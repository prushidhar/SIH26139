import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.decomposition import PCA
from sklearn.preprocessing import MinMaxScaler
import joblib

class FeatureSelector:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.rf = None
        self.selected_indices = []
        self.feature_names = []
        self.importances = {}
        self.minmax = MinMaxScaler(feature_range=(-np.pi, np.pi))
        
    def fit(self, X_train, y_train, n_features=10, feature_names=None):
        self.rf = RandomForestClassifier(n_estimators=100, random_state=self.random_state)
        self.rf.fit(X_train, y_train)
        
        if feature_names is None:
            self.feature_names = [f"feature_{i}" for i in range(X_train.shape[1])]
        else:
            self.feature_names = feature_names
            
        importances = self.rf.feature_importances_
        indices = np.argsort(importances)[::-1]
        
        self.selected_indices = indices[:n_features]
        
        selected_feature_names = [self.feature_names[i] for i in self.selected_indices]
        self.importances = {self.feature_names[i]: float(importances[i]) for i in self.selected_indices}
        
        X_selected = X_train[:, self.selected_indices]
        self.minmax.fit(X_selected)
        
        return selected_feature_names

    def transform(self, X):
        X_selected = X[:, self.selected_indices]
        return self.minmax.transform(X_selected)

    def get_importances(self):
        return self.importances

    def reduce_to_n_components(self, X, n=4):
        pca = PCA(n_components=n, random_state=self.random_state)
        X_pca = pca.fit_transform(X)
        self.minmax = MinMaxScaler(feature_range=(-np.pi, np.pi))
        X_pca = self.minmax.fit_transform(X_pca)
        return X_pca, pca

    def save(self, path):
        joblib.dump({
            'rf': self.rf,
            'selected_indices': self.selected_indices,
            'feature_names': self.feature_names,
            'importances': self.importances,
            'minmax': self.minmax
        }, path)

    @classmethod
    def load(cls, path):
        data = joblib.load(path)
        instance = cls()
        instance.rf = data['rf']
        instance.selected_indices = data['selected_indices']
        instance.feature_names = data['feature_names']
        instance.importances = data['importances']
        instance.minmax = data['minmax']
        return instance
