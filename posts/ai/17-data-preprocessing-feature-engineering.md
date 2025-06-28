---
title: "データ前処理・特徴量エンジニアリング実践"
date: "2024-01-17"
category: "ai-course"
slug: "17-data-preprocessing-feature-engineering"
difficulty: "intermediate"
number: 17
---

# データ前処理・特徴量エンジニアリング実践

機械学習プロジェクトの成功を左右するデータの前処理と特徴量エンジニアリングについて、実践的な手法を学習します。

## データ前処理の重要性

「データサイエンティストの仕事の80%はデータクリーニング」と言われるように、生データを機械学習に適した形に変換することは極めて重要です。

### 一般的なデータ品質問題
- **欠損値**: 測定エラー、データ収集の問題
- **外れ値**: 入力ミス、システムエラー
- **データ型の不整合**: 文字列と数値の混在
- **重複データ**: 同一レコードの複数存在
- **スケールの違い**: 異なる単位・範囲の特徴量

## 欠損値処理

### 欠損値の種類
```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# 欠損値パターンの可視化
def visualize_missing_data(df):
    plt.figure(figsize=(12, 8))
    
    # 欠損値マップ
    plt.subplot(2, 2, 1)
    sns.heatmap(df.isnull(), cbar=True, yticklabels=False, cmap='viridis')
    plt.title('Missing Value Pattern')
    
    # 欠損値の割合
    plt.subplot(2, 2, 2)
    missing_percent = (df.isnull().sum() / len(df)) * 100
    missing_percent[missing_percent > 0].plot(kind='bar')
    plt.title('Missing Value Percentage by Column')
    plt.ylabel('Percentage')
    
    # 欠損値の組み合わせ
    plt.subplot(2, 2, 3)
    import missingno as msno
    msno.bar(df)
    plt.title('Missing Value Count')
    
    plt.tight_layout()
    plt.show()

# 欠損値の種類判定
def analyze_missing_pattern(df):
    """
    MCAR: Missing Completely At Random
    MAR: Missing At Random  
    MNAR: Missing Not At Random
    """
    # Little's MCAR Test (実装例)
    # 実際にはlittleMCARtest等のライブラリを使用
    pass
```

### 欠損値処理手法

#### 1. 削除
```python
# 行の削除
df_dropna = df.dropna()  # 欠損値を含む行を削除
df_dropna_thresh = df.dropna(thresh=5)  # 非欠損値が5個未満の行を削除

# 列の削除
df_drop_cols = df.dropna(axis=1)  # 欠損値を含む列を削除
df_drop_cols_thresh = df.dropna(axis=1, thresh=100)  # 非欠損値が100個未満の列を削除
```

#### 2. 単純補完
```python
# 統計量による補完
df['age'].fillna(df['age'].mean(), inplace=True)  # 平均値
df['income'].fillna(df['income'].median(), inplace=True)  # 中央値
df['category'].fillna(df['category'].mode()[0], inplace=True)  # 最頻値

# 定数による補完
df['score'].fillna(0, inplace=True)
df['comment'].fillna('No Comment', inplace=True)

# 前後の値による補完
df['temperature'].fillna(method='ffill', inplace=True)  # 前の値
df['temperature'].fillna(method='bfill', inplace=True)  # 後の値
```

#### 3. 高度な補完
```python
from sklearn.impute import SimpleImputer, KNNImputer, IterativeImputer

# KNN補完
def knn_imputation(df, n_neighbors=5):
    # 数値データのみ
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    imputer = KNNImputer(n_neighbors=n_neighbors)
    df_imputed = df.copy()
    df_imputed[numeric_cols] = imputer.fit_transform(df[numeric_cols])
    
    return df_imputed

# 反復補完（MICE: Multiple Imputation by Chained Equations）
def iterative_imputation(df):
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    imputer = IterativeImputer(random_state=42, max_iter=10)
    df_imputed = df.copy()
    df_imputed[numeric_cols] = imputer.fit_transform(df[numeric_cols])
    
    return df_imputed

# カスタム補完関数
def custom_imputation(df):
    df_imputed = df.copy()
    
    # グループ別補完
    df_imputed['salary'] = df_imputed.groupby('department')['salary'].transform(
        lambda x: x.fillna(x.median())
    )
    
    # 条件付き補完
    mask = (df_imputed['age'].isnull()) & (df_imputed['experience'] > 5)
    df_imputed.loc[mask, 'age'] = df_imputed.loc[mask, 'experience'] + 22
    
    return df_imputed
```

## 外れ値検出・処理

### 統計的手法
```python
def detect_outliers_statistical(df, columns):
    outliers = {}
    
    for col in columns:
        # IQR法
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers[col] = df[(df[col] < lower_bound) | (df[col] > upper_bound)].index
        
        # Z-score法
        z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
        outliers[f'{col}_zscore'] = df[z_scores > 3].index
        
        # Modified Z-score法
        median = df[col].median()
        mad = np.median(np.abs(df[col] - median))
        modified_z_scores = 0.6745 * (df[col] - median) / mad
        outliers[f'{col}_modified_zscore'] = df[np.abs(modified_z_scores) > 3.5].index
    
    return outliers

# 可視化
def visualize_outliers(df, column):
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    
    # ボックスプロット
    axes[0].boxplot(df[column].dropna())
    axes[0].set_title(f'{column} - Box Plot')
    
    # ヒストグラム
    axes[1].hist(df[column].dropna(), bins=50, alpha=0.7)
    axes[1].set_title(f'{column} - Histogram')
    
    # Q-Qプロット
    from scipy import stats
    stats.probplot(df[column].dropna(), dist="norm", plot=axes[2])
    axes[2].set_title(f'{column} - Q-Q Plot')
    
    plt.tight_layout()
    plt.show()
```

### 機械学習による外れ値検出
```python
from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from sklearn.neighbors import LocalOutlierFactor

def ml_outlier_detection(df, contamination=0.1):
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    X = df[numeric_cols].fillna(df[numeric_cols].median())
    
    results = {}
    
    # Isolation Forest
    iso_forest = IsolationForest(contamination=contamination, random_state=42)
    results['isolation_forest'] = iso_forest.fit_predict(X)
    
    # One-Class SVM
    oc_svm = OneClassSVM(nu=contamination)
    results['one_class_svm'] = oc_svm.fit_predict(X)
    
    # Local Outlier Factor
    lof = LocalOutlierFactor(n_neighbors=20, contamination=contamination)
    results['lof'] = lof.fit_predict(X)
    
    # 結果を統合
    outlier_ensemble = np.sum([results[method] == -1 for method in results], axis=0)
    results['ensemble'] = outlier_ensemble >= 2  # 2つ以上の手法で外れ値と判定
    
    return results
```

## データ変換・正規化

### スケーリング
```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, QuantileTransformer

def apply_scaling(df, method='standard'):
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df_scaled = df.copy()
    
    if method == 'standard':
        scaler = StandardScaler()
    elif method == 'minmax':
        scaler = MinMaxScaler()
    elif method == 'robust':
        scaler = RobustScaler()
    elif method == 'quantile':
        scaler = QuantileTransformer(output_distribution='normal')
    
    df_scaled[numeric_cols] = scaler.fit_transform(df[numeric_cols])
    
    return df_scaled, scaler

# カスタムスケーリング
def log_transform(df, columns):
    df_transformed = df.copy()
    for col in columns:
        # 負の値がある場合の対処
        if (df[col] <= 0).any():
            df_transformed[col] = np.log1p(df[col] - df[col].min() + 1)
        else:
            df_transformed[col] = np.log1p(df[col])
    return df_transformed

def box_cox_transform(df, columns):
    from scipy import stats
    df_transformed = df.copy()
    
    for col in columns:
        # Box-Cox変換（正の値のみ）
        if (df[col] > 0).all():
            df_transformed[col], _ = stats.boxcox(df[col])
        else:
            # Yeo-Johnson変換（負の値も対応）
            df_transformed[col], _ = stats.yeojohnson(df[col])
    
    return df_transformed
```

## カテゴリカル変数のエンコーディング

### 基本的なエンコーディング
```python
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder

def categorical_encoding(df):
    df_encoded = df.copy()
    
    # Label Encoding（順序のないカテゴリ）
    le = LabelEncoder()
    df_encoded['color_label'] = le.fit_transform(df['color'])
    
    # One-Hot Encoding
    df_onehot = pd.get_dummies(df, columns=['category'], prefix='category')
    
    # Ordinal Encoding（順序のあるカテゴリ）
    education_order = ['High School', 'Bachelor', 'Master', 'PhD']
    oe = OrdinalEncoder(categories=[education_order])
    df_encoded['education_ordinal'] = oe.fit_transform(df[['education']])
    
    return df_encoded
```

### 高度なエンコーディング
```python
# Target Encoding
def target_encoding(df, categorical_col, target_col, cv=5):
    from sklearn.model_selection import KFold
    
    df_encoded = df.copy()
    kf = KFold(n_splits=cv, shuffle=True, random_state=42)
    encoded_values = np.zeros(len(df))
    
    for train_idx, val_idx in kf.split(df):
        train_df = df.iloc[train_idx]
        val_df = df.iloc[val_idx]
        
        # 訓練データでエンコーディング値を計算
        encoding_map = train_df.groupby(categorical_col)[target_col].mean()
        
        # 検証データに適用
        encoded_values[val_idx] = val_df[categorical_col].map(encoding_map)
    
    df_encoded[f'{categorical_col}_target_encoded'] = encoded_values
    return df_encoded

# Frequency Encoding
def frequency_encoding(df, columns):
    df_encoded = df.copy()
    
    for col in columns:
        freq_map = df[col].value_counts().to_dict()
        df_encoded[f'{col}_freq'] = df[col].map(freq_map)
    
    return df_encoded

# Binary Encoding
def binary_encoding(df, column):
    from category_encoders import BinaryEncoder
    
    be = BinaryEncoder(cols=[column])
    df_binary = be.fit_transform(df)
    
    return df_binary
```

## 特徴量エンジニアリング

### 数値特徴量の生成
```python
def create_numerical_features(df):
    df_features = df.copy()
    
    # 基本的な演算
    df_features['total_income'] = df['salary'] + df['bonus']
    df_features['income_ratio'] = df['salary'] / (df['expenses'] + 1)
    df_features['savings_rate'] = (df['income'] - df['expenses']) / df['income']
    
    # 統計的特徴量
    df_features['age_zscore'] = (df['age'] - df['age'].mean()) / df['age'].std()
    df_features['income_percentile'] = df['income'].rank(pct=True)
    
    # 多項式特徴量
    from sklearn.preprocessing import PolynomialFeatures
    poly = PolynomialFeatures(degree=2, include_bias=False)
    poly_features = poly.fit_transform(df[['age', 'income']])
    poly_feature_names = poly.get_feature_names_out(['age', 'income'])
    
    for i, name in enumerate(poly_feature_names):
        df_features[name] = poly_features[:, i]
    
    return df_features

# 時系列特徴量
def create_time_features(df, date_column):
    df_time = df.copy()
    df_time[date_column] = pd.to_datetime(df_time[date_column])
    
    # 基本的な時間特徴量
    df_time['year'] = df_time[date_column].dt.year
    df_time['month'] = df_time[date_column].dt.month
    df_time['day'] = df_time[date_column].dt.day
    df_time['dayofweek'] = df_time[date_column].dt.dayofweek
    df_time['quarter'] = df_time[date_column].dt.quarter
    df_time['is_weekend'] = df_time['dayofweek'].isin([5, 6]).astype(int)
    
    # 循環特徴量（周期性を保持）
    df_time['month_sin'] = np.sin(2 * np.pi * df_time['month'] / 12)
    df_time['month_cos'] = np.cos(2 * np.pi * df_time['month'] / 12)
    df_time['hour_sin'] = np.sin(2 * np.pi * df_time[date_column].dt.hour / 24)
    df_time['hour_cos'] = np.cos(2 * np.pi * df_time[date_column].dt.hour / 24)
    
    # ラグ特徴量
    df_time['sales_lag1'] = df_time['sales'].shift(1)
    df_time['sales_lag7'] = df_time['sales'].shift(7)
    df_time['sales_rolling_mean7'] = df_time['sales'].rolling(window=7).mean()
    df_time['sales_rolling_std7'] = df_time['sales'].rolling(window=7).std()
    
    return df_time
```

### テキスト特徴量
```python
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
import re

def create_text_features(df, text_column):
    df_text = df.copy()
    
    # 基本的なテキスト統計
    df_text['text_length'] = df[text_column].str.len()
    df_text['word_count'] = df[text_column].str.split().str.len()
    df_text['char_count'] = df[text_column].str.len()
    df_text['avg_word_length'] = df_text['char_count'] / df_text['word_count']
    
    # 句読点・記号の数
    df_text['punct_count'] = df[text_column].str.count(r'[^\w\s]')
    df_text['upper_count'] = df[text_column].str.count(r'[A-Z]')
    df_text['digit_count'] = df[text_column].str.count(r'\d')
    
    # 感情分析
    from textblob import TextBlob
    df_text['sentiment'] = df[text_column].apply(
        lambda x: TextBlob(str(x)).sentiment.polarity
    )
    
    # 言語検出
    from langdetect import detect
    def safe_detect(text):
        try:
            return detect(str(text))
        except:
            return 'unknown'
    
    df_text['language'] = df[text_column].apply(safe_detect)
    
    return df_text

# TF-IDFベクトル化
def create_tfidf_features(df, text_column, max_features=1000):
    tfidf = TfidfVectorizer(
        max_features=max_features,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95
    )
    
    tfidf_matrix = tfidf.fit_transform(df[text_column].fillna(''))
    feature_names = tfidf.get_feature_names_out()
    
    tfidf_df = pd.DataFrame(
        tfidf_matrix.toarray(),
        columns=[f'tfidf_{name}' for name in feature_names]
    )
    
    return pd.concat([df, tfidf_df], axis=1)
```

## 特徴量選択

### 統計的手法
```python
from sklearn.feature_selection import (
    SelectKBest, f_classif, f_regression, chi2,
    mutual_info_classif, mutual_info_regression
)

def statistical_feature_selection(X, y, task='classification', k=10):
    if task == 'classification':
        # カテゴリカル特徴量: Chi-square
        chi2_selector = SelectKBest(chi2, k=k)
        chi2_features = chi2_selector.fit_transform(X, y)
        
        # 数値特徴量: F-test
        f_selector = SelectKBest(f_classif, k=k)
        f_features = f_selector.fit_transform(X, y)
        
        # 相互情報量
        mi_selector = SelectKBest(mutual_info_classif, k=k)
        mi_features = mi_selector.fit_transform(X, y)
        
    else:  # regression
        f_selector = SelectKBest(f_regression, k=k)
        f_features = f_selector.fit_transform(X, y)
        
        mi_selector = SelectKBest(mutual_info_regression, k=k)
        mi_features = mi_selector.fit_transform(X, y)
    
    return {
        'chi2': chi2_features if task == 'classification' else None,
        'f_test': f_features,
        'mutual_info': mi_features
    }
```

### モデルベース特徴量選択
```python
from sklearn.feature_selection import SelectFromModel
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.linear_model import LassoCV

def model_based_feature_selection(X, y, method='random_forest'):
    if method == 'random_forest':
        estimator = RandomForestClassifier(n_estimators=100, random_state=42)
    elif method == 'extra_trees':
        estimator = ExtraTreesClassifier(n_estimators=100, random_state=42)
    elif method == 'lasso':
        estimator = LassoCV(cv=5, random_state=42)
    
    selector = SelectFromModel(estimator)
    X_selected = selector.fit_transform(X, y)
    
    # 選択された特徴量のインデックス
    selected_features = selector.get_support(indices=True)
    
    return X_selected, selected_features

# 特徴量重要度の可視化
def plot_feature_importance(X, y, feature_names, top_k=20):
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X, y)
    
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': rf.feature_importances_
    }).sort_values('importance', ascending=False)
    
    plt.figure(figsize=(10, 8))
    sns.barplot(data=feature_importance.head(top_k), y='feature', x='importance')
    plt.title(f'Top {top_k} Feature Importances')
    plt.tight_layout()
    plt.show()
    
    return feature_importance
```

## データ品質評価

### データプロファイリング
```python
def data_quality_report(df):
    report = {}
    
    for col in df.columns:
        col_info = {
            'dtype': str(df[col].dtype),
            'missing_count': df[col].isnull().sum(),
            'missing_percentage': (df[col].isnull().sum() / len(df)) * 100,
            'unique_count': df[col].nunique(),
            'unique_percentage': (df[col].nunique() / len(df)) * 100
        }
        
        if df[col].dtype in ['int64', 'float64']:
            col_info.update({
                'mean': df[col].mean(),
                'std': df[col].std(),
                'min': df[col].min(),
                'max': df[col].max(),
                'q25': df[col].quantile(0.25),
                'q50': df[col].quantile(0.50),
                'q75': df[col].quantile(0.75),
                'skewness': df[col].skew(),
                'kurtosis': df[col].kurtosis()
            })
        else:
            col_info.update({
                'most_frequent': df[col].mode().iloc[0] if not df[col].mode().empty else None,
                'most_frequent_count': df[col].value_counts().iloc[0] if not df[col].empty else 0
            })
        
        report[col] = col_info
    
    return pd.DataFrame(report).T

# データドリフト検出
def detect_data_drift(df_train, df_test, columns, threshold=0.05):
    from scipy import stats
    
    drift_results = {}
    
    for col in columns:
        if df_train[col].dtype in ['int64', 'float64']:
            # Kolmogorov-Smirnov test
            statistic, p_value = stats.ks_2samp(df_train[col].dropna(), df_test[col].dropna())
        else:
            # Chi-square test
            train_counts = df_train[col].value_counts()
            test_counts = df_test[col].value_counts()
            
            # 共通カテゴリのみ使用
            common_categories = set(train_counts.index) & set(test_counts.index)
            if len(common_categories) > 1:
                train_freq = train_counts[list(common_categories)]
                test_freq = test_counts[list(common_categories)]
                statistic, p_value = stats.chisquare(test_freq, train_freq)
            else:
                statistic, p_value = 0, 1
        
        drift_results[col] = {
            'statistic': statistic,
            'p_value': p_value,
            'drift_detected': p_value < threshold
        }
    
    return drift_results
```

## パイプライン化

### 前処理パイプライン
```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.base import BaseEstimator, TransformerMixin

class DataPreprocessingPipeline:
    def __init__(self):
        # 数値特徴量の前処理
        self.numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        
        # カテゴリカル特徴量の前処理
        self.categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        
    def create_preprocessor(self, numeric_features, categorical_features):
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', self.numeric_transformer, numeric_features),
                ('cat', self.categorical_transformer, categorical_features)
            ]
        )
        return preprocessor

# カスタムトランスフォーマー
class OutlierRemover(BaseEstimator, TransformerMixin):
    def __init__(self, method='iqr', threshold=1.5):
        self.method = method
        self.threshold = threshold
        self.lower_bounds = {}
        self.upper_bounds = {}
    
    def fit(self, X, y=None):
        for col in X.select_dtypes(include=[np.number]).columns:
            if self.method == 'iqr':
                Q1 = X[col].quantile(0.25)
                Q3 = X[col].quantile(0.75)
                IQR = Q3 - Q1
                self.lower_bounds[col] = Q1 - self.threshold * IQR
                self.upper_bounds[col] = Q3 + self.threshold * IQR
            elif self.method == 'zscore':
                mean = X[col].mean()
                std = X[col].std()
                self.lower_bounds[col] = mean - self.threshold * std
                self.upper_bounds[col] = mean + self.threshold * std
        
        return self
    
    def transform(self, X):
        X_transformed = X.copy()
        
        for col in self.lower_bounds:
            X_transformed[col] = X_transformed[col].clip(
                lower=self.lower_bounds[col],
                upper=self.upper_bounds[col]
            )
        
        return X_transformed

# 完全なパイプライン
def create_full_pipeline():
    return Pipeline([
        ('outlier_removal', OutlierRemover()),
        ('feature_engineering', FeatureEngineer()),
        ('preprocessing', DataPreprocessingPipeline().create_preprocessor(
            numeric_features=['age', 'income'],
            categorical_features=['category', 'region']
        )),
        ('feature_selection', SelectKBest(k=20))
    ])
```

## まとめ

データ前処理と特徴量エンジニアリングは機械学習プロジェクトの成功に不可欠です。欠損値処理、外れ値検出、適切なエンコーディング、特徴量生成・選択を体系的に行うことで、モデルの性能を大幅に向上させることができます。

次回は「MLOps・モデル運用」について学習し、機械学習システムの本番運用について学びます。