---
title: "19. AIセキュリティ・プライバシー保護技術"
date: "2024-01-19"
category: "ai-course"
slug: "19-ai-security-privacy"
difficulty: "intermediate"
number: 19
---

# AIセキュリティ・プライバシー保護技術

AIシステムのセキュリティ脅威と対策、プライバシー保護技術について実践的に学習します。

## AIセキュリティの脅威

### 敵対的攻撃（Adversarial Attacks）
入力に微小な摂動を加えてAIの判断を誤らせる攻撃

#### FGSM (Fast Gradient Sign Method)
```python
import torch
import torch.nn.functional as F

def fgsm_attack(model, data, target, epsilon=0.3):
    """
    FGSM攻撃による敵対的サンプル生成
    """
    data.requires_grad = True
    
    # 順伝播
    output = model(data)
    loss = F.nll_loss(output, target)
    
    # 勾配計算
    model.zero_grad()
    loss.backward()
    data_grad = data.grad.data
    
    # 敵対的サンプル生成
    sign_data_grad = data_grad.sign()
    perturbed_data = data + epsilon * sign_data_grad
    perturbed_data = torch.clamp(perturbed_data, 0, 1)
    
    return perturbed_data

# 使用例
model = load_pretrained_model()
original_image = load_image()
target_label = torch.tensor([5])  # 誤分類させたいクラス

adversarial_image = fgsm_attack(model, original_image, target_label)

# 元画像と敵対的画像の予測比較
with torch.no_grad():
    original_pred = model(original_image).argmax().item()
    adversarial_pred = model(adversarial_image).argmax().item()
    
print(f"Original prediction: {original_pred}")
print(f"Adversarial prediction: {adversarial_pred}")
```

#### PGD (Projected Gradient Descent)
```python
def pgd_attack(model, data, target, epsilon=0.3, alpha=0.01, num_iter=40):
    """
    PGD攻撃（より強力な敵対的攻撃）
    """
    # ランダム初期化
    delta = torch.empty_like(data).uniform_(-epsilon, epsilon)
    delta = torch.clamp(data + delta, 0, 1) - data
    
    for i in range(num_iter):
        delta.requires_grad = True
        
        # 損失計算
        output = model(data + delta)
        loss = F.cross_entropy(output, target)
        
        # 勾配計算
        loss.backward()
        
        # 更新
        delta = delta + alpha * delta.grad.sign()
        delta = torch.clamp(delta, -epsilon, epsilon)
        delta = torch.clamp(data + delta, 0, 1) - data
        delta = delta.detach()
    
    return data + delta
```

### データポイズニング攻撃
```python
class DataPoisoningAttack:
    def __init__(self, poison_rate=0.1):
        self.poison_rate = poison_rate
    
    def label_flipping_attack(self, X, y):
        """ラベル反転攻撃"""
        num_poison = int(len(y) * self.poison_rate)
        poison_indices = np.random.choice(len(y), num_poison, replace=False)
        
        y_poisoned = y.copy()
        # ランダムにラベルを変更
        y_poisoned[poison_indices] = np.random.choice(
            len(np.unique(y)), num_poison
        )
        
        return X, y_poisoned
    
    def backdoor_attack(self, X, y, trigger_pattern, target_label):
        """バックドア攻撃"""
        num_poison = int(len(X) * self.poison_rate)
        poison_indices = np.random.choice(len(X), num_poison, replace=False)
        
        X_poisoned = X.copy()
        y_poisoned = y.copy()
        
        # トリガーパターンを追加
        for idx in poison_indices:
            X_poisoned[idx] = self.add_trigger(X_poisoned[idx], trigger_pattern)
            y_poisoned[idx] = target_label
        
        return X_poisoned, y_poisoned
    
    def add_trigger(self, image, trigger_pattern):
        """画像にトリガーパターンを追加"""
        triggered_image = image.copy()
        h, w = trigger_pattern.shape
        triggered_image[-h:, -w:] = trigger_pattern
        return triggered_image
```

## 防御手法

### 敵対的訓練 (Adversarial Training)
```python
def adversarial_training(model, train_loader, epochs=10, epsilon=0.3):
    """
    敵対的サンプルを含めた訓練
    """
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = torch.nn.CrossEntropyLoss()
    
    model.train()
    for epoch in range(epochs):
        total_loss = 0
        
        for batch_idx, (data, target) in enumerate(train_loader):
            optimizer.zero_grad()
            
            # 通常の訓練
            output_clean = model(data)
            loss_clean = criterion(output_clean, target)
            
            # 敵対的サンプル生成
            data_adv = fgsm_attack(model, data, target, epsilon)
            output_adv = model(data_adv)
            loss_adv = criterion(output_adv, target)
            
            # 合計損失
            total_loss = loss_clean + loss_adv
            total_loss.backward()
            optimizer.step()
        
        print(f'Epoch {epoch+1}/{epochs}, Loss: {total_loss.item():.4f}')
```

### 特徴量スクワッシング
```python
def feature_squashing(x, bit_depth=8):
    """
    特徴量の精度を下げて敵対的摂動を除去
    """
    # ビット深度を下げる
    factor = 2 ** bit_depth
    x_squashed = torch.round(x * factor) / factor
    return x_squashed

def median_smoothing(x, kernel_size=3):
    """
    メディアンフィルタによる平滑化
    """
    import torchvision.transforms.functional as F
    return F.gaussian_blur(x, kernel_size)
```

### 検出手法
```python
class AdversarialDetector:
    def __init__(self, model, threshold=0.1):
        self.model = model
        self.threshold = threshold
    
    def uncertainty_detection(self, x, num_samples=100):
        """
        Monte Carlo Dropout による不確実性推定
        """
        self.model.train()  # Dropoutを有効にする
        predictions = []
        
        with torch.no_grad():
            for _ in range(num_samples):
                pred = F.softmax(self.model(x), dim=1)
                predictions.append(pred)
        
        predictions = torch.stack(predictions)
        mean_pred = predictions.mean(dim=0)
        uncertainty = predictions.var(dim=0).sum(dim=1)
        
        # 不確実性が閾値を超えたら敵対的サンプルと判定
        is_adversarial = uncertainty > self.threshold
        
        return is_adversarial, uncertainty
    
    def input_transformation_detection(self, x):
        """
        入力変換による検出
        """
        # 複数の変換を適用
        transforms = [
            lambda x: feature_squashing(x, 4),
            lambda x: median_smoothing(x, 3),
            lambda x: x + torch.randn_like(x) * 0.01  # ノイズ追加
        ]
        
        original_pred = self.model(x).argmax(dim=1)
        
        for transform in transforms:
            transformed_x = transform(x)
            transformed_pred = self.model(transformed_x).argmax(dim=1)
            
            # 予測が変わったら敵対的サンプルの可能性
            if not torch.equal(original_pred, transformed_pred):
                return True
        
        return False
```

## プライバシー保護技術

### 差分プライバシー (Differential Privacy)
```python
import numpy as np

class DifferentialPrivacy:
    def __init__(self, epsilon=1.0):
        self.epsilon = epsilon
    
    def add_laplace_noise(self, true_answer, sensitivity):
        """
        ラプラスノイズを追加
        """
        scale = sensitivity / self.epsilon
        noise = np.random.laplace(0, scale)
        return true_answer + noise
    
    def add_gaussian_noise(self, true_answer, sensitivity, delta=1e-5):
        """
        ガウシアンノイズを追加 (ε,δ)-差分プライバシー
        """
        sigma = np.sqrt(2 * np.log(1.25 / delta)) * sensitivity / self.epsilon
        noise = np.random.normal(0, sigma)
        return true_answer + noise
    
    def private_mean(self, data, bounds):
        """
        プライベートな平均計算
        """
        clipped_data = np.clip(data, bounds[0], bounds[1])
        true_mean = np.mean(clipped_data)
        sensitivity = (bounds[1] - bounds[0]) / len(data)
        
        return self.add_laplace_noise(true_mean, sensitivity)
    
    def private_histogram(self, data, bins):
        """
        プライベートなヒストグラム
        """
        hist, _ = np.histogram(data, bins=bins)
        sensitivity = 1  # 1つのデータポイントが変わると最大1つのビンが1変わる
        
        noisy_hist = []
        for count in hist:
            noisy_count = self.add_laplace_noise(count, sensitivity)
            noisy_hist.append(max(0, noisy_count))  # 負の値は0にクリップ
        
        return np.array(noisy_hist)

# 機械学習での差分プライバシー
class DPGradientDescent:
    def __init__(self, model, epsilon=1.0, delta=1e-5, max_grad_norm=1.0):
        self.model = model
        self.epsilon = epsilon
        self.delta = delta
        self.max_grad_norm = max_grad_norm
        self.noise_multiplier = self.compute_noise_multiplier()
    
    def compute_noise_multiplier(self):
        """
        ノイズ乗数の計算（RDP会計法）
        """
        # 簡略化された計算（実際にはより複雑）
        return np.sqrt(2 * np.log(1.25 / self.delta)) / self.epsilon
    
    def clip_gradients(self, gradients):
        """
        勾配クリッピング
        """
        total_norm = 0
        for grad in gradients:
            total_norm += grad.norm().item() ** 2
        total_norm = total_norm ** 0.5
        
        clip_coef = self.max_grad_norm / (total_norm + 1e-6)
        clip_coef = min(clip_coef, 1.0)
        
        clipped_gradients = []
        for grad in gradients:
            clipped_gradients.append(grad * clip_coef)
        
        return clipped_gradients
    
    def add_noise_to_gradients(self, gradients):
        """
        勾配にノイズを追加
        """
        noisy_gradients = []
        for grad in gradients:
            noise = torch.normal(
                mean=0, 
                std=self.noise_multiplier * self.max_grad_norm,
                size=grad.shape
            )
            noisy_gradients.append(grad + noise)
        
        return noisy_gradients
```

### 連合学習 (Federated Learning)
```python
import torch
import copy

class FederatedLearning:
    def __init__(self, global_model, clients, rounds=10):
        self.global_model = global_model
        self.clients = clients
        self.rounds = rounds
    
    def federated_averaging(self):
        """
        FedAvg アルゴリズム
        """
        for round_num in range(self.rounds):
            print(f"Round {round_num + 1}/{self.rounds}")
            
            # クライアント選択
            selected_clients = self.select_clients()
            
            # 各クライアントでローカル訓練
            client_models = []
            client_weights = []
            
            for client in selected_clients:
                # グローバルモデルをクライアントに送信
                client.set_model(copy.deepcopy(self.global_model))
                
                # ローカル訓練
                local_model, num_samples = client.local_train()
                
                client_models.append(local_model)
                client_weights.append(num_samples)
            
            # モデル集約
            self.global_model = self.aggregate_models(client_models, client_weights)
        
        return self.global_model
    
    def select_clients(self, fraction=0.1):
        """
        クライアント選択
        """
        num_selected = max(1, int(fraction * len(self.clients)))
        return np.random.choice(self.clients, num_selected, replace=False)
    
    def aggregate_models(self, client_models, client_weights):
        """
        重み付き平均によるモデル集約
        """
        total_weight = sum(client_weights)
        averaged_params = {}
        
        # 最初のモデルのパラメータ構造を取得
        for name, param in client_models[0].named_parameters():
            averaged_params[name] = torch.zeros_like(param)
        
        # 重み付き平均計算
        for model, weight in zip(client_models, client_weights):
            for name, param in model.named_parameters():
                averaged_params[name] += param * (weight / total_weight)
        
        # グローバルモデルを更新
        global_model = copy.deepcopy(client_models[0])
        for name, param in global_model.named_parameters():
            param.data = averaged_params[name]
        
        return global_model

class FederatedClient:
    def __init__(self, client_id, data_loader, local_epochs=5):
        self.client_id = client_id
        self.data_loader = data_loader
        self.local_epochs = local_epochs
        self.model = None
    
    def set_model(self, model):
        self.model = model
    
    def local_train(self):
        """
        ローカル訓練
        """
        if self.model is None:
            raise ValueError("Model not set")
        
        optimizer = torch.optim.SGD(self.model.parameters(), lr=0.01)
        criterion = torch.nn.CrossEntropyLoss()
        
        self.model.train()
        for epoch in range(self.local_epochs):
            for data, target in self.data_loader:
                optimizer.zero_grad()
                output = self.model(data)
                loss = criterion(output, target)
                loss.backward()
                optimizer.step()
        
        num_samples = len(self.data_loader.dataset)
        return self.model, num_samples
```

### 準同型暗号
```python
# TenSEALライブラリを使用した例
import tenseal as ts

class HomomorphicEncryption:
    def __init__(self):
        # コンテキスト設定
        self.context = ts.context(
            ts.SCHEME_TYPE.CKKS,
            poly_modulus_degree=8192,
            coeff_mod_bit_sizes=[60, 40, 40, 60]
        )
        self.context.generate_galois_keys()
        self.context.global_scale = 2**40
    
    def encrypt_data(self, data):
        """
        データの暗号化
        """
        return ts.ckks_vector(self.context, data)
    
    def encrypted_inference(self, encrypted_input, model_weights):
        """
        暗号化されたデータでの推論
        """
        # 線形変換（暗号化状態で実行）
        result = encrypted_input
        
        for weight_matrix, bias in model_weights:
            # 行列乗算（暗号化状態）
            result = self.encrypted_matrix_multiply(result, weight_matrix)
            
            # バイアス加算
            result = result + bias
            
            # 活性化関数（多項式近似）
            result = self.encrypted_activation(result)
        
        return result
    
    def encrypted_matrix_multiply(self, encrypted_vector, matrix):
        """
        暗号化ベクトルと平文行列の乗算
        """
        # 簡略化された実装
        result = []
        for row in matrix:
            dot_product = sum(encrypted_vector[i] * row[i] for i in range(len(row)))
            result.append(dot_product)
        return result
    
    def encrypted_activation(self, encrypted_input):
        """
        多項式による活性化関数近似
        """
        # ReLUの多項式近似: max(0, x) ≈ x^2 + x / 2 (for x ∈ [-1, 1])
        x_squared = encrypted_input * encrypted_input
        return (x_squared + encrypted_input) * 0.5
```

## セキュアマルチパーティ計算
```python
class SecretSharing:
    def __init__(self, prime=2**31 - 1):
        self.prime = prime
    
    def share_secret(self, secret, num_parties, threshold):
        """
        シャミアの秘密分散
        """
        import random
        
        # ランダムな係数を生成
        coefficients = [secret] + [random.randint(0, self.prime-1) 
                                  for _ in range(threshold-1)]
        
        # 各パーティに対して秘密シェアを計算
        shares = []
        for i in range(1, num_parties+1):
            share_value = 0
            for j, coeff in enumerate(coefficients):
                share_value += coeff * (i ** j)
            share_value %= self.prime
            shares.append((i, share_value))
        
        return shares
    
    def reconstruct_secret(self, shares, threshold):
        """
        秘密の復元
        """
        if len(shares) < threshold:
            raise ValueError("Insufficient shares for reconstruction")
        
        # ラグランジュ補間
        secret = 0
        for i in range(threshold):
            xi, yi = shares[i]
            
            # ラグランジュ基底多項式
            li = 1
            for j in range(threshold):
                if i != j:
                    xj, _ = shares[j]
                    li *= (-xj) * pow(xi - xj, -1, self.prime)
                    li %= self.prime
            
            secret += yi * li
            secret %= self.prime
        
        return secret

# SMPCプロトコル
class SMPCProtocol:
    def __init__(self, parties, secret_sharing):
        self.parties = parties
        self.ss = secret_sharing
    
    def secure_addition(self, share_a, share_b):
        """
        秘密シェア同士の加算
        """
        result_shares = []
        for (id_a, val_a), (id_b, val_b) in zip(share_a, share_b):
            assert id_a == id_b, "Share IDs must match"
            result_shares.append((id_a, (val_a + val_b) % self.ss.prime))
        return result_shares
    
    def secure_multiplication(self, share_a, share_b):
        """
        秘密シェア同士の乗算（簡略版）
        """
        # 実際のSMPCでは複雑なプロトコルが必要
        # ここでは概念的な実装のみ
        result_shares = []
        for (id_a, val_a), (id_b, val_b) in zip(share_a, share_b):
            result_shares.append((id_a, (val_a * val_b) % self.ss.prime))
        return result_shares
```

## 実装ガイドライン

### セキュリティ監査
```python
class SecurityAuditor:
    def __init__(self, model):
        self.model = model
    
    def audit_model(self):
        """
        モデルセキュリティ監査
        """
        audit_results = {
            'adversarial_robustness': self.test_adversarial_robustness(),
            'privacy_leakage': self.test_privacy_leakage(),
            'backdoor_detection': self.detect_backdoors(),
            'input_validation': self.test_input_validation()
        }
        
        return audit_results
    
    def test_adversarial_robustness(self):
        """
        敵対的攻撃に対する頑健性テスト
        """
        test_accuracy = []
        
        for epsilon in [0.01, 0.05, 0.1, 0.3]:
            # FGSM攻撃でテスト
            adversarial_accuracy = self.evaluate_under_attack(epsilon)
            test_accuracy.append((epsilon, adversarial_accuracy))
        
        return test_accuracy
    
    def test_privacy_leakage(self):
        """
        プライバシー漏洩テスト
        """
        # メンバーシップ推論攻撃
        member_accuracy = self.membership_inference_attack()
        
        # 属性推論攻撃
        attribute_accuracy = self.attribute_inference_attack()
        
        return {
            'membership_inference': member_accuracy,
            'attribute_inference': attribute_accuracy
        }
    
    def detect_backdoors(self):
        """
        バックドア検出
        """
        # Neural Cleanse手法
        reverse_triggers = self.neural_cleanse()
        
        # 異常検知ベース
        anomaly_score = self.anomaly_based_detection()
        
        return {
            'reverse_triggers': reverse_triggers,
            'anomaly_score': anomaly_score
        }
```

## まとめ

AIセキュリティは多層防御が重要です。敵対的攻撃、プライバシー侵害、データポイズニングなど様々な脅威に対し、適切な防御手法を組み合わせて対策することが必要です。

次回は中級編の最後として「AIプロジェクト管理・チーム体制」について学習します。