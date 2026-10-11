#!/usr/bin/env python3
"""
================================================================================
TRAIN HEPATITIS C & LIVER FIBROSIS 4-QUBIT VQC PIPELINE
================================================================================
Trains the 4-qubit ring-entangled VQC architecture for Hepatitis C:
  - 12 Canonical HCV Serum Biomarkers:
      Age, Sex_m, ALB, ALP, ALT, AST, BIL, CHE, CHOL, CREA, GGT, PROT
  - StandardScaler + PCA(4) + MinMaxScaler([-pi, pi])
  - 4-Qubit Dual-Angle (RY+RZ) Embedding + 3-Layer Ring CNOT Entanglement
  - 4 Pauli-Z expectation values + Calibrated Logistic Regression Readout
  - Saves artifacts to Backend/models_v1/artifacts_v1/hepatitis/
================================================================================
"""

import os
import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, roc_auc_score
import pennylane as qml
from pennylane import numpy as pnp

ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "models_v1" / "artifacts_v1" / "hepatitis"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

CANONICAL_FEATURES = [
    "Age", "Sex_m", "ALB", "ALP", "ALT", "AST", "BIL", "CHE", "CHOL", "CREA", "GGT", "PROT"
]

def load_or_generate_hcv_data():
    csv_path = Path(__file__).resolve().parents[1] / "data" / "biomedical" / "hcvdat0.csv"
    if csv_path.exists():
        print(f"Loading UCI HCV dataset from: {csv_path}")
        df = pd.read_csv(csv_path)
        # Parse Category into binary target (0: healthy/blood donor, 1: hepatitis/fibrosis/cirrhosis)
        df["target"] = df["Category"].apply(lambda c: 0 if str(c).strip().startswith("0") else 1)
        # Map Sex: m -> 1, f -> 0
        df["Sex_m"] = df["Sex"].apply(lambda s: 1.0 if str(s).strip().lower().startswith("m") else 0.0)
        
        # Impute missing values
        for feat in CANONICAL_FEATURES:
            if feat in df.columns:
                df[feat] = pd.to_numeric(df[feat], errors="coerce")
                df[feat] = df[feat].fillna(df[feat].median())
        
        X = df[CANONICAL_FEATURES].values
        y = df["target"].values
        return X, y

    print("Generating synthetic HCV cohort dataset...")
    rng = np.random.RandomState(42)
    n_samples = 400
    n_pos = n_samples // 2
    n_neg = n_samples - n_pos

    # Blood Donors / Healthy
    age_neg = rng.normal(42.0, 9.0, n_neg).clip(20, 75)
    sex_neg = rng.choice([0.0, 1.0], size=n_neg, p=[0.4, 0.6])
    alb_neg = rng.normal(42.0, 4.0, n_neg).clip(30, 55)
    alp_neg = rng.normal(65.0, 18.0, n_neg).clip(30, 110)
    alt_neg = rng.normal(24.0, 12.0, n_neg).clip(8, 50)
    ast_neg = rng.normal(26.0, 10.0, n_neg).clip(10, 50)
    bil_neg = rng.normal(8.0, 4.0, n_neg).clip(2, 20)
    che_neg = rng.normal(8.5, 1.8, n_neg).clip(5, 14)
    chol_neg = rng.normal(5.4, 1.0, n_neg).clip(3, 8)
    crea_neg = rng.normal(78.0, 16.0, n_neg).clip(45, 120)
    ggt_neg = rng.normal(28.0, 16.0, n_neg).clip(8, 70)
    prot_neg = rng.normal(73.0, 4.5, n_neg).clip(60, 85)

    X_neg = np.column_stack([
        age_neg, sex_neg, alb_neg, alp_neg, alt_neg, ast_neg,
        bil_neg, che_neg, chol_neg, crea_neg, ggt_neg, prot_neg
    ])
    y_neg = np.zeros(n_neg, dtype=int)

    # Hepatitis / Fibrosis / Cirrhosis
    age_pos = rng.normal(52.0, 10.0, n_pos).clip(22, 80)
    sex_pos = rng.choice([0.0, 1.0], size=n_pos, p=[0.35, 0.65])
    alb_pos = rng.normal(33.0, 6.0, n_pos).clip(18, 48)
    alp_pos = rng.normal(110.0, 45.0, n_pos).clip(40, 250)
    alt_pos = rng.normal(88.0, 55.0, n_pos).clip(35, 320)
    ast_pos = rng.normal(120.0, 75.0, n_pos).clip(45, 450)
    bil_pos = rng.normal(28.0, 22.0, n_pos).clip(12, 120)
    che_pos = rng.normal(4.8, 1.9, n_pos).clip(1.5, 8.5)
    chol_pos = rng.normal(4.1, 1.2, n_pos).clip(2, 7)
    crea_pos = rng.normal(105.0, 40.0, n_pos).clip(60, 250)
    ggt_pos = rng.normal(140.0, 85.0, n_pos).clip(45, 400)
    prot_pos = rng.normal(67.0, 6.5, n_pos).clip(50, 82)

    X_pos = np.column_stack([
        age_pos, sex_pos, alb_pos, alp_pos, alt_pos, ast_pos,
        bil_pos, che_pos, chol_pos, crea_pos, ggt_pos, prot_pos
    ])
    y_pos = np.ones(n_pos, dtype=int)

    X = np.vstack([X_neg, X_pos])
    y = np.concatenate([y_neg, y_pos])
    indices = rng.permutation(n_samples)
    return X[indices], y[indices]

print("1. Preparing Hepatitis C Dataset...")
X, y = load_or_generate_hcv_data()
print(f"Dataset shape: {X.shape}, Class distribution: Healthy/Donor={np.sum(y==0)}, Disease={np.sum(y==1)}")

# 2. Preprocessing pipeline
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

pca = PCA(n_components=4, random_state=42)
X_pca = pca.fit_transform(X_scaled)

minmax = MinMaxScaler(feature_range=(-np.pi, np.pi))
X_angles = minmax.fit_transform(X_pca)

# 3. Setup PennyLane VQC (4 Qubits, 3 Layers, Ring CNOT)
N_QUBITS = 4
N_LAYERS = 3
dev = qml.device("default.qubit", wires=N_QUBITS)

@qml.qnode(dev, interface="autograd")
def hcv_circuit(weights, angles):
    # Dual-Angle State Embedding
    for i in range(N_QUBITS):
        qml.RY(angles[i], wires=i)
        qml.RZ(angles[i] * 0.5, wires=i)

    # Variational Layers with Ring CNOT Entanglement
    for l in range(weights.shape[0]):
        for i in range(N_QUBITS):
            qml.RY(weights[l, i, 0], wires=i)
            qml.RZ(weights[l, i, 1], wires=i)
        for i in range(N_QUBITS):
            qml.CNOT(wires=[i, (i + 1) % N_QUBITS])

    return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

np.random.seed(42)
weights_init = pnp.random.uniform(
    low=-np.pi, high=np.pi, size=(N_LAYERS, N_QUBITS, 2), requires_grad=True
)

# 4. Train VQC with AdamOptimizer
opt = qml.AdamOptimizer(stepsize=0.08)
n_samples = len(X_angles)
batch_size = 32
n_epochs = 35

print(f"\n2. Optimizing 4-Qubit Ring-CNOT VQC for Hepatitis C over {n_epochs} epochs...")
vqc_weights = weights_init
y_mapped = np.where(y == 0, 1.0, -1.0)  # Healthy -> +1, Disease -> -1

for epoch in range(n_epochs):
    perm = np.random.permutation(n_samples)
    epoch_cost = 0.0
    batches = 0
    for b_start in range(0, n_samples, batch_size):
        idx = perm[b_start : b_start + batch_size]
        X_b = X_angles[idx]
        y_b = y_mapped[idx]

        def cost(w):
            batch_costs = []
            for sample, target_val in zip(X_b, y_b):
                exps = hcv_circuit(w, sample)
                pred = pnp.mean(pnp.stack(exps))
                batch_costs.append((pred - target_val) ** 2)
            return pnp.mean(pnp.stack(batch_costs))

        vqc_weights, c = opt.step_and_cost(cost, vqc_weights)
        epoch_cost += float(c)
        batches += 1

    if (epoch + 1) % 5 == 0 or epoch == 0:
        print(f"Epoch {epoch + 1:2d}/{n_epochs} - Mean Cost: {epoch_cost / batches:.4f}")

# 5. Extract quantum expectation features
print("\n3. Extracting Quantum Expectation Values...")
quantum_features = []
for sample in X_angles:
    exps = [float(v) for v in hcv_circuit(vqc_weights, sample)]
    quantum_features.append(exps)
quantum_features = np.array(quantum_features)

# 6. Fit calibrated LogisticRegression readout
print("4. Fitting Calibrated Logistic Regression Readout Head...")
vqc_readout = LogisticRegression(C=1.0, random_state=42)
vqc_readout.fit(quantum_features, y)

y_pred = vqc_readout.predict(quantum_features)
y_prob = vqc_readout.predict_proba(quantum_features)[:, 1]

acc = accuracy_score(y, y_pred)
tn, fp, fn, tp = confusion_matrix(y, y_pred).ravel()
sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
auroc = roc_auc_score(y, y_prob)

print("\n--- FINAL EVALUATION METRICS (HEPATITIS C VQC) ---")
print(f"Accuracy:    {acc * 100:.2f}%")
print(f"Sensitivity: {sensitivity * 100:.2f}%")
print(f"Specificity: {specificity * 100:.2f}%")
print(f"AUROC:       {auroc:.4f}")

# 7. Save Artifacts
print(f"\n5. Saving Artifacts to {ARTIFACTS_DIR}...")
np.save(ARTIFACTS_DIR / "vqc_weights.npy", np.array(vqc_weights))
joblib.dump(scaler, ARTIFACTS_DIR / "scaler.joblib")
joblib.dump(pca, ARTIFACTS_DIR / "pca.joblib")
joblib.dump(minmax, ARTIFACTS_DIR / "minmax.joblib")
joblib.dump(vqc_readout, ARTIFACTS_DIR / "vqc_readout.joblib")

metrics_summary = {
    "module": "hepatitis",
    "architecture": "4-qubit RY+RZ Ring-CNOT + 3 Layers",
    "n_samples": n_samples,
    "accuracy": float(acc),
    "sensitivity": float(sensitivity),
    "specificity": float(specificity),
    "auroc": float(auroc)
}
with open(ARTIFACTS_DIR / "metrics_summary.json", "w") as f:
    json.dump(metrics_summary, f, indent=2)

print("Hepatitis C Artifacts successfully serialized!\n")
