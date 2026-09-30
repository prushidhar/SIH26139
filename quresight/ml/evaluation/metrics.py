from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, roc_curve
import numpy as np

def compute_metrics(y_true, y_pred, y_prob, model_name, model_family, training_time=0.0, inference_time=0.0, extra_fields=None):
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel() if len(cm.ravel()) == 4 else (0,0,0,0)
    
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    
    # Sample down to 100 points
    idx = np.linspace(0, len(fpr) - 1, min(100, len(fpr)), dtype=int)
    
    metrics = {
        "model_name": model_name,
        "model_family": model_family,
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, y_prob)),
        "sensitivity": float(recall_score(y_true, y_pred, zero_division=0)),
        "specificity": float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0,
        "training_time": float(training_time),
        "inference_time": float(inference_time),
        "confusion_matrix": cm.tolist(),
        "roc_curve_data": {
            "fpr": fpr[idx].tolist(),
            "tpr": tpr[idx].tolist()
        }
    }
    
    if extra_fields:
        metrics.update(extra_fields)
        
    return metrics
