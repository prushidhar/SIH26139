# QureSight Benchmarking & Evidence-Based Routing

## 1. Core Guiding Principle
**"Quantum advantage must be measured, not assumed."**

QureSight enforces an empirical benchmarking standard. Quantum models are evaluated on the exact same cross-validation partitions as classical baselines. The system is structurally engineered to declare classical superiority when quantum methods do not exhibit statistically measurable benefit.

---

## 2. Evaluation Metric Suite
Implemented in [`quresight/ml/evaluation/metrics.py`](file:///c:/Users/P%20RUSHIDHAR/OneDrive/Desktop/SIH26139/quresight/ml/evaluation/metrics.py):

1. **ROC-AUC (Area Under ROC Curve):** Primary metric for diagnostic discrimination across all risk thresholds.
2. **Clinical Sensitivity (Recall / True Positive Rate):**
   $$\text{Sensitivity} = \frac{TP}{TP + FN}$$
   Critical in oncological diagnostics to avoid false negatives.
3. **Clinical Specificity (True Negative Rate):**
   $$\text{Specificity} = \frac{TN}{TN + FP}$$
   Prevents unnecessary invasive follow-up biopsies.
4. **F1-Score:** Harmonic balance of precision and recall.
5. **Runtime Latency:** Tracks training wall-clock time and single-sample inference latency.

---

## 3. Evidence-Based Routing Engine
Implemented in [`quresight/ml/routing/router.py`](file:///c:/Users/P%20RUSHIDHAR/OneDrive/Desktop/SIH26139/quresight/ml/routing/router.py):

The `ModelRouter` compares all trained models using a deterministic, multi-criteria scoring function:
$$\text{Score} = 0.40 \cdot \text{AUC} + 0.30 \cdot \text{Sensitivity} + 0.20 \cdot \text{F1} + 0.10 \cdot \text{Accuracy}$$

### Decision Criteria & Quantum Advantage Flagging:
1. **Classical Superiority:** If the top-scoring classical model exceeds quantum models, the classical model is selected and the routing rationale states:
   *"Classical model outperforms quantum alternatives on discrimination, sensitivity, and calibration."*
2. **Quantum Superiority (Empirical Threshold):** Quantum models are flagged for production routing ONLY if:
   $$\text{Score}_{\text{quantum}} - \text{Score}_{\text{classical}} \ge \delta_{\text{threshold}} \quad (\delta = 0.02)$$
3. **Resource-Cost Tradeoff:** When quantum accuracy is comparable within $\pm 0.02$, the router favors classical models due to the exponential compute overhead of NISQ quantum statevector simulation.

---

## 4. Empirical Benchmark Table (Actual Run on Test Set $N=114$)

| Rank | Model Name | Family | Accuracy | ROC-AUC | Sensitivity | Specificity | F1-Score | Runtime |
|---|---|---|---|---|---|---|---|---|
| **1 (Selected)** | **Logistic Regression** | Classical | **98.25%** | **0.9954** | **98.61%** | **97.62%** | **98.61%** | 0.003s |
| 2 | Classical SVM (RBF) | Classical | 97.37% | 0.9944 | 98.61% | 95.24% | 97.93% | 0.006s |
| 3 | Random Forest | Classical | 95.61% | 0.9939 | 97.22% | 92.86% | 96.55% | 0.125s |
| 4 | XGBoost | Classical | 95.61% | 0.9927 | 98.61% | 90.48% | 96.60% | 0.084s |
| 5 | Quantum Kernel SVM (4Q) | Quantum | 83.33% | 0.9332 | 86.11% | 78.57% | 86.71% | 1.012s |
| 6 | VQC (2Q, Depth 2) | Quantum | 82.46% | 0.9071 | 86.11% | 76.19% | 86.67% | 3.421s |
| 7 | VQC (4Q, Depth 2) | Quantum | 78.07% | 0.8442 | 84.72% | 66.67% | 83.22% | 6.815s |
