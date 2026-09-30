import shap
import numpy as np

class SHAPExplainer:
    def explain_model(self, model, X_train, X_test, feature_names):
        try:
            explainer = shap.TreeExplainer(model)
        except:
            explainer = shap.LinearExplainer(model, X_train)
            
        shap_values = explainer.shap_values(X_test)
        if isinstance(shap_values, list):
            shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]
        shap_values = np.array(shap_values)
        if shap_values.ndim == 3 and shap_values.shape[-1] == 2:
            shap_values = shap_values[:, :, 1]
            
        global_importances = np.abs(shap_values).mean(axis=0)
        
        global_importance_list = []
        for i, fn in enumerate(feature_names[:len(global_importances)]):
            val = float(global_importances[i])
            mean_shap = float(shap_values[:, i].mean())
            direction = "increases_risk" if mean_shap > 0 else "decreases_risk"
            global_importance_list.append({
                "feature": fn,
                "importance": val,
                "direction": direction
            })
            
        global_importance_list.sort(key=lambda x: x["importance"], reverse=True)
        
        return {
            "global_importance": global_importance_list,
            "shap_values_sample": shap_values[:50].tolist(),
            "feature_names": feature_names
        }

    def explain_prediction(self, model, X_train, instance, feature_names):
        try:
            explainer = shap.TreeExplainer(model)
        except:
            explainer = shap.LinearExplainer(model, X_train)
            
        shap_vals = explainer.shap_values(instance)
        if isinstance(shap_vals, list):
            shap_vals = shap_vals[1] if len(shap_vals) > 1 else shap_vals[0]
        shap_vals = np.array(shap_vals)
        if shap_vals.ndim == 3 and shap_vals.shape[-1] == 2:
            shap_vals = shap_vals[:, :, 1]
        elif shap_vals.ndim == 2 and shap_vals.shape[-1] == 2:
            shap_vals = shap_vals[:, 1]
            
        shap_vals = np.squeeze(shap_vals)
        if shap_vals.ndim == 0:
            shap_vals = np.array([float(shap_vals)])
            
        prob = float(model.predict_proba(instance)[0, 1]) if hasattr(model, "predict_proba") else 0.5
        pred = int(model.predict(instance)[0])
        
        contributions = []
        for i, fn in enumerate(feature_names[:len(shap_vals)]):
            val = float(shap_vals[i])
            direction = "increases_risk" if val > 0 else "decreases_risk"
            contributions.append({
                "feature": fn,
                "value": float(instance[0, i]) if i < instance.shape[1] else 0.0,
                "shap_value": val,
                "direction": direction
            })
            
        contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        
        return {
            "probability": float(prob),
            "prediction": int(pred),
            "contributions": contributions
        }
