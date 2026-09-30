# QureSight REST API Reference

> **FastAPI Backend Endpoints, Request/Response Schemas, and Error Handling.**  
> *Base URL: `http://localhost:8001`*

---

## 1. Complete Endpoints Summary Table

| Method | Endpoint | Description | Request Body | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Root API status, platform version, and service discovery | *None* | `RootInfoResponse` |
| `GET` | `/health` | Health check probe for container orchestrators | *None* | `HealthCheckResponse` |
| `GET` | `/api/dataset/info` | Diagnostic dataset summary (samples, feature count, class balance) | *None* | `DatasetInfoResponse` |
| `GET` | `/api/dataset/profile` | Feature-wise statistical summary (mean, std, min, max, skewness) | *None* | `DatasetProfileResponse` |
| `POST` | `/api/dataset/upload` | Upload custom clinical CSV dataset for analysis | `multipart/form-data` | `UploadResponse` |
| `POST` | `/api/dataset/preprocess` | Execute stratified 80/20 train/test split and fit scalers | `PreprocessRequest` | `PreprocessResponse` |
| `POST` | `/api/train/classical` | Train Logistic Regression, Random Forest, and XGBoost | `ClassicalTrainRequest` | `ClassicalTrainResponse` |
| `POST` | `/api/train/vqc` | Train Variational Quantum Classifier (PQC via PennyLane) | `VQCTrainRequest` | `QuantumTrainResponse` |
| `POST` | `/api/train/qsvc` | Compute ZZ quantum kernel Gram matrix and fit Support Vector Classifier | `QSVCTrainRequest` | `QuantumTrainResponse` |
| `POST` | `/api/train/all` | Execute complete benchmark pipeline sequentially | `TrainAllRequest` | `BenchmarkSummaryResponse` |
| `GET` | `/api/benchmark` | Retrieve comparative benchmark table across all models | *None* | `BenchmarkTableResponse` |
| `GET` | `/api/benchmark/{model_id}` | Detailed metrics, confusion matrix, and ROC/PR points for a model | *None* | `ModelDetailResponse` |
| `GET` | `/api/explain/shap/{model_id}` | Retrieve classical SHAP feature importances and summary distributions | *None* | `SHAPExplanationResponse` |
| `GET` | `/api/explain/quantum-sensitivity` | Retrieve quantum circuit perturbation sensitivities | *None* | `QuantumSensitivityResponse` |
| `POST` | `/api/predict` | Run single patient inference across classical and quantum models | `PatientPredictionRequest` | `MultiModelPredictionResponse`|
| `POST` | `/api/route` | Automated clinical triage routing based on certainty and consensus | `PatientPredictionRequest` | `RoutingDecisionResponse` |
| `POST` | `/api/lab/qubit-scaling` | Execute Quantum Lab qubit scaling benchmark (2 to 6 qubits) | `QubitScalingRequest` | `QubitScalingResponse` |
| `GET` | `/api/experiments/history` | Query historical experiment runs from relational SQLite storage | *None* | `ExperimentHistoryResponse` |

---

## 2. Endpoint Details & Schemas

### 2.1 System & Dataset Endpoints

#### `GET /api/dataset/info`
Returns fundamental metadata about the loaded dataset.
- **Request:** None
- **Response `200 OK`:**
```json
{
  "name": "Breast Cancer Wisconsin (Diagnostic)",
  "source": "scikit-learn",
  "num_samples": 569,
  "num_features": 30,
  "classes": {
    "0": {"label": "Malignant", "count": 212, "percentage": 37.26},
    "1": {"label": "Benign", "count": 357, "percentage": 62.74}
  },
  "missing_values": 0
}
```

#### `POST /api/dataset/preprocess`
Executes reproducible stratified splitting and fits the scaling pipeline.
- **Request Body:**
```json
{
  "test_size": 0.20,
  "random_seed": 42,
  "pca_components": 4,
  "angle_scaling_range": [0.0, 3.141592653589793]
}
```
- **Response `200 OK`:**
```json
{
  "status": "success",
  "train_samples": 455,
  "test_samples": 114,
  "pca_variance_explained": [0.4427, 0.1897, 0.0939, 0.0660],
  "total_variance_explained": 0.7923,
  "artifact_path": "models/preprocessor_pipeline.joblib"
}
```

---

### 2.2 Model Training Endpoints

#### `POST /api/train/classical`
Fits all three classical baseline architectures.
- **Request Body:**
```json
{
  "models": ["logistic_regression", "random_forest", "xgboost"],
  "hyperparameters": {
    "random_forest": {"n_estimators": 100, "max_depth": 6},
    "xgboost": {"n_estimators": 100, "learning_rate": 0.1}
  }
}
```
- **Response `200 OK`:**
```json
{
  "status": "completed",
  "trained_models": [
    {
      "model_id": "logistic_regression",
      "train_time_sec": 0.042,
      "test_accuracy": 0.9649,
      "test_f1": 0.9524
    },
    {
      "model_id": "random_forest",
      "train_time_sec": 0.215,
      "test_accuracy": 0.9649,
      "test_f1": 0.9512
    },
    {
      "model_id": "xgboost",
      "train_time_sec": 0.184,
      "test_accuracy": 0.9737,
      "test_f1": 0.9639
    }
  ]
}
```

#### `POST /api/train/vqc`
Executes gradient-based optimization of the Variational Quantum Classifier.
- **Request Body:**
```json
{
  "num_qubits": 4,
  "num_layers": 2,
  "learning_rate": 0.1,
  "max_steps": 100,
  "batch_size": 32,
  "seed": 42
}
```
- **Response `200 OK`:**
```json
{
  "status": "completed",
  "model_id": "vqc",
  "num_qubits": 4,
  "num_parameters": 24,
  "train_time_sec": 14.82,
  "final_cost": 0.1834,
  "test_accuracy": 0.9298,
  "test_f1": 0.9024
}
```

#### `POST /api/train/qsvc`
Calculates the quantum kernel state fidelities and solves the dual quadratic SVM.
- **Request Body:**
```json
{
  "num_qubits": 4,
  "feature_map": "zz_feature_map",
  "c_parameter": 1.0
}
```
- **Response `200 OK`:**
```json
{
  "status": "completed",
  "model_id": "qsvc",
  "num_qubits": 4,
  "kernel_computation_time_sec": 22.45,
  "svm_fit_time_sec": 0.015,
  "test_accuracy": 0.9386,
  "test_f1": 0.9157
}
```

---

### 2.3 Benchmarking Endpoints

#### `GET /api/benchmark`
Retrieves standardized performance metrics across all models.
- **Response `200 OK`:**
```json
{
  "experiment_id": "exp_sih26139_001",
  "timestamp": "2026-10-01T00:00:00Z",
  "dataset": "breast_cancer_wisconsin",
  "test_size": 114,
  "results": [
    {
      "model_id": "logistic_regression",
      "model_type": "classical",
      "accuracy": 0.9649,
      "sensitivity": 0.9286,
      "specificity": 0.9861,
      "precision": 0.9750,
      "f1_score": 0.9512,
      "auc_roc": 0.9937,
      "latency_ms": 0.12
    },
    {
      "model_id": "xgboost",
      "model_type": "classical",
      "accuracy": 0.9737,
      "sensitivity": 0.9524,
      "specificity": 0.9861,
      "precision": 0.9756,
      "f1_score": 0.9639,
      "auc_roc": 0.9947,
      "latency_ms": 0.28
    },
    {
      "model_id": "vqc",
      "model_type": "quantum",
      "accuracy": 0.9298,
      "sensitivity": 0.8810,
      "specificity": 0.9583,
      "precision": 0.9250,
      "f1_score": 0.9024,
      "auc_roc": 0.9682,
      "latency_ms": 14.50
    },
    {
      "model_id": "qsvc",
      "model_type": "quantum",
      "accuracy": 0.9386,
      "sensitivity": 0.9048,
      "specificity": 0.9583,
      "precision": 0.9268,
      "f1_score": 0.9157,
      "auc_roc": 0.9715,
      "latency_ms": 18.20
    }
  ]
}
```

---

### 2.4 Explainability Endpoints

#### `GET /api/explain/shap/{model_id}`
Returns top SHAP features and values for classical models.
- **Response `200 OK`:**
```json
{
  "model_id": "xgboost",
  "explainer_type": "TreeExplainer",
  "top_features": [
    {"feature": "worst perimeter", "mean_abs_shap": 1.482, "direction": "positive_risk"},
    {"feature": "mean concave points", "mean_abs_shap": 1.340, "direction": "positive_risk"},
    {"feature": "worst texture", "mean_abs_shap": 0.892, "direction": "positive_risk"},
    {"feature": "worst area", "mean_abs_shap": 0.811, "direction": "positive_risk"},
    {"feature": "worst concavity", "mean_abs_shap": 0.654, "direction": "positive_risk"}
  ]
}
```

#### `GET /api/explain/quantum-sensitivity`
Returns finite-difference perturbation sensitivity for the quantum circuit.
- **Response `200 OK`:**
```json
{
  "model_id": "vqc",
  "method": "central_finite_difference_perturbation",
  "epsilon": 0.05,
  "component_sensitivities": [
    {"component": "PC0", "mean_sensitivity": 0.742, "relative_share": 0.441, "primary_clinical_driver": "worst perimeter & area"},
    {"component": "PC1", "mean_sensitivity": 0.481, "relative_share": 0.286, "primary_clinical_driver": "concavity & compactness"},
    {"component": "PC2", "mean_sensitivity": 0.284, "relative_share": 0.169, "primary_clinical_driver": "texture & smoothness"},
    {"component": "PC3", "mean_sensitivity": 0.175, "relative_share": 0.104, "primary_clinical_driver": "symmetry & fractal dim"}
  ]
}
```

---

### 2.5 Inference and Routing Endpoints

#### `POST /api/predict`
Calculates predictions across all active models for a single patient record.
- **Request Body:**
```json
{
  "features": {
    "mean radius": 17.99,
    "mean texture": 10.38,
    "mean perimeter": 122.8,
    "mean area": 1001.0,
    "mean smoothness": 0.1184,
    "mean compactness": 0.2776,
    "mean concavity": 0.3001,
    "mean concave points": 0.1471
  }
}
```
- **Response `200 OK`:**
```json
{
  "predictions": {
    "xgboost": {"predicted_class": 1, "label": "Malignant", "probability": 0.984},
    "random_forest": {"predicted_class": 1, "label": "Malignant", "probability": 0.960},
    "logistic_regression": {"predicted_class": 1, "label": "Malignant", "probability": 0.991},
    "vqc": {"predicted_class": 1, "label": "Malignant", "probability": 0.912},
    "qsvc": {"predicted_class": 1, "label": "Malignant", "probability": 0.925}
  },
  "consensus": "Unanimous Malignant (5/5 models)"
}
```

#### `POST /api/route`
Determines optimal clinical handling based on uncertainty and model disagreement.
- **Response `200 OK`:**
```json
{
  "routing_tier": "HIGH_CONFIDENCE_MALIGNANT",
  "recommended_model": "xgboost",
  "recommended_action": "Immediate Oncological Consultation & Biopsy Review",
  "classical_agreement": true,
  "quantum_agreement": true,
  "uncertainty_score": 0.024
}
```

---

### 2.6 Quantum Lab Scaling Endpoint

#### `POST /api/lab/qubit-scaling`
Scans circuit performance across qubit dimensions $N \in [2, 6]$.
- **Request Body:**
```json
{
  "qubit_range": [2, 3, 4, 5, 6],
  "model_type": "vqc",
  "steps_per_config": 50
}
```
- **Response `200 OK`:**
```json
{
  "scaling_curve": [
    {"qubits": 2, "variance_captured": 0.632, "accuracy": 0.886, "train_time_sec": 4.1},
    {"qubits": 3, "variance_captured": 0.726, "accuracy": 0.912, "train_time_sec": 8.3},
    {"qubits": 4, "variance_captured": 0.792, "accuracy": 0.930, "train_time_sec": 14.8},
    {"qubits": 5, "variance_captured": 0.847, "accuracy": 0.930, "train_time_sec": 31.2},
    {"qubits": 6, "variance_captured": 0.887, "accuracy": 0.921, "train_time_sec": 68.5}
  ],
  "optimal_tradeoff_qubits": 4
}
```
