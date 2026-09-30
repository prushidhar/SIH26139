# QureSight Classical & Hybrid ML Pipeline

> **Rigorous Preprocessing, Leakage-Free Design, and Fair Benchmarking.**  
> *Smart India Hackathon 2024 / SIH26139*

---

## 1. Overview and Design Principles

Medical machine learning models often suffer from poor real-world generalizability due to subtle methodological flaws, including data leakage during feature standardization, unstratified train/test splits, and selective metric reporting. 

The QureSight ML Pipeline is designed with three core scientific principles:
1. **Zero Data Leakage:** Preprocessing parameters (means, variances, principal components) are computed strictly from the training cohort. Test instances are transformed solely using these frozen parameters.
2. **Apples-to-Apples Comparison:** Classical models and quantum models are trained and tested on the exact same patient instances using identical evaluation splits.
3. **Multi-Metric Clinical Evaluation:** Rather than relying solely on overall accuracy, models are evaluated across clinical diagnostic criteria: Sensitivity (Recall of malignancy), Specificity (True negative rate of benign lesions), Positive Predictive Value (Precision), F1-Score, and Area Under the ROC Curve (AUC-ROC).

---

## 2. Detailed Preprocessing Pipeline

The primary diagnostic dataset is the **Breast Cancer Wisconsin (Diagnostic)** dataset, consisting of 569 instances with 30 continuous real-valued features derived from Fine Needle Aspirates (FNA).

```text
Raw Dataset (569 Samples x 30 Features)
                  │
                  ▼
       [Stratified 80/20 Split]
                  │
   ┌──────────────┴──────────────┐
   ▼                             ▼
Train Set (455 samples)     Test Holdout (114 samples)
   │                             │
   ▼                             │
[Fit StandardScaler]             │
   │                             │
   ├────────────────────────────>│ [Transform StandardScaler]
   │                             │
   ▼                             │
[Fit PCA to N Components]        │
   │                             │
   ├────────────────────────────>│ [Transform PCA]
   │                             │
   ▼                             ▼
[MinMax Scale to [0, π]]     [MinMax Scale using Train Min/Max]
   │                             │
   ▼                             ▼
Train QML Inputs             Test QML Inputs
```

### Step 1: Stratified Partitioning
The full dataset $\mathcal{D} = \{(\mathbf{x}_i, y_i)\}_{i=1}^{569}$ is partitioned into an $80\%$ training set ($N_{train} = 455$) and a $20\%$ holdout test set ($N_{test} = 114$). Stratification ensures that the $37.26\%$ malignant / $62.74\%$ benign class ratio is precisely mirrored in both sets:
- Training: 170 Malignant, 285 Benign
- Holdout Test: 42 Malignant, 72 Benign

### Step 2: Feature Standardization
Features exhibit vastly different numerical scales (e.g., `mean area` spans hundreds of square millimeters, whereas `mean smoothness` spans $[0.05, 0.16]$).
- A `StandardScaler` is fitted on $X_{train}$:
  $$\mu_j = \frac{1}{N_{train}} \sum_{i=1}^{N_{train}} x_{i,j}, \quad \sigma_j = \sqrt{\frac{1}{N_{train}} \sum_{i=1}^{N_{train}} (x_{i,j} - \mu_j)^2}$$
- $X_{train}$ and $X_{test}$ are scaled according to:
  $$\tilde{x}_{i,j} = \frac{x_{i,j} - \mu_j}{\sigma_j}$$
  *Notice: $\mu_j$ and $\sigma_j$ derived from the training set are applied directly to $X_{test}$ without recomputing.*

### Step 3: Dimensionality Reduction for Quantum Encoding
While classical models receive all 30 standardized features, quantum circuits are constrained by simulation memory ($\mathcal{O}(2^N)$ statevector space) and gate fidelity in near-term quantum architectures.
- Principal Component Analysis (PCA) is fitted strictly on $\tilde{X}_{train}$ to extract the top $N_{qubits}$ principal components (default $N_{qubits} = 4$).
- The 4 principal components account for $>85\%$ of the total variance across the 30 continuous clinical features.
- $X_{test}$ is projected into the learned orthogonal eigenspace:
  $$Z_{test} = \tilde{X}_{test} \mathbf{W}_{train}$$

### Step 4: Angle Rescaling for Quantum State Preparation
Parameterized quantum gates (such as $R_x(\theta)$ rotations) operate periodically over $[0, 2\pi)$. To prevent phase wrapping or saturation:
- The principal components are linearly rescaled to the bounded interval $[0, \pi]$ based strictly on the minimum and maximum component values observed in $Z_{train}$.
- The out-of-sample test components are scaled using the training extrema, ensuring no future data informs the scaling range.

---

## 3. Feature Selection & Analysis

The 30 diagnostic features correspond to 10 morphological attributes measured across three statistical aggregations (Mean, Standard Error, and "Worst" / Largest):

| Category | Clinical Significance | Top Correlated Attributes |
| :--- | :--- | :--- |
| **Size / Geometry** | Correlates strongly with tumor invasive staging | `worst perimeter`, `worst area`, `mean radius` |
| **Shape / Concavity** | Irregular boundary indentations indicate aggressive malignancy | `mean concave points`, `worst concavity` |
| **Texture / Density** | Variation in grayscale pixel values reflects tissue heterogeneity | `worst texture`, `mean smoothness` |

In QureSight's feature selection module:
- Classical models utilize the full 30-dimensional feature space, preserving subtle micro-variations.
- Quantum models utilize the PCA-reduced representation, testing whether quantum entanglement among global principal axes provides distinct classification boundaries compared to classical hyperplanes.

---

## 4. Classical Model Architectures & Training Protocols

QureSight trains three classical baseline architectures:

### 1. Regularized Logistic Regression
- **Purpose:** Linear classification baseline representing clinical standard risk scoring.
- **Formulation:** Minimizes negative log-likelihood with L2 (Ridge) penalty:
  $$\min_{\mathbf{w}, b} \frac{1}{2} \|\mathbf{w}\|_2^2 + C \sum_{i=1}^N \log(1 + e^{-y_i (\mathbf{w}^T \mathbf{x}_i + b)})$$
- **Hyperparameters:** $C = 1.0$, `solver='lbfgs'`, `max_iter=1000`, `random_state=42`.

### 2. Random Forest Classifier
- **Purpose:** Non-linear bagged ensemble robust to outliers and feature collinearity.
- **Formulation:** A collection of 100 decorrelated decision trees using bootstrap aggregation with feature sub-sampling at each split ($\sqrt{M}$).
- **Hyperparameters:** `n_estimators=100`, `max_depth=6`, `min_samples_split=4`, `random_state=42`.

### 3. XGBoost (Extreme Gradient Boosting)
- **Purpose:** State-of-the-art classical gradient boosting on tabular data.
- **Formulation:** Sequentially minimizes regularized objective using second-order Taylor expansion of the loss function:
  $$\mathcal{L}^{(t)} \approx \sum_{i=1}^N \left[ g_i f_t(\mathbf{x}_i) + \frac{1}{2} h_i f_t^2(\mathbf{x}_i) \right] + \Omega(f_t)$$
- **Hyperparameters:** `n_estimators=100`, `max_depth=4`, `learning_rate=0.1`, `subsample=0.8`, `colsample_bytree=0.8`, `random_state=42`.

---

## 5. Evaluation Protocol

All models are evaluated on the exact same 114 holdout test samples. QureSight computes seven standardized evaluation metrics:

1. **Accuracy:**
   $$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$
2. **Sensitivity (Recall / True Positive Rate):**
   *Critical for medical triage to minimize missed malignant diagnoses (False Negatives).*
   $$\text{Sensitivity} = \frac{TP}{TP + FN}$$
3. **Specificity (True Negative Rate):**
   *Minimizes false alarms and unnecessary invasive biopsies.*
   $$\text{Specificity} = \frac{TN}{TN + FP}$$
4. **Precision (Positive Predictive Value):**
   $$\text{Precision} = \frac{TP}{TP + FP}$$
5. **F1-Score:**
   $$\text{F1} = 2 \cdot \frac{\text{Precision} \cdot \text{Sensitivity}}{\text{Precision} + \text{Sensitivity}}$$
6. **AUC-ROC:**
   Area under the Receiver Operating Characteristic curve across all classification thresholds $\tau \in [0, 1]$.
7. **Inference Latency:**
   Average execution time (in milliseconds) required to generate a prediction for a single patient record.

---

## 6. Data Leakage Prevention Checklist

| Leakage Vector | Risk Description | QureSight Mitigation |
| :--- | :--- | :--- |
| **Split Contamination** | Computing dataset mean/std before splitting contaminates the holdout distribution. | Stratified 80/20 train/test split is executed *first*. `StandardScaler` is fitted exclusively on $X_{train}$. |
| **PCA Dimensionality Leakage** | Fitting PCA on all 569 samples learns orthogonal vectors informed by test sample variance. | `PCA` is fitted strictly on $X_{train}$. Test points are projected using the frozen transformation matrix $\mathbf{W}_{train}$. |
| **MinMax Angle Bounds** | Min and Max values used to scale features to $[0, \pi]$ for quantum circuits include test extrema. | Min and Max bounds are extracted solely from $Z_{train}$. Any test outlier is strictly clamped if exceeding $[0, \pi]$. |
| **Label Encoding / Target Leakage** | Target variables leaking into feature matrices or test labels used in tuning. | Preprocessing pipelines operate strictly on feature arrays $X$; target labels $y$ are completely isolated from transformation steps. |

---

## 7. Reproducibility Measures

1. **Global Deterministic Seed:** `seed=42` is enforced across Python's `random`, NumPy (`np.random.seed(42)`), Scikit-Learn (`random_state=42`), and PennyLane (`qml.device("default.qubit", seed=42)`).
2. **Deterministic Optimizer:** Variational Quantum Classifiers employ fixed seed parameter initialization ($\mathcal{N}(0, 0.1)$) and deterministic gradient steps.
3. **Persistent Checkpoints:** Preprocessor transformers and trained model instances are automatically exported to `models/*.joblib` and logged in `results/quresight.db`.
