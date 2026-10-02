import os
from pathlib import Path
import pandas as pd
import numpy as np

_base_dir = Path(__file__).resolve().parents[2]
DATA_RAW_DIR = _base_dir / "data" / "raw"
if not DATA_RAW_DIR.exists():
    DATA_RAW_DIR = Path(__file__).resolve().parents[3] / "data" / "raw"

DATASET_REGISTRY = {
    "breast_cancer": {
        "id": "breast_cancer",
        "name": "Breast Cancer Wisconsin (Diagnostic)",
        "description": "Digitized Fine Needle Aspirate (FNA) cytopathology features for early breast tumor diagnosis.",
        "source": "University of Wisconsin Clinical Sciences Center / Scikit-Learn",
        "target_column": "target",
        "task_type": "binary_classification",
        "positive_class": "Malignant (Class 0 in sklearn / Positive Diagnosis)",
        "negative_class": "Benign (Class 1 in sklearn / Negative Diagnosis)",
        "file_name": "breast_cancer.csv",
        "default_quantum_dimensions": 4,
        "feature_count": 30,
        "sample_count": 569,
        "features_description": "Radius, texture, perimeter, area, smoothness, compactness, concavity, concave points, symmetry, fractal dimension."
    },
    "heart_disease": {
        "id": "heart_disease",
        "name": "Cardiovascular Disease Diagnostic (Cleveland)",
        "description": "Clinical and non-invasive hemodynamic measurements for identifying presence of coronary artery disease.",
        "source": "Cleveland Clinic Foundation / UCI Machine Learning Repository",
        "target_column": "target",
        "task_type": "binary_classification",
        "positive_class": "Heart Disease Present (Class 1)",
        "negative_class": "No Heart Disease (Class 0)",
        "file_name": "heart.csv",
        "default_quantum_dimensions": 4,
        "feature_count": 13,
        "sample_count": 303,
        "features_description": "Age, sex, chest pain type, resting BP, cholesterol, fasting blood sugar, ECG, max HR, exercise angina, ST depression, slope, fluoroscopy vessels, thal."
    },
    "diabetes": {
        "id": "diabetes",
        "name": "Diabetes Biomarker Diagnostic Dataset",
        "description": "Metabolic, biometric and clinical biomarker metrics for early onset diabetes mellitus risk evaluation.",
        "source": "National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)",
        "target_column": "target",
        "task_type": "binary_classification",
        "positive_class": "Diabetic Onset (Class 1)",
        "negative_class": "Non-Diabetic (Class 0)",
        "file_name": "diabetes.csv",
        "default_quantum_dimensions": 4,
        "feature_count": 8,
        "sample_count": 768,
        "features_description": "Pregnancies, Glucose tolerance, Diastolic BP, Triceps skin thickness, 2-hour serum insulin, Body Mass Index, Pedigree function, Age."
    },
    "cardiomegaly_cxr": {
        "id": "cardiomegaly_cxr",
        "name": "CheXpert Cardiomegaly Radiography (Decoodt et al. 2023)",
        "description": "Frontal chest X-ray transfer learning cohort for enlarged cardiac silhouette detection using DenseNet-121 backbones.",
        "source": "Stanford AIMI / Decoodt et al., J. Imaging 2023, 9(7), 128",
        "target_column": "target",
        "task_type": "binary_classification",
        "positive_class": "Cardiomegaly (Class 1)",
        "negative_class": "Normal Cardiac Silhouette (Class 0)",
        "file_name": "cardiomegaly_cxr.csv",
        "default_quantum_dimensions": 6,
        "feature_count": 7,
        "sample_count": 1200,
        "features_description": "DenseNet_PC1 through PC6 orthogonal latent projections, Cardiothoracic_Ratio (CTR)."
    },
    "ilpd_liver": {
        "id": "ilpd_liver",
        "name": "Indian Liver Patient Dataset (ILPD / Donaire et al. 2026)",
        "description": "Hepatic and metabolic biomarker panel for minimal 2-qubit hybrid quantum classification.",
        "source": "UCI Machine Learning / Donaire et al., Eng. Appl. Artif. Intell. 2026",
        "target_column": "target",
        "task_type": "binary_classification",
        "positive_class": "Liver Patient (Class 1)",
        "negative_class": "Non-Liver Patient (Class 0)",
        "file_name": "ilpd_liver.csv",
        "default_quantum_dimensions": 2,
        "feature_count": 10,
        "sample_count": 583,
        "features_description": "Total Bilirubin, Direct Bilirubin, Alkaline Phosphotase, ALT, AST, Total Proteins, Albumin, A/G Ratio, Age, Gender."
    }
}

class DatasetEngine:
    @staticmethod
    def list_datasets():
        return list(DATASET_REGISTRY.values())

    @staticmethod
    def get_dataset_metadata(dataset_id: str):
        return DATASET_REGISTRY.get(dataset_id, None)

    @staticmethod
    def load_dataset(dataset_id: str) -> pd.DataFrame:
        if dataset_id not in DATASET_REGISTRY:
            raise ValueError(f"Unknown dataset_id: {dataset_id}")
        
        info = DATASET_REGISTRY[dataset_id]
        fname = info["file_name"]
        
        candidates = [
            DATA_RAW_DIR / fname,
            Path.cwd() / "quresight" / "data" / "raw" / fname,
            Path.cwd().parent / "quresight" / "data" / "raw" / fname,
            Path(__file__).resolve().parents[2] / "data" / "raw" / fname,
            Path(__file__).resolve().parents[3] / "quresight" / "data" / "raw" / fname,
            Path("/opt/render/project/src/quresight/data/raw") / fname,
        ]
        for p in candidates:
            if p.exists():
                return pd.read_csv(p)
                
        if dataset_id == "breast_cancer":
            from sklearn.datasets import load_breast_cancer
            data = load_breast_cancer(as_frame=True)
            df = data.frame
            df.columns = [c.replace(" ", "_") for c in df.columns]
            return df

        raise FileNotFoundError(f"Dataset file '{fname}' not found in search paths")

    @staticmethod
    def profile_dataframe(df: pd.DataFrame, dataset_name: str = "Dataset"):
        target_col = 'target' if 'target' in df.columns else df.columns[-1]
        y = df[target_col]
        
        # Class distribution
        class_dist = {str(k): int(v) for k, v in y.value_counts().items()}
        total_rows = int(len(df))
        total_cols = int(len(df.columns))
        missing_cnt = int(df.isnull().sum().sum())
        missing_pct = float(missing_cnt / (total_rows * total_cols) * 100) if total_rows * total_cols > 0 else 0.0
        dup_cnt = int(df.duplicated().sum())
        
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
        
        # Check constant and low-variance features
        constant_cols = [c for c in num_cols if df[c].std() == 0 or df[c].nunique() <= 1]
        low_variance_cols = [c for c in num_cols if df[c].std() < 0.01 and c not in constant_cols]
        
        # Class imbalance ratio
        counts = list(class_dist.values())
        imbalance_ratio = float(max(counts) / min(counts)) if len(counts) > 1 and min(counts) > 0 else 1.0
        
        # Quality warnings
        risks = []
        if missing_pct > 10.0:
            risks.append({"type": "HIGH_MISSINGNESS", "severity": "warning", "message": f"{missing_pct:.1f}% missing values detected in dataset."})
        if imbalance_ratio > 3.0:
            risks.append({"type": "CLASS_IMBALANCE", "severity": "info", "message": f"Class imbalance ratio is {imbalance_ratio:.1f}:1. Stratified sampling recommended."})
        if dup_cnt > 0:
            risks.append({"type": "DUPLICATE_RECORDS", "severity": "info", "message": f"{dup_cnt} duplicate rows detected; will be handled during preprocessing."})
        if constant_cols:
            risks.append({"type": "CONSTANT_FEATURE", "severity": "warning", "message": f"Features with zero variance: {constant_cols}"})

        return {
            "name": dataset_name,
            "num_rows": total_rows,
            "n_rows": total_rows,
            "num_cols": total_cols,
            "n_cols": total_cols,
            "numerical_columns_count": len(num_cols),
            "categorical_columns_count": len(cat_cols),
            "target": str(target_col),
            "class_balance": class_dist,
            "class_distribution": class_dist,
            "imbalance_ratio": imbalance_ratio,
            "missing_values": missing_cnt,
            "missing_percentage": round(missing_pct, 2),
            "duplicates": dup_cnt,
            "duplicate_rows": dup_cnt,
            "constant_columns": constant_cols,
            "low_variance_columns": low_variance_cols,
            "quality_risks": risks,
            "feature_names": [str(c) for c in df.columns if c != target_col],
            "feature_types": {str(k): str(v) for k, v in df.dtypes.items()},
            "preview": df.head(10).to_dict(orient='records'),
            "statistics": df.describe().to_dict()
        }
