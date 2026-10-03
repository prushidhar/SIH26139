import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

@pytest.mark.anyio
async def test_breast_cancer_transfinite():
    payload = {
        "model_name": "transfinite_1",
        "biomarkers": {
            "radius_mean": 12.20,
            "texture_mean": 17.39,
            "perimeter_mean": 78.18,
            "area_mean": 458.70,
            "smoothness_mean": 0.0908,
            "compactness_mean": 0.0645,
            "concavity_mean": 0.0371,
            "concave_points_mean": 0.0234
        }
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/inference/breast-cancer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "telemetry" in data
    assert "prediction_label" in data["telemetry"]
    assert "confidence_percentage" in data["telemetry"]

@pytest.mark.anyio
async def test_breast_cancer_classical_cx01():
    payload = {
        "model_name": "cx_01",
        "biomarkers": {
            "radius_mean": 17.99,
            "texture_mean": 10.38,
            "perimeter_mean": 122.80,
            "area_mean": 1001.0,
            "smoothness_mean": 0.1184,
            "compactness_mean": 0.2776,
            "concavity_mean": 0.3001,
            "concave_points_mean": 0.1471
        }
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/inference/breast-cancer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["telemetry"]["prediction_label"] == "Malignant"

@pytest.mark.anyio
async def test_breast_cancer_adaptive_router():
    payload = {
        "model_name": "adaptive_router",
        "biomarkers": {
            "radius_mean": 14.0,
            "texture_mean": 19.0,
            "perimeter_mean": 90.0,
            "area_mean": 600.0,
            "smoothness_mean": 0.10,
            "compactness_mean": 0.10,
            "concavity_mean": 0.08,
            "concave_points_mean": 0.05
        }
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/inference/breast-cancer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "adaptive_router_decision" in data["telemetry"]

@pytest.mark.anyio
async def test_cardiac_demo_inference():
    payload = {"sample_type": "mi"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/inference/cardiac-demo", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "quantum_engine" in data
    assert "classical_engine" in data
    assert "dual_engine_consensus" in data

@pytest.mark.anyio
async def test_hepatitis_inference():
    payload = {
        "Age": 45.0,
        "Sex": "m",
        "ALB": 41.6,
        "ALP": 68.3,
        "ALT": 28.4,
        "AST": 34.7,
        "BIL": 11.4,
        "CHE": 8.2,
        "CHOL": 5.4,
        "CREA": 81.3,
        "GGT": 39.5,
        "PROT": 72.0
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/inference/hepatitis-c", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "classical_results" in data["telemetry"]
    assert "quantum_results" in data["telemetry"]

@pytest.mark.anyio
async def test_adaptive_route_standalone():
    payload = {
        "classical_probability": 0.90,
        "quantum_probability": 0.85,
        "disease_type": "breast_cancer",
        "hardware_mode": "simulator"
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/inference/adaptive-route", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "routing_decision" in data


@pytest.mark.anyio
async def test_heart_disease_tabular_inference():
    payload = {
        "age": 63.0,
        "sex": 1.0,
        "cp": 3.0,
        "trestbps": 145.0,
        "chol": 233.0,
        "fbs": 1.0,
        "restecg": 0.0,
        "thalach": 150.0,
        "exang": 0.0,
        "oldpeak": 2.3,
        "slope": 0.0,
        "ca": 0.0,
        "thal": 1.0
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/inference/heart-disease-tabular", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "telemetry" in data
    assert "classical_results" in data["telemetry"]
    assert "quantum_results" in data["telemetry"]
    assert "router_decision" in data["telemetry"]
    assert data["telemetry"]["provenance"]["dataset"] == "Cleveland Clinic Foundation (UCI Heart Disease)"
    assert "architecture" in data["telemetry"]["provenance"]


@pytest.mark.anyio
async def test_chronic_kidney_inference():
    payload = {
        "age": 52.0,
        "blood_pressure": 80.0,
        "specific_gravity": 1.020,
        "albumin": 0.0,
        "blood_glucose_random": 115.0,
        "blood_urea": 36.0,
        "serum_creatinine": 1.1,
        "hemoglobin": 14.8
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/inference/chronic-kidney", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "telemetry" in data
    assert "egfr_value" in data["telemetry"]
    assert "kdigo_stage" in data["telemetry"]
    assert "classical_results" in data["telemetry"]
    assert "quantum_results" in data["telemetry"]
    assert "kfre_progression_risk" in data["telemetry"]


@pytest.mark.anyio
async def test_liver_ilpd_inference():
    payload = {
        "Age": 45.0,
        "Gender": 1.0,
        "Total_Bilirubin": 2.4,
        "Direct_Bilirubin": 1.1,
        "Alkaline_Phosphotase": 280.0,
        "Alamine_Aminotransferase": 52.0,
        "Aspartate_Aminotransferase": 64.0,
        "Total_Protiens": 6.8,
        "Albumin": 3.1,
        "Albumin_and_Globulin_Ratio": 0.85
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/inference/liver-ilpd", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "telemetry" in data
    assert "de_ritis_clinical_marker" in data["telemetry"]
    assert "minimal_qml_telemetry" in data["telemetry"]
    assert data["telemetry"]["minimal_qml_telemetry"]["qubit_count"] == 2


@pytest.mark.anyio
async def test_cardiomegaly_cxr_inference():
    payload = {
        "measured_ctr": 0.54,
        "sample_label": "CheXpert CXR Patient Study"
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/inference/cardiomegaly-cxr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "telemetry" in data
    assert "cardiothoracic_ratio" in data["telemetry"]
    assert data["telemetry"]["cardiothoracic_ratio"]["measured_ctr"] == 0.54
    assert "transfer_learning_telemetry" in data["telemetry"]


@pytest.mark.anyio
async def test_neurological_inference():
    payload = {
        "eeg_alpha_beta_ratio": 2.2,
        "eeg_theta_power": 25.0,
        "motor_tremor_hz": 1.2,
        "reaction_time_ms": 240.0,
        "speech_jitter_pct": 0.38,
        "speech_shimmer_db": 0.18,
        "cognitive_mmse": 29.0,
        "age": 62.0
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/inference/neurological", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "telemetry" in data
    assert "mds_updrs_tremor" in data["telemetry"]
    assert "cognitive_mmse_staging" in data["telemetry"]
    assert "eeg_spectral_analysis" in data["telemetry"]


