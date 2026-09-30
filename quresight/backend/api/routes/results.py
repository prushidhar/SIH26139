from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from quresight.backend.db.database import Database
import json
import datetime
import uuid

router = APIRouter(prefix="/api")
db = Database()

@router.get("/results")
@router.get("/experiments")
def get_results():
    experiments = db.get_experiments()
    formatted = []
    for exp in experiments:
        cfg = json.loads(exp['config']) if isinstance(exp.get('config'), str) else exp.get('config', {})
        m = json.loads(exp['metrics']) if isinstance(exp.get('metrics'), str) else exp.get('metrics', {})
        
        models_list = []
        if exp['experiment_type'] == 'benchmark':
            classical = m.get('classical', [])
            quantum = m.get('quantum', [])
            for c in classical:
                models_list.append({
                    "model": c.get("model_name"),
                    "family": "classical",
                    "metrics": {
                        "auc": c.get("roc_auc", 0),
                        "accuracy": c.get("accuracy", 0),
                        "precision": c.get("precision", 0),
                        "recall": c.get("recall", 0),
                        "f1": c.get("f1", 0),
                        "sensitivity": c.get("sensitivity", 0),
                        "specificity": c.get("specificity", 0)
                    }
                })
            for q in quantum:
                models_list.append({
                    "model": q.get("model_name", "vqc"),
                    "family": "quantum",
                    "metrics": {
                        "auc": q.get("roc_auc", 0),
                        "accuracy": q.get("accuracy", 0),
                        "precision": q.get("precision", 0),
                        "recall": q.get("recall", 0),
                        "f1": q.get("f1", 0),
                        "sensitivity": q.get("sensitivity", 0),
                        "specificity": q.get("specificity", 0)
                    }
                })
        
        formatted.append({
            **exp,
            "type": exp['experiment_type'],
            "config": cfg,
            "metrics": m,
            "data": {
                "models": models_list,
                "selected_model": m.get("selected_model", {})
            }
        })
    return formatted

@router.get("/results/{id}")
@router.get("/experiments/{id}")
def get_result(id: str):
    res = db.get_experiment(id)
    if res:
        if isinstance(res.get('config'), str): res['config'] = json.loads(res['config'])
        if isinstance(res.get('metrics'), str): res['metrics'] = json.loads(res['metrics'])
    return res

@router.get("/predictions")
def get_predictions():
    preds = db.get_predictions()
    for p in preds:
        if isinstance(p.get('features'), str): p['features'] = json.loads(p['features'])
        if isinstance(p.get('contributions'), str): p['contributions'] = json.loads(p['contributions'])
    return preds

@router.get("/jobs/{job_id}")
def get_job_status(job_id: str):
    job = db.get_job(job_id)
    if not job:
        return {"error": f"Job '{job_id}' not found"}
    return job

@router.post("/reports")
@router.post("/report")
def create_report(req: dict = None):
    experiments = get_results()
    predictions = get_predictions()
    
    report_id = str(uuid.uuid4())
    now_str = datetime.datetime.utcnow().isoformat()
    
    report_data = {
        "id": report_id,
        "title": "QureSight Biomedical Intelligence Report",
        "generated_at": now_str,
        "platform": {
            "name": "QureSight",
            "tagline": "Quantum Intelligence. Explainable Health Insights.",
            "version": "1.0.0",
            "frameworks": ["FastAPI", "Next.js", "PennyLane", "scikit-learn", "XGBoost", "SHAP"],
            "quantum_simulator": "PennyLane default.qubit (Statevector Simulator)"
        },
        "executive_summary": "Empirical comparison of classical ML baselines against Variational Quantum Classifiers (VQC) and Quantum Kernel SVM. Quantum advantage is measured rather than assumed.",
        "benchmark_runs": experiments[:10],
        "total_experiments_recorded": len(experiments),
        "recent_predictions_count": len(predictions),
        "recent_predictions_sample": predictions[:5],
        "evidence_based_selection_rule": "Deterministic evaluation: selects highest ROC-AUC with sensitivity preference; flags quantum benefit only when empirical threshold delta > 0.02 is established.",
        "disclaimer": "This prototype provides research/decision-support predictions and is not a substitute for professional medical diagnosis."
    }
    
    db.save_report({
        "id": report_id,
        "title": report_data["title"],
        "created_at": now_str,
        "format": "json",
        "content": json.dumps(report_data)
    })
    
    return report_data

@router.get("/reports")
def list_reports():
    return db.get_reports()

@router.get("/reports/{report_id}")
def get_report(report_id: str):
    r = db.get_report_content(report_id)
    if not r:
        return {"error": "Report not found"}
    try:
        return json.loads(r["content"])
    except:
        return r

@router.get("/reports/{report_id}/html", response_class=HTMLResponse)
def get_report_html(report_id: str):
    r = db.get_report_content(report_id)
    if not r:
        return HTMLResponse("<h1>Report not found</h1>", status_code=404)
        
    try:
        data = json.loads(r["content"])
    except:
        data = {"title": "QureSight Report", "generated_at": r["created_at"]}
        
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{data.get('title')}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0f1e; color: #f9fafb; margin: 0; padding: 40px; }}
        .header {{ border-bottom: 2px solid #1f2937; padding-bottom: 20px; margin-bottom: 30px; }}
        h1 {{ color: #06b6d4; margin: 0 0 10px 0; }}
        .tagline {{ color: #8b5cf6; font-size: 1.1em; }}
        .badge {{ display: inline-block; padding: 4px 8px; border-radius: 4px; background: #1f2937; color: #9ca3af; font-size: 0.85em; margin-top: 10px; }}
        .card {{ background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; margin-bottom: 25px; }}
        h2 {{ color: #ffffff; border-bottom: 1px solid #1f2937; padding-bottom: 8px; margin-top: 0; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9em; }}
        th, td {{ padding: 10px; text-align: left; border-bottom: 1px solid #1f2937; }}
        th {{ background: #1f2937; color: #9ca3af; }}
        .disclaimer {{ background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; padding: 15px; border-radius: 6px; font-size: 0.85em; margin-top: 30px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{data.get('title')}</h1>
        <div class="tagline">Quantum Intelligence. Explainable Health Insights.</div>
        <div class="badge">Generated: {data.get('generated_at')} | Version 1.0.0 | SIH26139</div>
    </div>

    <div class="card">
        <h2>Executive Summary</h2>
        <p>{data.get('executive_summary')}</p>
        <p><strong>Selection Rule:</strong> {data.get('evidence_based_selection_rule')}</p>
    </div>

    <div class="card">
        <h2>Platform Environment</h2>
        <ul>
            <li><strong>Classical Engine:</strong> scikit-learn, XGBoost (Gradient Boosted Trees)</li>
            <li><strong>Quantum Engine:</strong> PennyLane (default.qubit statevector simulator)</li>
            <li><strong>Explainability:</strong> SHAP (TreeExplainer) & Quantum Perturbation Sensitivity</li>
            <li><strong>Total Recorded Benchmarks:</strong> {data.get('total_experiments_recorded', 0)}</li>
            <li><strong>Predictions Audited:</strong> {data.get('recent_predictions_count', 0)}</li>
        </ul>
    </div>

    <div class="disclaimer">
        <strong>⚠️ Medical & Research Disclaimer:</strong><br>
        {data.get('disclaimer')}
    </div>
</body>
</html>"""
    return HTMLResponse(content=html)
