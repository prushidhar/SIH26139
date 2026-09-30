# QureSight Reproducibility Protocol

> **Core Principle:** *Quantum advantage is measured, not assumed.*
> Every benchmark, metric, and comparison in QureSight is deterministic, auditable, and reproducible across platforms.

---

## 1. System Specifications & Environment

All benchmark runs and validation pipelines are guaranteed reproducible under the following execution environment:

| Component | Specification | Details |
| :--- | :--- | :--- |
| **Python Runtime** | Python 3.12 (tested on 3.11 & 3.12) | 64-bit architecture |
| **Operating System** | Windows 10/11 x64, Linux Ubuntu 22.04 LTS, macOS Darwin | Cross-platform compatibility |
| **Random Seed** | `42` | Global seed applied to Python, NumPy, Scikit-learn, PennyLane |
| **Quantum Simulator** | PennyLane `default.qubit` | Analytical statevector simulator |
| **Persistence** | SQLite 3 | Relational audit trail stored at `results/quresight.db` |

### Key Package Dependencies

```text
pennylane>=0.36.0
scikit-learn>=1.4.0
xgboost>=2.0.0
shap>=0.44.0
numpy>=1.26.0
pandas>=2.2.0
scipy>=1.12.0
fastapi>=0.110.0
uvicorn>=0.28.0
pydantic>=2.6.0
```

---

## 2. Dataset Protocol

### Primary Diagnostic Dataset
- **Name:** Breast Cancer Wisconsin (Diagnostic) Dataset
- **Source:** Scikit-Learn standard distribution (`sklearn.datasets.load_breast_cancer`)
- **Originating Institution:** University of Wisconsin Hospitals, Madison (Dr. William H. Wolberg, W. Nick Street, Olvi L. Mangasarian)
- **Sample Count:** 569 patient instances
- **Feature Count:** 30 real-valued continuous features computed from digitized Fine Needle Aspirate (FNA) images
- **Classes:** 2 classes (Binary classification)
  - Malignant: 212 instances (37.3%)
  - Benign: 357 instances (62.7%)

### Partitioning & Leakage Prevention
1. **Split Ratio:** 80% Training (455 samples), 20% Evaluation Holdout (114 samples).
2. **Stratification:** Enabled (`stratify=y`) using random state `42` to strictly mirror class distributions.
3. **Pipeline Isolation:** All scalers (`StandardScaler`, `MinMaxScaler`) and dimensionality reduction transforms (`PCA`) are fitted exclusively on the 80% training set. Transform operations on the 20% holdout test set are strictly out-of-sample projections to prevent any target or feature leakage.

---

## 3. Quantum Execution Protocol

### Variational Quantum Classifier (VQC)
- **Qubit Allocation:** 4 qubits (scalable to 6 qubits for sensitivity studies).
- **Dimensionality Reduction:** Classical PCA transforms 30 input features into $n_{qubits}$ principal components fitted strictly on training data.
- **Feature Encoding:** Angle Embedding mapping features onto $[0, \pi]$ using $R_x(\theta_i)$ rotations.
- **Ansatz:** PennyLane `StronglyEntanglingLayers` ($L=2$ layers), providing parameterized single-qubit rotations ($R(\alpha, \beta, \gamma)$) and entangling CNOT rings.
- **Measurement:** Expectation value of Pauli-Z on qubit 0: $\langle \hat{\sigma}_z^{(0)} \rangle \in [-1, 1]$.
- **Optimization:** Adam / Gradient Descent with learning rate $\eta = 0.1$, step limit 100, seed 42.

### Quantum Kernel Support Vector Classifier (QSVC)
- **Feature Map:** ZZ-inspired non-linear feature map with entangling phase gates $R_{ZZ}(\phi_{ij}) = \exp(-i \frac{\phi_{ij}}{2} Z_i \otimes Z_j)$ where $\phi_{ij} = (\pi - x_i)(\pi - x_j)$.
- **Kernel Evaluation:** State overlap / fidelity computed via quantum inner product:
  $$K(x, x') = |\langle \psi(x') | \psi(x) \rangle|^2$$
- **Classification:** Precomputed Gram Matrix passed into scikit-learn `SVC(kernel='precomputed', C=1.0)`.

---

## 4. Step-by-Step Reproduction Guide

### Step 1: Environment Setup
```bash
# Clone the repository
git clone https://github.com/egreen-quanta/quresight.git
cd quresight

# Set up Python virtual environment
python -m venv .venv

# Activate on Windows PowerShell:
.venv\Scripts\Activate.ps1
# Or on Linux/macOS:
# source .venv/bin/activate

# Install backend dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 2: Set Environment Variables
```bash
cp .env.example .env
```

### Step 3: Run Deterministic Benchmarks
Execute the full benchmark suite directly from the command line:
```bash
python scripts/run_experiments.py --seed 42 --dataset breast_cancer --output results/benchmark_run.json
```

### Step 4: Verify Evaluation Metrics
Compare generated metrics in `results/benchmark_run.json` against database records:
```bash
python scripts/verify_results.py --db results/quresight.db
```

### Step 5: Launch Local UI & API for Visual Inspection
```bash
# Terminal 1: Backend
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000` to interact with the full dashboard and verify live model predictions against logged benchmarks.
