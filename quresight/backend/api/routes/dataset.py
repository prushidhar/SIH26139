from fastapi import APIRouter, UploadFile, File
import pandas as pd
import numpy as np
import io
from quresight.ml.datasets.registry import DATASET_REGISTRY, DatasetEngine

router = APIRouter()

cached_dataset = None
cached_dataset_id = "breast_cancer"
cached_name = "Breast Cancer Wisconsin (Diagnostic)"

def ensure_default_loaded():
    global cached_dataset, cached_dataset_id, cached_name
    if cached_dataset is None:
        cached_dataset = DatasetEngine.load_dataset("breast_cancer")
        cached_dataset_id = "breast_cancer"
        cached_name = DATASET_REGISTRY["breast_cancer"]["name"]

@router.get("/api/datasets")
@router.get("/api/data/datasets")
def list_datasets():
    return {
        "datasets": DatasetEngine.list_datasets(),
        "active_dataset_id": cached_dataset_id
    }

@router.get("/api/datasets/{dataset_id}")
@router.get("/api/data/datasets/{dataset_id}")
def get_dataset(dataset_id: str):
    meta = DatasetEngine.get_dataset_metadata(dataset_id)
    if not meta:
        return {"error": f"Dataset '{dataset_id}' not found"}
    return meta

@router.post("/api/datasets/{dataset_id}/select")
@router.post("/api/data/datasets/{dataset_id}/select")
def select_dataset(dataset_id: str):
    global cached_dataset, cached_dataset_id, cached_name
    try:
        df = DatasetEngine.load_dataset(dataset_id)
        cached_dataset = df
        cached_dataset_id = dataset_id
        cached_name = DATASET_REGISTRY[dataset_id]["name"]
        return {
            "status": "success",
            "message": f"Dataset '{cached_name}' loaded successfully",
            "profile": DatasetEngine.profile_dataframe(df, cached_name)
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/api/dataset/default")
@router.post("/api/dataset/default")
@router.get("/api/data/default")
@router.post("/api/data/default")
def get_default_dataset():
    ensure_default_loaded()
    return DatasetEngine.profile_dataframe(cached_dataset, cached_name)

@router.post("/api/dataset/upload")
@router.post("/api/data/upload")
async def upload_dataset(file: UploadFile = File(...)):
    global cached_dataset, cached_dataset_id, cached_name
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        return {"error": f"Failed to parse CSV file: {str(e)}"}
        
    if df.empty:
        return {"error": "Uploaded CSV file is empty"}
        
    target_col = 'target' if 'target' in df.columns else df.columns[-1]
    unique_vals = df[target_col].dropna().unique()
    if len(unique_vals) > 2:
        return {"error": f"Target column '{target_col}' has {len(unique_vals)} unique classes. Only binary classification is supported."}
        
    val_map = {val: i for i, val in enumerate(unique_vals)}
    df[target_col] = df[target_col].map(val_map)
    
    cached_dataset = df
    cached_dataset_id = "custom_upload"
    cached_name = file.filename or "Uploaded Custom Biomedical Dataset"
    return DatasetEngine.profile_dataframe(df, cached_name)

@router.get("/api/dataset/profile")
@router.post("/api/dataset/profile")
@router.get("/api/data/profile")
@router.post("/api/data/profile")
@router.get("/api/datasets/{dataset_id}/profile")
@router.post("/api/datasets/{dataset_id}/profile")
def profile_dataset(dataset_id: str = None, req: dict = None):
    global cached_dataset, cached_dataset_id, cached_name
    if dataset_id and dataset_id in DATASET_REGISTRY:
        df = DatasetEngine.load_dataset(dataset_id)
        return DatasetEngine.profile_dataframe(df, DATASET_REGISTRY[dataset_id]["name"])
        
    ensure_default_loaded()
    return DatasetEngine.profile_dataframe(cached_dataset, cached_name)
