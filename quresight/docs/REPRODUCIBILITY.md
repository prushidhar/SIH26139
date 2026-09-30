# QureSight Reproducibility & Benchmark Verification Guide

> **Empirical Rigor: Deterministic Splits, Seed Freezing, and Verification Protocols.**  
> *Smart India Hackathon 2024 / SIH26139*

---

## 1. Reproducibility Principles

Scientific credibility requires that independent evaluators can clone the repository, run the benchmarking pipeline, and produce identical metrics down to the reported decimal places. 

QureSight implements five safeguards to guarantee complete reproducibility:
1. **Pinned Pseudo-Random Generators:** Python, NumPy, Scikit-Learn, and PennyLane are seeded with `seed = 42`.
2. **Deterministic Quantum Circuit Initialization:** Variational ansatz parameters are initialized using a fixed Gaussian distribution $\mathcal{N}(0, 0.1)$ seeded at 42.
3. **Analytical Statevector Simulation:** The PennyLane `default.qubit` backend performs exact matrix-vector linear algebra without Monte Carlo shot stochasticity.
4. **Frozen Preprocessing Pipelines:** Train/test splits are stratified and frozen. All scaling parameters are stored in `models/preprocessor_pipeline.joblib`.
5. **Relational Audit Trail:** All executions are logged to `results/quresight.db` with input parameter hashes.

---

## 2. Environment Specification

| Component | Target Version | Verification Command |
| :--- | :--- | :--- |
| **Python** | `3.12.x` (or `3.11.x`) | `python --version` |
| **PennyLane** | `0.38.0` (or `0.36.0+`) | `python -c "import pennylane as qml; print(qml.__version__)"` |
| **Scikit-Learn** | `1.4.0+` | `python -c "import sklearn; print(sklearn.__version__)"` |
| **XGBoost** | `2.0.0+` | `python -c "import xgboost; print(xgboost.__version__)"` |
| **SHAP** | `0.44.0+` | `python -c "import shap; print(shap.__version__)"` |
| **NumPy** | `1.26.0+` | `python -c "import numpy; print(numpy.__version__)"` |
| **FastAPI** | `0.110.0+` | `python -c "import fastapi; print(fastapi.__version__)"` |

---

## 3. Benchmark Dataset Protocol

- **Dataset:** Breast Cancer Wisconsin (Diagnostic)
- **Scikit-Learn Loader:** `from sklearn.datasets import load_breast_cancer`
- **Total Records:** 569 instances
- **Splitting Strategy:**
  ```python
  from sklearn.model_selection import train_test_split
  from sklearn.datasets import load_breast_cancer

  data = load_breast_cancer()
  X, y = data.data, data.target

  X_train, X_test, y_train, y_test = train_test_split(
      X, y,
      test_size=0.20,
      random_state=42,
      stratify=y
  )
  ```
- **Holdout Test Set Size:** Exactly 114 samples (42 Malignant, 72 Benign).

---

## 4. Quantum Simulation Specifications

### Device Definition
```python
import pennylane as qml

# Statevector simulator with fixed seed
dev = qml.device("default.qubit", wires=4, seed=42)
```

### Preprocessing & Feature Encoding
```python
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import numpy as np

# 1. Standardize based ONLY on training data
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 2. Extract 4 Principal Components fitted ONLY on training data
pca = PCA(n_components=4, random_state=42)
X_train_pca = pca.fit_transform(X_train_scaled)
X_test_pca = pca.transform(X_test_scaled)

# 3. Angle scale to [0, pi] using training extrema
mins = X_train_pca.min(axis=0)
maxs = X_train_pca.max(axis=0)

X_train_angles = np.pi * (X_train_pca - mins) / (maxs - mins)
X_test_angles = np.pi * (X_test_pca - mins) / (maxs - mins)
X_test_angles = np.clip(X_test_angles, 0.0, np.pi)
```

---

## 5. End-to-End Reproduction Instructions

### Option A: Command-Line Benchmark Reproduction
Run the automated experiment runner script:
```bash
# From the quresight/ root directory:
python scripts/run_experiments.py --seed 42 --output results/benchmark_run.json
```
The script will:
1. Load the Wisconsin Breast Cancer dataset.
2. Partition into the stratified 80/20 train/test split.
3. Fit classical models (`LogisticRegression`, `RandomForest`, `XGBoost`).
4. Train the 4-qubit `VQC` via Adam optimization.
5. Compute the quantum kernel Gram matrix and solve the `QSVC`.
6. Output exact evaluation metrics to `results/benchmark_run.json`.
7. Commit all records to `results/quresight.db`.

### Option B: Interactive Dashboard Reproduction
1. Launch backend:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8001
   ```
2. Launch frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:3000/benchmark`.
4. Click **"Execute Full Benchmark"**.
5. The live progress bar monitors model convergence and displays metrics directly in the comparative data table.
