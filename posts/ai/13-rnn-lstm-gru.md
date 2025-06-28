---
title: "RNN・LSTM・GRU：系列データ処理の核心技術"
date: "2024-01-13"
category: "ai-course"
slug: "13-rnn-lstm-gru"
difficulty: "intermediate"
number: 13
---

# RNN・LSTM・GRU：系列データ処理の核心技術

時系列データや自然言語処理で重要な役割を果たすRNN（再帰型ニューラルネットワーク）とその発展形について詳しく学習します。

## RNN（Recurrent Neural Network）の基礎

### 基本構造と数式

#### RNNの状態更新式
```
h_t = tanh(W_hh × h_{t-1} + W_xh × x_t + b_h)
y_t = W_hy × h_t + b_y
```

- **h_t**: 時刻tの隠れ状態
- **x_t**: 時刻tの入力
- **y_t**: 時刻tの出力
- **W_hh, W_xh, W_hy**: 重み行列
- **b_h, b_y**: バイアス

#### 実装例（PyTorch風）
```python
import torch
import torch.nn as nn

class SimpleRNN(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(SimpleRNN, self).__init__()
        self.hidden_size = hidden_size
        
        # 重み行列
        self.W_xh = nn.Linear(input_size, hidden_size)
        self.W_hh = nn.Linear(hidden_size, hidden_size)
        self.W_hy = nn.Linear(hidden_size, output_size)
        
    def forward(self, input_seq):
        batch_size = input_seq.size(0)
        seq_len = input_seq.size(1)
        
        # 隠れ状態の初期化
        h = torch.zeros(batch_size, self.hidden_size)
        outputs = []
        
        for t in range(seq_len):
            x_t = input_seq[:, t, :]
            h = torch.tanh(self.W_xh(x_t) + self.W_hh(h))
            y_t = self.W_hy(h)
            outputs.append(y_t)
        
        return torch.stack(outputs, dim=1)
```

## RNNの問題点

### 勾配消失問題

#### 原因
長い系列での逆伝播時、勾配が指数的に減衰：

```
∂h_t/∂h_{t-k} = ∏_{i=1}^k ∂h_{t-i+1}/∂h_{t-i}
               = ∏_{i=1}^k W_hh × diag(tanh'(net_{t-i+1}))
```

#### 影響
- **長期依存関係**の学習困難
- **情報の忘却**
- **学習の不安定性**

### 勾配爆発問題
勾配が指数的に増大し、パラメータが発散

#### 対策：勾配クリッピング
```python
def clip_gradients(model, max_norm):
    total_norm = 0
    for p in model.parameters():
        if p.grad is not None:
            param_norm = p.grad.norm()
            total_norm += param_norm.item() ** 2
    total_norm = total_norm ** (1. / 2)
    
    clip_coef = max_norm / (total_norm + 1e-6)
    if clip_coef < 1:
        for p in model.parameters():
            if p.grad is not None:
                p.grad.mul_(clip_coef)
```

## LSTM（Long Short-Term Memory）

### アーキテクチャ

#### セル状態とゲート機構
```
f_t = σ(W_f × [h_{t-1}, x_t] + b_f)  # 忘却ゲート
i_t = σ(W_i × [h_{t-1}, x_t] + b_i)  # 入力ゲート
C̃_t = tanh(W_C × [h_{t-1}, x_t] + b_C)  # 候補値
C_t = f_t * C_{t-1} + i_t * C̃_t      # セル状態更新
o_t = σ(W_o × [h_{t-1}, x_t] + b_o)  # 出力ゲート
h_t = o_t * tanh(C_t)                 # 隠れ状態更新
```

#### 実装例
```python
class LSTMCell(nn.Module):
    def __init__(self, input_size, hidden_size):
        super(LSTMCell, self).__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        
        # 4つのゲートを同時に計算
        self.weight_ih = nn.Linear(input_size, 4 * hidden_size)
        self.weight_hh = nn.Linear(hidden_size, 4 * hidden_size)
    
    def forward(self, input, hidden):
        h_prev, c_prev = hidden
        
        # 線形変換
        gi = self.weight_ih(input)
        gh = self.weight_hh(h_prev)
        i_i, i_f, i_g, i_o = gi.chunk(4, 1)
        h_i, h_f, h_g, h_o = gh.chunk(4, 1)
        
        # ゲート計算
        input_gate = torch.sigmoid(i_i + h_i)
        forget_gate = torch.sigmoid(i_f + h_f)
        cell_gate = torch.tanh(i_g + h_g)
        output_gate = torch.sigmoid(i_o + h_o)
        
        # セル状態更新
        c_new = forget_gate * c_prev + input_gate * cell_gate
        h_new = output_gate * torch.tanh(c_new)
        
        return h_new, c_new

class LSTM(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers=1):
        super(LSTM, self).__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.layers = nn.ModuleList([
            LSTMCell(input_size if i == 0 else hidden_size, hidden_size)
            for i in range(num_layers)
        ])
    
    def forward(self, input, hidden=None):
        batch_size = input.size(0)
        seq_len = input.size(1)
        
        if hidden is None:
            h = [torch.zeros(batch_size, self.hidden_size) 
                 for _ in range(self.num_layers)]
            c = [torch.zeros(batch_size, self.hidden_size) 
                 for _ in range(self.num_layers)]
        else:
            h, c = hidden
        
        outputs = []
        for t in range(seq_len):
            x = input[:, t, :]
            new_h, new_c = [], []
            
            for layer_idx, layer in enumerate(self.layers):
                h_new, c_new = layer(x, (h[layer_idx], c[layer_idx]))
                new_h.append(h_new)
                new_c.append(c_new)
                x = h_new
            
            h, c = new_h, new_c
            outputs.append(h[-1])
        
        return torch.stack(outputs, dim=1), (h, c)
```

### LSTMの特徴

#### 長期記憶の保持
- **セル状態**による情報の長期保存
- **忘却ゲート**による不要情報の削除
- **入力ゲート**による重要情報の選択

## GRU（Gated Recurrent Unit）

### 簡素化されたアーキテクチャ

#### 更新式
```
r_t = σ(W_r × [h_{t-1}, x_t] + b_r)  # リセットゲート
z_t = σ(W_z × [h_{t-1}, x_t] + b_z)  # 更新ゲート
h̃_t = tanh(W_h × [r_t * h_{t-1}, x_t] + b_h)  # 候補状態
h_t = (1 - z_t) * h_{t-1} + z_t * h̃_t  # 状態更新
```

#### 実装例
```python
class GRUCell(nn.Module):
    def __init__(self, input_size, hidden_size):
        super(GRUCell, self).__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        
        self.weight_ih = nn.Linear(input_size, 3 * hidden_size)
        self.weight_hh = nn.Linear(hidden_size, 3 * hidden_size)
    
    def forward(self, input, hidden):
        gi = self.weight_ih(input)
        gh = self.weight_hh(hidden)
        
        i_r, i_z, i_n = gi.chunk(3, 1)
        h_r, h_z, h_n = gh.chunk(3, 1)
        
        # ゲート計算
        reset_gate = torch.sigmoid(i_r + h_r)
        update_gate = torch.sigmoid(i_z + h_z)
        new_gate = torch.tanh(i_n + reset_gate * h_n)
        
        # 状態更新
        new_h = (1 - update_gate) * hidden + update_gate * new_gate
        
        return new_h
```

### LSTM vs GRU

| 特徴 | LSTM | GRU |
|------|------|-----|
| パラメータ数 | 多い | 少ない |
| 計算複雑度 | 高い | 低い |
| 表現力 | 高い | 中程度 |
| 学習速度 | 遅い | 速い |
| 長期依存 | 優秀 | 良好 |

## 双方向RNN（Bidirectional RNN）

### 構造
```python
class BiLSTM(nn.Module):
    def __init__(self, input_size, hidden_size):
        super(BiLSTM, self).__init__()
        self.forward_lstm = LSTM(input_size, hidden_size)
        self.backward_lstm = LSTM(input_size, hidden_size)
        
    def forward(self, input):
        # 順方向
        forward_out, _ = self.forward_lstm(input)
        
        # 逆方向（入力を反転）
        backward_input = input.flip(dims=[1])
        backward_out, _ = self.backward_lstm(backward_input)
        backward_out = backward_out.flip(dims=[1])
        
        # 結合
        output = torch.cat([forward_out, backward_out], dim=2)
        return output
```

### 利点
- **過去と未来**の情報を同時活用
- **より豊富な文脈**理解
- **文全体**の情報を各時刻で利用

## 実践的な応用例

### 1. 時系列予測
```python
class TimeSeriesLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size):
        super(TimeSeriesLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, 
                           batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        # 最後の時刻の出力を使用
        predictions = self.fc(lstm_out[:, -1, :])
        return predictions

# 学習例
def train_time_series(model, dataloader, criterion, optimizer, num_epochs):
    model.train()
    for epoch in range(num_epochs):
        total_loss = 0
        for batch_x, batch_y in dataloader:
            optimizer.zero_grad()
            predictions = model(batch_x)
            loss = criterion(predictions, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        
        print(f'Epoch {epoch+1}/{num_epochs}, Loss: {total_loss/len(dataloader):.4f}')
```

### 2. 感情分析
```python
class SentimentLSTM(nn.Module):
    def __init__(self, vocab_size, embed_size, hidden_size, num_classes):
        super(SentimentLSTM, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embed_size)
        self.lstm = nn.LSTM(embed_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)
        self.dropout = nn.Dropout(0.5)
        
    def forward(self, x):
        embedded = self.embedding(x)
        lstm_out, (hidden, _) = self.lstm(embedded)
        
        # 最後の隠れ状態を使用
        output = self.dropout(hidden[-1])
        output = self.fc(output)
        return output
```

### 3. シーケンス to シーケンス
```python
class Seq2Seq(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(Seq2Seq, self).__init__()
        self.encoder = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.decoder = nn.LSTM(output_size, hidden_size, batch_first=True)
        self.output_projection = nn.Linear(hidden_size, output_size)
        
    def forward(self, src, tgt=None, max_length=50):
        # エンコーダ
        _, (hidden, cell) = self.encoder(src)
        
        if self.training and tgt is not None:
            # 学習時：Teacher Forcing
            decoder_out, _ = self.decoder(tgt, (hidden, cell))
            output = self.output_projection(decoder_out)
        else:
            # 推論時：自己回帰生成
            outputs = []
            input_token = torch.zeros(src.size(0), 1, src.size(2))
            h, c = hidden, cell
            
            for _ in range(max_length):
                out, (h, c) = self.decoder(input_token, (h, c))
                output_token = self.output_projection(out)
                outputs.append(output_token)
                input_token = output_token
            
            output = torch.cat(outputs, dim=1)
        
        return output
```

## 最適化技術

### 学習率スケジューリング
```python
# 段階的減衰
scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.1)

# コサインアニーリング
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)

# 適応的減衰
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', factor=0.5, patience=5
)
```

### 正則化技術

#### Dropout
```python
class DropoutLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, dropout_rate=0.2):
        super(DropoutLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, dropout=dropout_rate)
        self.dropout = nn.Dropout(dropout_rate)
    
    def forward(self, x):
        lstm_out, hidden = self.lstm(x)
        output = self.dropout(lstm_out)
        return output, hidden
```

#### 重み減衰
```python
optimizer = torch.optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
```

## デバッグと可視化

### 隠れ状態の可視化
```python
def visualize_hidden_states(model, input_seq):
    model.eval()
    with torch.no_grad():
        hidden_states = []
        h = torch.zeros(1, model.hidden_size)
        
        for t in range(input_seq.size(1)):
            x_t = input_seq[:, t:t+1, :]
            _, h = model.lstm_cell(x_t, h)
            hidden_states.append(h.numpy())
        
        hidden_states = np.array(hidden_states)
        
        plt.figure(figsize=(12, 8))
        plt.imshow(hidden_states.T, aspect='auto', cmap='viridis')
        plt.colorbar()
        plt.xlabel('Time Steps')
        plt.ylabel('Hidden Units')
        plt.title('Hidden State Evolution')
        plt.show()
```

### 注意重みの可視化
```python
def plot_attention_weights(attention_weights, input_tokens, output_tokens):
    fig, ax = plt.subplots(figsize=(10, 8))
    im = ax.imshow(attention_weights, cmap='Blues')
    
    ax.set_xticks(range(len(input_tokens)))
    ax.set_yticks(range(len(output_tokens)))
    ax.set_xticklabels(input_tokens, rotation=45)
    ax.set_yticklabels(output_tokens)
    
    plt.colorbar(im)
    plt.xlabel('Input Tokens')
    plt.ylabel('Output Tokens')
    plt.title('Attention Weights')
    plt.tight_layout()
    plt.show()
```

## 実践的なコツ

### データ前処理
1. **正規化**：入力データのスケール調整
2. **パディング**：系列長の統一
3. **マスキング**：パディング部分の無視

### ハイパーパラメータ調整
- **隠れ層サイズ**：64, 128, 256, 512
- **層数**：1-3層（深すぎると学習困難）
- **学習率**：1e-3から開始
- **バッチサイズ**：32-128

### 収束の監視
```python
def train_with_validation(model, train_loader, val_loader, num_epochs):
    train_losses, val_losses = [], []
    
    for epoch in range(num_epochs):
        # 学習
        model.train()
        train_loss = 0
        for batch in train_loader:
            # 学習処理
            pass
        
        # 検証
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for batch in val_loader:
                # 検証処理
                pass
        
        train_losses.append(train_loss)
        val_losses.append(val_loss)
        
        # 早期停止の判定
        if early_stopping_condition:
            break
    
    return train_losses, val_losses
```

## まとめ

RNN・LSTM・GRUは系列データ処理の基盤技術です。勾配消失問題の理解、ゲート機構の活用、適切な正則化技術の適用が重要です。現在はTransformerが主流ですが、基礎理解として必須の知識です。

次回は、現代NLPの革命を起こした「Transformer・Attention機構」について詳しく学習します。