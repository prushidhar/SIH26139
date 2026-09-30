import numpy as np

class QuantumSensitivity:
    def analyze(self, model, X_sample, feature_names, delta=0.1):
        sensitivities = []
        base_probs = model.predict_proba(X_sample)[:, 1]
        
        for i, fn in enumerate(feature_names):
            X_pert = X_sample.copy()
            X_pert[:, i] += delta
            pert_probs = model.predict_proba(X_pert)[:, 1]
            
            delta_prob = np.mean(np.abs(pert_probs - base_probs))
            sens = delta_prob / delta
            sensitivities.append({
                "feature": fn,
                "sensitivity": float(sens)
            })
            
        max_sens = max(s["sensitivity"] for s in sensitivities) if sensitivities else 1.0
        if max_sens == 0: max_sens = 1.0
        
        for s in sensitivities:
            s["sensitivity"] /= max_sens
            
        sensitivities.sort(key=lambda x: x["sensitivity"], reverse=True)
        for rank, s in enumerate(sensitivities):
            s["rank"] = rank + 1
            
        return {
            "sensitivities": sensitivities,
            "method": "perturbation_analysis",
            "description": "Quantum Feature Sensitivity (Perturbation-Based) — not SHAP"
        }
