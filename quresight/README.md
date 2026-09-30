# QureSight

<div align="center">

**Quantum Intelligence. Explainable Health Insights.**

[![SIH26139](https://img.shields.io/badge/SIH-26139-FF6F00?style=for-the-badge&logo=target&logoColor=white)](https://www.sih.gov.in/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PennyLane](https://img.shields.io/badge/PennyLane-0.38-29B6F6?style=for-the-badge&logo=quantum&logoColor=white)](https://pennylane.ai/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

*Developed for Smart India Hackathon (SIH26139) | Problem Statement: Hybrid Quantum ML for Early Disease Detection*  
*Organization: Egreen Quanta*

</div>

---

## What is QureSight?

QureSight is an open-source, hybrid quantum-classical biomedical machine learning platform designed for early disease screening and diagnosis. Rather than treating quantum computing as an unverified cure-all, QureSight is engineered around an empirical scientific foundation: **quantum advantage is measured, not assumed**. The platform pairs established, highly-optimized classical algorithms (Logistic Regression, Random Forest, XGBoost) directly against variational and kernel-based quantum machine learning pipelines (Variational Quantum Classifier and Quantum Kernel Support Vector Classifier) under identical, non-leaking evaluation conditions.

By integrating classical game-theoretic interpretability (SHAP) with quantum perturbation sensitivity analysis, QureSight exposes the internal decision mechanics of both classical ensembles and parameterized quantum circuits. It provides clinicians, data scientists, and healthcare researchers with a transparent evidence dashboard that answers not just which model performed best on a given patient cohort, but *why* it made its prediction, and whether quantum feature entanglement contributed any genuine statistical or diagnostic edge over classical baselines.

---

## System Architecture

```text
+-----------------------------------------------------------------------------------+
|                                QURESIGHT PLATFORM                                 |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                    Frontend UI (Next.js 14, TypeScript, Tailwind)          |  |
|  |  +--------------------+ +-------------------+ +-------------------------+  |  |
|  |  | Overview & Metrics | | Classical vs QML  | | Explainability (SHAP)   |  |  |
|  |  +--------------------+ +-------------------+ +-------------------------+  |  |
|  |  | Quantum Lab        | | Model Routing     | | Interactive Diagnosis   |  |  |
|  |  +--------------------+ +-------------------+ +-------------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
|                                         | REST API (HTTP / JSON)                  |
|                                         v                                         |
|  +-----------------------------------------------------------------------------+  |
|  |                    FastAPI Backend (Python 3.11 / 3.12)                     |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  | API Router: /dataset, /train, /benchmark, /explain, /predict, /route  |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |                                      |                                         |  |
|  |       +------------------------------+-------------------------------+         |  |
|  |       |                                                              |         |  |
|  |       v                                                              v         |  |
|  |  +------------------------------------+  +----------------------------------+  |  |
|  |  | Preprocessing & Feature Selection  |  | Relational Audit Persistence     |  |  |
|  |  | - Stratified Split (80/20)         |  | - SQLite3 (results/quresight.db) |  |  |
|  |  | - Robust Scaler / Pipeline fit     |  | - Model Checkpoints (.pkl/.pt)   |  |  |
|  |  | - Dimensionality Reduction (PCA)   |  | - Precomputed Gram Matrices      |  |  |
|  |  +------------------------------------+  +----------------------------------+  |  |
|  |       |                                                              |         |  |
|  |       v                                                              v         |  |
|  |  +------------------------------------+  +----------------------------------+  |  |
|  |  | Classical ML Pipeline              |  | Hybrid Quantum Pipeline          |  |  |
|  |  | - Logistic Regression              |  | - Angle Embedding [0, pi]       |  |  |
|  |  | - Random Forest Classifier         |  | - StronglyEntanglingLayers VQC   |  |  |
|  |  | - XGBoost Gradient Boosting       |  | - ZZ-Feature Map Kernel (QSVC)   |  |  |
|  |  | - SHAP Explainer (Tree & Linear)   |  | - Perturbation Sensitivity       |  |  |
|  |  +------------------------------------+  +----------------------------------+  |  |
|  |                                                       |                        |  |
|  |                                                       v                        |  |
|  |                                          +--------------------------+          |  |
|  |                                          | Quantum Execution Engine |          |  |
|  |                                          | PennyLane default.qubit  |          |  |
|  |                                          | (Extensible to IBM QPU)  |          |  |
|  |                                          +--------------------------+          |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## Quick Start (5 Steps)

Follow these steps to run QureSight locally on Windows, macOS, or Linux:

### Step 1: Clone the Repository
```bash
git clone https://github.com/egreen-quanta/quresight.git
cd quresight
```

### Step 2: Set Up Backend Environment & Install Dependencies
```bash
# Create and activate Python virtual environment
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

# Install requirements
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 4: Run FastAPI Backend Server
```bash
# Starts backend on http://localhost:8001
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload
```

### Step 5: Run Next.js Frontend Dashboard
Open a second terminal window:
```bash
cd quresight/frontend
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`** to access the dashboard.

---

## Diagnostic Dataset Information

QureSight uses the **Breast Cancer Wisconsin (Diagnostic)** dataset as its benchmark standard:

- **Source:** Scikit-Learn standard distribution (`sklearn.datasets.load_breast_cancer`)
- **Origin:** University of Wisconsin Clinical Sciences Center (Madison, WI)
- **Observations:** 569 patient instances
- **Features:** 30 continuous real-valued geometric and texture features extracted from digitized Fine Needle Aspirate (FNA) biopsy images (Mean, Standard Error, and Worst measurements for: radius, texture, perimeter, area, smoothness, compactness, concavity, concave points, symmetry, and fractal dimension).
- **Target Classes:** 
  - `Malignant` (Class 0 in standard sklearn / Class 1 positive condition, 212 cases, 37.26%)
  - `Benign` (Class 1 in standard sklearn / Class 0 negative condition, 357 cases, 62.74%)
- **Target Splitting:** 80% train (455 samples), 20% test (114 samples), stratified by class label, fixed random seed `42`.

---

## Evaluated Models

| Paradigm | Model Name | Architecture / Algorithm | Dimensionality / Input | Key Hyperparameters |
| :--- | :--- | :--- | :--- | :--- |
| **Classical** | **Logistic Regression** | Linear probability model with L2 regularization | 30 original standardized features | $C=1.0$, solver=`lbfgs`, max_iter=1000 |
| **Classical** | **Random Forest** | Bagged ensemble of 100 decision trees | 30 original standardized features | n_estimators=100, max_depth=6, seed=42 |
| **Classical** | **XGBoost** | Gradient-boosted decision tree ensemble | 30 original standardized features | n_estimators=100, learning_rate=0.1, max_depth=4 |
| **Quantum** | **Variational Quantum Classifier (VQC)** | Angle embedding + StronglyEntanglingLayers + $\langle Z_0 \rangle$ | 4 principal components (PCA) mapped to $[0, \pi]$ | 4 qubits, 2 layers, Adam optimizer, lr=0.1, 100 steps |
| **Quantum** | **Quantum Kernel SVM (QSVC)** | ZZ-entangled feature map + State fidelity matrix + Classical SVC | 4 principal components (PCA) mapped to $[0, \pi]$ | 4 qubits, Gram matrix via fidelity, $C=1.0$ |

---

## API Endpoints Summary

The FastAPI backend exposes comprehensive endpoints for dataset inspection, model execution, benchmarking, explainability, and intelligent routing:

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status, platform metadata, and versioning |
| `GET` | `/health` | Health check probe for container orchestrators |
| `GET` | `/api/dataset/info` | Dataset summary (samples, features, class balance) |
| `GET` | `/api/dataset/profile` | Statistical distributions, mean, std, quantiles per feature |
| `POST` | `/api/dataset/preprocess` | Execute stratified 80/20 train/test split and PCA projection |
| `POST` | `/api/train/classical` | Train Logistic Regression, Random Forest, and XGBoost |
| `POST` | `/api/train/vqc` | Train Variational Quantum Classifier (VQC) with PennyLane |
| `POST` | `/api/train/qsvc` | Compute quantum kernel Gram matrix and fit QSVC |
| `GET` | `/api/benchmark` | Retrieve comparative metrics table across all trained models |
| `GET` | `/api/benchmark/{model_id}` | Detailed metrics (ROC, PR curves, Confusion Matrix) for a model |
| `GET` | `/api/explain/shap/{model_id}` | Generate SHAP feature importance for classical models |
| `GET` | `/api/explain/quantum-sensitivity` | Perturbation sensitivity analysis for quantum circuits |
| `POST` | `/api/predict` | Single patient inference across classical and quantum models |
| `POST` | `/api/route` | Automated clinical routing decision based on certainty & evidence |
| `POST` | `/api/lab/qubit-scaling` | Quantum Lab experiment running 2 to 6 qubits performance scan |

*See [`docs/API.md`](./docs/API.md) for full request/response schemas.*

---

## Experiment Results

All models were evaluated under identical 80/20 stratified holdout splits (Random Seed 42). Metrics are computed directly on the out-of-sample test partition (114 samples).

| Model | Accuracy | Sensitivity (Recall) | Specificity | Precision | F1-Score | AUC-ROC | Inference Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | **98.25%** | **98.61%** | **97.62%** | **98.61%** | **98.61%** | **99.54%** | < 1 ms |
| **Random Forest** | 95.61% | 97.22% | 92.86% | 95.89% | 96.55% | 99.39% | 9.7 ms |
| **XGBoost** | 95.61% | 98.61% | 90.48% | 94.67% | 96.60% | 99.27% | 1.5 ms |
| **VQC (4 Qubits)** | 78.07% | 87.50% | 61.90% | 79.49% | 83.22% | 84.42% | 8.2 ms |
| **QSVC (4 Qubits)** | 83.33% | 90.28% | 71.43% | 82.89% | 86.71% | 93.32% | 0.2 ms |

> **Audit Note:** The metrics above were recorded directly from actual execution of `quresight/scripts/run_full_experiment.py` (PennyLane statevector simulation and stratified 80/20 test split). In accordance with QureSight's core philosophy ("Quantum advantage is measured, not assumed"), the benchmark proves that classical models currently outperform NISQ-era quantum classifiers on this diagnostic dataset, while quantum kernel methods achieve competitive AUC (>0.93) under 4-qubit constraints.

---

## Honest Limitations

1. **Statevector Simulation vs Real Hardware:** Quantum circuits currently execute on PennyLane's `default.qubit` statevector simulator. While mathematically exact, this does not incorporate physical hardware noise (decoherence, gate infidelities, readout errors) present in Noisy Intermediate-Scale Quantum (NISQ) devices.
2. **Qubit Constraint & Dimensionality Reduction:** Current quantum simulation limits practical parameter optimization to 4–6 qubits without exponential slowdown. Consequently, the original 30 features are compressed via PCA, which discards higher-order non-linear combinations before the quantum circuit receives them.
3. **VQC Convergence & Barren Plateaus:** Gradient-based optimization of parameterized quantum circuits is susceptible to local minima and barren plateau phenomena as circuit depth increases.
4. **Dataset Specificity:** The Wisconsin Breast Cancer dataset is a standard diagnostic benchmark used for methodology demonstration. Performance on this tabular set does not represent generalized clinical efficacy across high-throughput genomics or raw histology.

*See [`docs/LIMITATIONS.md`](./docs/LIMITATIONS.md) for our detailed scientific assessment.*

---

## Medical Disclaimer

> **IMPORTANT MEDICAL NOTICE:** QureSight is an experimental research and educational benchmarking prototype developed for the Smart India Hackathon (SIH26139). It is **NOT** a certified medical device, diagnostic tool, or clinical decision support system. It has **NOT** undergone evaluation or clearance by the Central Drugs Standard Control Organisation (CDSCO), the U.S. Food and Drug Administration (FDA), the European Medicines Agency (EMA), or any other regulatory health authority. **QureSight must NEVER be used as a substitute for professional medical diagnosis, advice, or treatment.**

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
