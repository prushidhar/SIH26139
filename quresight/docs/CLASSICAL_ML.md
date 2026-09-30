# QureSight Classical Machine Learning Architecture

## 1. Overview
Implemented in [`quresight/ml/classical/trainer.py`](file:///c:/Users/P%20RUSHIDHAR/OneDrive/Desktop/SIH26139/quresight/ml/classical/trainer.py), QureSight integrates four distinct classical algorithmic paradigms to establish rigorous, empirically grounded diagnostic baselines.

---

## 2. Model Zoo & Specifications

### 2.1 Logistic Regression (`logistic_regression`)
- **Algorithm:** L2-regularized linear classification with liblinear solver.
- **Hyperparameters:** `C=1.0`, `max_iter=1000`, `random_state=42`.
- **Clinical Role:** High-interpretability linear baseline providing log-odds coefficients directly corresponding to biomarker diagnostic risk.

### 2.2 Random Forest (`random_forest`)
- **Algorithm:** Ensemble of 100 decorrelated classification trees using bootstrap aggregation.
- **Hyperparameters:** `n_estimators=100`, `max_depth=6`, `min_samples_split=4`, `random_state=42`.
- **Clinical Role:** Handles non-linear feature interactions and provides intrinsic Gini feature importances while remaining robust against overfitting.

### 2.3 Extreme Gradient Boosting (`xgboost`)
- **Algorithm:** Regularized gradient boosted decision trees optimizing pseudo-residual loss.
- **Hyperparameters:** `n_estimators=100`, `learning_rate=0.08`, `max_depth=4`, `subsample=0.85`, `eval_metric='logloss'`.
- **Clinical Role:** Industry gold standard for tabular clinical benchmarks with tree-based shrinkage regularization.

### 2.4 Support Vector Classifier (`svm`)
- **Algorithm:** C-Support Vector Classification with Radial Basis Function (RBF) kernel.
- **Hyperparameters:** `C=1.0`, `kernel='rbf'`, `gamma='scale'`, `probability=True`.
- **Clinical Role:** Direct classical analogue to Quantum Kernel SVM, allowing fair comparison between classical Hilbert spaces (RBF kernel) and quantum statevector Hilbert spaces (ZZ-entangled feature map).

---

## 3. Training & Evaluation Flow
Each classical model executes:
1. `fit(X_train, y_train)` on standardized, leakage-free partitions.
2. `predict(X_test)` to obtain binary classification decisions.
3. `predict_proba(X_test)[:, 1]` to obtain well-calibrated continuous risk scores.
4. Comprehensive metric calculation via [`MetricsCalculator`](file:///c:/Users/P%20RUSHIDHAR/OneDrive/Desktop/SIH26139/quresight/ml/evaluation/metrics.py):
   - ROC-AUC
   - Accuracy, Precision, Recall (Sensitivity)
   - Specificity
   - F1-Score
   - Wall-clock training and inference latency
5. Model persistence via `joblib` into `quresight/models/`.

---

## 4. Empirical Baseline Performance (Wisconsin Diagnostic Benchmark, $N=114$ Test Set)

| Model | ROC-AUC | Accuracy | Sensitivity (Recall) | Specificity | F1-Score | Training Latency |
|---|---|---|---|---|---|---|
| **Logistic Regression** | **0.9954** | **98.25%** | **98.61%** | **97.62%** | **98.61%** | 0.003s |
| **Random Forest** | 0.9939 | 95.61% | 97.22% | 92.86% | 96.55% | 0.125s |
| **XGBoost** | 0.9927 | 95.61% | 98.61% | 90.48% | 96.60% | 0.084s |
| **Classical SVM (RBF)** | 0.9944 | 97.37% | 98.61% | 95.24% | 97.93% | 0.006s |
