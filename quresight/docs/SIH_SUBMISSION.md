# Smart India Hackathon Submission Document (SIH26139)

> **Project Title:** QureSight — Hybrid Quantum-Classical Machine Learning Platform for Early Disease Detection  
> **Problem Statement ID:** SIH26139  
> **Theme:** Healthcare & Biomedical Technology / Quantum Computing  
> **Team:** Egreen Quanta

---

## 1. Problem Statement Analysis

### Context & Healthcare Challenge
Early disease detection (such as oncology screening, cardiovascular risk stratification, and diabetic pathology) represents the single most effective leverage point in clinical medicine. Identifying malignant cellular changes at Stage 0/I improves 5-year survival rates past $90\%$, while late-stage intervention drops survival below $30\%$ and increases treatment costs tenfold.

Modern clinical diagnostics increasingly generate complex, high-dimensional data (e.g. FNA biopsy cytopathology, whole-exome sequencing, multiplexed imaging). Classical machine learning models (such as SVMs, Random Forests, and Gradient Boosting) achieve strong benchmark results, but frequently struggle with subtle, multi-body feature interactions, non-linear correlation structures, and overfitting on small patient cohorts.

### The Quantum Machine Learning Opportunity & Fallacy
Quantum computing offers a theoretical paradigm shift: mapping classical feature vectors into high-dimensional Hilbert spaces $(\mathbb{C}^2)^{\otimes N}$ using quantum superposition and multi-qubit entanglement. 

However, current literature is saturated with exaggerated claims:
- Models are often evaluated on synthetic toy datasets with unrealistic separability.
- Preprocessing steps suffer from severe data leakage.
- Quantum models are rarely benchmarked against state-of-the-art classical models like tuned XGBoost under identical holdout conditions.
- Quantum circuits remain opaque "black boxes" lacking clinical interpretability.

**The SIH26139 Mandate:** Develop a practical, reproducible, and explainable hybrid quantum-classical machine learning framework that operates within current hardware capabilities while providing measurable clinical diagnostic value.

---

## 2. The QureSight Solution Approach

QureSight solves this problem through an empirical scientific philosophy: **Quantum advantage is measured, not assumed.**

Rather than forcing quantum computing where classical algorithms are demonstrably faster and more accurate, QureSight creates an integrated diagnostic and benchmarking platform that:
1. **Unifies Evaluation:** Runs classical baselines (Logistic Regression, Random Forest, XGBoost) and quantum algorithms (Variational Quantum Classifiers and Quantum Kernel SVMs) side-by-side on identical, stratified patient cohorts.
2. **Guarantees Scientific Rigor:** Implements strict data leakage prevention by isolating all scaling and dimensionality reduction transforms strictly to training partitions.
3. **Pioneers Dual-Paradigm Explainability:** Employs SHAP (TreeExplainer and LinearExplainer) for classical ensembles and introduces **Quantum Perturbation Sensitivity Analysis** to reveal how quantum state phase rotations influence diagnostic outputs.
4. **Intelligent Clinical Routing:** Combines classical and quantum model predictions into an uncertainty-aware triage engine, flagging high-confidence cases for rapid clinical action and routing ambiguous cases for secondary specialist review.

---

## 3. Technical Architecture Summary

```text
+-----------------------------------------------------------------------------------------+
|                                    QURESIGHT STACK                                      |
+-----------------------------------------------------------------------------------------+
|  User Interface: Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts               |
|  API Gateway: FastAPI Asynchronous Server (Python 3.12 / 3.11, Pydantic, CORS)          |
|  Classical Engines: Scikit-Learn 1.4+, XGBoost 2.0+, SHAP 0.44+                         |
|  Quantum Engines: PennyLane 0.38+ (default.qubit simulator, extensible to IBM Quantum)   |
|  Persistence Tier: SQLite3 (results/quresight.db), Joblib pipeline serialization        |
+-----------------------------------------------------------------------------------------+
```

### Key Technical Specifications
- **Dataset:** Breast Cancer Wisconsin Diagnostic benchmark (569 samples, 30 features, binary classification).
- **Partitioning:** Stratified 80% Train (455 samples) / 20% Holdout Test (114 samples), random seed 42.
- **Quantum Circuits:**
  - **VQC:** 4-qubit parameterized quantum circuit, angle embedding, 2 StronglyEntanglingLayers (24 parameters), Adam optimizer, Pauli-Z expectation measurement.
  - **QSVC:** 4-qubit ZZ-entangled feature map generating an $N \times N$ state fidelity Gram matrix evaluated on a precomputed Support Vector Machine.

---

## 4. Key Innovation Points

1. **Measured Quantum Advantage Framework:**  
   QureSight is the first platform to systematically quantify the gap between classical ML and quantum ML across seven standardized clinical metrics (Accuracy, Sensitivity, Specificity, Precision, F1-Score, AUC-ROC, and Inference Latency).
2. **Dual-Paradigm Explainability Engine:**  
   While existing tools attempt to misapply classical permutation SHAP to quantum circuits, QureSight formulates native **Quantum Feature Sensitivity Analysis** using central finite-difference perturbations, bridging quantum Hilbert space rotations back to recognizable clinical biomarkers.
3. **Leakage-Free Hybrid Dimensionality Pipeline:**  
   Resolves the fundamental dimensionality mismatch between 30+ classical biological markers and 4–6 NISQ qubits using frozen orthogonal PCA projection and angle normalization strictly fitted on training splits.
4. **Interactive Quantum Lab:**  
   Enables clinical researchers to simulate qubit scaling (2 to 6 qubits) and evaluate how circuit depth and parameter count impact classification accuracy and convergence time.
5. **Clinical Evidence-Based Routing:**  
   A practical deployment heuristic that uses quantum-classical consensus to quantify diagnostic certainty and automate patient triage recommendations.

---

## 5. Feasibility & Scalability Analysis

| Dimension | Feasibility Assessment | Scaling Strategy |
| :--- | :--- | :--- |
| **Computational Feasibility** | 4-qubit simulation executes in seconds on standard commodity hardware (no GPU or supercomputer required). | Ready for immediate deployment in resource-constrained hospital clinics on laptop or desktop computers. |
| **Near-Term Hardware Transition** | Built entirely on PennyLane's device abstraction layer. | Switching from `default.qubit` to physical QPUs (IBM Quantum, Rigetti, IonQ) requires changing only a single configuration flag and supplying an API token. |
| **Dataset Agnosticism** | Modular preprocessing pipeline accepts arbitrary continuous tabular datasets. | Can seamlessly ingest cardiac telemetry, renal panels, or genomic microarray data with automated feature normalization. |
| **Regulatory Alignment** | Transparent explainability and auditable SQLite logs comply with emerging SaMD (Software as a Medical Device) explainability standards. | Provides complete historical replayability and parameter traceability for audit boards. |

---

## 6. Real-World Societal & Clinical Impact

1. **Democratizing Quantum Research in Healthcare:**  
   Lowers the barrier to entry for medical researchers to explore quantum ML algorithms without requiring a PhD in quantum physics.
2. **Preventing Missed Diagnoses (Sensitivity Focus):**  
   Prioritizes diagnostic Sensitivity (Recall) in model evaluation, ensuring algorithmic development focuses on minimizing false negatives in life-threatening conditions.
3. **Transparent Clinician Adoption:**  
   Providing visual SHAP force plots and quantum sensitivity rankings builds clinician trust, transforming AI from an intimidating black box into an explainable second opinion.

---

## 7. Team Details & Submission Notes

- **Team Name:** Egreen Quanta
- **Hackathon:** Smart India Hackathon 2024
- **Problem Statement ID:** SIH26139
- **Repository:** `https://github.com/egreen-quanta/quresight`
- **Submission Date:** October 2026
- **License:** Open Source MIT License
