from fastapi import APIRouter
from quresight.ml.preprocessing.pipeline import PreprocessingPipeline
from quresight.ml.feature_selection.selector import FeatureSelector
from sklearn.model_selection import train_test_split
from quresight.backend.api.routes import dataset as dataset_module

router = APIRouter(prefix="/api")

processed_state = {}

@router.post("/preprocess")
def preprocess(req: dict = None):
    if req is None:
        req = {}
    if dataset_module.cached_dataset is None:
        dataset_module.get_default_dataset()
        
    df = dataset_module.cached_dataset
    X = df.drop('target', axis=1).values
    y = df['target'].values
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=req.get('test_size', 0.2), random_state=req.get('random_state', 42)
    )
    
    pipe = PreprocessingPipeline()
    X_train_p, X_test_p, rep = pipe.fit_transform(X_train, y_train, X_test)
    
    fs = FeatureSelector()
    sel_features = fs.fit(X_train_p, y_train, n_features=req.get('n_features', 10), feature_names=pipe.feature_names_out)
    
    from sklearn.decomposition import PCA
    pca = PCA(n_components=5, random_state=42)
    pca.fit(X_train_p)
    pca_var = [float(v) for v in pca.explained_variance_ratio_]

    processed_state.update({
        "X_train": X_train_p,
        "X_test": X_test_p,
        "y_train": y_train,
        "y_test": y_test,
        "feature_names": sel_features,
        "preprocessor": pipe,
        "selector": fs
    })
    
    return {
        "preprocessing_report": rep,
        "feature_selection_report": {"selected_features": sel_features},
        "original_features_count": int(X.shape[1]),
        "selected_features_count": len(sel_features),
        "train_size": len(X_train_p),
        "test_size": len(X_test_p),
        "selected_features": sel_features,
        "pca_variance_ratio": pca_var,
        "pca_variance_explained": pca_var
    }
