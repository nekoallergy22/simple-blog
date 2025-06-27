---
title: "12. CNN詳説：畳み込みニューラルネットワークの設計"
date: "2024-01-12"
category: "ai-course"
slug: "12-cnn-architecture"
difficulty: "intermediate"
number: 12
---

# CNN詳説：畳み込みニューラルネットワークの設計

画像処理で圧倒的な性能を発揮するCNN（畳み込みニューラルネットワーク）の詳細な仕組みと設計原理を学習します。

## CNN の基本構造

### 畳み込み層（Convolutional Layer）

#### 畳み込み演算の数式
```
(f * g)(x, y) = Σᵢ Σⱼ f(i, j) · g(x-i, y-j)
```

#### 特徴マップの計算
```
Output[i,j] = Σₘ Σₙ Input[i+m, j+n] × Kernel[m, n] + Bias
```

#### パラメータ
- **カーネルサイズ**: 3×3, 5×5, 7×7
- **ストライド**: 畳み込みの移動幅
- **パディング**: 境界の処理方法
- **チャネル数**: 入力・出力の深さ

### 出力サイズの計算
```
Output_size = (Input_size + 2×Padding - Kernel_size) / Stride + 1
```

### プーリング層（Pooling Layer）

#### Max Pooling
```
MaxPool(X)[i,j] = max(X[i×s:i×s+k, j×s:j×s+k])
```

#### Average Pooling
```
AvgPool(X)[i,j] = mean(X[i×s:i×s+k, j×s:j×s+k])
```

### 実装例（PyTorch風）

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super(SimpleCNN, self).__init__()
        
        # 畳み込み層1: 3→32チャネル
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        
        # 畳み込み層2: 32→64チャネル
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        
        # 畳み込み層3: 64→128チャネル
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        
        # プーリング層
        self.pool = nn.MaxPool2d(2, 2)
        
        # 全結合層
        self.fc1 = nn.Linear(128 * 4 * 4, 256)
        self.fc2 = nn.Linear(256, num_classes)
        
        # Dropout
        self.dropout = nn.Dropout(0.5)
    
    def forward(self, x):
        # ブロック1
        x = self.pool(F.relu(self.bn1(self.conv1(x))))
        
        # ブロック2
        x = self.pool(F.relu(self.bn2(self.conv2(x))))
        
        # ブロック3
        x = self.pool(F.relu(self.bn3(self.conv3(x))))
        
        # 平坦化
        x = x.view(-1, 128 * 4 * 4)
        
        # 全結合層
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        
        return x
```

## 代表的なCNNアーキテクチャ

### LeNet-5 (1998)
**手書き数字認識用の初期CNN**

```
構造:
Input(32×32) → Conv(6@28×28) → Pool(6@14×14) → 
Conv(16@10×10) → Pool(16@5×5) → FC(120) → FC(84) → FC(10)
```

### AlexNet (2012)
**ImageNet革命の起点**

#### 特徴
- **ReLU活性化関数**の使用
- **Dropout**による正則化
- **データ拡張**（Data Augmentation）
- **GPU並列処理**

```python
class AlexNet(nn.Module):
    def __init__(self, num_classes=1000):
        super(AlexNet, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=11, stride=4, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
            nn.Conv2d(64, 192, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
            nn.Conv2d(192, 384, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(384, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
        )
        self.classifier = nn.Sequential(
            nn.Dropout(),
            nn.Linear(256 * 6 * 6, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Linear(4096, num_classes),
        )
```

### VGGNet (2014)
**小さなフィルタで深いネットワーク**

#### 設計思想
- **3×3フィルタ**のみ使用
- **深いネットワーク**（16-19層）
- **均一な構造**

```python
def make_vgg_layers(cfg, batch_norm=False):
    layers = []
    in_channels = 3
    for v in cfg:
        if v == 'M':
            layers += [nn.MaxPool2d(kernel_size=2, stride=2)]
        else:
            conv2d = nn.Conv2d(in_channels, v, kernel_size=3, padding=1)
            if batch_norm:
                layers += [conv2d, nn.BatchNorm2d(v), nn.ReLU(inplace=True)]
            else:
                layers += [conv2d, nn.ReLU(inplace=True)]
            in_channels = v
    return nn.Sequential(*layers)

# VGG16設定
vgg16_cfg = [64, 64, 'M', 128, 128, 'M', 256, 256, 256, 'M', 
             512, 512, 512, 'M', 512, 512, 512, 'M']
```

### ResNet (2015)
**残差接続による超深層ネットワーク**

#### 残差ブロック
```python
class BasicBlock(nn.Module):
    def __init__(self, in_planes, planes, stride=1):
        super(BasicBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_planes, planes, kernel_size=3, 
                              stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(planes)
        self.conv2 = nn.Conv2d(planes, planes, kernel_size=3, 
                              stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(planes)
        
        self.shortcut = nn.Sequential()
        if stride != 1 or in_planes != planes:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_planes, planes, kernel_size=1, 
                         stride=stride, bias=False),
                nn.BatchNorm2d(planes)
            )
    
    def forward(self, x):
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)  # 残差接続
        out = F.relu(out)
        return out
```

#### 残差接続の効果
```
F(x) = H(x) - x
H(x) = F(x) + x
```
- **勾配消失問題**の解決
- **152層**の超深層ネットワーク実現
- **恒等写像**の学習容易化

## 高度な設計技法

### Inception Module (GoogLeNet)
**複数スケールの並列処理**

```python
class InceptionModule(nn.Module):
    def __init__(self, in_channels, ch1x1, ch3x3red, ch3x3, 
                 ch5x5red, ch5x5, pool_proj):
        super(InceptionModule, self).__init__()
        
        # 1x1 conv
        self.branch1 = nn.Conv2d(in_channels, ch1x1, kernel_size=1)
        
        # 1x1 conv -> 3x3 conv
        self.branch2 = nn.Sequential(
            nn.Conv2d(in_channels, ch3x3red, kernel_size=1),
            nn.Conv2d(ch3x3red, ch3x3, kernel_size=3, padding=1)
        )
        
        # 1x1 conv -> 5x5 conv
        self.branch3 = nn.Sequential(
            nn.Conv2d(in_channels, ch5x5red, kernel_size=1),
            nn.Conv2d(ch5x5red, ch5x5, kernel_size=5, padding=2)
        )
        
        # 3x3 max pool -> 1x1 conv
        self.branch4 = nn.Sequential(
            nn.MaxPool2d(kernel_size=3, stride=1, padding=1),
            nn.Conv2d(in_channels, pool_proj, kernel_size=1)
        )
    
    def forward(self, x):
        branch1 = self.branch1(x)
        branch2 = self.branch2(x)
        branch3 = self.branch3(x)
        branch4 = self.branch4(x)
        
        outputs = [branch1, branch2, branch3, branch4]
        return torch.cat(outputs, 1)
```

### Depthwise Separable Convolution
**計算効率の向上**

```python
class DepthwiseSeparableConv(nn.Module):
    def __init__(self, in_channels, out_channels, stride=1):
        super(DepthwiseSeparableConv, self).__init__()
        
        # Depthwise convolution
        self.depthwise = nn.Conv2d(in_channels, in_channels, 
                                  kernel_size=3, stride=stride, 
                                  padding=1, groups=in_channels)
        
        # Pointwise convolution
        self.pointwise = nn.Conv2d(in_channels, out_channels, 
                                  kernel_size=1)
    
    def forward(self, x):
        x = self.depthwise(x)
        x = self.pointwise(x)
        return x
```

## データ拡張技術

### 基本的な変換
```python
import torchvision.transforms as transforms

transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=10),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, 
                          saturation=0.2, hue=0.1),
    transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                        std=[0.229, 0.224, 0.225])
])
```

### 高度な拡張技術

#### Cutout
```python
class Cutout:
    def __init__(self, n_holes, length):
        self.n_holes = n_holes
        self.length = length
    
    def __call__(self, img):
        h, w = img.size(1), img.size(2)
        mask = np.ones((h, w), np.float32)
        
        for n in range(self.n_holes):
            y = np.random.randint(h)
            x = np.random.randint(w)
            
            y1 = np.clip(y - self.length // 2, 0, h)
            y2 = np.clip(y + self.length // 2, 0, h)
            x1 = np.clip(x - self.length // 2, 0, w)
            x2 = np.clip(x + self.length // 2, 0, w)
            
            mask[y1: y2, x1: x2] = 0.
        
        mask = torch.from_numpy(mask).expand_as(img)
        img = img * mask
        return img
```

#### Mixup
```python
def mixup_data(x, y, alpha=1.0):
    if alpha > 0:
        lam = np.random.beta(alpha, alpha)
    else:
        lam = 1
    
    batch_size = x.size(0)
    index = torch.randperm(batch_size)
    
    mixed_x = lam * x + (1 - lam) * x[index, :]
    y_a, y_b = y, y[index]
    return mixed_x, y_a, y_b, lam

def mixup_criterion(criterion, pred, y_a, y_b, lam):
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)
```

## 転移学習

### 事前学習済みモデルの活用
```python
import torchvision.models as models

# 事前学習済みResNet50の読み込み
model = models.resnet50(pretrained=True)

# 最後の層を置き換え
num_classes = 10
model.fc = nn.Linear(model.fc.in_features, num_classes)

# 特徴抽出器として使用（パラメータ固定）
for param in model.parameters():
    param.requires_grad = False

# 最後の層のみ学習
model.fc.requires_grad = True
```

### ファインチューニング戦略
```python
# 段階的な学習率設定
optimizer = torch.optim.SGD([
    {'params': model.features.parameters(), 'lr': 1e-4},
    {'params': model.classifier.parameters(), 'lr': 1e-3}
], momentum=0.9)

# 学習率スケジューラ
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
    optimizer, T_max=100, eta_min=1e-6
)
```

## 可視化と解釈

### 特徴マップの可視化
```python
def visualize_feature_maps(model, input_image, layer_name):
    activation = {}
    
    def get_activation(name):
        def hook(model, input, output):
            activation[name] = output.detach()
        return hook
    
    # フックを登録
    model.conv1.register_forward_hook(get_activation('conv1'))
    
    # 順伝播
    _ = model(input_image)
    
    # 特徴マップを可視化
    feature_maps = activation['conv1'].squeeze(0)
    
    fig, axes = plt.subplots(4, 8, figsize=(16, 8))
    for i, ax in enumerate(axes.flat):
        if i < feature_maps.shape[0]:
            ax.imshow(feature_maps[i].cpu(), cmap='viridis')
            ax.axis('off')
```

### Grad-CAM
```python
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_backward_hook(self.save_gradient)
    
    def save_activation(self, module, input, output):
        self.activations = output
    
    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]
    
    def generate_cam(self, input_image, class_idx):
        # 順伝播
        output = self.model(input_image)
        
        # 指定クラスの勾配を計算
        self.model.zero_grad()
        output[0, class_idx].backward()
        
        # 重みを計算
        weights = torch.mean(self.gradients, dim=(2, 3))
        
        # CAMを生成
        cam = torch.zeros(self.activations.shape[2:])
        for i, w in enumerate(weights[0]):
            cam += w * self.activations[0, i, :, :]
        
        cam = F.relu(cam)
        cam = cam / torch.max(cam)
        
        return cam
```

## 実践的な学習のコツ

### 学習戦略
1. **事前学習済みモデル**の活用
2. **段階的学習**：低層固定→全層学習
3. **データ拡張**の積極的活用
4. **正則化**によるオーバーフィッティング防止

### ハイパーパラメータ調整
- **学習率**：1e-3から開始、検証ロス監視
- **バッチサイズ**：GPUメモリとのバランス
- **エポック数**：早期停止での調整

### デバッグ手法
- **学習曲線**の確認
- **特徴マップ**の可視化
- **勾配ノルム**の監視

## まとめ

CNNは画像認識タスクで革命的な性能を実現しました。畳み込み・プーリング操作の理解、代表的アーキテクチャの学習、データ拡張・転移学習の活用が重要です。

次回は、系列データ処理に特化した「RNN・LSTM」について詳しく学習します。