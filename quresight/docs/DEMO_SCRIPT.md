# QureSight SIH Hackathon Demo Script (3–5 Minutes)

> **Live Demonstration Guide for Evaluators & Jury Members.**  
> *Problem Statement: SIH26139 — Hybrid Quantum ML for Early Disease Detection*  
> *Team: Egreen Quanta*

---

## Demo Timing & Walkthrough Summary

| Time | Step | Action | Key Talking Point |
| :---: | :--- | :--- | :--- |
| **0:00 - 0:25** | **Step 1: Overview** | Open browser at `http://localhost:3000` | "Quantum advantage is measured, not assumed." |
| **0:25 - 0:50** | **Step 2: Pipeline Architecture** | Click **"Architecture"** tab | Non-leaking hybrid architecture, classical baselines vs. QML. |
| **0:50 - 1:15** | **Step 3: Dataset Ingestion** | Navigate to **"Dataset"** view | Wisconsin Diagnostic Dataset: 569 patients, 30 features, FNA biopsies. |
| **1:15 - 1:40** | **Step 4: Profiling & Preprocessing** | Click **"Run Preprocessing"** | Stratified 80/20 split, zero data leakage, PCA to 4 qubits. |
| **1:40 - 2:05** | **Step 5: Classical Baselines** | Click **"Train Classical Models"** | Logistic Regression, Random Forest, XGBoost trained instantaneously. |
| **2:05 - 2:35** | **Step 6: Quantum Models** | Click **"Train Quantum Models"** | PennyLane statevector VQC with angle embedding and 2 entangling layers. |
| **2:35 - 3:10** | **Step 7: Benchmark Comparison** | Switch to **"Benchmark Table"** | Multi-metric comparison (Acc, Sensitivity, Specificity, AUC-ROC, Latency). |
| **3:10 - 3:40** | **Step 8: Quantum Lab** | Navigate to **"Quantum Lab"** | Qubit scaling analysis (2 to 6 qubits) demonstrating the simulation trade-off. |
| **3:40 - 4:10** | **Step 9: Explainability** | Open **"Explainability"** page | SHAP for classical trees vs. Perturbation Sensitivity for quantum circuits. |
| **4:10 - 4:40** | **Step 10: Patient Prediction** | Navigate to **"Diagnosis"** tab | Adjust biomarker sliders for a simulated patient. |
| **4:40 - 5:00** | **Step 11: Intelligent Routing & Close** | View **"Clinical Routing"** card | Automated triage decision. Concluding scientific thesis. |

---

## Step-by-Step Spoken Script & Actions

### Step 1: Open QureSight Overview (0:00 - 0:25)
- **Action:** Open `http://localhost:3000` in fullscreen mode.
- **Presenter:**  
  *"Good morning respected judges. Welcome to **QureSight**. Our platform addresses Problem SIH26139: Hybrid Quantum Machine Learning for Early Disease Detection. While much of the buzz around quantum AI assumes immediate supremacy, our core engineering thesis is simple: **Quantum advantage is measured, not assumed.** QureSight is an empirical benchmarking and explainability platform built to discover exactly where quantum methods provide genuine diagnostic utility, and where classical algorithms remain superior."*

### Step 2: Explain System Pipeline (0:25 - 0:50)
- **Action:** Hover over the system architecture diagram on the Overview screen.
- **Presenter:**  
  *"Our architecture is built on a clean separation of concerns. A Next.js 14 frontend communicates with an asynchronous FastAPI Python backend. Data preprocessing enforces strict isolation to prevent data leakage. Classical models—Logistic Regression, Random Forest, and XGBoost—run alongside Variational Quantum Classifiers and Quantum Kernel SVMs implemented in PennyLane."*

### Step 3: Load Breast Cancer Dataset (0:50 - 1:15)
- **Action:** Click **"Dataset"** in the sidebar. Show the dataset summary card.
- **Presenter:**  
  *"We load the clinically validated Breast Cancer Wisconsin Diagnostic benchmark: 569 patient biopsy cases with 30 continuous geometrical and morphological features—such as tumor radius, perimeter, and concavity. 212 cases are malignant, and 357 are benign."*

### Step 4: Profile & Preprocess (1:15 - 1:40)
- **Action:** Click the **"Execute Preprocessing"** button. Point to the PCA variance curve.
- **Presenter:**  
  *"Notice our data leakage prevention: we partition into an 80% training set and a 20% holdout test set with stratification. All standard scalers and PCA transforms are fitted strictly on the training set. For quantum circuits, we compress the 30 features into 4 orthogonal principal components, capturing over 80% of total variance, rescaled to [0, π] for angle embedding."*

### Step 5: Run Classical Baseline Models (1:40 - 2:05)
- **Action:** Click **"Train Classical Models"**. Watch the status chips turn green.
- **Presenter:**  
  *"We first establish rigorous classical baselines. In fractions of a second, our backend trains Logistic Regression, a 100-tree Random Forest, and XGBoost. These represent the real-world classical benchmarks that any quantum algorithm must legitimately compete against."*

### Step 6: Run Quantum Models (2:05 - 2:35)
- **Action:** Click **"Train Quantum Models (VQC & QSVC)"**. Observe the optimization loss graph.
- **Presenter:**  
  *"Now we train our quantum models using PennyLane's statevector engine. Here is our Variational Quantum Classifier (VQC): 4 qubits initialized with angle embedding, two StronglyEntanglingLayers applying single-qubit Euler rotations and ring CNOTs, measuring Pauli-Z expectation on qubit 0. Alongside it, we compute the quantum kernel Gram matrix via state fidelity for our Quantum Kernel SVM."*

### Step 7: Benchmark Comparison Table (2:35 - 3:10)
- **Action:** Click **"Benchmark"** in the sidebar. Show the comparative table.
- **Presenter:**  
  *"Here is our empirical audit table. We don't hide results: classical XGBoost achieves near 97% accuracy with sub-millisecond latency. Our 4-qubit quantum models achieve competitive accuracy around 93-94%, but with higher computational latency. More importantly, in clinical triage, Sensitivity—catching every true malignant case—is vital. We present Sensitivity, Specificity, Precision, F1, and AUC-ROC side-by-side."*

### Step 8: Quantum Lab & Qubit Scaling (3:10 - 3:40)
- **Action:** Click **"Quantum Lab"**. Trigger the 2-to-6 Qubit Scaling experiment.
- **Presenter:**  
  *"In our Quantum Lab, we investigate the scaling behavior of quantum models. As we increase from 2 to 6 qubits, information retention increases, but simulation time scales exponentially, and barren plateau risks emerge. We found 4 qubits to provide the optimal trade-off between variance captured and training stability on today's simulators."*

### Step 9: Dual Explainability (SHAP & Quantum Sensitivity) (3:40 - 4:10)
- **Action:** Click **"Explainability"**. Toggle between Classical SHAP and Quantum Sensitivity.
- **Presenter:**  
  *"Clinicians cannot trust black boxes. For classical models, we provide exact TreeExplainer SHAP values, proving that tumor perimeter and concave points drive malignant predictions. For quantum circuits, where classical SHAP is mathematically flawed, we introduce **Quantum Perturbation Sensitivity Analysis**—measuring finite-difference expectation shifts to reveal which quantum registers govern the classification boundary."*

### Step 10: Single Patient Prediction Demo (4:10 - 4:40)
- **Action:** Go to **"Diagnosis"**. Adjust `worst perimeter` and `concave points` sliders to high values. Click **"Run Diagnostic Inference"**.
- **Presenter:**  
  *"Let's simulate an incoming patient biopsy. As we elevate boundary concavity and perimeter, all five models evaluate the patient simultaneously. Classical and quantum models agree on a malignant classification with high confidence."*

### Step 11: Clinical Routing Decision & Closing (4:40 - 5:00)
- **Action:** Highlight the **Clinical Evidence Routing Card** at the bottom of the screen.
- **Presenter:**  
  *"When models agree with high certainty, QureSight routes the patient directly for immediate oncological review. When quantum and classical models diverge, it flags the case for secondary pathological review.*  
  *In conclusion:*  
  **QureSight does not assume quantum advantage. It measures when and where quantum methods are useful.**  
  *Thank you, and we welcome your questions!"*
