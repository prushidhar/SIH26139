import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OrdinalEncoder, StandardScaler
import joblib

class PreprocessingPipeline:
    def __init__(self):
        self.preprocessor = None
        self.numeric_features = []
        self.categorical_features = []
        self.feature_names_in = []
        self.feature_names_out = []

    def fit_transform(self, X_train, y_train, X_test, feature_names=None):
        if isinstance(X_train, pd.DataFrame):
            X_train_df = X_train.copy().drop_duplicates()
            cols = [str(c) for c in X_train_df.columns]
            X_train_df.columns = cols
        else:
            if feature_names is not None:
                cols = [str(c) for c in feature_names]
            else:
                cols = [f"feature_{i}" for i in range(X_train.shape[1])]
            X_train_df = pd.DataFrame(X_train, columns=cols).drop_duplicates()
            
        if isinstance(X_test, pd.DataFrame):
            X_test_df = X_test.copy()
            X_test_df.columns = [str(c) for c in X_test_df.columns]
        else:
            X_test_df = pd.DataFrame(X_test, columns=cols)
        
        y_train = pd.Series(y_train).loc[X_train_df.index].values
        
        self.feature_names_in = list(cols)
        self.numeric_features = [str(c) for c in X_train_df.select_dtypes(include=[np.number]).columns]
        self.categorical_features = [str(c) for c in X_train_df.select_dtypes(exclude=[np.number]).columns]
        
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('encoder', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1))
        ])
        
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, self.numeric_features),
                ('cat', categorical_transformer, self.categorical_features)
            ])
            
        X_train_proc = self.preprocessor.fit_transform(X_train_df)
        X_test_proc = self.preprocessor.transform(X_test_df)
        
        self.feature_names_out = self.numeric_features + self.categorical_features
        
        report = {
            "n_rows_train": len(X_train_proc),
            "n_rows_test": len(X_test_proc),
            "n_features_before": len(self.feature_names_in),
            "n_features_after": X_train_proc.shape[1],
            "imputed_cols": self.numeric_features + self.categorical_features,
            "encoded_cols": self.categorical_features,
            "scaled_cols": self.numeric_features
        }
        
        return X_train_proc, X_test_proc, report

    def transform(self, X):
        return self.preprocessor.transform(pd.DataFrame(X, columns=self.feature_names_in))

    def save(self, path):
        joblib.dump({
            'preprocessor': self.preprocessor,
            'numeric_features': self.numeric_features,
            'categorical_features': self.categorical_features,
            'feature_names_in': self.feature_names_in,
            'feature_names_out': self.feature_names_out
        }, path)

    @classmethod
    def load(cls, path):
        data = joblib.load(path)
        instance = cls()
        instance.preprocessor = data['preprocessor']
        instance.numeric_features = data['numeric_features']
        instance.categorical_features = data['categorical_features']
        instance.feature_names_in = data['feature_names_in']
        instance.feature_names_out = data['feature_names_out']
        return instance
