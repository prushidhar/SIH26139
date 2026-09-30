# QureSight System Architecture

> **Quantum Intelligence. Explainable Health Insights.**  
> *Smart India Hackathon 2024 / SIH26139*

---

## 1. System Overview

QureSight is an end-to-end hybrid quantum-classical biomedical machine learning platform designed to objectively evaluate, benchmark, and explain quantum algorithms for early disease detection. 

Rather than treating quantum machine learning (QML) as an assumed technological upgrade over classical baselines, QureSight constructs an empirical sandbox where classical models (Logistic Regression, Random Forest, XGBoost) and quantum models (Variational Quantum Classifier, Quantum Kernel Support Vector Classifier) run on identical data partitions under strict non-leaking preprocessing pipelines.

The platform consists of four primary structural tiers:
1. **Presentation Tier:** Next.js 14 Single-Page Application (SPA) leveraging React, TypeScript, and Tailwind CSS.
2. **Application & Orchestration Tier:** High-performance asynchronous FastAPI service exposing RESTful APIs for data loading, pipeline execution, inference, and explainability.
3. **Execution Engines Tier:** Dual-engine architecture dividing tasks between scikit-learn/XGBoost for classical modeling and PennyLane statevector simulation for parameterized quantum circuits.
4. **Data & Persistence Tier:** Relational SQLite persistence (`results/quresight.db`) coupled with disk-backed serializations of pipeline transformers, fitted model weights, and precomputed quantum Gram matrices.

---

## 2. Component Diagram

```text
+-------------------------------------------------------------------------------------------------------+
|                                           CLIENT BROWSER                                              |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  |                     Next.js 14 Dashboard (React 18 / TypeScript / Tailwind CSS)                |  |
|  |                                                                                                 |  |
|  |  [ Dataset Explorer ]  [ Pipeline Config ]  [ Benchmark View ]  [ Quantum Lab ]  [ Explain UI ]  |  |
|  +-------------------------------------------------------------------------------------------------+  |
+--------------------------------------------------+----------------------------------------------------+
                                                   | HTTP REST / JSON (Port 8001)
                                                   v
+-------------------------------------------------------------------------------------------------------+
|                                         FASTAPI BACKEND SERVICE                                       |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  |                                         API Routers                                             |  |
|  |  /dataset      /preprocess       /train/classical       /train/quantum       /explain   /predict|  |
|  +-------------------------------------------------------------------------------------------------+  |
|                                                  |                                                    |
|  +-----------------------------------------------+-------------------------------------------------+  |
|  |                                     Service Orchestrator Layer                                  |  |
|  |  - Pipeline Manager             - Benchmark Service               - Evidence-Based Router       |  |
|  +-----------------------------------------------+-------------------------------------------------+  |
|            |                                     |                                     |              |
|            v                                     v                                     v              |
|  +---------------------+               +---------------------+               +---------------------+  |
|  | Preprocessing Engine|               | Classical ML Engine |               |  Quantum ML Engine  |  |
|  | - Stratified Split  |               | - Logistic Reg.     |               | - PennyLane Sim     |  |
|  | - Scaler Pipeline   |               | - Random Forest     |               | - Angle Embedding   |  |
|  | - PCA Dimensionality|               | - XGBoost           |               | - VQC (Layers=2)    |  |
|  |   Reduction         |               | - Tree/Linear SHAP  |               | - QSVC Kernel Gram  |  |
|  +---------------------+               +---------------------+               +---------------------+  |
+--------------------------------------------------+----------------------------------------------------+
                                                   |
                                                   v
+-------------------------------------------------------------------------------------------------------+
|                                        PERSISTENCE & STORAGE                                          |
|                                                                                                       |
|  +-----------------------------------+  +----------------------------------+  +--------------------+  |
|  |       SQLite Relational DB        |  |        Fitted Model Store        |  |  Dataset & Reports |  |
|  |       results/quresight.db        |  |             models/              |  |   data/ & reports/ |  |
|  | - experiments     - metrics       |  | - *.joblib pipelines             |  | - raw CSVs         |  |
|  | - model_runs      - predictions   |  | - *.pt / *.npy weights           |  | - JSON benchmarks  |  |
|  +-----------------------------------+  +----------------------------------+  +--------------------+  |
+-------------------------------------------------------------------------------------------------------+
```

---

## 3. End-to-End Data Flow

```text
 [Raw Dataset]
       |
       v
 [Data Ingestion] ----------> Profiler computes statistics (mean, variance, skew, missingness)
       |
       v
 [Stratified Split] --------> 80% Train Partition (Fit Only) / 20% Test Partition (Transform Only)
       |
       +------------------------------------+
       |                                    |
       v (30 Raw Features)                  v (PCA to N Qubits)
 [Classical Preprocessing]            [Quantum Preprocessing]
 - StandardScaler (Fit on Train)      - StandardScaler (Fit on Train)
 - Out-of-sample Test Transform       - PCA (Fit on Train, components=4)
       |                              - Scale components to [0, pi]
       |                                    |
       v                                    v
 [Classical Modeling]                 [Quantum Modeling]
 - Logistic Regression (L2)           - Variational Quantum Classifier (StronglyEntanglingLayers)
 - Random Forest (100 Trees)          - Quantum Kernel SVM (ZZ Feature Map Fidelity)
 - XGBoost (Grad Boosted Trees)             |
       |                                    |
       +-----------------+------------------+
                         |
                         v
                [Unified Evaluation]
                - Confusion Matrix, Accuracy, Sensitivity (Recall)
                - Specificity, Precision, F1-Score, AUC-ROC, Latency
                         |
                         v
                [Explainability Layer]
                - SHAP (TreeExplainer & LinearExplainer)
                - Quantum Perturbation Sensitivity Analysis
                         |
                         v
                [Evidence Routing]
                - Selects most confident, calibrated model for single-patient triage
```

---

## 4. Machine Learning Pipeline Architecture

To prevent subtle statistical flaws common in published literature, QureSight strictly enforces a non-leaking pipeline pattern:

1. **Separation of Concerns:** The dataset split occurs before any scaling or feature transformations. The test set is sequestered as out-of-sample data.
2. **Dimension Matching:**
   - **Classical ML:** Retains the full 30 diagnostic features to provide baseline performance ceiling.
   - **Quantum ML:** Because statevector simulation scales as $\mathcal{O}(2^N)$ in memory and parameterized circuit optimization scales poorly on large qubit sets, the 30 features are projected into $N$ principal components (default $N=4$) explaining $>85\%$ of training variance.
3. **Quantum Feature Representation:**
   - Features $x \in \mathbb{R}^N$ are normalized to $[0, \pi]$ using MinMax scaling fitted strictly on training data.
   - The mapped values serve as rotational angles for single-qubit gates $R_x(\theta_i)$ and two-qubit entangling operations.

---

## 5. Backend Repository Structure

The backend is organized into modular services under `quresight/`:

```text
quresight/
├── backend/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── dataset.py        # Dataset loading, profiling, and upload
│   │   │   ├── training.py       # Classical and quantum training triggers
│   │   │   ├── benchmark.py      # Metric queries, ROC/PR curves
│   │   │   ├── explainability.py # SHAP and quantum sensitivity endpoints
│   │   │   ├── prediction.py     # Single-case inference
│   │   │   ├── routing.py        # Clinical triage decision logic
│   │   │   └── lab.py            # Qubit scaling and noise experiments
│   │   └── schemas.py            # Pydantic request/response data contracts
│   ├── db/
│   │   ├── database.py           # SQLite connection and session lifecycle
│   │   └── models.py             # SQLAlchemy ORM table definitions
│   └── main.py                   # FastAPI application initialization and CORS
├── ml/
│   ├── preprocessing/            # Scalers, stratified splitters, PCA pipelines
│   ├── classical/                # Scikit-learn & XGBoost wrappers
│   ├── quantum/                  # PennyLane VQC & Quantum Kernel implementations
│   ├── evaluation/               # Metrics calculation (Acc, Sens, Spec, AUC-ROC)
│   ├── explainability/           # SHAP explainers & quantum perturbation engine
│   └── routing/                  # Certainty routing heuristics
├── models/                       # Serialized model artifacts (.pkl, .joblib)
├── results/                      # SQLite database file and benchmark JSONs
├── scripts/                      # Standalone CLI reproduction and benchmark runners
└── tests/                        # Pytest suite for API and ML components
```

---

## 6. Frontend Repository Structure

The client application is built with Next.js 14 App Router:

```text
quresight/frontend/
├── app/
│   ├── layout.tsx                # Root layout with sidebar navigation and themes
│   ├── page.tsx                  # Platform overview and executive summary
│   ├── dataset/
│   │   └── page.tsx              # Dataset inspector and feature distribution charts
│   ├── benchmark/
│   │   └── page.tsx              # Classical vs Quantum comparative benchmark table
│   ├── quantum-lab/
│   │   └── page.tsx              # Qubit scaling experimentator (2 to 6 qubits)
│   ├── explainability/
│   │   └── page.tsx              # SHAP summary plots and quantum sensitivity bars
│   └── diagnosis/
│   │   └── page.tsx              # Patient input sliders with real-time model routing
├── components/                   # Reusable UI widgets (cards, charts, metrics badges)
├── lib/
│   ├── api.ts                    # Typed API client fetching from backend port 8001
│   └── utils.ts                  # Numerical formatting and chart utilities
├── package.json                  # Next.js 14, Lucide React, Tailwind dependencies
└── tsconfig.json                 # TypeScript strict typing configuration
```

---

## 7. Database Schema

All experiment runs, fitted models, and individual inference outputs are recorded in SQLite (`results/quresight.db`) using SQLAlchemy:

### Table: `experiments`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | Unique UUID for the benchmark session |
| `name` | VARCHAR(128) | NOT NULL | Experiment run tag (e.g. `sih_baseline_run`) |
| `dataset_name` | VARCHAR(64) | NOT NULL | Dataset used (`breast_cancer_wisconsin`) |
| `random_seed` | INTEGER | NOT NULL | Deterministic random seed (`42`) |
| `created_at` | DATETIME | DEFAULT NOW | Timestamp of benchmark run |

### Table: `model_runs`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | Unique model execution run ID |
| `experiment_id` | VARCHAR(36) | FOREIGN KEY | Links to `experiments.id` |
| `model_name` | VARCHAR(64) | NOT NULL | `LogisticRegression`, `RandomForest`, `XGBoost`, `VQC`, `QSVC` |
| `model_type` | VARCHAR(16) | NOT NULL | `classical` or `quantum` |
| `num_qubits` | INTEGER | NULLABLE | Number of qubits (4 for VQC/QSVC, NULL for classical) |
| `accuracy` | FLOAT | NOT NULL | Out-of-sample accuracy $[0.0, 1.0]$ |
| `sensitivity` | FLOAT | NOT NULL | Recall / True Positive Rate $[0.0, 1.0]$ |
| `specificity` | FLOAT | NOT NULL | True Negative Rate $[0.0, 1.0]$ |
| `precision` | FLOAT | NOT NULL | Positive Predictive Value $[0.0, 1.0]$ |
| `f1_score` | FLOAT | NOT NULL | Harmonic mean of precision and recall |
| `auc_roc` | FLOAT | NOT NULL | Area Under the Receiver Operating Characteristic |
| `train_duration_sec`| FLOAT | NOT NULL | Total elapsed fitting time |
| `inference_latency_ms`| FLOAT | NOT NULL | Mean inference latency per sample in milliseconds |
| `artifact_path` | VARCHAR(255)| NOT NULL | File path to serialized weights/pipeline |

### Table: `predictions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | Prediction record UUID |
| `model_run_id` | VARCHAR(36) | FOREIGN KEY | Links to `model_runs.id` |
| `predicted_class` | INTEGER | NOT NULL | 0 (Benign) or 1 (Malignant) |
| `probability` | FLOAT | NOT NULL | Calibrated probability of malignancy |
| `routing_decision` | VARCHAR(64) | NOT NULL | Clinical routing recommendation |
| `created_at` | DATETIME | DEFAULT NOW | Inference timestamp |

---

## 8. Artifact Storage Structure

Serialized models, preprocessing transformers, and precomputed kernel matrices are persisted on local storage:

```text
quresight/
├── models/
│   ├── preprocessor_pipeline.joblib  # StandardScaler + PCA fitted on train
│   ├── logistic_regression.joblib    # Fitted classical logistic regression
│   ├── random_forest.joblib          # Fitted Random Forest ensemble
│   ├── xgboost.joblib                # Fitted XGBoost model
│   ├── vqc_weights.npy               # Trained variational circuit parameter matrix
│   └── qsvc_model.joblib             # SVC fitted on quantum kernel Gram matrix
└── results/
    ├── quresight.db                  # Relational audit database
    ├── train_gram_matrix.npy         # N_train x N_train quantum state fidelities
    ├── test_gram_matrix.npy          # N_test x N_train quantum state fidelities
    └── benchmark_summary.json        # Static cache of comparative results
```
