import time
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from ..evaluation.metrics import compute_metrics

class ClassicalTrainer:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.models = {
            "logistic_regression": LogisticRegression(random_state=random_state, max_iter=1000),
            "random_forest": RandomForestClassifier(random_state=random_state, n_estimators=100),
            "xgboost": XGBClassifier(random_state=random_state, eval_metric='logloss'),
            "svm": SVC(probability=True, random_state=random_state, C=1.0)
        }

    def train(self, X_train, y_train, X_test, y_test, model_name: str):
        model = self.models[model_name]
        
        start_train = time.time()
        model.fit(X_train, y_train)
        train_time = time.time() - start_train
        
        start_inf = time.time()
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred
        inf_time = time.time() - start_inf
        
        metrics = compute_metrics(
            y_test, y_pred, y_prob, 
            model_name=model_name, 
            model_family="classical",
            training_time=train_time, 
            inference_time=inf_time
        )
        return metrics, model

    def train_all(self, X_train, y_train, X_test, y_test):
        results = []
        for name in self.models.keys():
            metrics, _ = self.train(X_train, y_train, X_test, y_test, name)
            results.append(metrics)
        return results

    def save_model(self, model, path):
        joblib.dump(model, path)

    @classmethod
    def load_model(cls, path):
        return joblib.load(path)
