from fastapi import APIRouter
from quresight.ml.explainability.shap_explainer import SHAPExplainer
from quresight.ml.explainability.quantum_sensitivity import QuantumSensitivity
from quresight.ml.classical.trainer import ClassicalTrainer
from quresight.ml.quantum.trainer import QuantumTrainer
from quresight.backend.api.routes.training import models_cache, ensure_preprocessed
from quresight.backend.api.routes.preprocessing import processed_state
from quresight.backend.db.database import Database
import numpy as np
import datetime
import uuid

router = APIRouter(prefix="/api")
db = Database()

def get_or_train_model(model_name: str):
    ensure_preprocessed()
    if model_name in models_cache:
        return models_cache[model_name]
    
    # Train if not cached
    if model_name in ["logistic_regression", "random_forest", "xgboost", "svm"]:
        trainer = ClassicalTrainer()
        metrics, model = trainer.train(
            processed_state["X_train"], processed_state["y_train"],
            processed_state["X_test"], processed_state["y_test"],
            model_name
        )
        models_cache[model_name] = model
        return model
    elif model_name in ["vqc", "quantum"]:
        trainer = QuantumTrainer()
        fs = processed_state["selector"]
        X_train_pca, _ = fs.reduce_to_n_components(processed_state["X_train"], n=4)
        X_test_pca, _ = fs.reduce_to_n_components(processed_state["X_test"], n=4)
        trainer.train(
            X_train_pca, processed_state["y_train"],
            X_test_pca, processed_state["y_test"],
            method="vqc", n_qubits=4, n_layers=2
        )
        if trainer.last_model is not None:
            models_cache[model_name] = trainer.last_model
            return trainer.last_model
    
    # Default fallback to random_forest
    trainer = ClassicalTrainer()
    metrics, model = trainer.train(
        processed_state["X_train"], processed_state["y_train"],
        processed_state["X_test"], processed_state["y_test"],
        "random_forest"
    )
    models_cache["random_forest"] = model
    return model

@router.post("/explain")
@router.post("/explainability/classical")
@router.post("/explainability/quantum")
def explain(req: dict = None):
    ensure_preprocessed()
    if req is None:
        req = {}
    model_name = req.get("model_name", "random_forest")
    sample_index = int(req.get("sample_index", req.get("instance_index", 0)))
    
    X_test = processed_state["X_test"]
    X_train = processed_state["X_train"]
    feature_names = processed_state.get("feature_names", [f"Feature_{i}" for i in range(X_train.shape[1])])
    
    if sample_index >= len(X_test):
        sample_index = 0
        
    instance = X_test[sample_index:sample_index+1]
    model = get_or_train_model(model_name)
    
    is_quantum = "vqc" in model_name or "quantum" in model_name
    
    if is_quantum:
        # Quantum Feature Sensitivity
        fs = processed_state["selector"]
        instance_pca = fs.minmax.transform(fs.rf.transform(instance)[:, :4]) if hasattr(fs, 'rf') else instance[:, :4]
        q_sens = QuantumSensitivity()
        X_sample = X_test[:10, :4]
        sens_res = q_sens.analyze(model, X_sample, [f"PC_{i+1}" for i in range(4)])
        
        prob = float(model.predict_proba(instance[:, :4])[0, 1])
        shap_vals = [s["sensitivity"] for s in sens_res["sensitivities"]]
        
        return {
            "local": {
                "shap_values": shap_vals,
                "feature_names": [s["feature"] for s in sens_res["sensitivities"]],
                "probability": prob,
                "base_value": 0.5,
                "model_output": prob,
                "contributions": sens_res["sensitivities"]
            },
            "quantum_sensitivity": sens_res,
            "model_type": "quantum"
        }
    else:
        explainer = SHAPExplainer()
        pred_exp = explainer.explain_prediction(model, X_train, instance, feature_names)
        shap_vals = [c["shap_value"] for c in pred_exp["contributions"]]
        fn_ordered = [c["feature"] for c in pred_exp["contributions"]]
        
        return {
            "local": {
                "shap_values": shap_vals,
                "feature_names": fn_ordered,
                "probability": pred_exp["probability"],
                "base_value": 0.5,
                "model_output": pred_exp["probability"],
                "contributions": pred_exp["contributions"]
            },
            "model_type": "classical"
        }

@router.post("/predict")
@router.post("/predictions")
def predict(req: dict = None):
    ensure_preprocessed()
    if req is None:
        req = {}
    features = req.get("features", {})
    model_name = req.get("model_name", "random_forest")
    
    model = get_or_train_model(model_name)
    feature_names = processed_state.get("feature_names", [])
    
    # Construct feature vector matching feature_names or X_train dimension
    X_train = processed_state["X_train"]
    n_feat = X_train.shape[1]
    
    # If partial features provided, fill from mean or default
    vector = np.zeros((1, n_feat))
    for i, fn in enumerate(feature_names[:n_feat]):
        if fn in features:
            try:
                vector[0, i] = float(features[fn])
            except:
                pass
        else:
            # Use mean from training set
            vector[0, i] = float(np.mean(X_train[:, i]))
            
    is_quantum = "vqc" in model_name or "quantum" in model_name
    if is_quantum:
        pred_vector = vector[:, :4]
        prob = float(model.predict_proba(pred_vector)[0, 1])
    else:
        prob = float(model.predict_proba(vector)[0, 1]) if hasattr(model, "predict_proba") else 0.5
        
    risk_level = "Elevated Risk" if prob >= 0.65 else ("Moderate Risk" if prob >= 0.35 else "Low Risk")
    
    top_factors = []
    if not is_quantum and hasattr(model, "feature_importances_"):
        imps = model.feature_importances_
        idx = np.argsort(imps)[::-1][:5]
        for i in idx:
            if i < len(feature_names):
                top_factors.append({
                    "factor": feature_names[i],
                    "importance": float(imps[i])
                })
    elif not is_quantum and hasattr(model, "coef_"):
        coefs = np.abs(model.coef_[0])
        idx = np.argsort(coefs)[::-1][:5]
        for i in idx:
            if i < len(feature_names):
                top_factors.append({
                    "factor": feature_names[i],
                    "importance": float(coefs[i])
                })
    else:
        top_factors = [{"factor": f"Biomarker Component {i+1}", "importance": 0.25} for i in range(4)]
        
    pred_id = str(uuid.uuid4())
    result = {
        "id": pred_id,
        "probability": prob,
        "risk_level": risk_level,
        "model": model_name,
        "model_used": model_name,
        "top_factors": top_factors,
        "disclaimer": "This prototype provides research/decision-support predictions and is not a substitute for professional medical diagnosis.",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    
    # Save to DB
    db.save_prediction({
        "id": pred_id,
        "created_at": result["timestamp"],
        "dataset_name": "Breast Cancer Wisconsin (Diagnostic)",
        "model_name": model_name,
        "features": features,
        "probability": prob,
        "risk_level": risk_level,
        "contributions": top_factors
    })
    
    return result
