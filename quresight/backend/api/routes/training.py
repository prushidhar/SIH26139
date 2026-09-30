from fastapi import APIRouter
from quresight.ml.classical.trainer import ClassicalTrainer
from quresight.ml.quantum.trainer import QuantumTrainer
from quresight.ml.routing.router import ModelRouter
from quresight.backend.db.database import Database
from .preprocessing import processed_state, preprocess
import uuid
import datetime

router = APIRouter()
db = Database()

models_cache = {}

def ensure_preprocessed():
    if "X_train" not in processed_state:
        preprocess({})

@router.post("/api/train/classical")
@router.post("/api/models/train/classical")
@router.post("/api/models/classical/train")
def train_classical(req: dict = None):
    ensure_preprocessed()
    if req is None:
        req = {}
    models_to_train = req.get("models", ["logistic_regression", "random_forest", "xgboost", "svm"])
    if isinstance(models_to_train, str):
        models_to_train = [models_to_train]
        
    trainer = ClassicalTrainer()
    results = []
    for m_name in models_to_train:
        if m_name in trainer.models:
            metrics, model = trainer.train(
                processed_state["X_train"], processed_state["y_train"],
                processed_state["X_test"], processed_state["y_test"],
                m_name
            )
            models_cache[metrics["model_name"]] = model
            results.append(metrics)
            
            # Save experiment to DB
            exp_id = str(uuid.uuid4())
            db.save_experiment({
                "id": exp_id,
                "created_at": datetime.datetime.utcnow().isoformat(),
                "dataset_name": "Breast Cancer Wisconsin (Diagnostic)",
                "experiment_type": "classical_training",
                "config": {"model": m_name},
                "metrics": metrics,
                "status": "completed",
                "duration_seconds": metrics.get("training_time", 0)
            })
            
    return results

@router.post("/api/train/quantum")
@router.post("/api/models/train/quantum")
@router.post("/api/models/quantum/train")
def train_quantum(req: dict = None):
    ensure_preprocessed()
    if req is None:
        req = {}
    trainer = QuantumTrainer()
    fs = processed_state["selector"]
    n_qubits = req.get("qubits", req.get("n_qubits", 4))
    n_layers = req.get("depth", req.get("n_layers", 2))
    method = req.get("method", "vqc")
    
    X_train_pca, _ = fs.reduce_to_n_components(processed_state["X_train"], n=n_qubits)
    X_test_pca, _ = fs.reduce_to_n_components(processed_state["X_test"], n=n_qubits)
    
    metrics = trainer.train(
        X_train_pca, processed_state["y_train"],
        X_test_pca, processed_state["y_test"],
        method=method,
        n_qubits=n_qubits,
        n_layers=n_layers
    )
    if trainer.last_model is not None:
        models_cache[method] = trainer.last_model

    # Save to DB
    exp_id = str(uuid.uuid4())
    db.save_experiment({
        "id": exp_id,
        "created_at": datetime.datetime.utcnow().isoformat(),
        "dataset_name": "Breast Cancer Wisconsin (Diagnostic)",
        "experiment_type": "quantum_training",
        "config": {"method": method, "n_qubits": n_qubits, "n_layers": n_layers},
        "metrics": metrics,
        "status": "completed",
        "duration_seconds": metrics.get("training_time", 0)
    })
    return metrics

@router.post("/api/benchmark")
@router.post("/api/benchmark/run")
@router.get("/api/benchmark")
def benchmark(req: dict = None):
    ensure_preprocessed()
    if req is None:
        req = {}
        
    c_trainer = ClassicalTrainer()
    q_trainer = QuantumTrainer()
    
    c_res = []
    for m_name in c_trainer.models.keys():
        metrics, model = c_trainer.train(
            processed_state["X_train"], processed_state["y_train"],
            processed_state["X_test"], processed_state["y_test"],
            m_name
        )
        models_cache[m_name] = model
        c_res.append(metrics)
    
    fs = processed_state["selector"]
    X_train_pca, pca = fs.reduce_to_n_components(processed_state["X_train"], n=4)
    X_test_pca = fs.minmax.transform(pca.transform(processed_state["X_test"]))
    
    q_res = q_trainer.train(
        X_train_pca, processed_state["y_train"],
        X_test_pca, processed_state["y_test"],
        method="vqc", n_qubits=4, n_layers=2
    )
    if q_trainer.last_model is not None:
        models_cache["vqc"] = q_trainer.last_model
        
    qsvm_res = q_trainer.train(
        X_train_pca, processed_state["y_train"],
        X_test_pca, processed_state["y_test"],
        method="quantum_kernel", n_qubits=4
    )
    if q_trainer.last_model is not None:
        models_cache["quantum_kernel"] = q_trainer.last_model
    
    all_res = c_res + [q_res, qsvm_res]
    model_router = ModelRouter()
    best = model_router.select_best_model(all_res)
    
    bench_id = str(uuid.uuid4())
    db.save_experiment({
        "id": bench_id,
        "created_at": datetime.datetime.utcnow().isoformat(),
        "dataset_name": "Breast Cancer Wisconsin (Diagnostic)",
        "experiment_type": "benchmark",
        "config": {"models": [r["model_name"] for r in all_res]},
        "metrics": {
            "classical": c_res,
            "quantum": [q_res, qsvm_res],
            "selected_model": best
        },
        "status": "completed",
        "duration_seconds": sum(r.get("training_time", 0) for r in all_res)
    })
    
    return {
        "classical_results": c_res,
        "quantum_results": [q_res, qsvm_res],
        "selected_model": best,
        "benchmark_id": bench_id
    }
