---
title: "強化学習基礎：エージェントが環境から学ぶ仕組み"
date: "2024-01-16"
category: "ai-course"
slug: "16-reinforcement-learning-basics"
difficulty: "intermediate"
number: 16
---

# 強化学習基礎：エージェントが環境から学ぶ仕組み

試行錯誤を通じて最適な行動を学習する強化学習について、基本概念から代表的なアルゴリズムまで詳しく学習します。

## 強化学習の基本概念

### 構成要素
- **エージェント（Agent）**: 学習する主体
- **環境（Environment）**: エージェントが行動する場
- **状態（State）**: 環境の現在の状況
- **行動（Action）**: エージェントが取れる選択肢
- **報酬（Reward）**: 行動に対するフィードバック

### マルコフ決定過程（MDP）
```
MDP = (S, A, P, R, γ)
```
- **S**: 状態空間
- **A**: 行動空間  
- **P**: 状態遷移確率
- **R**: 報酬関数
- **γ**: 割引率

### 基本的な学習ループ
```python
for episode in range(num_episodes):
    state = env.reset()
    total_reward = 0
    
    while not done:
        # 行動選択
        action = agent.select_action(state)
        
        # 環境での行動実行
        next_state, reward, done, info = env.step(action)
        
        # 学習
        agent.learn(state, action, reward, next_state, done)
        
        state = next_state
        total_reward += reward
```

## Q学習（Q-Learning）

### 基本原理
Q値（行動価値関数）を学習し、最適な行動を選択

#### Q値更新式
```
Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
                           a'
```

### 実装例
```python
import numpy as np
import random

class QLearningAgent:
    def __init__(self, state_size, action_size, learning_rate=0.1, 
                 discount_factor=0.99, epsilon=1.0, epsilon_decay=0.995, 
                 epsilon_min=0.01):
        self.state_size = state_size
        self.action_size = action_size
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min
        
        # Q-table初期化
        self.q_table = np.zeros((state_size, action_size))
    
    def select_action(self, state):
        # ε-greedy戦略
        if np.random.random() <= self.epsilon:
            return random.randrange(self.action_size)  # 探索
        else:
            return np.argmax(self.q_table[state])  # 活用
    
    def learn(self, state, action, reward, next_state, done):
        # Q値更新
        if done:
            target = reward
        else:
            target = reward + self.discount_factor * np.max(self.q_table[next_state])
        
        self.q_table[state, action] += self.learning_rate * (
            target - self.q_table[state, action]
        )
        
        # εの減衰
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

# 迷路環境での使用例
def train_maze_agent():
    env = MazeEnvironment()
    agent = QLearningAgent(state_size=100, action_size=4)
    
    for episode in range(1000):
        state = env.reset()
        total_reward = 0
        
        while True:
            action = agent.select_action(state)
            next_state, reward, done, _ = env.step(action)
            agent.learn(state, action, reward, next_state, done)
            
            state = next_state
            total_reward += reward
            
            if done:
                break
        
        if episode % 100 == 0:
            print(f"Episode {episode}, Total Reward: {total_reward}")
```

## Deep Q-Network (DQN)

### アーキテクチャ
```python
import torch
import torch.nn as nn
import torch.optim as optim
import random
from collections import deque

class DQN(nn.Module):
    def __init__(self, state_size, action_size, hidden_size=128):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(state_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.fc3 = nn.Linear(hidden_size, action_size)
        
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        x = self.fc3(x)
        return x

class DQNAgent:
    def __init__(self, state_size, action_size, learning_rate=0.001):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=10000)
        self.epsilon = 1.0
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.learning_rate = learning_rate
        self.batch_size = 32
        self.target_update_freq = 100
        self.train_freq = 4
        
        # メインネットワークとターゲットネットワーク
        self.q_network = DQN(state_size, action_size)
        self.target_network = DQN(state_size, action_size)
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=learning_rate)
        
        # ターゲットネットワークの初期化
        self.update_target_network()
        
    def update_target_network(self):
        self.target_network.load_state_dict(self.q_network.state_dict())
    
    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))
    
    def select_action(self, state):
        if np.random.random() <= self.epsilon:
            return random.randrange(self.action_size)
        
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        q_values = self.q_network(state_tensor)
        return q_values.argmax().item()
    
    def replay(self):
        if len(self.memory) < self.batch_size:
            return
        
        batch = random.sample(self.memory, self.batch_size)
        states = torch.FloatTensor([e[0] for e in batch])
        actions = torch.LongTensor([e[1] for e in batch])
        rewards = torch.FloatTensor([e[2] for e in batch])
        next_states = torch.FloatTensor([e[3] for e in batch])
        dones = torch.BoolTensor([e[4] for e in batch])
        
        current_q_values = self.q_network(states).gather(1, actions.unsqueeze(1))
        
        # Double DQN
        next_actions = self.q_network(next_states).argmax(1).unsqueeze(1)
        next_q_values = self.target_network(next_states).gather(1, next_actions).squeeze(1)
        target_q_values = rewards + (0.99 * next_q_values * ~dones)
        
        loss = nn.MSELoss()(current_q_values.squeeze(), target_q_values)
        
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
```

## Policy Gradient Methods

### REINFORCE算法
```python
class REINFORCEAgent:
    def __init__(self, state_size, action_size, learning_rate=0.001):
        self.state_size = state_size
        self.action_size = action_size
        
        # ポリシーネットワーク
        self.policy_network = nn.Sequential(
            nn.Linear(state_size, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Linear(128, action_size),
            nn.Softmax(dim=-1)
        )
        
        self.optimizer = optim.Adam(self.policy_network.parameters(), lr=learning_rate)
        
        # エピソードのデータ保存
        self.log_probs = []
        self.rewards = []
    
    def select_action(self, state):
        state_tensor = torch.FloatTensor(state)
        action_probs = self.policy_network(state_tensor)
        action_dist = torch.distributions.Categorical(action_probs)
        action = action_dist.sample()
        
        # log確率を保存（後で勾配計算に使用）
        self.log_probs.append(action_dist.log_prob(action))
        
        return action.item()
    
    def learn(self):
        # 割引累積報酬の計算
        discounted_rewards = []
        R = 0
        for r in reversed(self.rewards):
            R = r + 0.99 * R
            discounted_rewards.insert(0, R)
        
        # 正規化
        discounted_rewards = torch.FloatTensor(discounted_rewards)
        discounted_rewards = (discounted_rewards - discounted_rewards.mean()) / (
            discounted_rewards.std() + 1e-8
        )
        
        # ポリシー損失の計算
        policy_loss = []
        for log_prob, reward in zip(self.log_probs, discounted_rewards):
            policy_loss.append(-log_prob * reward)
        
        # 勾配更新
        self.optimizer.zero_grad()
        policy_loss = torch.stack(policy_loss).sum()
        policy_loss.backward()
        self.optimizer.step()
        
        # データクリア
        self.log_probs = []
        self.rewards = []
```

## Actor-Critic方法

### A2C (Advantage Actor-Critic)
```python
class A2CAgent:
    def __init__(self, state_size, action_size, learning_rate=0.001):
        self.state_size = state_size
        self.action_size = action_size
        
        # 共通特徴抽出層
        self.shared_layers = nn.Sequential(
            nn.Linear(state_size, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU()
        )
        
        # Actor（ポリシー）
        self.actor = nn.Sequential(
            nn.Linear(128, action_size),
            nn.Softmax(dim=-1)
        )
        
        # Critic（価値関数）
        self.critic = nn.Linear(128, 1)
        
        self.optimizer = optim.Adam(
            list(self.shared_layers.parameters()) + 
            list(self.actor.parameters()) + 
            list(self.critic.parameters()),
            lr=learning_rate
        )
        
    def forward(self, state):
        features = self.shared_layers(state)
        action_probs = self.actor(features)
        state_value = self.critic(features)
        return action_probs, state_value
    
    def select_action(self, state):
        state_tensor = torch.FloatTensor(state)
        action_probs, _ = self.forward(state_tensor)
        action_dist = torch.distributions.Categorical(action_probs)
        action = action_dist.sample()
        return action.item(), action_dist.log_prob(action)
    
    def learn(self, states, actions, rewards, next_states, dones, log_probs):
        states = torch.FloatTensor(states)
        next_states = torch.FloatTensor(next_states)
        rewards = torch.FloatTensor(rewards)
        
        # 価値関数の計算
        _, current_values = self.forward(states)
        _, next_values = self.forward(next_states)
        
        # TD誤差（Advantage）の計算
        targets = rewards + 0.99 * next_values.squeeze() * (1 - torch.FloatTensor(dones))
        advantages = targets - current_values.squeeze()
        
        # Actor損失
        actor_loss = -(torch.stack(log_probs) * advantages.detach()).mean()
        
        # Critic損失
        critic_loss = advantages.pow(2).mean()
        
        # 合計損失
        total_loss = actor_loss + critic_loss
        
        self.optimizer.zero_grad()
        total_loss.backward()
        self.optimizer.step()
```

## PPO (Proximal Policy Optimization)

### クリップ版PPO
```python
class PPOAgent:
    def __init__(self, state_size, action_size, learning_rate=3e-4, clip_ratio=0.2):
        self.state_size = state_size
        self.action_size = action_size
        self.clip_ratio = clip_ratio
        
        # Actor-Criticネットワーク
        self.network = ActorCritic(state_size, action_size)
        self.optimizer = optim.Adam(self.network.parameters(), lr=learning_rate)
        
        # 経験バッファ
        self.buffer = PPOBuffer()
        
    def select_action(self, state):
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state)
            action_probs, value = self.network(state_tensor)
            action_dist = torch.distributions.Categorical(action_probs)
            action = action_dist.sample()
            log_prob = action_dist.log_prob(action)
            
        return action.item(), log_prob.item(), value.item()
    
    def update(self):
        # バッファからデータ取得
        states, actions, old_log_probs, rewards, values, dones = self.buffer.get()
        
        # Advantage計算（GAE）
        advantages = self.compute_gae(rewards, values, dones)
        returns = advantages + values
        
        # 複数エポック学習
        for _ in range(10):  # PPOエポック数
            # 現在のポリシーでlog確率と価値を計算
            action_probs, new_values = self.network(states)
            action_dist = torch.distributions.Categorical(action_probs)
            new_log_probs = action_dist.log_prob(actions)
            
            # 重要度比
            ratio = torch.exp(new_log_probs - old_log_probs)
            
            # クリップ版目的関数
            surr1 = ratio * advantages
            surr2 = torch.clamp(ratio, 1 - self.clip_ratio, 1 + self.clip_ratio) * advantages
            actor_loss = -torch.min(surr1, surr2).mean()
            
            # 価値関数損失
            critic_loss = nn.MSELoss()(new_values.squeeze(), returns)
            
            # エントロピー正則化
            entropy = action_dist.entropy().mean()
            
            # 合計損失
            total_loss = actor_loss + 0.5 * critic_loss - 0.01 * entropy
            
            self.optimizer.zero_grad()
            total_loss.backward()
            torch.nn.utils.clip_grad_norm_(self.network.parameters(), 0.5)
            self.optimizer.step()
        
        self.buffer.clear()
    
    def compute_gae(self, rewards, values, dones, gamma=0.99, lam=0.95):
        advantages = torch.zeros_like(rewards)
        gae = 0
        
        for t in reversed(range(len(rewards))):
            if t == len(rewards) - 1:
                next_value = 0
            else:
                next_value = values[t + 1]
            
            delta = rewards[t] + gamma * next_value * (1 - dones[t]) - values[t]
            gae = delta + gamma * lam * (1 - dones[t]) * gae
            advantages[t] = gae
        
        return advantages
```

## 強化学習の応用例

### ゲームAI
```python
# Atari Breakout DQN
class AtariDQN:
    def __init__(self):
        self.env = gym.make('Breakout-v4')
        self.state_processor = AtariStateProcessor()
        self.agent = DQNAgent(state_size=84*84*4, action_size=4)
    
    def train(self, num_episodes=1000):
        for episode in range(num_episodes):
            state = self.env.reset()
            state = self.state_processor.process(state)
            total_reward = 0
            
            while True:
                action = self.agent.select_action(state)
                next_state, reward, done, _ = self.env.step(action)
                next_state = self.state_processor.process(next_state)
                
                self.agent.remember(state, action, reward, next_state, done)
                self.agent.replay()
                
                state = next_state
                total_reward += reward
                
                if done:
                    break
```

### ロボット制御
```python
class RobotController:
    def __init__(self):
        self.agent = PPOAgent(state_size=20, action_size=6)  # 関節角度制御
        
    def train_walking(self):
        for episode in range(1000):
            # 初期姿勢
            joint_angles = self.reset_robot()
            
            for step in range(1000):
                # 現在の状態（センサー情報）
                state = self.get_sensor_data()
                
                # 行動選択（関節トルク）
                action, log_prob, value = self.agent.select_action(state)
                
                # ロボット制御
                self.apply_torques(action)
                
                # 報酬計算（前進距離、安定性等）
                reward = self.calculate_reward()
                
                # 学習データ保存
                self.agent.buffer.store(state, action, reward, log_prob, value)
                
                if step % 100 == 0:
                    self.agent.update()
```

### トレーディング
```python
class TradingAgent:
    def __init__(self, market_data):
        self.data = market_data
        self.agent = A2CAgent(state_size=20, action_size=3)  # buy, sell, hold
        self.portfolio = Portfolio()
        
    def train(self):
        for episode in range(1000):
            self.portfolio.reset()
            
            for day in range(len(self.data) - 1):
                # 市場状態（テクニカル指標）
                state = self.get_market_state(day)
                
                # 行動選択
                action, log_prob = self.agent.select_action(state)
                
                # 取引実行
                self.execute_trade(action, day)
                
                # 報酬（利益）
                reward = self.portfolio.get_return()
                
                # 学習
                next_state = self.get_market_state(day + 1)
                self.agent.learn([state], [action], [reward], [next_state], [False], [log_prob])
```

## 実装上の重要なテクニック

### Experience Replay
```python
class ReplayBuffer:
    def __init__(self, capacity=10000):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))
    
    def sample(self, batch_size):
        return random.sample(self.buffer, batch_size)
```

### Prioritized Experience Replay
```python
class PrioritizedReplayBuffer:
    def __init__(self, capacity=10000, alpha=0.6):
        self.capacity = capacity
        self.alpha = alpha
        self.buffer = []
        self.priorities = []
        self.pos = 0
        
    def push(self, state, action, reward, next_state, done, error):
        priority = (abs(error) + 1e-5) ** self.alpha
        
        if len(self.buffer) < self.capacity:
            self.buffer.append((state, action, reward, next_state, done))
            self.priorities.append(priority)
        else:
            self.buffer[self.pos] = (state, action, reward, next_state, done)
            self.priorities[self.pos] = priority
        
        self.pos = (self.pos + 1) % self.capacity
```

## デバッグと可視化

### 学習曲線の監視
```python
def plot_learning_curve(rewards, window=100):
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(rewards)
    plt.title('Episode Rewards')
    plt.xlabel('Episode')
    plt.ylabel('Reward')
    
    plt.subplot(1, 2, 2)
    smoothed_rewards = np.convolve(rewards, np.ones(window)/window, mode='valid')
    plt.plot(smoothed_rewards)
    plt.title(f'Smoothed Rewards (window={window})')
    plt.xlabel('Episode')
    plt.ylabel('Average Reward')
    
    plt.tight_layout()
    plt.show()
```

### Q値の可視化
```python
def visualize_q_values(agent, env):
    q_values = np.zeros((env.height, env.width, env.action_size))
    
    for i in range(env.height):
        for j in range(env.width):
            state = i * env.width + j
            q_values[i, j] = agent.q_table[state]
    
    fig, axes = plt.subplots(1, env.action_size, figsize=(15, 3))
    actions = ['Up', 'Down', 'Left', 'Right']
    
    for a in range(env.action_size):
        im = axes[a].imshow(q_values[:, :, a], cmap='viridis')
        axes[a].set_title(f'Q-values for {actions[a]}')
        plt.colorbar(im, ax=axes[a])
    
    plt.tight_layout()
    plt.show()
```

## まとめ

強化学習はエージェントが環境との相互作用を通じて最適な行動を学習する手法です。Q学習、DQN、Policy Gradient、Actor-Critic、PPOなど様々なアルゴリズムがあり、ゲーム、ロボット制御、金融など幅広い分野で応用されています。

これで中級編は完了です。次からは上級編として、より実践的で高度な内容を学習していきます。