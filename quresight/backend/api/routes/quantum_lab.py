from fastapi import APIRouter
from quresight.ml.quantum.trainer import QuantumTrainer
from quresight.ml.classical.trainer import ClassicalTrainer
from quresight.ml.quantum.backend import LocalSimulatorBackend, IBMQuantumBackend
from quresight.backend.api.routes.preprocessing import processed_state, preprocess
from quresight.backend.db.database import Database
import uuid
import datetime

router = APIRouter(prefix="/api/quantum")
db = Database()

def ensure_preprocessed():
    if "X_train" not in processed_state:
        preprocess({})

@router.post("/experiments")
@router.post("/experiments/run")
def run_experiment(req: dict = None):
    ensure_preprocessed()
    if req is None:
        req = {}
        
    exp_type = req.get("type", req.get("experiment_type", "scaling"))
    trainer = QuantumTrainer()
    
    if exp_type in ["scaling", "qubit_scaling"]:
        qubits = req.get("qubits_list", req.get("qubit_options", [2, 4]))
        results = trainer.run_qubit_scaling_experiment(
            processed_state["X_train"], processed_state["y_train"],
            processed_state["X_test"], processed_state["y_test"],
            qubit_options=qubits,
            method=req.get("method", "vqc")
        )
    elif exp_type in ["depth", "depth_scaling"]:
        depths = req.get("depth_list", req.get("depth_options", [2, 4]))
        nq = req.get("qubits", req.get("n_qubits", 4))
        results = trainer.run_depth_experiment(
            processed_state["X_train"], processed_state["y_train"],
            processed_state["X_test"], processed_state["y_test"],
            depth_options=depths,
            n_qubits=nq
        )
    elif exp_type in ["noise", "noise_sensitivity"]:
        noise_levels = req.get("noise_levels", ["ideal", "low", "moderate"])
        results = trainer.run_noise_experiment(
            processed_state["X_train"], processed_state["y_train"],
            processed_state["X_test"], processed_state["y_test"],
            noise_levels=noise_levels,
            n_qubits=req.get("n_qubits", 4)
        )
    elif exp_type in ["comparison", "quantum_vs_classical"]:
        # Direct comparison of 4-qubit VQC/QuantumKernel vs classical on same PCA features
        fs = processed_state["selector"]
        X_train_pca4, pca4 = fs.reduce_to_n_components(processed_state["X_train"], n=4)
        X_test_pca4 = fs.minmax.transform(pca4.transform(processed_state["X_test"]))
        
        c_trainer = ClassicalTrainer()
        lr_metrics, _ = c_trainer.train(X_train_pca4, processed_state["y_train"], X_test_pca4, processed_state["y_test"], "logistic_regression")
        rf_metrics, _ = c_trainer.train(X_train_pca4, processed_state["y_train"], X_test_pca4, processed_state["y_test"], "random_forest")
        vqc_metrics = trainer.train(X_train_pca4, processed_state["y_train"], X_test_pca4, processed_state["y_test"], method="vqc", n_qubits=4)
        qsvm_metrics = trainer.train(X_train_pca4, processed_state["y_train"], X_test_pca4, processed_state["y_test"], method="quantum_kernel", n_qubits=4)
        results = [lr_metrics, rf_metrics, vqc_metrics, qsvm_metrics]
    else: # full
        res_scaling = trainer.run_qubit_scaling_experiment(
            processed_state["X_train"], processed_state["y_train"],
            processed_state["X_test"], processed_state["y_test"],
            qubit_options=[2, 4],
            method="vqc"
        )
        res_depth = trainer.run_depth_experiment(
            processed_state["X_train"], processed_state["y_train"],
            processed_state["X_test"], processed_state["y_test"],
            depth_options=[2, 4],
            n_qubits=4
        )
        results = res_scaling + res_depth

    # Save to database
    exp_id = str(uuid.uuid4())
    db.save_experiment({
        "id": exp_id,
        "created_at": datetime.datetime.utcnow().isoformat(),
        "dataset_name": "Breast Cancer Wisconsin (Diagnostic)",
        "experiment_type": f"quantum_{exp_type}",
        "config": req,
        "metrics": {"results": results},
        "status": "completed",
        "duration_seconds": sum(r.get("training_time", 0) for r in results)
    })

    return {"results": results, "data": results, "experiment_id": exp_id}

@router.get("/experiments")
def get_quantum_experiments():
    exps = db.get_experiments()
    return [e for e in exps if "quantum" in e.get("experiment_type", "")]

@router.get("/circuit-info")
@router.post("/circuit-info")
@router.get("/circuit")
@router.post("/circuit")
def circuit_info(req: dict = None, method: str="vqc", n_qubits: int=4, n_layers: int=2):
    if req is not None and isinstance(req, dict):
        method = req.get("method", method)
        n_qubits = req.get("qubits", req.get("n_qubits", n_qubits))
        n_layers = req.get("depth", req.get("n_layers", n_layers))
        
    local_backend = LocalSimulatorBackend()
    ibm_adapter = IBMQuantumBackend()
    resources = local_backend.estimate_resources(n_qubits, n_layers)
    qasm_code = local_backend.export_circuit_qasm(n_qubits, n_layers)

    return {
        "n_qubits": n_qubits,
        "n_layers": n_layers,
        "circuit_depth": resources["circuit_depth"],
        "n_params": resources["parameter_count"],
        "single_qubit_gates": resources["single_qubit_gates"],
        "two_qubit_gates": resources["two_qubit_gates"],
        "total_gates": resources["total_gates"],
        "encoding": "Angle Encoding (RX)" if method == "vqc" else "ZZFeatureMap-inspired",
        "entanglement": "Strongly Entangling Layers (Euler + CNOT ring)" if method == "vqc" else "ZZ Entangling Gates",
        "backend": "default.qubit",
        "simulator_label": "PennyLane default.qubit (Statevector Simulator)",
        "hardware_readiness": ibm_adapter.get_backend_info(),
        "openqasm": qasm_code
    }
