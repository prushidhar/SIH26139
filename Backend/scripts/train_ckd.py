#!/usr/bin/env python3
"""
================================================================================
TRAIN CKD (CHRONIC KIDNEY DISEASE) 4-QUBIT VQC PIPELINE
================================================================================
Trains the 4-qubit VQC architecture for Chronic Kidney Disease:
  - 8 Clinical Biomarkers:
      age, blood_pressure, specific_gravity, albumin, blood_glucose_random,
      blood_urea, serum_creatinine, hemoglobin
  - StandardScaler + PCA(4) + MinMaxScaler([-pi, pi])
  - 4-Qubit RX+RZ AngleEmbedding + StronglyEntanglingLayers(layers=2)
  - 4 Pauli-Z expectation values + Calibrated Logistic Regression Readout
  - Saves artifacts to Backend/models_v1/artifacts_v1/ckd/
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

ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "models_v1" / "artifacts_v1" / "ckd"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_NAMES = [
    "age",
    "blood_pressure",
    "specific_gravity",
    "albumin",
    "blood_glucose_random",
    "blood_urea",
    "serum_creatinine",
    "hemoglobin"
]

def generate_ckd_data(n_samples=350, random_state=42):
    rng = np.random.RandomState(random_state)
    n_pos = n_samples // 2
    n_neg = n_samples - n_pos

    # Negative class (healthy kidneys)
    age_neg = rng.normal(46.0, 14.0, n_neg).clip(18, 90)
    bp_neg = rng.normal(74.0, 8.0, n_neg).clip(55, 110)
    sg_neg = rng.choice([1.020, 1.025], size=n_neg, p=[0.6, 0.4])
    alb_neg = rng.choice([0, 1], size=n_neg, p=[0.95, 0.05])
    bgr_neg = rng.normal(105.0, 18.0, n_neg).clip(70, 160)
    bu_neg = rng.normal(32.0, 8.0, n_neg).clip(12, 50)
    sc_neg = rng.normal(0.9, 0.2, n_neg).clip(0.4, 1.3)
    hemo_neg = rng.normal(15.0, 1.4, n_neg).clip(12.0, 18.0)

    X_neg = np.column_stack([
        age_neg, bp_neg, sg_neg, alb_neg, bgr_neg, bu_neg, sc_neg, hemo_neg
    ])
    y_neg = np.zeros(n_neg, dtype=int)

    # Positive class (CKD present)
    age_pos = rng.normal(59.0, 12.0, n_pos).clip(20, 90)
    bp_pos = rng.normal(84.0, 14.0, n_pos).clip(60, 130)
    sg_pos = rng.choice([1.010, 1.015, 1.020], size=n_pos, p=[0.5, 0.35, 0.15])
    alb_pos = rng.choice([1, 2, 3, 4], size=n_pos, p=[0.3, 0.35, 0.25, 0.1])
    bgr_pos = rng.normal(175.0, 65.0, n_pos).clip(90, 380)
    bu_pos = rng.normal(72.0, 38.0, n_pos).clip(25, 210)
    sc_pos = rng.normal(4.2, 2.8, n_pos).clip(1.4, 15.0)
    hemo_pos = rng.normal(10.6, 2.1, n_pos).clip(5.0, 14.0)

    X_pos = np.column_stack([
        age_pos, bp_pos, sg_pos, alb_pos, bgr_pos, bu_pos, sc_pos, hemo_pos
    ])
    y_pos = np.ones(n_pos, dtype=int)

    X = np.vstack([X_neg, X_pos])
    y = np.concatenate([y_neg, y_pos])
    indices = rng.permutation(n_samples)
    return X[indices], y[indices]

print("1. Preparing CKD Cohort Dataset...")
X, y = generate_ckd_data(n_samples=350, random_state=42)
print(f"Dataset shape: {X.shape}, Class distribution: Non-CKD={np.sum(y==0)}, CKD={np.sum(y==1)}")

# 2. Preprocessing pipeline
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

pca = PCA(n_components=4, random_state=42)
X_pca = pca.fit_transform(X_scaled)

minmax = MinMaxScaler(feature_range=(-np.pi, np.pi))
X_angles = minmax.fit_transform(X_pca)

# 3. Setup PennyLane VQC (4 Qubits, 2 Layers)
N_QUBITS = 4
N_LAYERS = 2
dev = qml.device("default.qubit", wires=N_QUBITS)

@qml.qnode(dev, interface="autograd")
def ckd_circuit(weights, angles):
    for i in range(N_QUBITS):
        qml.RX(angles[i], wires=i)
        qml.RZ(angles[i] * 0.5, wires=i)
    qml.StronglyEntanglingLayers(weights, wires=range(N_QUBITS))
    return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

np.random.seed(42)
weights_init = pnp.random.uniform(
    low=-np.pi, high=np.pi, size=(N_LAYERS, N_QUBITS, 3), requires_grad=True
)

# 4. Train VQC with AdamOptimizer
opt = qml.AdamOptimizer(stepsize=0.08)
n_samples = len(X_angles)
batch_size = 32
n_epochs = 35

print(f"\n2. Optimizing 4-Qubit StronglyEntanglingLayers VQC for CKD over {n_epochs} epochs...")
vqc_weights = weights_init
y_mapped = np.where(y == 0, 1.0, -1.0)  # non-CKD -> +1 (<Z>), CKD -> -1

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
                exps = ckd_circuit(w, sample)
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
    exps = [float(v) for v in ckd_circuit(vqc_weights, sample)]
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

print("\n--- FINAL EVALUATION METRICS (CKD VQC) ---")
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
    "module": "ckd",
    "architecture": "4-qubit RX+RZ + StronglyEntanglingLayers(2)",
    "n_samples": n_samples,
    "accuracy": float(acc),
    "sensitivity": float(sensitivity),
    "specificity": float(specificity),
    "auroc": float(auroc)
}
with open(ARTIFACTS_DIR / "metrics_summary.json", "w") as f:
    json.dump(metrics_summary, f, indent=2)

print("CKD Artifacts successfully serialized!\n")
