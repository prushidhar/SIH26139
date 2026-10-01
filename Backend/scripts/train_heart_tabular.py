#!/usr/bin/env python3
"""
================================================================================
TRAIN TABULAR HEART DISEASE QML PIPELINE (AstroVall02 Architecture Reference)
================================================================================
Trains the dual-engine QML architecture for UCI Cleveland Heart Disease dataset:
  - 13 Clinical Hemodynamic Features
  - StandardScaler + PCA(4) + MinMaxScaler([-pi, pi])
  - 4-Qubit AngleEmbedding (RX) + StronglyEntanglingLayers(layers=3)
  - Pauli-Z expectation values + Linear Readout Head
  - Classical Benchmarks: Random Forest + Logistic Regression
  - Saves artifacts to Backend/models_v1/artifacts_v1/heart_tabular/
================================================================================
"""

import os
import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score, recall_score, precision_score
import pennylane as qml

# Output directory
ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "models_v1" / "artifacts_v1" / "heart_tabular"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

DATA_PATH = Path(__file__).resolve().parents[2] / "quresight" / "data" / "raw" / "heart.csv"
if not DATA_PATH.exists():
    DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "raw" / "heart.csv"

print(f"Loading Cleveland Heart Dataset from: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)
df.columns = [c.replace("\ufeff", "").strip() for c in df.columns]
print(f"Dataset shape: {df.shape}, Columns: {list(df.columns)}")

FEATURE_NAMES = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", 
    "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"
]

X = df[FEATURE_NAMES].values
y = df["target"].values

# 1. Fit Preprocessors
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

pca = PCA(n_components=4, random_state=42)
X_pca = pca.fit_transform(X_scaled)

minmax = MinMaxScaler(feature_range=(-np.pi, np.pi))
X_angles = minmax.fit_transform(X_pca)

# 2. Fit Classical Baselines
rf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
rf.fit(X_scaled, y)

lr = LogisticRegression(C=1.0, random_state=42)
lr.fit(X_scaled, y)

# 3. Setup PennyLane VQC (AstroVall02 StronglyEntanglingLayers)
N_QUBITS = 4
N_LAYERS = 3
dev = qml.device("default.qubit", wires=N_QUBITS)

@qml.qnode(dev, interface="autograd")
def cardiac_vqc_circuit(weights, angles):
    for i in range(N_QUBITS):
        qml.RX(angles[i], wires=i)
    qml.StronglyEntanglingLayers(weights, wires=range(N_QUBITS))
    return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

from pennylane import numpy as pnp
np.random.seed(42)
vqc_weights = pnp.random.uniform(low=-np.pi, high=np.pi, size=(N_LAYERS, N_QUBITS, 3), requires_grad=True)

# Train VQC weights
opt = qml.AdamOptimizer(stepsize=0.08)
n_samples = len(X_angles)
batch_size = 32
n_epochs = 15

print(f"Optimizing 4-Qubit StronglyEntanglingLayers VQC over {n_epochs} epochs...")

for epoch in range(n_epochs):
    perm = np.random.permutation(n_samples)
    epoch_cost = 0.0
    batches = 0
    for b_start in range(0, n_samples, batch_size):
        idx = perm[b_start : b_start + batch_size]
        X_b = X_angles[idx]
        y_b = y[idx]
        y_b_mapped = np.where(y_b == 0, -1.0, 1.0)

        def cost(w):
            batch_costs = []
            for sample, target_val in zip(X_b, y_b_mapped):
                exps = cardiac_vqc_circuit(w, sample)
                # Expectation average
                pred = pnp.mean(pnp.stack(exps))
                batch_costs.append((pred - target_val) ** 2)
            return pnp.mean(pnp.stack(batch_costs))

        vqc_weights, c = opt.step_and_cost(cost, vqc_weights)
        epoch_cost += float(c)
        batches += 1
    if (epoch + 1) % 5 == 0 or epoch == 0:
        print(f"Epoch {epoch + 1}/{n_epochs} - Mean Cost: {epoch_cost / batches:.4f}")

# Extract Quantum Features (Pauli-Z expectations) for all samples
print("Extracting Quantum Expectation Features across cohort...")
quantum_features = []
for sample in X_angles:
    exps = [float(val) for val in cardiac_vqc_circuit(vqc_weights, sample)]
    quantum_features.append(exps)
quantum_features = np.array(quantum_features)

# Train calibrated quantum readout head
vqc_readout = LogisticRegression(C=1.0, random_state=42)
vqc_readout.fit(quantum_features, y)

# Evaluate 5-fold cross validation
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_rf_acc, cv_lr_acc, cv_q_acc = [], [], []
cv_rf_auc, cv_lr_auc, cv_q_auc = [], [], []

for train_idx, test_idx in skf.split(X, y):
    X_tr_s, X_te_s = X_scaled[train_idx], X_scaled[test_idx]
    y_tr, y_te = y[train_idx], y[test_idx]
    
    # RF
    rf_m = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42).fit(X_tr_s, y_tr)
    cv_rf_acc.append(accuracy_score(y_te, rf_m.predict(X_te_s)))
    cv_rf_auc.append(roc_auc_score(y_te, rf_m.predict_proba(X_te_s)[:, 1]))

    # LR
    lr_m = LogisticRegression(random_state=42).fit(X_tr_s, y_tr)
    cv_lr_acc.append(accuracy_score(y_te, lr_m.predict(X_te_s)))
    cv_lr_auc.append(roc_auc_score(y_te, lr_m.predict_proba(X_te_s)[:, 1]))

    # Quantum
    q_tr, q_te = quantum_features[train_idx], quantum_features[test_idx]
    q_m = LogisticRegression(random_state=42).fit(q_tr, y_tr)
    cv_q_acc.append(accuracy_score(y_te, q_m.predict(q_te)))
    cv_q_auc.append(roc_auc_score(y_te, q_m.predict_proba(q_te)[:, 1]))

benchmark_report = {
    "dataset": "UCI Cleveland Heart Disease (AstroVall02 Reference)",
    "n_samples": int(len(df)),
    "n_features": 13,
    "feature_names": FEATURE_NAMES,
    "pca_explained_variance": [float(v) for v in pca.explained_variance_ratio_],
    "pca_cumulative_variance": float(np.sum(pca.explained_variance_ratio_)),
    "qml_architecture": {
        "n_qubits": N_QUBITS,
        "n_layers": N_LAYERS,
        "ansatz": "StronglyEntanglingLayers",
        "embedding": "AngleEmbedding (RX)",
        "observables": ["<Z0>", "<Z1>", "<Z2>", "<Z3>"],
        "device": "PennyLane default.qubit"
    },
    "metrics": {
        "random_forest": {
            "accuracy": f"{np.mean(cv_rf_acc)*100:.2f} ± {np.std(cv_rf_acc)*100:.2f}%",
            "auroc": f"{np.mean(cv_rf_auc):.4f} ± {np.std(cv_rf_auc):.4f}"
        },
        "logistic_regression": {
            "accuracy": f"{np.mean(cv_lr_acc)*100:.2f} ± {np.std(cv_lr_acc)*100:.2f}%",
            "auroc": f"{np.mean(cv_lr_auc):.4f} ± {np.std(cv_lr_auc):.4f}"
        },
        "hybrid_vqc_quantum": {
            "accuracy": f"{np.mean(cv_q_acc)*100:.2f} ± {np.std(cv_q_acc)*100:.2f}%",
            "auroc": f"{np.mean(cv_q_auc):.4f} ± {np.std(cv_q_auc):.4f}"
        }
    }
}

print("\n--- Model Evaluation Complete ---")
print("RF CV Acc:", benchmark_report["metrics"]["random_forest"]["accuracy"])
print("LR CV Acc:", benchmark_report["metrics"]["logistic_regression"]["accuracy"])
print("Quantum CV Acc:", benchmark_report["metrics"]["hybrid_vqc_quantum"]["accuracy"])

# 4. Save Artifacts
joblib.dump(scaler, ARTIFACTS_DIR / "scaler.joblib")
joblib.dump(pca, ARTIFACTS_DIR / "pca.joblib")
joblib.dump(minmax, ARTIFACTS_DIR / "minmax.joblib")
joblib.dump(rf, ARTIFACTS_DIR / "random_forest.joblib")
joblib.dump(lr, ARTIFACTS_DIR / "logistic_regression.joblib")
joblib.dump(vqc_readout, ARTIFACTS_DIR / "vqc_readout.joblib")
np.save(ARTIFACTS_DIR / "vqc_weights.npy", np.array(vqc_weights))

with open(ARTIFACTS_DIR / "benchmark_report.json", "w", encoding="utf-8") as f:
    json.dump(benchmark_report, f, indent=2)

print(f"\nAll artifacts successfully saved to: {ARTIFACTS_DIR}")
