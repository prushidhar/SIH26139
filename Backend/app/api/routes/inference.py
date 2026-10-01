from typing import Dict, Any, Optional, List
import io
import base64
from pathlib import Path
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Request
from pydantic import BaseModel, Field

from models_v1 import (
    cx_01_pipeline,
    transfinite_1_pipeline,
    aleph_1_pipeline,
    hepatitis_pipeline,
    heart_tabular_pipeline,
    cxr_transfer_pipeline,
    donaire_liver_pipeline,
    AdaptiveModelRouter,
)

# ==============================================================================
# CARDIAC ENGINE SELECTION TOGGLE (1-Line Switch)
# Set to True to revert to legacy heart_v1; False to use SOTA Heart Model Final (heart_v2)
# ==============================================================================
USE_LEGACY_HEART_ENGINE = False

if USE_LEGACY_HEART_ENGINE:
    from models_v1.heart_v1.cardiac_engine import get_cardiac_engine
else:
    from models_v1.heart_v2.cardiac_engine_v2 import get_cardiac_engine

router = APIRouter(
    prefix="/inference",
    tags=["Model Inference Pipelines"],
)

class BiomarkerInput(BaseModel):
    radius_mean: float = Field(default=12.20, description="Mean nuclear radius")
    texture_mean: float = Field(default=17.39, description="Standard deviation of gray-scale values")
    perimeter_mean: float = Field(default=78.18, description="Mean nuclear perimeter")
    area_mean: float = Field(default=458.70, description="Mean nuclear spatial area")
    smoothness_mean: float = Field(default=0.0908, description="Local variation in radius lengths")
    compactness_mean: float = Field(default=0.0645, description="Perimeter^2 / area - 1.0")
    concavity_mean: float = Field(default=0.0371, description="Severity of concave portions of contour")
    concave_points_mean: float = Field(default=0.0234, description="Number of concave portions of contour")

class InferenceRequest(BaseModel):
    model_name: str = Field(default="transfinite_1", description="Target model: 'cx_01' | 'transfinite_1' | 'aleph_1'")
    biomarkers: BiomarkerInput
    ibm_token: Optional[str] = Field(default=None, description="Optional IBM Quantum API token for Aleph-1")

@router.post("/breast-cancer", status_code=status.HTTP_200_OK)
async def run_breast_cancer_inference(payload: InferenceRequest):
    """
    Executes one of the three dedicated model pipelines:
      - CX-01: Classical Benchmark (SVM-RBF + XGBoost)
      - Transfinite-1: Hybrid Quantum Baseline Simulator (PennyLane statevector)
      - Aleph-1: Fine-Tuned Real IBM Hardware QPU Model
    """
    try:
        biomarker_dict = payload.biomarkers.model_dump()
        target = payload.model_name.lower().replace("-", "_")

        if target in ["cx_01", "classical"]:
            result = cx_01_pipeline.predict(biomarker_dict)
        elif target in ["aleph_1", "real_ibm_qpu", "ibm"]:
            result = aleph_1_pipeline.predict(biomarker_dict, ibm_token=payload.ibm_token)
        elif target in ["adaptive", "router", "adaptive_router", "consensus"]:
            res_c = cx_01_pipeline.predict(biomarker_dict)
            res_q = transfinite_1_pipeline.predict(biomarker_dict)
            p_c = float(res_c.get("calibrated_malignancy_prob", 0.5))
            p_q = float(res_q.get("calibrated_malignancy_prob", 0.5))
            router_decision = AdaptiveModelRouter.route(
                classical_prob=p_c,
                quantum_prob=p_q,
                disease_type="breast_cancer",
                classical_latency_ms=float(res_c.get("latency_ms", 3.5)),
                quantum_latency_ms=float(res_q.get("latency_ms", 12.0)),
            )
            result = {
                "adaptive_router_decision": router_decision,
                "classical_telemetry": res_c,
                "quantum_telemetry": res_q,
                "primary_model_used": router_decision["selected_engine"],
                "prediction_label": router_decision["final_label"],
                "calibrated_malignancy_prob": router_decision["final_calibrated_probability"],
                "confidence_percentage": round(abs(router_decision["final_calibrated_probability"] - 0.5) * 200.0, 1),
                "composite_risk_score": res_q.get("composite_risk_score", 50.0),
                "risk_tier": res_q.get("risk_tier", "Moderate Risk"),
                "clinical_action": res_q.get("clinical_action", "Clinical consultation recommended"),
                "consensus_status": router_decision["consensus_status"],
            }
        else:
            # Default to Transfinite-1 (Simulator)
            result = transfinite_1_pipeline.predict(biomarker_dict)

        return {"success": True, "telemetry": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline execution error: {str(e)}"
        )


class CardiacBase64Request(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded ECG image data string")
    filename: Optional[str] = Field(default="ecg_upload.jpg")
    model_name: Optional[str] = Field(default="transfinite_1")


@router.post("/cardiac-ecg", status_code=status.HTTP_200_OK)
async def run_cardiac_ecg_inference(
    request: Request,
    file: Optional[UploadFile] = File(None),
):
    """
    Executes production Cardiac ECG Dual-Engine Inference:
      - Classical CX-01 ResNet-18 + Grad-CAM Heatmap
      - Hybrid Quantum Transfinite-1 8-Qubit VQC
      - Calibrated 0-100 Continuous Cardiac Risk Score
      - Anatomical Lead & ST Abnormality Pinpointing
    """
    try:
        engine = get_cardiac_engine()
        image_bytes = None
        filename = "ecg_image.jpg"

        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            data = await request.json()
            b64_str = data.get("image_base64", "")
            if "," in b64_str:
                b64_str = b64_str.split(",")[1]
            if b64_str:
                image_bytes = base64.b64decode(b64_str)
            filename = data.get("filename") or "ecg_image.jpg"
        elif file is not None:
            image_bytes = await file.read()
            filename = file.filename or "ecg_image.jpg"
        else:
            # Check form data fields
            try:
                form = await request.form()
                if "file" in form and hasattr(form["file"], "read"):
                    upload = form["file"]
                    image_bytes = await upload.read()
                    filename = getattr(upload, "filename", "ecg_image.jpg")
                elif "image_base64" in form:
                    b64_str = str(form["image_base64"])
                    if "," in b64_str:
                        b64_str = b64_str.split(",")[1]
                    image_bytes = base64.b64decode(b64_str)
                    filename = str(form.get("filename", "ecg_image.jpg"))
            except Exception:
                pass

        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either an image file upload or image_base64 payload must be provided."
            )

        telemetry = engine.predict_image(image_bytes, filename=filename)
        return telemetry
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cardiac ECG inference failed: {str(e)}"
        )


class CardiacDemoRequest(BaseModel):
    sample_type: str = Field(..., description="'mi' | 'normal' | 'history_mi' | 'arrhythmia'")


@router.post("/cardiac-demo", status_code=status.HTTP_200_OK)
async def run_cardiac_demo_inference(payload: CardiacDemoRequest):
    """
    Runs instant inference on verified clinical sample ECG cases.
    """
    try:
        sample_key = payload.sample_type.lower().strip()
        sample_map = {
            "mi": ("Frontend/public/samples/ecg/sample-mi.jpg", "Acute_MI_Lead_V2_V6.jpg"),
            "normal": ("Frontend/public/samples/ecg/sample-normal.jpg", "Normal_Sinus_Rhythm.jpg"),
            "history_mi": ("Frontend/public/samples/ecg/sample-history-mi.jpg", "Prior_Infarct_Lead_II.jpg"),
            "arrhythmia": ("Frontend/public/samples/ecg/sample-arrhythmia.jpg", "Conduction_Arrhythmia.jpg"),
        }

        if sample_key not in sample_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown sample_type '{sample_key}'. Choose from: {list(sample_map.keys())}"
            )

        rel_path, display_name = sample_map[sample_key]
        filename = Path(rel_path).name

        possible_paths = [
            Path(__file__).resolve().parents[2] / "samples" / "ecg" / filename,
            Path(__file__).resolve().parents[3] / "samples" / "ecg" / filename,
            Path(__file__).resolve().parents[4] / rel_path,
            Path(__file__).resolve().parents[3] / rel_path,
            Path.cwd() / "Backend" / "samples" / "ecg" / filename,
            Path.cwd() / "samples" / "ecg" / filename,
            Path.cwd() / rel_path,
        ]

        img_path = None
        for p in possible_paths:
            if p.exists():
                img_path = p
                break

        if not img_path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sample file '{filename}' not found on server filesystem."
            )

        with open(img_path, "rb") as f:
            data = f.read()

        engine = get_cardiac_engine()
        telemetry = engine.predict_image(data, filename=display_name)
        return telemetry
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cardiac demo inference failed: {str(e)}"
        )


# ==============================================================================
# HEPATOLOGY PILLAR: HEPATITIS C & LIVER FIBROSIS INFERENCE
# ==============================================================================

class HepatitisBiomarkerInput(BaseModel):
    Age: float = Field(default=45.0, description="Patient age in years")
    Sex: str = Field(default="m", description="Biological sex ('m' or 'f')")
    ALB: float = Field(default=41.6, description="Serum Albumin in g/L")
    ALP: float = Field(default=68.3, description="Alkaline Phosphatase in U/L")
    ALT: float = Field(default=28.4, description="Alanine Aminotransferase in U/L")
    AST: float = Field(default=34.7, description="Aspartate Aminotransferase in U/L")
    BIL: float = Field(default=11.4, description="Total Bilirubin in µmol/L")
    CHE: float = Field(default=8.2, description="Cholinesterase in kU/L")
    CHOL: float = Field(default=5.4, description="Cholesterol in mmol/L")
    CREA: float = Field(default=81.3, description="Creatinine in µmol/L")
    GGT: float = Field(default=39.5, description="Gamma-Glutamyl Transferase in U/L")
    PROT: float = Field(default=72.0, description="Total Protein in g/L")


@router.post("/hepatitis-c", status_code=status.HTTP_200_OK)
async def run_hepatitis_inference(payload: HepatitisBiomarkerInput):
    """
    Executes Tri-Model Hepatology Triage for Hepatitis C / Liver Fibrosis:
      - Classical Liver Ensemble (XGBoost / Logistic Regression)
      - 4-Qubit PennyLane Ring-CNOT VQC
      - Differentiable QML Latent Sensitivity Analysis
      - Adaptive Model Router clinical decision dispatch
    """
    try:
        raw_dict = payload.model_dump()
        result = hepatitis_pipeline.predict(raw_dict)
        return {"success": True, "telemetry": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hepatology pipeline execution error: {str(e)}"
        )


# ==============================================================================
# CARDIOLOGY TABULAR PILLAR: UCI CLEVELAND HEART DISEASE QML INFERENCE
# (AstroVall02 Architecture Reference)
# ==============================================================================

class HeartTabularInput(BaseModel):
    age: float = Field(default=55.0, description="Age in years")
    sex: float = Field(default=1.0, description="Biological sex (1 = male, 0 = female)")
    cp: float = Field(default=1.0, description="Chest pain type (0: typical, 1: atypical, 2: non-anginal, 3: asymptomatic)")
    trestbps: float = Field(default=130.0, description="Resting blood pressure in mm Hg")
    chol: float = Field(default=240.0, description="Serum cholestoral in mg/dl")
    fbs: float = Field(default=0.0, description="Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)")
    restecg: float = Field(default=0.0, description="Resting ECG results (0-2)")
    thalach: float = Field(default=150.0, description="Maximum heart rate achieved in bpm")
    exang: float = Field(default=0.0, description="Exercise-induced angina (1 = yes, 0 = no)")
    oldpeak: float = Field(default=1.0, description="ST depression induced by exercise relative to rest")
    slope: float = Field(default=1.0, description="Slope of the peak exercise ST segment (0-2)")
    ca: float = Field(default=0.0, description="Number of major vessels colored by flourosopy (0-3)")
    thal: float = Field(default=2.0, description="Thallium scintigraphy stress test (1: normal, 2: fixed, 3: reversible)")


@router.post("/heart-disease-tabular", status_code=status.HTTP_200_OK)
async def run_heart_disease_tabular_inference(payload: HeartTabularInput):
    """
    Executes AstroVall02-referenced 4-Qubit StronglyEntanglingLayers QML Inference
    on the 13-feature UCI Cleveland Cardiology panel with Quantara Adaptive Routing.
    """
    try:
        raw_dict = payload.model_dump()
        result = heart_tabular_pipeline.predict(raw_dict)
        return {"success": True, "telemetry": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Heart disease tabular pipeline execution error: {str(e)}"
        )


# ==============================================================================
# STANDALONE ADAPTIVE MODEL ROUTER ENDPOINT
# ==============================================================================

class AdaptiveRouteRequest(BaseModel):
    classical_probability: float = Field(..., ge=0.0, le=1.0, description="Classical ensemble probability")
    quantum_probability: float = Field(..., ge=0.0, le=1.0, description="Quantum hybrid model probability")
    disease_type: str = Field(default="breast_cancer", description="Target domain: 'breast_cancer' | 'cardiac_ecg' | 'hepatitis_c'")
    hardware_mode: str = Field(default="simulator", description="'simulator' or 'real_ibm_qpu'")
    classical_latency_ms: Optional[float] = Field(default=3.5)
    quantum_latency_ms: Optional[float] = Field(default=12.0)


@router.post("/adaptive-route", status_code=status.HTTP_200_OK)
async def evaluate_adaptive_routing(payload: AdaptiveRouteRequest):
    """
    Evaluates dynamic clinical routing between Classical and Quantum predictions
    using Shannon entropy, confidence margins, historical benchmark F1, and NISQ costs.
    """
    try:
        decision = AdaptiveModelRouter.route(
            classical_prob=payload.classical_probability,
            quantum_prob=payload.quantum_probability,
            disease_type=payload.disease_type,
            hardware_mode=payload.hardware_mode,
            classical_latency_ms=payload.classical_latency_ms or 3.5,
            quantum_latency_ms=payload.quantum_latency_ms or 12.0,
        )
        return {"success": True, "routing_decision": decision}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Adaptive routing error: {str(e)}"
        )


# ==============================================================================
# RADIOLOGY PILLAR: CHEXPERT CARDIOMEGALY TRANSFER LEARNING INFERENCE
# (Decoodt et al. 2023 Architecture Reference)
# ==============================================================================

class CXRInferenceRequest(BaseModel):
    measured_ctr: Optional[float] = Field(default=0.52, description="Cardiothoracic Ratio (CTR) measured from frontal radiograph")
    sample_label: Optional[str] = Field(default="CheXpert CXR Patient Study", description="Patient study identifier")
    dense_features: Optional[List[float]] = Field(default=None, description="Optional 1024 or 6 dimensional DenseNet-121 latent vector")


@router.post("/cardiomegaly-cxr", status_code=status.HTTP_200_OK)
async def run_cardiomegaly_cxr_inference(payload: CXRInferenceRequest):
    """
    Executes Decoodt et al. (J. Imaging 2023) Classical-Quantum Transfer Learning
    on CheXpert Chest Radiographs using 6-Qubit PennyLane VQC with DenseNet-121 features.
    """
    try:
        features_np = np.array(payload.dense_features, dtype=np.float64) if payload.dense_features else None
        telemetry = cxr_transfer_pipeline.predict(
            features=features_np,
            ctr_measurement=payload.measured_ctr,
            sample_label=payload.sample_label or "CheXpert CXR Patient Study"
        )
        return {"success": True, "telemetry": telemetry}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CXR transfer learning pipeline error: {str(e)}"
        )


# ==============================================================================
# HEPATOLOGY MINIMAL PILLAR: ILPD 2-QUBIT VQC INFERENCE
# (Donaire et al. 2026 Architecture Reference)
# ==============================================================================

class LiverILPDInput(BaseModel):
    Age: float = Field(default=45.0, description="Age in years")
    Gender: float = Field(default=1.0, description="1 for Male, 0 for Female")
    Total_Bilirubin: float = Field(default=2.4, description="Total Bilirubin in mg/dL")
    Direct_Bilirubin: float = Field(default=1.1, description="Direct Bilirubin in mg/dL")
    Alkaline_Phosphotase: float = Field(default=280.0, description="Alkaline Phosphatase in IU/L")
    Alamine_Aminotransferase: float = Field(default=52.0, description="ALT in IU/L")
    Aspartate_Aminotransferase: float = Field(default=64.0, description="AST in IU/L")
    Total_Protiens: float = Field(default=6.8, description="Total Proteins in g/dL")
    Albumin: float = Field(default=3.1, description="Albumin in g/dL")
    Albumin_and_Globulin_Ratio: float = Field(default=0.85, description="A/G Ratio")


@router.post("/liver-ilpd", status_code=status.HTTP_200_OK)
async def run_liver_ilpd_inference(payload: LiverILPDInput):
    """
    Executes Donaire et al. (Eng. Appl. Artif. Intell. 2026) ultra-compact
    2-Qubit Minimal Footprint VQC on 10 Indian Liver Patient Dataset biomarkers.
    """
    try:
        raw_dict = payload.model_dump()
        telemetry = donaire_liver_pipeline.predict(raw_dict)
        return {"success": True, "telemetry": telemetry}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ILPD minimal QML pipeline error: {str(e)}"
        )


