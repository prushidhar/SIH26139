# QureSight Biomedical Data Pipeline Architecture

## 1. Overview
The QureSight Biomedical Data Pipeline transforms raw clinical cytology, cardiovascular, and metabolic biomarker cohorts into standardized, leakage-free numeric feature representations suitable for both classical gradient-boosted models and NISQ-compatible quantum circuits.

---

## 2. Ingestion & Multi-Dataset Registry
Located in [`quresight/ml/datasets/registry.py`](file:///c:/Users/P%20RUSHIDHAR/OneDrive/Desktop/SIH26139/quresight/ml/datasets/registry.py), the platform includes three pre-loaded clinical diagnostic benchmark datasets:

| Dataset Identifier | Clinical Domain | Rows | Features | Target Definition | Positive Class (1) |
|---|---|---|---|---|---|
| `breast_cancer` | Wisconsin FNA Cytopathology | 569 | 30 | Binary Tumor Diagnostic | Malignant Tumor |
| `heart_disease` | Cleveland Cardiology Workup | 303 | 13 | Coronary Artery Disease | Disease Present |
| `diabetes` | NIDDK Metabolic Biomarkers | 768 | 8 | Diabetes Mellitus Onset | Diabetic Onset |

The system also supports arbitrary CSV upload with automatic binary column detection (`target` or rightmost column).

---

## 3. Data Quality & Pre-Flight Validation
Before model training, [`DatasetEngine.profile_dataframe()`](file:///c:/Users/P%20RUSHIDHAR/OneDrive/Desktop/SIH26139/quresight/ml/datasets/registry.py) executes automated statistical checks:
1. **Missing Value Profiling:** Detects NaN / Null cells and reports column-level missing rates.
2. **Duplicate Detection:** Scans for exact duplicate clinical observations.
3. **Zero-Variance Checks:** Identifies uninformative or constant biomarker columns.
4. **Class Imbalance Profiling:** Computes the positive-to-negative ratio ($N_{\text{majority}} / N_{\text{minority}}$) and triggers clinical class-weight compensation when ratio $> 1.5$.
5. **Statistical Distribution:** Computes 5-point summaries (mean, std, min, 25%, 50%, 75%, max) for every numeric biomarker.

---

## 4. Leakage-Free Preprocessing Pipeline
Implemented in [`quresight/ml/preprocessing/pipeline.py`](file:///c:/Users/P%20RUSHIDHAR/OneDrive/Desktop/SIH26139/quresight/ml/preprocessing/pipeline.py):

```
Raw Data → Stratified Split (80/20) → Fit Preprocessor on Train Only → Transform Test
```

- **Stratified Train-Test Split:** Preserves disease prevalence across splits (default `test_size=0.20`, `random_state=42`).
- **Strict Leakage Prevention:** Scalers and encoders are fit strictly on training partitions; test partitions are transformed using training statistics without updating state.
- **Missing Value Imputation:** Median imputation (`SimpleImputer(strategy='median')`) protects against outliers in clinical measurements.
- **Standardization:** Zero-mean, unit-variance standardization (`StandardScaler`) ensures numerical stability for logistic regression, SVM, and gradient descent.

---

## 5. Quantum Feature Selection & Angle Scaling
Quantum circuits on NISQ architectures have limited qubit budgets ($2$ to $8$ qubits) and shallow coherent circuit depths. The feature selection pipeline [`FeatureSelector`](file:///c:/Users/P%20RUSHIDHAR/OneDrive/Desktop/SIH26139/quresight/ml/feature_selection/selector.py) bridges the dimensionality gap:

1. **Dimensionality Reduction via PCA:**
   - Projects standardized features into $N$ orthogonal principal components ($N \in \{2, 4, 6, 8\}$).
   - Computes cumulative explained variance ratio to monitor clinical information retention.
2. **Angle Embedding Normalization:**
   - Features destined for rotational quantum gates ($R_X$, $R_Z$) must satisfy the periodic boundary $[-\pi, \pi]$.
   - `MinMaxScaler(feature_range=(-np.pi, np.pi))` ensures full coverage of the Bloch sphere without angle clipping.
3. **Random Forest Importance Filtering:**
   - For classical explainability and tabular selection, Gini-importance ranks the most discriminative biomarkers.
