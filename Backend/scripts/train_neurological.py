#!/usr/bin/env python3
"""
================================================================================
TRAIN NEUROLOGICAL & COGNITIVE 4-QUBIT VQC PIPELINE
================================================================================
Trains the 4-qubit RY AngleEmbedding VQC architecture for Neurological screening:
  - 8 Neuro-Cognitive Features:
      eeg_alpha_beta_ratio, eeg_theta_power, motor_tremor_hz, reaction_time_ms,
      speech_jitter_pct, speech_shimmer_db, cognitive_mmse, age
  - StandardScaler + PCA(4) + MinMaxScaler([-pi, pi])
  - 4-Qubit RY AngleEmbedding + StronglyEntanglingLayers(layers=2)
  - 4 Pauli-Z expectation values + Calibrated Logistic Regression Readout
  - Saves artifacts to Backend/models_v1/artifacts_v1/neurological/
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

ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "models_v1" / "artifacts_v1" / "neurological"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_NAMES = [
    "eeg_alpha_beta_ratio",
    "eeg_theta_power",
    "motor_tremor_hz",
    "reaction_time_ms",
    "speech_jitter_pct",
    "speech_shimmer_db",
    "cognitive_mmse",
    "age"
]

def generate_neuro_data(n_samples=300, random_state=42):
    rng = np.random.RandomState(random_state)
    n_pos = n_samples // 2
    n_neg = n_samples - n_pos

    # Intact / Healthy neurological profile
    ab_neg = rng.normal(2.4, 0.4, n_neg).clip(1.5, 4.0)
    theta_neg = rng.normal(22.0, 6.0, n_neg).clip(10, 35)
    tremor_neg = rng.normal(1.2, 0.4, n_neg).clip(0.4, 2.2)
    react_neg = rng.normal(230.0, 30.0, n_neg).clip(160, 300)
    jitter_neg = rng.normal(0.32, 0.10, n_neg).clip(0.12, 0.60)
    shimmer_neg = rng.normal(0.16, 0.05, n_neg).clip(0.06, 0.30)
    mmse_neg = rng.normal(29.0, 0.9, n_neg).clip(27.0, 30.0)
    age_neg = rng.normal(58.0, 9.0, n_neg).clip(35, 80)

    X_neg = np.column_stack([
        ab_neg, theta_neg, tremor_neg, react_neg,
        jitter_neg, shimmer_neg, mmse_neg, age_neg
    ])
    y_neg = np.zeros(n_neg, dtype=int)

    # Neurodegenerative / Impaired profile
    ab_pos = rng.normal(1.3, 0.3, n_pos).clip(0.6, 1.8)
    theta_pos = rng.normal(38.0, 9.0, n_pos).clip(26, 65)
    tremor_pos = rng.normal(4.8, 1.3, n_pos).clip(2.8, 8.5)
    react_pos = rng.normal(340.0, 45.0, n_pos).clip(270, 480)
    jitter_pos = rng.normal(0.85, 0.28, n_pos).clip(0.55, 1.80)
    shimmer_pos = rng.normal(0.42, 0.14, n_pos).clip(0.25, 0.85)
    mmse_pos = rng.normal(22.5, 3.2, n_pos).clip(12.0, 26.0)
    age_pos = rng.normal(70.0, 8.0, n_pos).clip(50, 90)

    X_pos = np.column_stack([
        ab_pos, theta_pos, tremor_pos, react_pos,
        jitter_pos, shimmer_pos, mmse_pos, age_pos
    ])
    y_pos = np.ones(n_pos, dtype=int)

    X = np.vstack([X_neg, X_pos])
    y = np.concatenate([y_neg, y_pos])
    idx = rng.permutation(n_samples)
    return X[idx], y[idx]

print("1. Preparing Neurological Cohort Dataset...")
X, y = generate_neuro_data(n_samples=300, random_state=42)
print(f"Dataset shape: {X.shape}, Class distribution: Healthy={np.sum(y==0)}, Impaired={np.sum(y==1)}")

# 2. Preprocessing pipeline
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

pca = PCA(n_components=4, random_state=42)
X_pca = pca.fit_transform(X_scaled)

minmax = MinMaxScaler(feature_range=(-np.pi, np.pi))
X_angles = minmax.fit_transform(X_pca)

# 3. Setup PennyLane VQC (4 Qubits, 2 Layers, RY AngleEmbedding)
N_QUBITS = 4
N_LAYERS = 2
dev = qml.device("default.qubit", wires=N_QUBITS)

@qml.qnode(dev, interface="autograd")
def neuro_circuit(weights, angles):
    for i in range(N_QUBITS):
        qml.RY(angles[i], wires=i)
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

print(f"\n2. Optimizing 4-Qubit StronglyEntanglingLayers VQC for Neurological over {n_epochs} epochs...")
vqc_weights = weights_init
y_mapped = np.where(y == 0, 1.0, -1.0)  # Healthy -> +1, Impaired -> -1

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
                exps = neuro_circuit(w, sample)
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
    exps = [float(v) for v in neuro_circuit(vqc_weights, sample)]
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

print("\n--- FINAL EVALUATION METRICS (NEUROLOGICAL VQC) ---")
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
    "module": "neurological",
    "architecture": "4-qubit RY AngleEmbedding + StronglyEntanglingLayers(2)",
    "n_samples": n_samples,
    "accuracy": float(acc),
    "sensitivity": float(sensitivity),
    "specificity": float(specificity),
    "auroc": float(auroc)
}
with open(ARTIFACTS_DIR / "metrics_summary.json", "w") as f:
    json.dump(metrics_summary, f, indent=2)

print("Neurological Artifacts successfully serialized!\n")
