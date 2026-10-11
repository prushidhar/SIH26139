#!/usr/bin/env python3
"""
================================================================================
TRAIN DONAIRE ET AL. 2-QUBIT MINIMAL VQC PIPELINE (INDIAN LIVER PATIENT DATASET)
================================================================================
Trains the 2-qubit ultra-compact VQC architecture for ILPD:
  - 10 Hepatic Biomarkers:
      Age, Gender, Total_Bilirubin, Direct_Bilirubin, Alkaline_Phosphotase,
      Alamine_Aminotransferase, Aspartate_Aminotransferase, Total_Protiens,
      Albumin, Albumin_and_Globulin_Ratio
  - StandardScaler + PCA(2) + MinMaxScaler([-pi, pi])
  - 2-Qubit RX AngleEmbedding + StronglyEntanglingLayers(layers=2)
  - 3 Observables: [<Z0>, <Z1>, <Z0 Z1>] + Calibrated Logistic Regression Readout
  - Saves artifacts to Backend/models_v1/artifacts_v1/liver_ilpd/
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

ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "models_v1" / "artifacts_v1" / "liver_ilpd"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_KEYS = [
    "Age", "Gender", "Total_Bilirubin", "Direct_Bilirubin",
    "Alkaline_Phosphotase", "Alamine_Aminotransferase",
    "Aspartate_Aminotransferase", "Total_Protiens",
    "Albumin", "Albumin_and_Globulin_Ratio"
]

def load_or_generate_ilpd_data():
    csv_path = Path(__file__).resolve().parents[2] / "quresight" / "data" / "raw" / "ilpd_liver.csv"
    if not csv_path.exists():
        csv_path = Path(__file__).resolve().parents[1] / "data" / "raw" / "ilpd_liver.csv"

    if csv_path.exists():
        print(f"Loading Indian Liver Patient Dataset from: {csv_path}")
        df = pd.read_csv(csv_path)
        # Parse Gender if string
        if df["Gender"].dtype == object:
            df["Gender"] = df["Gender"].apply(lambda g: 1.0 if str(g).strip().lower().startswith("m") else 0.0)
        
        # Impute missing values
        for k in FEATURE_KEYS:
            df[k] = pd.to_numeric(df[k], errors="coerce")
            df[k] = df[k].fillna(df[k].median())
        
        # Target column: in ILPD, 1=Liver patient, 2=Non liver patient, or 0/1
        if "target" in df.columns:
            y = df["target"].values
            # If target has 1 and 2, map 1->1 (disease), 2->0 (healthy)
            if set(np.unique(y)).issubset({1, 2}):
                y = np.where(y == 1, 1, 0)
        elif "Dataset" in df.columns:
            y = df["Dataset"].values
            if set(np.unique(y)).issubset({1, 2}):
                y = np.where(y == 1, 1, 0)
        else:
            y = df.iloc[:, -1].values
            y = np.where(y == 1, 1, 0)

        X = df[FEATURE_KEYS].values
        return X, y

    print("Generating synthetic ILPD dataset...")
    rng = np.random.RandomState(42)
    n_samples = 400
    n_pos = n_samples // 2
    n_neg = n_samples - n_pos

    # Healthy liver
    age_neg = rng.normal(40.0, 14.0, n_neg).clip(15, 80)
    gen_neg = rng.choice([0.0, 1.0], size=n_neg, p=[0.3, 0.7])
    tb_neg = rng.normal(0.9, 0.3, n_neg).clip(0.4, 1.8)
    db_neg = rng.normal(0.3, 0.1, n_neg).clip(0.1, 0.6)
    alk_neg = rng.normal(190.0, 45.0, n_neg).clip(100, 310)
    alt_neg = rng.normal(28.0, 12.0, n_neg).clip(10, 55)
    ast_neg = rng.normal(30.0, 14.0, n_neg).clip(10, 60)
    tp_neg = rng.normal(6.8, 0.8, n_neg).clip(5.0, 8.8)
    alb_neg = rng.normal(3.5, 0.5, n_neg).clip(2.5, 4.8)
    ag_neg = rng.normal(1.1, 0.2, n_neg).clip(0.7, 1.8)

    X_neg = np.column_stack([
        age_neg, gen_neg, tb_neg, db_neg, alk_neg, alt_neg, ast_neg, tp_neg, alb_neg, ag_neg
    ])
    y_neg = np.zeros(n_neg, dtype=int)

    # Liver disease
    age_pos = rng.normal(48.0, 16.0, n_pos).clip(15, 85)
    gen_pos = rng.choice([0.0, 1.0], size=n_pos, p=[0.25, 0.75])
    tb_pos = rng.normal(4.8, 4.5, n_pos).clip(1.5, 25.0)
    db_pos = rng.normal(2.3, 2.2, n_pos).clip(0.7, 12.0)
    alk_pos = rng.normal(360.0, 190.0, n_pos).clip(160, 950)
    alt_pos = rng.normal(95.0, 85.0, n_pos).clip(35, 600)
    ast_pos = rng.normal(135.0, 120.0, n_pos).clip(45, 750)
    tp_pos = rng.normal(6.1, 1.1, n_pos).clip(3.5, 8.5)
    alb_pos = rng.normal(2.7, 0.7, n_pos).clip(1.5, 4.0)
    ag_pos = rng.normal(0.8, 0.3, n_pos).clip(0.3, 1.3)

    X_pos = np.column_stack([
        age_pos, gen_pos, tb_pos, db_pos, alk_pos, alt_pos, ast_pos, tp_pos, alb_pos, ag_pos
    ])
    y_pos = np.ones(n_pos, dtype=int)

    X = np.vstack([X_neg, X_pos])
    y = np.concatenate([y_neg, y_pos])
    idx = rng.permutation(n_samples)
    return X[idx], y[idx]

print("1. Preparing Indian Liver Patient Dataset...")
X, y = load_or_generate_ilpd_data()
print(f"Dataset shape: {X.shape}, Class distribution: Healthy={np.sum(y==0)}, Liver Disease={np.sum(y==1)}")

# 2. Preprocessing pipeline
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

pca = PCA(n_components=2, random_state=42)
X_pca = pca.fit_transform(X_scaled)

minmax = MinMaxScaler(feature_range=(-np.pi, np.pi))
X_angles = minmax.fit_transform(X_pca)

# 3. Setup PennyLane VQC (2 Qubits, 2 Layers)
N_QUBITS = 2
N_LAYERS = 2
dev = qml.device("default.qubit", wires=N_QUBITS)

@qml.qnode(dev, interface="autograd")
def liver_2q_circuit(weights, angles):
    qml.RX(angles[0], wires=0)
    qml.RX(angles[1], wires=1)
    qml.StronglyEntanglingLayers(weights, wires=range(N_QUBITS))
    return [qml.expval(qml.PauliZ(0)), qml.expval(qml.PauliZ(1)), qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))]

np.random.seed(42)
weights_init = pnp.random.uniform(
    low=-np.pi, high=np.pi, size=(N_LAYERS, N_QUBITS, 3), requires_grad=True
)

# 4. Train VQC with AdamOptimizer
opt = qml.AdamOptimizer(stepsize=0.08)
n_samples = len(X_angles)
batch_size = 32
n_epochs = 35

print(f"\n2. Optimizing 2-Qubit Minimal VQC for Liver ILPD over {n_epochs} epochs...")
vqc_weights = weights_init
y_mapped = np.where(y == 0, 1.0, -1.0)  # Healthy -> +1, Liver Disease -> -1

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
                exps = liver_2q_circuit(w, sample)
                pred = pnp.mean(pnp.stack(exps[:2]))
                batch_costs.append((pred - target_val) ** 2)
            return pnp.mean(pnp.stack(batch_costs))

        vqc_weights, c = opt.step_and_cost(cost, vqc_weights)
        epoch_cost += float(c)
        batches += 1

    if (epoch + 1) % 5 == 0 or epoch == 0:
        print(f"Epoch {epoch + 1:2d}/{n_epochs} - Mean Cost: {epoch_cost / batches:.4f}")

# 5. Extract quantum expectation features (3 observables)
print("\n3. Extracting Quantum Expectation Values...")
quantum_features = []
for sample in X_angles:
    exps = [float(v) for v in liver_2q_circuit(vqc_weights, sample)]
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

print("\n--- FINAL EVALUATION METRICS (LIVER ILPD VQC) ---")
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
    "module": "liver_ilpd",
    "architecture": "2-qubit Minimal VQC (StronglyEntangling 2 layers)",
    "n_samples": n_samples,
    "accuracy": float(acc),
    "sensitivity": float(sensitivity),
    "specificity": float(specificity),
    "auroc": float(auroc)
}
with open(ARTIFACTS_DIR / "metrics_summary.json", "w") as f:
    json.dump(metrics_summary, f, indent=2)

print("Liver ILPD Artifacts successfully serialized!\n")
