---
title: "MLOps・モデルデプロイメント実践"
date: "2024-01-18"
category: "ai-course"
slug: "18-mlops-model-deployment"
difficulty: "intermediate"
number: 18
---

# MLOps・モデルデプロイメント実践

機械学習モデルを本番環境で安定運用するためのMLOps（Machine Learning Operations）について実践的に学習します。

## MLOpsとは

**MLOps**は、機械学習モデルの開発から本番運用まで全工程を効率化・自動化する手法・文化・技術の総称です。

### 従来の開発 vs MLOps
| 従来 | MLOps |
|------|-------|
| 手動デプロイ | 自動デプロイ |
| 個別管理 | 統合管理 |
| 実験中心 | 運用中心 |
| モデル単体 | システム全体 |

### MLOpsの構成要素
1. **実験管理**: パラメータ・メトリクス追跡
2. **モデル管理**: バージョン管理・レジストリ
3. **CI/CD**: 継続的統合・デプロイ
4. **監視**: 性能・ドリフト検知
5. **再学習**: 自動・半自動更新

## 実験管理・追跡

### MLflow による実験管理
```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score

# 実験の開始
mlflow.set_experiment("customer_churn_prediction")

def train_model(n_estimators, max_depth, min_samples_split):
    with mlflow.start_run():
        # パラメータの記録
        mlflow.log_param("n_estimators", n_estimators)
        mlflow.log_param("max_depth", max_depth)
        mlflow.log_param("min_samples_split", min_samples_split)
        
        # モデル訓練
        model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            random_state=42
        )
        model.fit(X_train, y_train)
        
        # 予測・評価
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        # メトリクス記録
        mlflow.log_metric("accuracy", accuracy)
        mlflow.log_metric("f1_score", f1)
        
        # モデル保存
        mlflow.sklearn.log_model(model, "model")
        
        # 追加アーティファクト
        feature_importance = pd.DataFrame({
            'feature': X_train.columns,
            'importance': model.feature_importances_
        })
        feature_importance.to_csv("feature_importance.csv")
        mlflow.log_artifact("feature_importance.csv")
        
        return model, accuracy

# ハイパーパラメータ探索
param_grid = [
    {"n_estimators": 100, "max_depth": 10, "min_samples_split": 2},
    {"n_estimators": 200, "max_depth": 15, "min_samples_split": 5},
    {"n_estimators": 300, "max_depth": 20, "min_samples_split": 10}
]

best_model = None
best_accuracy = 0

for params in param_grid:
    model, accuracy = train_model(**params)
    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_model = model

print(f"Best accuracy: {best_accuracy}")
```

### Weights & Biases (wandb) 活用
```python
import wandb

# プロジェクト初期化
wandb.init(project="deep_learning_experiment", config={
    "learning_rate": 0.001,
    "epochs": 100,
    "batch_size": 32,
    "architecture": "CNN"
})

# 学習ループ
for epoch in range(wandb.config.epochs):
    train_loss = train_epoch()
    val_loss, val_accuracy = validate()
    
    # メトリクス記録
    wandb.log({
        "epoch": epoch,
        "train_loss": train_loss,
        "val_loss": val_loss,
        "val_accuracy": val_accuracy
    })
    
    # 画像・グラフの記録
    if epoch % 10 == 0:
        wandb.log({"predictions": wandb.Image(prediction_plot)})
        wandb.log({"confusion_matrix": wandb.plot.confusion_matrix(
            probs=None, y_true=y_true, preds=y_pred, class_names=class_names
        )})

# モデル保存
wandb.save("model.h5")
```

## モデルレジストリ・バージョン管理

### MLflow Model Registry
```python
# モデル登録
model_name = "customer_churn_model"

# 最新の実験からモデル登録
latest_run = mlflow.search_runs(experiment_ids=["1"]).iloc[0]
model_uri = f"runs:/{latest_run.run_id}/model"

model_version = mlflow.register_model(
    model_uri=model_uri,
    name=model_name
)

# ステージ管理
client = mlflow.tracking.MlflowClient()

# Staging環境へ移行
client.transition_model_version_stage(
    name=model_name,
    version=model_version.version,
    stage="Staging"
)

# Production環境へ移行（承認後）
client.transition_model_version_stage(
    name=model_name,
    version=model_version.version,
    stage="Production"
)

# モデル読み込み
def load_production_model(model_name):
    model_uri = f"models:/{model_name}/Production"
    model = mlflow.sklearn.load_model(model_uri)
    return model
```

### DVC (Data Version Control)
```bash
# データバージョン管理
dvc init
dvc add data/train.csv
git add data/train.csv.dvc .gitignore
git commit -m "Add training data"

# モデルバージョン管理
dvc add models/model.pkl
git add models/model.pkl.dvc
git commit -m "Add trained model v1.0"

# パイプライン定義
# dvc.yaml
stages:
  prepare:
    cmd: python src/prepare.py
    deps:
    - src/prepare.py
    - data/raw
    outs:
    - data/processed
  
  train:
    cmd: python src/train.py
    deps:
    - src/train.py
    - data/processed
    params:
    - train.learning_rate
    - train.epochs
    outs:
    - models/model.pkl
    metrics:
    - metrics.json

# パイプライン実行
dvc repro
```

## モデルデプロイメント

### REST API デプロイ (FastAPI)
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from typing import List

app = FastAPI(title="ML Model API", version="1.0.0")

# モデル読み込み
model = joblib.load("models/production_model.pkl")
scaler = joblib.load("models/scaler.pkl")

class PredictionInput(BaseModel):
    features: List[float]
    
class PredictionOutput(BaseModel):
    prediction: float
    probability: List[float]
    model_version: str

@app.post("/predict", response_model=PredictionOutput)
async def predict(input_data: PredictionInput):
    try:
        # 前処理
        features = np.array(input_data.features).reshape(1, -1)
        features_scaled = scaler.transform(features)
        
        # 予測
        prediction = model.predict(features_scaled)[0]
        probability = model.predict_proba(features_scaled)[0].tolist()
        
        return PredictionOutput(
            prediction=float(prediction),
            probability=probability,
            model_version="1.0.0"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

# バッチ予測エンドポイント
@app.post("/predict_batch")
async def predict_batch(input_data: List[PredictionInput]):
    results = []
    for item in input_data:
        pred_result = await predict(item)
        results.append(pred_result)
    return results
```

### Docker化
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  ml-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/app/models/model.pkl
    volumes:
      - ./models:/app/models
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Kubernetes デプロイ
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-model-api
  template:
    metadata:
      labels:
        app: ml-model-api
    spec:
      containers:
      - name: ml-api
        image: ml-model:latest
        ports:
        - containerPort: 8000
        env:
        - name: MODEL_PATH
          value: "/app/models/model.pkl"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: ml-model-service
spec:
  selector:
    app: ml-model-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: LoadBalancer
```

## CI/CD パイプライン

### GitHub Actions
```yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest
    
    - name: Run tests
      run: |
        pytest tests/
    
    - name: Data validation
      run: |
        python src/validate_data.py
    
    - name: Model training
      run: |
        python src/train.py
        
    - name: Model validation
      run: |
        python src/validate_model.py

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Docker image
      run: |
        docker build -t ml-model:${{ github.sha }} .
    
    - name: Deploy to staging
      run: |
        # Staging環境へのデプロイ
        kubectl apply -f k8s/staging/
    
    - name: Integration tests
      run: |
        python tests/integration_tests.py
    
    - name: Deploy to production
      run: |
        # Production環境へのデプロイ
        kubectl apply -f k8s/production/
```

### Jenkins Pipeline
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        MODEL_NAME = 'customer-churn-model'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'pip install -r requirements.txt'
            }
        }
        
        stage('Data Validation') {
            steps {
                sh 'python src/validate_data.py'
            }
        }
        
        stage('Model Training') {
            steps {
                sh 'python src/train.py'
                archiveArtifacts artifacts: 'models/**/*', fingerprint: true
            }
        }
        
        stage('Model Testing') {
            steps {
                sh 'python src/test_model.py'
                publishTestResults testResultsPattern: 'test-results.xml'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/${MODEL_NAME}:${BUILD_NUMBER}")
                    docker.withRegistry("https://${DOCKER_REGISTRY}") {
                        image.push()
                        image.push("latest")
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                sh 'kubectl apply -f k8s/staging/'
                sh 'kubectl rollout status deployment/ml-model-api -n staging'
            }
        }
        
        stage('Integration Tests') {
            steps {
                sh 'python tests/integration_tests.py'
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                sh 'kubectl apply -f k8s/production/'
                sh 'kubectl rollout status deployment/ml-model-api -n production'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        failure {
            emailext (
                subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Build failed. Check console output at ${env.BUILD_URL}",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
```

## モニタリング・アラート

### モデル性能監視
```python
import prometheus_client
from prometheus_client import Counter, Histogram, Gauge
import time

# メトリクス定義
prediction_counter = Counter('ml_predictions_total', 'Total predictions made')
prediction_latency = Histogram('ml_prediction_duration_seconds', 'Prediction latency')
model_accuracy = Gauge('ml_model_accuracy', 'Current model accuracy')
data_drift_score = Gauge('ml_data_drift_score', 'Data drift score')

class ModelMonitor:
    def __init__(self, model, reference_data):
        self.model = model
        self.reference_data = reference_data
        self.prediction_buffer = []
        
    def predict_with_monitoring(self, X):
        start_time = time.time()
        
        try:
            # 予測実行
            predictions = self.model.predict(X)
            
            # メトリクス更新
            prediction_counter.inc()
            prediction_latency.observe(time.time() - start_time)
            
            # データドリフト検知
            drift_score = self.detect_data_drift(X)
            data_drift_score.set(drift_score)
            
            # 予測結果をバッファに保存
            self.prediction_buffer.extend(predictions.tolist())
            
            return predictions
            
        except Exception as e:
            # エラーメトリクス
            error_counter.inc()
            raise e
    
    def detect_data_drift(self, X):
        from scipy import stats
        
        drift_scores = []
        for i, feature in enumerate(X.T):
            # Kolmogorov-Smirnov test
            statistic, p_value = stats.ks_2samp(
                self.reference_data[:, i], 
                feature
            )
            drift_scores.append(statistic)
        
        return np.mean(drift_scores)
    
    def update_accuracy(self, y_true, y_pred):
        accuracy = np.mean(y_true == y_pred)
        model_accuracy.set(accuracy)
        
        # アラート条件
        if accuracy < 0.8:
            self.send_alert(f"Model accuracy dropped to {accuracy:.2f}")
    
    def send_alert(self, message):
        # Slack通知
        import requests
        webhook_url = "YOUR_SLACK_WEBHOOK_URL"
        payload = {"text": f"🚨 ML Model Alert: {message}"}
        requests.post(webhook_url, json=payload)
```

### Grafana ダッシュボード設定
```yaml
# grafana-dashboard.json (抜粋)
{
  "dashboard": {
    "title": "ML Model Monitoring",
    "panels": [
      {
        "title": "Prediction Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(ml_predictions_total[5m])",
            "legendFormat": "Predictions/sec"
          }
        ]
      },
      {
        "title": "Prediction Latency",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, ml_prediction_duration_seconds_bucket)",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Model Accuracy",
        "type": "singlestat",
        "targets": [
          {
            "expr": "ml_model_accuracy",
            "legendFormat": "Accuracy"
          }
        ]
      }
    ]
  }
}
```

## A/Bテスト・カナリアデプロイ

### A/Bテスト実装
```python
class ABTestFramework:
    def __init__(self, model_a, model_b, traffic_split=0.5):
        self.model_a = model_a
        self.model_b = model_b
        self.traffic_split = traffic_split
        self.results_a = []
        self.results_b = []
    
    def predict(self, X, user_id):
        # ユーザーIDに基づいてモデル選択
        use_model_b = hash(user_id) % 100 < (self.traffic_split * 100)
        
        if use_model_b:
            prediction = self.model_b.predict(X)
            self.results_b.append({
                'user_id': user_id,
                'prediction': prediction,
                'timestamp': time.time()
            })
            return prediction, 'model_b'
        else:
            prediction = self.model_a.predict(X)
            self.results_a.append({
                'user_id': user_id,
                'prediction': prediction,
                'timestamp': time.time()
            })
            return prediction, 'model_a'
    
    def analyze_results(self):
        from scipy import stats
        
        # 統計的有意差検定
        metric_a = [r['metric'] for r in self.results_a]
        metric_b = [r['metric'] for r in self.results_b]
        
        t_stat, p_value = stats.ttest_ind(metric_a, metric_b)
        
        return {
            'model_a_mean': np.mean(metric_a),
            'model_b_mean': np.mean(metric_b),
            'p_value': p_value,
            'significant': p_value < 0.05
        }
```

### Istio カナリアデプロイ
```yaml
# canary-deployment.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: ml-model-vs
spec:
  http:
  - match:
    - headers:
        canary:
          exact: "true"
    route:
    - destination:
        host: ml-model-service
        subset: v2
  - route:
    - destination:
        host: ml-model-service
        subset: v1
      weight: 90
    - destination:
        host: ml-model-service
        subset: v2
      weight: 10

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: ml-model-dr
spec:
  host: ml-model-service
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
```

## まとめ

MLOpsは機械学習モデルの実用化に不可欠な技術体系です。実験管理、モデルレジストリ、CI/CD、監視、A/Bテストを統合することで、安定したMLシステムを構築できます。

次回は「AI セキュリティ」について学習し、AIシステムの安全性確保について学びます。