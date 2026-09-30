# QureSight Explainability Engine

> **Transparent Interpretability for Classical Ensembles and Quantum Circuits.**  
> *Smart India Hackathon 2024 / SIH26139*

---

## 1. Why Explainability in Biomedical AI?

In clinical diagnostics, black-box predictions are unacceptable. Regulatory frameworks, medical practitioners, and patients require transparent explanations that highlight which physiological markers influenced a diagnosis and the direction of that influence.

Explainability becomes even more crucial when comparing classical algorithms with quantum computing. Quantum models are frequently perceived as opaque mathematical objects. QureSight provides dual-paradigm explainability:
1. **Classical Explainability:** Exact Shapley values via **SHAP** (SHapley Additive exPlanations).
2. **Quantum Explainability:** Empirical **Quantum Perturbation Sensitivity Analysis** (gradient and finite-difference evaluation).

> **Crucial Methodological Distinction:** Standard SHAP algorithms (such as TreeExplainer or KernelExplainer) make assumptions about feature independence or require thousands of conditional background evaluations that are computationally prohibitive on quantum circuits. QureSight uses **Quantum Feature Sensitivity**, avoiding misleading mathematical claims.

---

## 2. Classical Model Interpretability: SHAP

SHAP leverages cooperative game theory to compute the marginal contribution of each diagnostic feature to the model's output:
$$f(\mathbf{x}) = \phi_0 + \sum_{j=1}^M \phi_j(\mathbf{x})$$
where $\phi_0 = \mathbb{E}[f(\mathbf{x})]$ is the base value (expected dataset prevalence) and $\phi_j$ represents the attribution of feature $j$.

```text
Patient Feature Vector (30 Features)
           │
     ┌─────┴────────────────────────────┐
     ▼                                  ▼
[Tree Models: RF & XGBoost]    [Linear Model: Logistic Regression]
     │                                  │
     ▼                                  ▼
[SHAP TreeExplainer]           [SHAP LinearExplainer]
- Fast exact Shapley values    - Direct weight-covariance product
- O(TLD^2) algorithmic speed   - phi_j = w_j * (x_j - E[x_j])
     │                                  │
     └──────────────┬───────────────────┘
                    ▼
         [Unified Attribution Object]
         - Feature importance ranking (Mean |SHAP|)
         - Directional force (+ pushes malignant, - pushes benign)
```

### 2.1 TreeExplainer for Random Forest and XGBoost
For tree ensemble models, QureSight utilizes Lundberg's `TreeExplainer`, computing exact Shapley values in polynomial time $\mathcal{O}(T L D^2)$ (where $T$ is the number of trees, $L$ is the number of leaves, and $D$ is maximum tree depth).
- **Global Explanations:** Aggregated mean absolute Shapley values across the test cohort:
  $$I_j = \frac{1}{N_{test}} \sum_{i=1}^{N_{test}} |\phi_j(\mathbf{x}_i)|$$
  Consistently ranks features like `worst concave points`, `worst perimeter`, and `mean concavity` as primary drivers of malignant classifications.
- **Local Explanations:** For an individual patient, provides positive and negative force vectors showing how specific biomarker elevations shifted the probability above or below the baseline.

### 2.2 LinearExplainer for Logistic Regression
For regularized Logistic Regression, QureSight computes attribution using `LinearExplainer`, which directly factors the learned weight vector $\mathbf{w}$ and feature covariance $\mathbf{\Sigma}$:
$$\phi_j(\mathbf{x}) = w_j \cdot (x_j - \mathbb{E}[x_j])$$
This guarantees mathematical fidelity to the linear log-odds formulation.

---

## 3. Quantum Model Interpretability: Feature Sensitivity Analysis

Quantum circuits do not evaluate classical conditional expectations, rendering standard SHAP algorithms theoretically inappropriate or computationally unwieldy. Instead, QureSight implements **Quantum Perturbation Sensitivity Analysis**.

```text
Encoded Quantum State |ψ(x)⟩
           │
           ▼
[Perturbation Engine]
For each feature k in {0, ..., N-1}:
  - Positive perturbation: x^(+k) = x + ε * e_k
  - Negative perturbation: x^(-k) = x - ε * e_k
           │
           ▼
[Quantum Circuit Evaluation]
  - Evaluate expectation: ⟨σ_z⟩(x^(+k))
  - Evaluate expectation: ⟨σ_z⟩(x^(-k))
           │
           ▼
[Finite Difference Gradient]
  S_k(x) = | ⟨σ_z⟩(x^(+k)) - ⟨σ_z⟩(x^(-k)) | / (2ε)
           │
           ▼
[Sensitivity Attribution]
Normalized Quantum Feature Importance: S_k / Σ_j S_j
Direction of influence: sign( ⟨σ_z⟩(x^(+k)) - ⟨σ_z⟩(x^(-k)) )
```

### 3.1 Mathematical Formulation
Let $\hat{f}_Q(\mathbf{x}) = \langle \psi(\mathbf{x}) | U^\dagger(\mathbf{\theta}) \hat{\sigma}_z^{(0)} U(\mathbf{\theta}) | \psi(\mathbf{x}) \rangle$ denote the quantum expectation value for feature vector $\mathbf{x} \in \mathbb{R}^N$.

To measure how sensitively the quantum state's classification boundary responds to changes in feature $k$, we evaluate a central finite-difference perturbation with step size $\epsilon = 0.05$:
$$\Delta_k(\mathbf{x}) = \frac{\hat{f}_Q(\mathbf{x} + \epsilon \mathbf{e}_k) - \hat{f}_Q(\mathbf{x} - \epsilon \mathbf{e}_k)}{2\epsilon}$$
where $\mathbf{e}_k$ is the unit basis vector along dimension $k$.

### 3.2 Sensitivity Magnitude & Direction
- **Local Feature Sensitivity ($S_k(\mathbf{x})$):**
  $$S_k(\mathbf{x}) = |\Delta_k(\mathbf{x})|$$
  Measures the instantaneous gradient magnitude of the quantum circuit output with respect to feature $k$. A large $S_k$ indicates that small biological perturbations in this feature induce large phase shifts and quantum state rotations, strongly altering the predicted outcome.
- **Directional Influence:**
  $$\text{dir}_k(\mathbf{x}) = \text{sign}(\Delta_k(\mathbf{x}))$$
  - $\text{dir}_k > 0$: Increasing feature $k$ shifts expectation toward $+1$ (malignancy indicator).
  - $\text{dir}_k < 0$: Increasing feature $k$ shifts expectation toward $-1$ (benign indicator).
- **Global Quantum Sensitivity:**
  Aggregated across all holdout test instances:
  $$\bar{S}_k = \frac{1}{N_{test}} \sum_{i=1}^{N_{test}} |\Delta_k(\mathbf{x}_i)|$$

---

## 4. Global vs. Local Explanations Comparison

| Level | Classical (SHAP) | Quantum (Perturbation Sensitivity) |
| :--- | :--- | :--- |
| **Global Summary** | Ranks all 30 features by mean absolute Shapley value across the cohort. Identifies global disease risk drivers. | Ranks the $N$ principal components by average gradient responsiveness $\bar{S}_k$. Identifies which quantum state dimensions govern circuit decisions. |
| **Local Patient Case** | Force plot detailing exact additive point shifts for an individual's 30 biomarkers. | Bar chart displaying localized sensitivity $S_k(\mathbf{x})$ and directional arrows for each component of the patient's state. |
| **Computational Basis** | Game-theoretic marginal contributions over feature subsets. | Unitary phase and expectation shifts under orthogonal vector perturbations. |
| **Feature Space** | Original clinical space (e.g. `mean radius`, `worst concavity`). | Orthogonal latent eigenspace (PCA Components 0 through 3 mapped to $[0, \pi]$). |

---

## 5. Reverse Mapping: Interpreting Quantum Components in Clinical Terms

Because quantum models ingest PCA-transformed features ($PC_0, \dots, PC_{N-1}$), raw quantum sensitivities are initially expressed in latent component space. QureSight provides a **reverse projection matrix** to translate quantum sensitivities back into clinical biomarker language:

$$\mathbf{I}_{\text{clinical}} = \bar{\mathbf{S}}_{\text{quantum}} \cdot |\mathbf{W}_{\text{PCA}}|$$

where $|\mathbf{W}_{\text{PCA}}|$ is the $N \times 30$ matrix of absolute PCA component loadings. This ensures medical practitioners can directly see how quantum sensitivity maps to recognizable clinical features such as tumor size, boundary irregularities, and texture variations.
