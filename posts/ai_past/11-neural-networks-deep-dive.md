---
title: "ニューラルネットワーク詳説：仕組みを数式で理解する"
date: "2024-01-11"
category: "ai-course"
slug: "11-neural-networks-deep-dive"
difficulty: "intermediate"
number: 11
---

# ニューラルネットワーク詳説：仕組みを数式で理解する

中級編の開始として、ニューラルネットワークの数学的基盤と詳細な動作原理を学習します。

## ニューラルネットワークの数学的基礎

### パーセプトロンの数式表現

単一のニューロン（パーセプトロン）は以下の数式で表現されます：

```
y = f(w₁x₁ + w₂x₂ + ... + wₙxₙ + b)
```

#### 要素の説明
- **x₁, x₂, ..., xₙ**: 入力値
- **w₁, w₂, ..., wₙ**: 重み（weight）
- **b**: バイアス（bias）
- **f**: 活性化関数
- **y**: 出力値

#### ベクトル表記
```
y = f(w^T x + b)
```
- **w**: 重みベクトル [w₁, w₂, ..., wₙ]^T
- **x**: 入力ベクトル [x₁, x₂, ..., xₙ]^T

### 活性化関数の種類と特性

#### 1. シグモイド関数
```
σ(z) = 1 / (1 + e^(-z))
```

**特徴：**
- 出力範囲：(0, 1)
- 微分可能で滑らか
- 勾配消失問題が発生しやすい

**微分：**
```
σ'(z) = σ(z)(1 - σ(z))
```

#### 2. tanh関数
```
tanh(z) = (e^z - e^(-z)) / (e^z + e^(-z))
```

**特徴：**
- 出力範囲：(-1, 1)
- ゼロ中心
- シグモイドより勾配消失が少ない

**微分：**
```
tanh'(z) = 1 - tanh²(z)
```

#### 3. ReLU関数
```
ReLU(z) = max(0, z)
```

**特徴：**
- 計算が高速
- 勾配消失問題が少ない
- Dead ReLU問題

**微分：**
```
ReLU'(z) = {1 if z > 0, 0 if z ≤ 0}
```

#### 4. Leaky ReLU
```
LeakyReLU(z) = max(αz, z)  (α ≈ 0.01)
```

#### 5. Swish/SiLU
```
Swish(z) = z · σ(z) = z / (1 + e^(-z))
```

### 多層パーセプトロンの構造

#### 順伝播（Forward Propagation）

3層ネットワークの例：

**入力層から隠れ層1:**
```
h₁ = f₁(W₁x + b₁)
```

**隠れ層1から隠れ層2:**
```
h₂ = f₂(W₂h₁ + b₂)
```

**隠れ層2から出力層:**
```
y = f₃(W₃h₂ + b₃)
```

#### 行列表記
```
H₁ = f₁(XW₁ + B₁)
H₂ = f₂(H₁W₂ + B₂)
Y = f₃(H₂W₃ + B₃)
```

## 損失関数（Loss Function）

### 回帰問題の損失関数

#### 平均二乗誤差（MSE）
```
MSE = (1/n) Σᵢ₌₁ⁿ (yᵢ - ŷᵢ)²
```

#### 平均絶対誤差（MAE）
```
MAE = (1/n) Σᵢ₌₁ⁿ |yᵢ - ŷᵢ|
```

### 分類問題の損失関数

#### 二値分類：二値交差エントロピー
```
BCE = -(1/n) Σᵢ₌₁ⁿ [yᵢ log(ŷᵢ) + (1-yᵢ) log(1-ŷᵢ)]
```

#### 多クラス分類：カテゴリカル交差エントロピー
```
CCE = -(1/n) Σᵢ₌₁ⁿ Σⱼ₌₁ᶜ yᵢⱼ log(ŷᵢⱼ)
```

### ソフトマックス関数
多クラス分類の出力層で使用：

```
Softmax(zᵢ) = e^(zᵢ) / Σⱼ₌₁ᶜ e^(zⱼ)
```

**特徴：**
- 出力の合計が1
- 確率分布として解釈可能

## 逆伝播法（Backpropagation）

### 連鎖律（Chain Rule）
逆伝播の数学的基盤：

```
∂L/∂w = (∂L/∂y) · (∂y/∂z) · (∂z/∂w)
```

### 勾配計算の具体例

2層ネットワークの場合：

#### 出力層の勾配
```
∂L/∂W₂ = (∂L/∂y) · (∂y/∂z₂) · (∂z₂/∂W₂)
         = δ₂ · h₁ᵀ

∂L/∂b₂ = δ₂
```

#### 隠れ層の勾配
```
∂L/∂W₁ = (∂L/∂y) · (∂y/∂z₂) · (∂z₂/∂h₁) · (∂h₁/∂z₁) · (∂z₁/∂W₁)
         = δ₁ · xᵀ

∂L/∂b₁ = δ₁
```

#### 誤差の逆伝播
```
δ₂ = ∂L/∂y · f₂'(z₂)
δ₁ = (W₂ᵀδ₂) ⊙ f₁'(z₁)
```

- **⊙**: 要素積（Hadamard product）

### 実装例（NumPy）

```python
import numpy as np

class MLP:
    def __init__(self, input_size, hidden_size, output_size):
        # 重みの初期化（Xavier初期化）
        self.W1 = np.random.randn(input_size, hidden_size) * np.sqrt(2/input_size)
        self.b1 = np.zeros((1, hidden_size))
        self.W2 = np.random.randn(hidden_size, output_size) * np.sqrt(2/hidden_size)
        self.b2 = np.zeros((1, output_size))
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-np.clip(x, -250, 250)))
    
    def sigmoid_derivative(self, x):
        return x * (1 - x)
    
    def forward(self, X):
        # 順伝播
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = self.sigmoid(self.z1)
        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.a2 = self.sigmoid(self.z2)
        return self.a2
    
    def backward(self, X, y, output):
        m = X.shape[0]
        
        # 逆伝播
        dz2 = output - y
        dW2 = (1/m) * np.dot(self.a1.T, dz2)
        db2 = (1/m) * np.sum(dz2, axis=0, keepdims=True)
        
        dz1 = np.dot(dz2, self.W2.T) * self.sigmoid_derivative(self.a1)
        dW1 = (1/m) * np.dot(X.T, dz1)
        db1 = (1/m) * np.sum(dz1, axis=0, keepdims=True)
        
        return dW1, db1, dW2, db2
    
    def update_parameters(self, dW1, db1, dW2, db2, learning_rate):
        self.W1 -= learning_rate * dW1
        self.b1 -= learning_rate * db1
        self.W2 -= learning_rate * dW2
        self.b2 -= learning_rate * db2
```

## 最適化アルゴリズム

### 勾配降下法（Gradient Descent）

#### バッチ勾配降下法
```
θₜ₊₁ = θₜ - α∇L(θₜ)
```

#### 確率的勾配降下法（SGD）
```
θₜ₊₁ = θₜ - α∇L(θₜ, xᵢ, yᵢ)
```

#### ミニバッチ勾配降下法
```
θₜ₊₁ = θₜ - α(1/B)Σᵢ∈Bₜ ∇L(θₜ, xᵢ, yᵢ)
```

### 適応的学習率アルゴリズム

#### Momentum
```
vₜ = βvₜ₋₁ + α∇L(θₜ)
θₜ₊₁ = θₜ - vₜ
```

#### AdaGrad
```
Gₜ = Gₜ₋₁ + (∇L(θₜ))²
θₜ₊₁ = θₜ - α∇L(θₜ)/√(Gₜ + ε)
```

#### Adam
```
mₜ = β₁mₜ₋₁ + (1-β₁)∇L(θₜ)
vₜ = β₂vₜ₋₁ + (1-β₂)(∇L(θₜ))²

m̂ₜ = mₜ/(1-β₁ᵗ)
v̂ₜ = vₜ/(1-β₂ᵗ)

θₜ₊₁ = θₜ - α·m̂ₜ/√(v̂ₜ + ε)
```

## 重みの初期化

### Xavier/Glorot初期化
```
W ~ U(-√(6/(nᵢₙ + nₒᵤₜ)), √(6/(nᵢₙ + nₒᵤₜ)))
```

### He初期化（ReLU用）
```
W ~ N(0, √(2/nᵢₙ))
```

## 正則化手法

### L1正則化（Lasso）
```
L_total = L_original + λ Σᵢ |wᵢ|
```

### L2正則化（Ridge）
```
L_total = L_original + λ Σᵢ wᵢ²
```

### Dropout
学習時にランダムにニューロンを無効化：

```python
def dropout(x, keep_prob):
    mask = np.random.binomial(1, keep_prob, size=x.shape) / keep_prob
    return x * mask
```

### Batch Normalization
各層の入力を正規化：

```
BN(x) = γ((x - μ)/σ) + β
```

- **μ**: バッチ平均
- **σ**: バッチ標準偏差
- **γ, β**: 学習可能パラメータ

## 実践的な学習のコツ

### 学習率の設定
- 大きすぎ：発散
- 小さすぎ：収束が遅い
- 適応的手法（Adam等）の利用

### バッチサイズの選択
- 小さい：ノイズが多いが汎化性能向上
- 大きい：安定した学習だが汎化性能低下
- 一般的：32, 64, 128, 256

### 早期停止（Early Stopping）
```python
best_val_loss = float('inf')
patience_counter = 0
patience = 10

for epoch in range(max_epochs):
    # 学習処理
    val_loss = validate()
    
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        patience_counter = 0
        # モデル保存
    else:
        patience_counter += 1
        if patience_counter >= patience:
            break
```

## デバッグ手法

### 勾配の確認
数値微分との比較：

```python
def gradient_check(f, x, grad, epsilon=1e-7):
    grad_numerical = np.zeros_like(x)
    for i in range(x.shape[0]):
        x_plus = x.copy()
        x_plus[i] += epsilon
        x_minus = x.copy()
        x_minus[i] -= epsilon
        grad_numerical[i] = (f(x_plus) - f(x_minus)) / (2 * epsilon)
    
    relative_error = np.linalg.norm(grad - grad_numerical) / (
        np.linalg.norm(grad) + np.linalg.norm(grad_numerical)
    )
    return relative_error < 1e-7
```

### 学習曲線の分析
- **損失の変化**：減少傾向の確認
- **過学習の検出**：訓練・検証損失の乖離
- **勾配の監視**：勾配消失・爆発の検出

## まとめ

ニューラルネットワークの数学的基盤を理解することで、より効果的なモデル設計と問題解決が可能になります。順伝播・逆伝播の仕組み、最適化手法、正則化技術をマスターすることが重要です。

次回は、現代的な深層学習の核心技術「CNN（畳み込みニューラルネットワーク）」について詳しく学習します。