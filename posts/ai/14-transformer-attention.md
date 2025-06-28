---
title: "Transformer・Attention：現代NLPの革命技術"
date: "2024-01-14"
category: "ai-course"
slug: "14-transformer-attention"
difficulty: "intermediate"
number: 14
---

# Transformer・Attention：現代NLPの革命技術

ChatGPTやBERTの基盤となるTransformerアーキテクチャとAttention機構について詳しく学習します。

## Attention機構の基礎概念

### Attentionとは
**入力系列の各要素に対する重要度を動的に計算し、関連する情報に注目する機構**

### Scaled Dot-Product Attention

#### 数式
```
Attention(Q, K, V) = softmax(QK^T / √d_k)V
```

- **Q (Query)**: 質問ベクトル
- **K (Key)**: キーベクトル  
- **V (Value)**: 値ベクトル
- **d_k**: キーの次元数

#### 実装例
```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

def scaled_dot_product_attention(query, key, value, mask=None):
    """
    Args:
        query: (batch_size, seq_len, d_model)
        key: (batch_size, seq_len, d_model)
        value: (batch_size, seq_len, d_model)
        mask: (batch_size, seq_len, seq_len)
    """
    d_k = query.size(-1)
    
    # Attention スコア計算
    scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)
    
    # マスキング（必要に応じて）
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    
    # Softmax適用
    attention_weights = F.softmax(scores, dim=-1)
    
    # Value との加重和
    output = torch.matmul(attention_weights, value)
    
    return output, attention_weights
```

## Multi-Head Attention

### 概念
複数の異なる表現部分空間で並列にattentionを計算

### 数式
```
MultiHead(Q, K, V) = Concat(head_1, ..., head_h)W^O

head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)
```

### 実装
```python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super(MultiHeadAttention, self).__init__()
        assert d_model % num_heads == 0
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        # 線形変換層
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        
    def forward(self, query, key, value, mask=None):
        batch_size = query.size(0)
        
        # 線形変換とヘッド分割
        Q = self.W_q(query).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(key).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(value).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        # Scaled Dot-Product Attention
        attention_output, attention_weights = scaled_dot_product_attention(Q, K, V, mask)
        
        # ヘッド結合
        attention_output = attention_output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.d_model
        )
        
        # 最終線形変換
        output = self.W_o(attention_output)
        
        return output, attention_weights
```

## Transformer アーキテクチャ

### エンコーダーブロック
```python
class EncoderLayer(nn.Module):
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super(EncoderLayer, self).__init__()
        
        # Multi-Head Attention
        self.self_attention = MultiHeadAttention(d_model, num_heads)
        
        # Feed Forward Network
        self.feed_forward = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Linear(d_ff, d_model)
        )
        
        # Layer Normalization
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        
        # Dropout
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x, mask=None):
        # Self-Attention + Residual Connection
        attention_output, _ = self.self_attention(x, x, x, mask)
        x = self.norm1(x + self.dropout(attention_output))
        
        # Feed Forward + Residual Connection
        ff_output = self.feed_forward(x)
        x = self.norm2(x + self.dropout(ff_output))
        
        return x

class TransformerEncoder(nn.Module):
    def __init__(self, num_layers, d_model, num_heads, d_ff, dropout=0.1):
        super(TransformerEncoder, self).__init__()
        
        self.layers = nn.ModuleList([
            EncoderLayer(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])
        
    def forward(self, x, mask=None):
        for layer in self.layers:
            x = layer(x, mask)
        return x
```

### デコーダーブロック
```python
class DecoderLayer(nn.Module):
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super(DecoderLayer, self).__init__()
        
        # Masked Self-Attention
        self.self_attention = MultiHeadAttention(d_model, num_heads)
        
        # Cross-Attention
        self.cross_attention = MultiHeadAttention(d_model, num_heads)
        
        # Feed Forward Network
        self.feed_forward = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Linear(d_ff, d_model)
        )
        
        # Layer Normalization
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.norm3 = nn.LayerNorm(d_model)
        
        # Dropout
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x, encoder_output, self_attention_mask=None, cross_attention_mask=None):
        # Masked Self-Attention
        self_attention_output, _ = self.self_attention(x, x, x, self_attention_mask)
        x = self.norm1(x + self.dropout(self_attention_output))
        
        # Cross-Attention
        cross_attention_output, _ = self.cross_attention(x, encoder_output, encoder_output, cross_attention_mask)
        x = self.norm2(x + self.dropout(cross_attention_output))
        
        # Feed Forward
        ff_output = self.feed_forward(x)
        x = self.norm3(x + self.dropout(ff_output))
        
        return x
```

## Positional Encoding

### 必要性
Transformerは位置情報を持たないため、系列の順序を明示的に与える必要

### Sinusoidal Positional Encoding
```python
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super(PositionalEncoding, self).__init__()
        
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1).float()
        
        div_term = torch.exp(torch.arange(0, d_model, 2).float() *
                           -(math.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        
        pe = pe.unsqueeze(0)
        self.register_buffer('pe', pe)
        
    def forward(self, x):
        return x + self.pe[:, :x.size(1)]
```

### 学習可能な位置エンコーディング
```python
class LearnablePositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super(LearnablePositionalEncoding, self).__init__()
        self.pe = nn.Embedding(max_len, d_model)
        
    def forward(self, x):
        seq_len = x.size(1)
        positions = torch.arange(seq_len, device=x.device)
        return x + self.pe(positions)
```

## 完全なTransformerモデル

```python
class Transformer(nn.Module):
    def __init__(self, src_vocab_size, tgt_vocab_size, d_model=512, 
                 num_heads=8, num_encoder_layers=6, num_decoder_layers=6, 
                 d_ff=2048, dropout=0.1, max_len=5000):
        super(Transformer, self).__init__()
        
        # Embedding layers
        self.src_embedding = nn.Embedding(src_vocab_size, d_model)
        self.tgt_embedding = nn.Embedding(tgt_vocab_size, d_model)
        
        # Positional encoding
        self.pos_encoding = PositionalEncoding(d_model, max_len)
        
        # Encoder and Decoder
        self.encoder = TransformerEncoder(num_encoder_layers, d_model, num_heads, d_ff, dropout)
        self.decoder = TransformerDecoder(num_decoder_layers, d_model, num_heads, d_ff, dropout)
        
        # Output projection
        self.output_projection = nn.Linear(d_model, tgt_vocab_size)
        
        # Dropout
        self.dropout = nn.Dropout(dropout)
        
        # Scale embedding
        self.d_model = d_model
        
    def forward(self, src, tgt, src_mask=None, tgt_mask=None):
        # Embedding + Positional Encoding
        src_embedded = self.dropout(self.pos_encoding(
            self.src_embedding(src) * math.sqrt(self.d_model)
        ))
        tgt_embedded = self.dropout(self.pos_encoding(
            self.tgt_embedding(tgt) * math.sqrt(self.d_model)
        ))
        
        # Encoder
        encoder_output = self.encoder(src_embedded, src_mask)
        
        # Decoder
        decoder_output = self.decoder(tgt_embedded, encoder_output, tgt_mask, src_mask)
        
        # Output projection
        output = self.output_projection(decoder_output)
        
        return output
```

## マスキング戦略

### Padding Mask
```python
def create_padding_mask(seq, pad_token=0):
    return (seq != pad_token).unsqueeze(1).unsqueeze(2)
```

### Look-ahead Mask
```python
def create_look_ahead_mask(size):
    mask = torch.triu(torch.ones(size, size), diagonal=1)
    return mask == 0
```

### Combined Mask
```python
def create_masks(src, tgt, pad_token=0):
    # Source padding mask
    src_mask = create_padding_mask(src, pad_token)
    
    # Target padding mask
    tgt_padding_mask = create_padding_mask(tgt, pad_token)
    
    # Target look-ahead mask
    seq_len = tgt.size(1)
    look_ahead_mask = create_look_ahead_mask(seq_len)
    
    # Combined target mask
    tgt_mask = tgt_padding_mask & look_ahead_mask
    
    return src_mask, tgt_mask
```

## 学習と最適化

### Label Smoothing
```python
class LabelSmoothingLoss(nn.Module):
    def __init__(self, vocab_size, smoothing=0.1):
        super(LabelSmoothingLoss, self).__init__()
        self.criterion = nn.KLDivLoss(reduction='batchmean')
        self.confidence = 1.0 - smoothing
        self.smoothing = smoothing
        self.vocab_size = vocab_size
        
    def forward(self, predictions, targets):
        predictions = F.log_softmax(predictions, dim=-1)
        true_dist = torch.zeros_like(predictions)
        true_dist.fill_(self.smoothing / (self.vocab_size - 1))
        true_dist.scatter_(1, targets.unsqueeze(1), self.confidence)
        
        return self.criterion(predictions, true_dist)
```

### Warmup Learning Rate Schedule
```python
class WarmupScheduler:
    def __init__(self, optimizer, d_model, warmup_steps=4000):
        self.optimizer = optimizer
        self.d_model = d_model
        self.warmup_steps = warmup_steps
        self.step_num = 0
        
    def step(self):
        self.step_num += 1
        lr = self.d_model ** (-0.5) * min(
            self.step_num ** (-0.5),
            self.step_num * self.warmup_steps ** (-1.5)
        )
        
        for param_group in self.optimizer.param_groups:
            param_group['lr'] = lr
```

## BERT（Bidirectional Encoder Representations from Transformers）

### アーキテクチャ
```python
class BERT(nn.Module):
    def __init__(self, vocab_size, d_model=768, num_heads=12, 
                 num_layers=12, d_ff=3072, max_len=512, dropout=0.1):
        super(BERT, self).__init__()
        
        # Embeddings
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.position_embedding = nn.Embedding(max_len, d_model)
        self.token_type_embedding = nn.Embedding(2, d_model)
        
        # Transformer Encoder
        self.encoder = TransformerEncoder(num_layers, d_model, num_heads, d_ff, dropout)
        
        # MLM Head
        self.mlm_head = nn.Sequential(
            nn.Linear(d_model, d_model),
            nn.GELU(),
            nn.LayerNorm(d_model),
            nn.Linear(d_model, vocab_size)
        )
        
        # NSP Head
        self.nsp_head = nn.Linear(d_model, 2)
        
    def forward(self, input_ids, token_type_ids=None, position_ids=None):
        seq_len = input_ids.size(1)
        
        if position_ids is None:
            position_ids = torch.arange(seq_len, device=input_ids.device)
        if token_type_ids is None:
            token_type_ids = torch.zeros_like(input_ids)
            
        # Embeddings
        embeddings = (self.token_embedding(input_ids) + 
                     self.position_embedding(position_ids) + 
                     self.token_type_embedding(token_type_ids))
        
        # Encoder
        encoded = self.encoder(embeddings)
        
        # MLM predictions
        mlm_logits = self.mlm_head(encoded)
        
        # NSP prediction (use [CLS] token)
        nsp_logits = self.nsp_head(encoded[:, 0])
        
        return mlm_logits, nsp_logits
```

## GPT（Generative Pre-trained Transformer）

### アーキテクチャ
```python
class GPT(nn.Module):
    def __init__(self, vocab_size, d_model=768, num_heads=12, 
                 num_layers=12, d_ff=3072, max_len=1024, dropout=0.1):
        super(GPT, self).__init__()
        
        # Embeddings
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.position_embedding = nn.Embedding(max_len, d_model)
        
        # Transformer Decoder (Causal)
        self.decoder = TransformerDecoder(num_layers, d_model, num_heads, d_ff, dropout)
        
        # Language Model Head
        self.lm_head = nn.Linear(d_model, vocab_size)
        
    def forward(self, input_ids, attention_mask=None):
        seq_len = input_ids.size(1)
        position_ids = torch.arange(seq_len, device=input_ids.device)
        
        # Embeddings
        embeddings = self.token_embedding(input_ids) + self.position_embedding(position_ids)
        
        # Causal mask
        causal_mask = create_look_ahead_mask(seq_len).to(input_ids.device)
        
        # Decoder
        hidden_states = self.decoder(embeddings, mask=causal_mask)
        
        # Language model logits
        logits = self.lm_head(hidden_states)
        
        return logits
```

## 実践的な使用例

### 機械翻訳
```python
def translate(model, src_sentence, src_tokenizer, tgt_tokenizer, max_len=100):
    model.eval()
    
    # Encode source
    src_tokens = src_tokenizer.encode(src_sentence)
    src_tensor = torch.tensor([src_tokens])
    
    # Initialize target with start token
    tgt_tokens = [tgt_tokenizer.bos_token_id]
    
    for _ in range(max_len):
        tgt_tensor = torch.tensor([tgt_tokens])
        
        # Create masks
        src_mask, tgt_mask = create_masks(src_tensor, tgt_tensor)
        
        # Forward pass
        with torch.no_grad():
            output = model(src_tensor, tgt_tensor, src_mask, tgt_mask)
        
        # Get next token
        next_token = output[0, -1, :].argmax().item()
        tgt_tokens.append(next_token)
        
        # Stop if end token
        if next_token == tgt_tokenizer.eos_token_id:
            break
    
    return tgt_tokenizer.decode(tgt_tokens[1:-1])
```

### テキスト生成
```python
def generate_text(model, prompt, tokenizer, max_length=100, temperature=1.0):
    model.eval()
    
    # Encode prompt
    input_ids = tokenizer.encode(prompt, return_tensors='pt')
    
    with torch.no_grad():
        for _ in range(max_length):
            # Forward pass
            outputs = model(input_ids)
            logits = outputs[:, -1, :] / temperature
            
            # Sample next token
            probs = F.softmax(logits, dim=-1)
            next_token = torch.multinomial(probs, 1)
            
            # Append to sequence
            input_ids = torch.cat([input_ids, next_token], dim=-1)
            
            # Stop if end token
            if next_token.item() == tokenizer.eos_token_id:
                break
    
    return tokenizer.decode(input_ids[0])
```

## まとめ

Transformerは現代NLPの基盤技術で、Attention機構により長距離依存関係を効果的に捉えます。BERT、GPTなどの大規模言語モデルの基礎となっており、理解が不可欠です。

次回は、Transformerを基盤とした「大規模言語モデル（LLM）」について詳しく学習します。