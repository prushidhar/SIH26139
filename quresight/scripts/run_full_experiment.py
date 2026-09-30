import sys
import os
from pathlib import Path

# Ensure project root is in sys.path
root_dir = Path(__file__).resolve().parents[2]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from quresight.ml.preprocessing.pipeline import PreprocessingPipeline
from quresight.ml.feature_selection.selector import FeatureSelector
from quresight.ml.classical.trainer import ClassicalTrainer
from quresight.ml.quantum.trainer import QuantumTrainer
from quresight.ml.routing.router import ModelRouter
from quresight.ml.explainability.shap_explainer import SHAPExplainer
from quresight.ml.explainability.quantum_sensitivity import QuantumSensitivity
from quresight.backend.db.database import Database

from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
import json
import datetime
import uuid

def main():
    print("==================================================")
    print("  QURESIGHT BENCHMARK ENGINE — SIH26139")
    print("  Quantum Intelligence. Explainable Health Insights.")
    print("==================================================")
    
    # 1. Dataset
    print("\n[1/6] Ingesting Biomedical Dataset: Breast Cancer Wisconsin (Diagnostic)...")
    data = load_breast_cancer()
    feature_names = list(data.feature_names)
    X = data.data
    y = data.target
    print(f"  Total samples: {len(X)} | Features: {len(feature_names)} | Classes: 2 (Malignant=0, Benign=1)")
    
    # Stratified Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    print(f"  Training split: {len(X_train)} samples | Test split: {len(X_test)} samples")
    
    # 2. Preprocessing & Feature Selection
    print("\n[2/6] Executing Preprocessing Pipeline (leakage-safe transformations)...")
    pipe = PreprocessingPipeline()
    X_train_p, X_test_p, prep_report = pipe.fit_transform(X_train, y_train, X_test, feature_names=feature_names)
    
    fs = FeatureSelector()
    sel_features = fs.fit(X_train_p, y_train, n_features=10, feature_names=pipe.feature_names_out)
    print(f"  Selected top {len(sel_features)} clinical features: {', '.join(sel_features[:4])}...")
    
    # 3. Classical ML Training
    print("\n[3/6] Training Classical Baselines...")
    c_trainer = ClassicalTrainer()
    c_results = []
    c_models = {}
    for name in ["logistic_regression", "random_forest", "xgboost"]:
        metrics, model = c_trainer.train(X_train_p, y_train, X_test_p, y_test, name)
        c_results.append(metrics)
        c_models[name] = model
        print(f"  [OK] {name.replace('_', ' ').title():<22} | Acc: {metrics['accuracy']:.4f} | F1: {metrics['f1']:.4f} | AUC: {metrics['roc_auc']:.4f} | Time: {metrics['training_time']:.3f}s")

    # 4. Quantum ML Training
    print("\n[4/6] Executing Quantum Simulation Pipeline (PennyLane default.qubit)...")
    q_trainer = QuantumTrainer()
    
    # Qubit scaling experiment (2 and 4 qubits)
    print("  Running Qubit Scaling experiments (VQC 2 & 4 qubits)...")
    q_results = q_trainer.run_qubit_scaling_experiment(X_train_p, y_train, X_test_p, y_test, qubit_options=[2, 4], method="vqc")
    for res in q_results:
        depth_val = res.get('circuit_depth', res.get('n_layers', 2))
        print(f"  [OK] VQC ({res['n_qubits']} qubits, depth {depth_val}) | Acc: {res['accuracy']:.4f} | F1: {res['f1']:.4f} | AUC: {res['roc_auc']:.4f} | Time: {res['training_time']:.2f}s")
        
    # Quantum Kernel SVM
    print("  Running Quantum Kernel SVM (4 qubits)...")
    X_train_pca4, pca4 = fs.reduce_to_n_components(X_train_p, n=4)
    X_test_pca4 = fs.minmax.transform(pca4.transform(X_test_p))
    qsvm_metrics = q_trainer.train(X_train_pca4, y_train, X_test_pca4, y_test, method="quantum_kernel", n_qubits=4)
    q_results.append(qsvm_metrics)
    print(f"  [OK] Quantum Kernel SVM     | Acc: {qsvm_metrics['accuracy']:.4f} | F1: {qsvm_metrics['f1']:.4f} | AUC: {qsvm_metrics['roc_auc']:.4f} | Time: {qsvm_metrics['training_time']:.2f}s")

    # 5. Benchmarking & Model Routing
    print("\n[5/6] Running Evidence-Based Model Selection...")
    all_results = c_results + q_results
    router = ModelRouter()
    routing_decision = router.select_best_model(all_results)
    print(f"  Selected Model: {routing_decision['selected_model']}")
    print(f"  Model Family:   {routing_decision['model_family']}")
    print(f"  Reason:         {routing_decision['reason']}")
    print(f"  Evidence:")
    for ev in routing_decision.get('evidence', []):
        print(f"    - {ev}")

    # 6. Explainability Evaluation
    print("\n[6/6] Computing Explainability Metrics...")
    explainer = SHAPExplainer()
    best_c_model = c_models["random_forest"]
    shap_exp = explainer.explain_prediction(best_c_model, X_train_p, X_test_p[0:1], sel_features)
    print(f"  Top SHAP Risk Factors for test sample: {[c['feature'] for c in shap_exp['contributions'][:3]]}")
    
    q_sens = QuantumSensitivity()
    q_sens_res = q_sens.analyze(q_trainer.last_model or q_results[0], X_test_pca4[:10], [f"PC_{i+1}" for i in range(4)])
    print(f"  Quantum Feature Sensitivity: {[s['feature'] + ': ' + str(round(s['sensitivity'], 3)) for s in q_sens_res['sensitivities'][:2]]}")

    # Save to JSON
    results_dir = Path(root_dir) / "quresight" / "results"
    results_dir.mkdir(parents=True, exist_ok=True)
    json_path = results_dir / "full_experiment_results.json"
    
    payload = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "dataset": "Breast Cancer Wisconsin (Diagnostic)",
        "samples_total": len(X),
        "train_samples": len(X_train_p),
        "test_samples": len(X_test_p),
        "classical_results": c_results,
        "quantum_results": q_results,
        "results": all_results,
        "routing_decision": routing_decision,
        "explainability": {
            "shap_sample": shap_exp,
            "quantum_sensitivity": q_sens_res
        }
    }
    with open(json_path, "w") as f:
        json.dump(payload, f, indent=2)
    print(f"\n  [OK] Persisted results to: {json_path}")

    # Save to SQLite Database
    db = Database()
    bench_id = str(uuid.uuid4())
    db.save_experiment({
        "id": bench_id,
        "created_at": payload["timestamp"],
        "dataset_name": "Breast Cancer Wisconsin (Diagnostic)",
        "experiment_type": "benchmark",
        "config": {"models": [r["model_name"] for r in all_results]},
        "metrics": {
            "classical": c_results,
            "quantum": q_results,
            "selected_model": routing_decision
        },
        "status": "completed",
        "duration_seconds": sum(r.get("training_time", 0) for r in all_results)
    })
    print(f"  [OK] Persisted benchmark run to SQLite DB: {db.db_path}")

    # Save Models Artifacts
    models_dir = Path(root_dir) / "quresight" / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    pipe.save(models_dir / "preprocessor.joblib")
    fs.save(models_dir / "feature_selector.joblib")
    c_trainer.save_model(c_models["random_forest"], models_dir / "random_forest.joblib")
    c_trainer.save_model(c_models["logistic_regression"], models_dir / "logistic_regression.joblib")
    c_trainer.save_model(c_models["xgboost"], models_dir / "xgboost.joblib")
    print(f"  [OK] Saved model artifacts to: {models_dir}")
    print("\n==================================================")
    print("  EXPERIMENT COMPLETE: Real Benchmark Evidence Captured!")
    print("==================================================")

if __name__ == "__main__":
    main()
