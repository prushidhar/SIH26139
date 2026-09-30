# QureSight: Evaluator & Judge Q&A Preparation Guide

> **Rigorous, Honest, and Defensible Answers for SIH26139 Technical Evaluation.**  
> *Smart India Hackathon 2024 / Team: Egreen Quanta*

---

### Q1: Why use quantum computing for this problem? Aren't classical models already sufficient?
**Answer:**  
We agree that classical models are extraordinarily effective on standard tabular medical datasets. Our goal is **not** to claim that quantum algorithms currently beat classical algorithms on this dataset. 

Instead, our goal is **empirical benchmarking**: quantum machine learning offers theoretical promise in representing non-linear, correlated feature interactions through Hilbert space mapping. However, today's literature is crowded with unverified claims of "quantum supremacy" in healthcare. QureSight is built to rigorously test these claims under controlled conditions: our core thesis is that **quantum advantage is measured, not assumed**. We use quantum methods to discover where they provide genuine utility and where classical methods remain optimal.

---

### Q2: Why did you choose a hybrid quantum-classical architecture instead of pure quantum?
**Answer:**  
In the current Noisy Intermediate-Scale Quantum (NISQ) era, quantum processors cannot handle raw biomedical preprocessing, normalization, or massive feature dimensions end-to-end. 

A hybrid architecture divides labor according to computational strengths:
- **Classical layer:** Handles high-throughput data ingestion, validation, stratified splitting, feature scaling, and dimensionality reduction.
- **Quantum layer:** Evaluates non-linear state embeddings and parameterized unitary rotations in Hilbert space.
- **Classical optimizer / classifier:** Updates circuit weights or solves the dual Support Vector Machine quadratic program based on quantum expectation values or kernel Gram matrices.

This hybrid approach represents the only practical pathway for near-term biomedical quantum computing.

---

### Q3: Why not just use XGBoost? Doesn't XGBoost achieve higher accuracy in much less time?
**Answer:**  
That is a completely fair and accurate observation—and QureSight is one of the few platforms that openly demonstrates it! 

In our benchmark table, classical XGBoost achieves near $97\%$ accuracy with sub-millisecond inference, outperforming 4-qubit quantum models in both accuracy and speed. We intentionally include tuned XGBoost as a gold standard baseline. 

The purpose of QureSight is to prevent "strawman benchmarking" (comparing quantum models against deliberately weak classical baselines). If XGBoost wins, our platform transparently reports it, logs it, and routes clinical inference to XGBoost.

---

### Q4: Why are your quantum circuits limited to only 4 to 6 qubits?
**Answer:**  
This constraint is driven by two fundamental computational realities:
1. **Classical Simulation Complexity:** Statevector simulation memory scales as $\mathcal{O}(2^N)$. Simulating 4 qubits requires only 16 complex amplitudes; simulating all 30 features would require $2^{30} \times 16 \text{ bytes} \approx 17.17 \text{ GB}$ of RAM per forward pass, making iterative training computationally prohibitive.
2. **Barren Plateaus & Trainability:** Theoretical quantum research (McClean et al., Cerezo et al.) proves that as qubit count and circuit depth grow, gradients vanish exponentially ($\mathcal{O}(1/2^N)$), rendering gradient descent ineffective without specialized ansatz design. 

A 4-to-6 qubit regime represents the sweet spot for stable training and meaningful feature interaction modeling on current simulators.

---

### Q5: Why are you using a classical simulator (`default.qubit`) instead of real quantum hardware?
**Answer:**  
We chose PennyLane's `default.qubit` statevector simulator for three practical reasons:
1. **Algorithmic Determinism & Reproducibility:** Simulators calculate exact wavefunctions without queue delays, hardware drift, or network latency, allowing apples-to-apples algorithmic verification.
2. **Cost & Accessibility:** Accessing physical QPUs via cloud providers involves long queue times and high per-circuit execution costs that are impractical for high-epoch gradient training.
3. **Hardware Portability:** PennyLane's device abstraction layer allows us to switch from `default.qubit` to an IBM Quantum backend (`qiskit.ibmq`) or Amazon Braket by simply changing the device initialization line and providing an API token. The circuit architecture itself remains $100\%$ identical.

---

### Q6: How does QML handle high-dimensional biomedical data (e.g. 30 features into 4 qubits)?
**Answer:**  
We use a **leakage-free dimensionality reduction pipeline**:
1. Continuous features are standardized using parameters fitted exclusively on the 80% training set.
2. Principal Component Analysis (PCA) is fitted on the training features to extract the top 4 orthogonal principal components, capturing $>80\%$ of total dataset variance.
3. The components are scaled to $[0, \pi]$ using training extrema and encoded as rotational angles $R_x(\theta_j)$ on the 4 qubits.

This preserves the dominant global variance while allowing the quantum circuit to operate within its coherent qubit capacity.

---

### Q7: How do you guarantee there is no data leakage in your pipeline?
**Answer:**  
Data leakage is one of the most common flaws in published QML literature. We mitigate it through four strict controls:
1. **Split-First Architecture:** The dataset is partitioned into an 80% train and 20% holdout test set using stratified sampling *before* any feature statistics are calculated.
2. **Frozen Transformers:** `StandardScaler` and `PCA` are fitted exclusively on the training split. Out-of-sample test samples are transformed using the frozen training parameters.
3. **Extrema Isolation:** The min/max values used to scale PCA components into $[0, \pi]$ are derived solely from training components; test components are clipped if they exceed bounds.
4. **Isolated Labels:** Target labels $y$ are completely isolated from feature transformations.

---

### Q8: How is model explainability implemented? Can you really run SHAP on a quantum circuit?
**Answer:**  
No—and claiming to run standard Tree or Linear SHAP on a quantum circuit would be mathematically misleading. We implement **dual-paradigm explainability**:
- **Classical Models:** We use exact **SHAP** (`TreeExplainer` for Random Forest/XGBoost and `LinearExplainer` for Logistic Regression), calculating game-theoretic Shapley values across all 30 features.
- **Quantum Models:** We implement **Quantum Perturbation Sensitivity Analysis**. We apply central finite-difference perturbations ($\pm \epsilon$) to each quantum register and measure the instantaneous shift in the Pauli-Z expectation value:
  $$S_k(\mathbf{x}) = \frac{|\langle \sigma_z \rangle(\mathbf{x} + \epsilon \mathbf{e}_k) - \langle \sigma_z \rangle(\mathbf{x} - \epsilon \mathbf{e}_k)|}{2\epsilon}$$
We then multiply this sensitivity vector by the PCA loading matrix to map quantum sensitivities back to recognizable clinical biomarkers.

---

### Q9: How do you ensure the comparison between classical and quantum models is fair?
**Answer:**  
Comparisons are structured strictly "apples-to-apples":
1. **Identical Partitions:** All models are evaluated on the exact same 114 holdout patient cases (Random Seed 42).
2. **Standardized Metrics:** We evaluate all models across the exact same seven clinical metrics: Accuracy, Sensitivity (Recall), Specificity, Precision, F1-Score, AUC-ROC, and per-sample Inference Latency.
3. **Fixed Hardware Environment:** All benchmarks execute within the same hardware runtime to record honest execution latency differences.

---

### Q10: What happens if your quantum model performs worse than the classical models?
**Answer:**  
**We report it honestly.** 

In scientific research, discovering where a technology does *not* provide an advantage is just as valuable as discovering where it does. In our benchmark, classical models achieve superior accuracy ($96.5\% - 97.4\%$) compared to 4-qubit quantum models ($93\% - 94\%$), and run over $50 \times$ faster. 

Our platform does not hide this: our automated **Evidence Routing Engine** explicitly recommends classical XGBoost for high-confidence clinical triage based on measured performance.

---

### Q11: Can QureSight scale to other diseases and custom datasets?
**Answer:**  
Yes. While the Wisconsin Breast Cancer dataset serves as our default reproducible benchmark, QureSight features:
1. A modular `Dataset` API accepting arbitrary tabular CSV uploads.
2. Dynamic feature schema inference and profiling.
3. Automated PCA re-projection to adjust to configurable qubit counts ($N \in [2, 8]$).
4. Direct applicability to other binary diagnostic tasks such as cardiovascular risk, diabetes onset, or chronic kidney disease panels.

---

### Q12: Can this platform run on real quantum hardware like IBM Quantum?
**Answer:**  
Yes. PennyLane provides seamless backend plugins for IBM Quantum via `pennylane-qiskit`. 

To execute on a real superconducting QPU:
1. Provide an IBM Quantum API token.
2. Change the device declaration:
   ```python
   # From simulator:
   dev = qml.device("default.qubit", wires=4)
   # To physical hardware:
   dev = qml.device("qiskit.ibmq", wires=4, backend="ibm_brisbane")
   ```
The circuit definitions, angle embeddings, and measurement observables require zero modifications.

---

### Q13: How does QureSight handle patient data privacy and HIPAA/GDPR concerns?
**Answer:**  
1. **Public Benchmarks:** The platform currently operates exclusively on publicly available, de-identified research datasets (`sklearn.datasets.load_breast_cancer`).
2. **Zero PII Storage:** No Protected Health Information (PHI) or Personally Identifiable Information (PII) is stored in the database.
3. **Local Execution:** QureSight can run entirely on-premise in a local hospital environment without sending patient feature vectors to external third-party cloud servers.

---

### Q14: What are the primary scientific limitations of your project?
**Answer:**  
We openly acknowledge four main limitations:
1. **Statevector Simulation:** We use ideal mathematical simulation without physical device noise channels (decoherence and readout error).
2. **Dimensionality Reduction:** Compressing 30 features to 4 principal components causes minor information loss.
3. **Tabular Focus:** The platform currently evaluates tabular cytopathological metrics, not raw medical images or multi-modal genomic sequences.
4. **Research Prototype:** QureSight has not undergone clinical trials or regulatory approval (FDA/CDSCO) and is strictly a scientific benchmarking platform.

---

### Q15: What is the core novelty of QureSight compared to other hackathon submissions?
**Answer:**  
The core novelty lies in our **scientific integrity, dual explainability, and intelligent routing**:
1. **Measured Advantage Framework:** We do not claim unverified quantum supremacy; we instrument, measure, and audit classical vs. quantum models under strict non-leaking conditions.
2. **Native Quantum Explainability:** We developed Quantum Perturbation Sensitivity Analysis rather than forcing ill-suited classical SHAP onto quantum circuits.
3. **Evidence-Based Clinical Routing:** We combine classical and quantum predictions into a functional clinical decision triage system that quantifies diagnostic consensus and uncertainty.
