#!/usr/bin/env python3
"""
================================================================================
TRAIN BREAST CANCER VQC LOGISTIC REGRESSION READOUT HEAD
================================================================================
Extracts Pauli-Z expectation values from the 8-qubit VQC model across all 569
WDBC patient cases and fits a calibrated LogisticRegression readout classifier.
Saves the artifact to Backend/models_v1/artifacts_v1/vqc_readout.joblib.
================================================================================
"""

import os
import sys
from pathlib import Path
import numpy as np
import joblib
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score, recall_score, precision_score
import pennylane as qml

SCRIPT_DIR = Path(__file__).resolve().parents[1] / "models_v1"
ARTIFACTS_DIR = SCRIPT_DIR / "artifacts_v1"

print("1. Loading WDBC Dataset & Serialized Quantum VQC weights...")
data = load_breast_cancer()
X = data.data[:, :8]
# WDBC in sklearn: 0 = malignant, 1 = benign. Convert so 1 = Malignant, 0 = Benign
y = (data.target == 0).astype(int)

weights = np.load(ARTIFACTS_DIR / "vqc_weights.npy")
scaler = joblib.load(ARTIFACTS_DIR / "quantum_scaler.joblib")

X_scaled = scaler.transform(X)

print(f"Dataset shape: {X_scaled.shape}, Class distribution: Benign={np.sum(y==0)}, Malignant={np.sum(y==1)}")

print("2. Setting up 8-Qubit PennyLane VQC Simulation Device...")
dev = qml.device("default.qubit", wires=8)

@qml.qnode(dev)
def vqc_circuit(weights, x):
    # 1. Second-Order Pauli-Z (ZZ) Feature Map
    for i in range(8):
        qml.Hadamard(wires=i)
        qml.RZ(2.0 * x[i], wires=i)
    for i in range(7):
        val = (np.pi - x[i]) * (np.pi - x[i+1])
        qml.CNOT(wires=[i, i+1])
        qml.RZ(val, wires=i+1)
        qml.CNOT(wires=[i, i+1])
    
    # 2. Strongly Entangling Variational Layers
    for l in range(weights.shape[0]):
        for i in range(8):
            qml.Rot(weights[l, i, 0], weights[l, i, 1], weights[l, i, 2], wires=i)
        for i in range(7):
            qml.CNOT(wires=[i, i+1])
    
    return [qml.expval(qml.PauliZ(i)) for i in range(8)]

print("3. Evaluating Quantum Expectation Values for all cohort samples...")
quantum_features = []
for idx, x_vec in enumerate(X_scaled):
    if (idx + 1) % 100 == 0 or idx == len(X_scaled) - 1:
        print(f"   Processed {idx + 1}/{len(X_scaled)} samples...")
    expvals = vqc_circuit(weights, x_vec)
    quantum_features.append([float(v) for v in expvals])

X_quantum = np.array(quantum_features)

print("4. Fitting Calibrated Logistic Regression Readout Head...")
readout = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
readout.fit(X_quantum, y)

y_pred = readout.predict(X_quantum)
y_prob = readout.predict_proba(X_quantum)[:, 1]

acc = accuracy_score(y, y_pred)
auc = roc_auc_score(y, y_prob)
rec = recall_score(y, y_pred)
prec = precision_score(y, y_pred)

print("\n--- FINAL EVALUATION METRICS (BREAST CANCER VQC READOUT) ---")
print(f"Accuracy:    {acc * 100:.2f}%")
print(f"Sensitivity: {rec * 100:.2f}%")
print(f"Precision:   {prec * 100:.2f}%")
print(f"AUROC:       {auc:.4f}")

out_path = ARTIFACTS_DIR / "vqc_readout.joblib"
joblib.dump(readout, out_path)
print(f"\nSuccessfully saved trained readout to: {out_path}")
