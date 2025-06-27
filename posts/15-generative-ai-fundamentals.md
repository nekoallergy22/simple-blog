---
title: "15. 生成AI基礎：テキスト・画像・音声生成の仕組み"
date: "2024-01-15"
category: "ai-course"
slug: "15-generative-ai-fundamentals"
difficulty: "intermediate"
number: 15
---

# 生成AI基礎：テキスト・画像・音声生成の仕組み

現在話題の生成AI技術について、基本原理から最新動向まで体系的に学習します。

## 生成AIとは

**生成AI（Generative AI）**とは、学習データの分布を学習し、新しいデータを生成するAI技術の総称です。

### 従来のAI vs 生成AI

| 従来のAI | 生成AI |
|----------|--------|
| 判別・分類 | 新規生成 |
| 既存データの分析 | 新しいデータ創造 |
| 確定的出力 | 確率的出力 |

## 主要な生成モデル

### 1. 大規模言語モデル（LLM）

#### GPT系モデル
- **GPT-1** (2018): 1.17億パラメータ
- **GPT-2** (2019): 15億パラメータ  
- **GPT-3** (2020): 1,750億パラメータ
- **GPT-4** (2023): 推定1.7兆パラメータ

#### 学習手法
```
1. 事前学習（Pre-training）
   - 大量テキストでの次単語予測
   - 自己教師あり学習

2. ファインチューニング（Fine-tuning）
   - タスク特化データでの追加学習
   - 教師あり学習

3. 強化学習（RLHF）
   - 人間フィードバックによる報酬学習
   - より人間に好まれる出力
```

### 2. 拡散モデル（Diffusion Models）

#### 基本原理
```python
# Forward Process (ノイズ追加)
q(x_t|x_{t-1}) = N(x_t; √(1-β_t)x_{t-1}, β_t I)

# Reverse Process (ノイズ除去)
p_θ(x_{t-1}|x_t) = N(x_{t-1}; μ_θ(x_t,t), Σ_θ(x_t,t))
```

#### 実装例（簡略版）
```python
import torch
import torch.nn as nn

class SimpleDiffusion(nn.Module):
    def __init__(self, timesteps=1000):
        super().__init__()
        self.timesteps = timesteps
        
        # ノイズスケジュール
        self.betas = torch.linspace(0.0001, 0.02, timesteps)
        self.alphas = 1 - self.betas
        self.alpha_bars = torch.cumprod(self.alphas, dim=0)
        
        # U-Netベースのデノイザー
        self.denoiser = UNet(in_channels=3, out_channels=3)
    
    def add_noise(self, x0, t):
        """画像にノイズを追加"""
        noise = torch.randn_like(x0)
        alpha_bar_t = self.alpha_bars[t].reshape(-1, 1, 1, 1)
        
        # x_t = √α̅_t * x_0 + √(1-α̅_t) * ε
        x_t = torch.sqrt(alpha_bar_t) * x0 + torch.sqrt(1 - alpha_bar_t) * noise
        return x_t, noise
    
    def sample(self, shape):
        """ランダムノイズから画像を生成"""
        x = torch.randn(shape)
        
        for t in reversed(range(self.timesteps)):
            t_tensor = torch.full((shape[0],), t, dtype=torch.long)
            
            # ノイズ予測
            predicted_noise = self.denoiser(x, t_tensor)
            
            # ノイズ除去
            alpha_t = self.alphas[t]
            alpha_bar_t = self.alpha_bars[t]
            
            x = (1 / torch.sqrt(alpha_t)) * (
                x - (self.betas[t] / torch.sqrt(1 - alpha_bar_t)) * predicted_noise
            )
            
            # ランダムノイズ追加（最後のステップ以外）
            if t > 0:
                noise = torch.randn_like(x)
                x += torch.sqrt(self.betas[t]) * noise
        
        return x
```

### 3. GAN（Generative Adversarial Networks）

#### 基本構造
```python
class Generator(nn.Module):
    def __init__(self, noise_dim=100, output_dim=784):
        super(Generator, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(noise_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 512),
            nn.ReLU(),
            nn.Linear(512, 1024),
            nn.ReLU(),
            nn.Linear(1024, output_dim),
            nn.Tanh()
        )
    
    def forward(self, noise):
        return self.net(noise)

class Discriminator(nn.Module):
    def __init__(self, input_dim=784):
        super(Discriminator, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 1024),
            nn.LeakyReLU(0.2),
            nn.Linear(1024, 512),
            nn.LeakyReLU(0.2),
            nn.Linear(512, 256),
            nn.LeakyReLU(0.2),
            nn.Linear(256, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        return self.net(x)

# 敵対的学習
def train_gan(generator, discriminator, dataloader, num_epochs):
    g_optimizer = torch.optim.Adam(generator.parameters(), lr=0.0002)
    d_optimizer = torch.optim.Adam(discriminator.parameters(), lr=0.0002)
    criterion = nn.BCELoss()
    
    for epoch in range(num_epochs):
        for real_data, _ in dataloader:
            batch_size = real_data.size(0)
            
            # Discriminator学習
            d_optimizer.zero_grad()
            
            # 真データ
            real_labels = torch.ones(batch_size, 1)
            real_output = discriminator(real_data)
            d_loss_real = criterion(real_output, real_labels)
            
            # 偽データ
            noise = torch.randn(batch_size, 100)
            fake_data = generator(noise)
            fake_labels = torch.zeros(batch_size, 1)
            fake_output = discriminator(fake_data.detach())
            d_loss_fake = criterion(fake_output, fake_labels)
            
            d_loss = d_loss_real + d_loss_fake
            d_loss.backward()
            d_optimizer.step()
            
            # Generator学習
            g_optimizer.zero_grad()
            fake_output = discriminator(fake_data)
            g_loss = criterion(fake_output, real_labels)  # Generatorは偽データが真と判定されることを目指す
            g_loss.backward()
            g_optimizer.step()
```

## テキスト生成

### 生成戦略

#### 1. Greedy Search
```python
def greedy_search(model, input_ids, max_length=50):
    for _ in range(max_length):
        outputs = model(input_ids)
        next_token = torch.argmax(outputs.logits[:, -1, :], dim=-1)
        input_ids = torch.cat([input_ids, next_token.unsqueeze(1)], dim=1)
        
        if next_token == tokenizer.eos_token_id:
            break
    return input_ids
```

#### 2. Beam Search
```python
def beam_search(model, input_ids, beam_size=5, max_length=50):
    batch_size = input_ids.size(0)
    
    # 初期化
    sequences = input_ids.repeat(beam_size, 1)
    scores = torch.zeros(beam_size)
    
    for _ in range(max_length):
        outputs = model(sequences)
        logits = outputs.logits[:, -1, :]
        log_probs = torch.log_softmax(logits, dim=-1)
        
        # 各ビームから上位k個を選択
        candidates = []
        for i in range(beam_size):
            top_k_probs, top_k_tokens = torch.topk(log_probs[i], beam_size)
            for j in range(beam_size):
                new_seq = torch.cat([sequences[i], top_k_tokens[j].unsqueeze(0)])
                new_score = scores[i] + top_k_probs[j]
                candidates.append((new_seq, new_score))
        
        # 上位beam_size個を選択
        candidates.sort(key=lambda x: x[1], reverse=True)
        sequences = torch.stack([c[0] for c in candidates[:beam_size]])
        scores = torch.tensor([c[1] for c in candidates[:beam_size]])
    
    return sequences[0]  # 最高スコアの系列
```

#### 3. Top-k / Top-p Sampling
```python
def top_k_top_p_sampling(logits, k=50, p=0.9, temperature=1.0):
    # Temperature scaling
    logits = logits / temperature
    
    # Top-k filtering
    if k > 0:
        top_k_values, _ = torch.topk(logits, k)
        min_value = top_k_values[:, -1].unsqueeze(1)
        logits = torch.where(logits < min_value, 
                           torch.full_like(logits, float('-inf')), 
                           logits)
    
    # Top-p (nucleus) filtering
    if p < 1.0:
        sorted_logits, sorted_indices = torch.sort(logits, descending=True)
        cumulative_probs = torch.cumsum(torch.softmax(sorted_logits, dim=-1), dim=-1)
        
        # 累積確率がpを超える部分を除去
        sorted_indices_to_remove = cumulative_probs > p
        sorted_indices_to_remove[:, 1:] = sorted_indices_to_remove[:, :-1].clone()
        sorted_indices_to_remove[:, 0] = 0
        
        indices_to_remove = sorted_indices_to_remove.scatter(1, sorted_indices, sorted_indices_to_remove)
        logits = logits.masked_fill(indices_to_remove, float('-inf'))
    
    # サンプリング
    probs = torch.softmax(logits, dim=-1)
    next_token = torch.multinomial(probs, 1)
    
    return next_token
```

## 画像生成

### Stable Diffusion
```python
class StableDiffusion:
    def __init__(self):
        # VAE: 画像をlatent spaceに変換
        self.vae = VAE()
        
        # Text Encoder: テキストを埋め込みベクトルに変換
        self.text_encoder = CLIPTextEncoder()
        
        # U-Net: ノイズ除去
        self.unet = UNet()
        
        # Scheduler: ノイズスケジュール
        self.scheduler = DDPMScheduler()
    
    def generate(self, prompt, height=512, width=512, num_steps=50):
        # テキストエンコーディング
        text_embeddings = self.text_encoder(prompt)
        
        # ランダムlatent
        latents = torch.randn(1, 4, height//8, width//8)
        
        # Denoising
        for t in self.scheduler.timesteps:
            # ノイズ予測
            noise_pred = self.unet(latents, t, text_embeddings)
            
            # ノイズ除去
            latents = self.scheduler.step(noise_pred, t, latents)
        
        # VAEデコード
        image = self.vae.decode(latents)
        return image
```

### ControlNet
```python
class ControlNet(nn.Module):
    def __init__(self, conditioning_channels=3):
        super().__init__()
        
        # 元のU-Netをコピー
        self.unet = copy.deepcopy(original_unet)
        
        # 制御入力用のエンコーダー
        self.control_encoder = nn.Sequential(
            nn.Conv2d(conditioning_channels, 320, 3, padding=1),
            nn.GroupNorm(32, 320),
            nn.SiLU(),
            # ... 追加層
        )
        
        # Zero convolution（初期化時は出力0）
        self.zero_convs = nn.ModuleList([
            nn.Conv2d(320, 320, 1) for _ in range(12)
        ])
        
        # Zero convの重みを0で初期化
        for conv in self.zero_convs:
            nn.init.zeros_(conv.weight)
            nn.init.zeros_(conv.bias)
    
    def forward(self, x, timestep, context, control_input):
        # 制御信号をエンコード
        control_features = self.control_encoder(control_input)
        
        # U-Netの各層に制御信号を注入
        # ... 実装詳細
        
        return self.unet(x, timestep, context, control_features)
```

## 音声生成

### Text-to-Speech
```python
class TTS(nn.Module):
    def __init__(self):
        super().__init__()
        
        # テキストエンコーダー
        self.text_encoder = TransformerEncoder(
            d_model=256, num_heads=8, num_layers=6
        )
        
        # Duration Predictor
        self.duration_predictor = nn.Sequential(
            nn.Conv1d(256, 256, 3, padding=1),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Conv1d(256, 1, 1)
        )
        
        # Mel Decoder
        self.mel_decoder = TransformerDecoder(
            d_model=256, num_heads=8, num_layers=6
        )
        
        # Vocoder (HiFi-GAN等)
        self.vocoder = HiFiGAN()
    
    def forward(self, text_tokens):
        # テキストエンコーディング
        text_features = self.text_encoder(text_tokens)
        
        # 音素継続長予測
        durations = self.duration_predictor(text_features.transpose(1, 2))
        
        # 継続長に基づいて拡張
        expanded_features = self.expand_by_duration(text_features, durations)
        
        # メルスペクトログラム生成
        mel_spectrogram = self.mel_decoder(expanded_features)
        
        # 音声波形生成
        waveform = self.vocoder(mel_spectrogram)
        
        return waveform, mel_spectrogram
```

## 評価指標

### テキスト生成評価

#### BLEU Score
```python
from nltk.translate.bleu_score import sentence_bleu

def calculate_bleu(reference, candidate):
    reference_tokens = [reference.split()]
    candidate_tokens = candidate.split()
    
    bleu_score = sentence_bleu(reference_tokens, candidate_tokens)
    return bleu_score
```

#### ROUGE Score
```python
from rouge_score import rouge_scorer

def calculate_rouge(reference, candidate):
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], 
                                     use_stemmer=True)
    scores = scorer.score(reference, candidate)
    return scores
```

### 画像生成評価

#### FID (Fréchet Inception Distance)
```python
def calculate_fid(real_images, generated_images):
    # Inception-v3で特徴量抽出
    inception = InceptionV3()
    
    # 実画像の特徴量
    real_features = inception(real_images)
    mu_real = torch.mean(real_features, dim=0)
    sigma_real = torch.cov(real_features.T)
    
    # 生成画像の特徴量
    gen_features = inception(generated_images)
    mu_gen = torch.mean(gen_features, dim=0)
    sigma_gen = torch.cov(gen_features.T)
    
    # FID計算
    diff = mu_real - mu_gen
    fid = torch.dot(diff, diff) + torch.trace(sigma_real + sigma_gen - 2 * torch.sqrt(sigma_real @ sigma_gen))
    
    return fid.item()
```

## 倫理的考慮事項

### 生成AIの課題
1. **偏見の増幅**: 学習データの偏見を反映
2. **著作権問題**: 学習データの著作権
3. **偽情報拡散**: Deep fakeや虚偽情報
4. **創作者への影響**: 人間の創作活動への影響

### 対策
```python
# コンテンツフィルタリング
class ContentFilter:
    def __init__(self):
        self.safety_classifier = SafetyClassifier()
        self.toxicity_detector = ToxicityDetector()
    
    def filter_output(self, generated_content):
        # 安全性チェック
        safety_score = self.safety_classifier(generated_content)
        if safety_score < 0.8:
            return None
        
        # 有害性チェック  
        toxicity_score = self.toxicity_detector(generated_content)
        if toxicity_score > 0.2:
            return None
        
        return generated_content
```

## 実践的な応用

### ChatBot
```python
class ConversationalAI:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
        self.conversation_history = []
    
    def chat(self, user_input):
        # 対話履歴を含めてエンコード
        full_context = self.build_context(user_input)
        input_ids = self.tokenizer.encode(full_context, return_tensors='pt')
        
        # 応答生成
        with torch.no_grad():
            output = self.model.generate(
                input_ids,
                max_length=input_ids.shape[1] + 100,
                temperature=0.7,
                top_p=0.9,
                do_sample=True
            )
        
        response = self.tokenizer.decode(output[0][input_ids.shape[1]:])
        
        # 履歴更新
        self.conversation_history.append(('user', user_input))
        self.conversation_history.append(('assistant', response))
        
        return response
```

## まとめ

生成AIは創造的タスクでの革新的技術です。大規模言語モデル、拡散モデル、GANなど様々な手法があり、それぞれ特徴的な応用分野を持ちます。倫理的配慮も重要な課題です。

次回は中級編の最後として「強化学習」の基礎について学習します。