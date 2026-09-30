# Scientific Limitations & Honest Boundaries

> **Empirical Transparency: Distinguishing Research Exploration from Clinical Deployment.**  
> *Smart India Hackathon 2024 / SIH26139*

---

## 1. Executive Summary

Many contemporary claims regarding "Quantum Artificial Intelligence in Healthcare" rely on hyperbolic extrapolations rather than measured clinical utility. The core philosophy of **QureSight** is that **quantum advantage is measured, not assumed**.

To uphold research integrity, this document explicitly details the mathematical, technological, and clinical limitations of the current implementation.

---

## 2. Quantum Simulation vs. Real Physical Hardware Gap

QureSight currently runs its quantum circuits using PennyLane's **`default.qubit`** statevector simulator:

- **Mathematical Exactness vs. Physical Stochasticity:** Statevector simulators calculate exact complex amplitudes using linear algebra. Physical quantum hardware (such as superconducting transmon qubits or trapped ions) operates via physical microwave pulses and laser cooling, subject to environmental decoherence, thermal fluctuations, and measurement readout errors.
- **Shot Noise:** The simulator calculates analytical expectation values $\langle \hat{\mathcal{O}} \rangle$. On physical NISQ QPUs, expectation values must be estimated through finite repeated measurements (shots, typically $1024 - 8192$), introducing statistical sampling variance $\propto 1/\sqrt{N_{shots}}$.
- **Hardware Topology & Gate Synthesis:** Simulators allow arbitrary all-to-all connectivity. Real QPUs have constrained physical coupling graphs (e.g. heavy-hex or linear nearest-neighbor), requiring SWAP gate insertion that significantly increases circuit depth and error rates.

---

## 3. Qubit Constraint & Dimensionality Reduction Trade-Off

Simulating quantum systems on classical processors requires $2^N$ complex floating-point numbers:

- **The Exponential Memory Wall:**
  - 4 qubits: $2^4 = 16$ amplitudes ($\approx 256$ bytes) — trivial.
  - 10 qubits: $2^{10} = 1,024$ amplitudes ($\approx 16$ KB).
  - 20 qubits: $2^{20} \approx 10^6$ amplitudes ($\approx 16$ MB).
  - 30 qubits: $2^{30} \approx 1.07 \times 10^9$ amplitudes ($\approx 17.17$ GB per circuit state).
- **Mandatory Compression via PCA:** Because classical medical records contain 30 to thousands of biomarkers, direct 1-to-1 qubit mapping is intractable on current classical simulators and noisy hardware. QureSight compresses the 30 features into 4–6 principal components.
- **Information Loss:** While PCA captures $>80\%$ of total variance, non-linear relationships that classical ensembles (like XGBoost) can isolate across raw features may be blurred during linear projection before the quantum circuit ever encounters them.

---

## 4. Variational Optimization & Barren Plateaus

Variational Quantum Classifiers (VQC) employ classical gradient optimizers to tune unitary gate parameters:

- **Barren Plateau Phenomenon:** As the number of qubits and circuit depth increase, the variance of the gradients vanishes exponentially:
  $$\text{Var}_{\mathbf{\theta}}\left[ \frac{\partial \langle \hat{\mathcal{O}} \rangle}{\partial \theta_k} \right] \in \mathcal{O}\left( \frac{1}{2^N} \right)$$
  This flattens the optimization landscape, preventing gradient descent from finding optimal minima without specialized initialization strategies.
- **Non-Convex Optimization:** Unlike classical linear models or Support Vector Machines (which possess convex loss functions with guaranteed global optima), VQCs optimize non-convex energy landscapes with numerous local minima and saddle points.

---

## 5. Noise Modeling in the NISQ Era

In near-term quantum processors (NISQ):
- **Decoherence Times:** Physical qubits have finite lifetimes:
  - $T_1$ (longitudinal relaxation time): Energy loss to the environment.
  - $T_2$ (transverse dephasing time): Phase randomization destroying quantum superposition.
- **Two-Qubit Gate Error:** CNOT and CZ entangling gates currently have error rates between $0.1\%$ and $1.0\%$. In circuits with dozens of entangling operations, cumulative noise rapidly drives the quantum state toward the maximally mixed state $\frac{1}{2^N} \mathbb{I}$, destroying any computational advantage.
- QureSight's default simulator does not apply a full Kraus operator noise model, although the **Quantum Lab** module provides synthetic depolarization channels to demonstrate these degradation effects.

---

## 6. Dataset Scope & Generalizability

The primary benchmark dataset is the **Breast Cancer Wisconsin (Diagnostic)** dataset:
- **Demonstration Benchmark:** While standard in machine learning research, this dataset consists of 569 tabular observations derived from 1990s FNA biopsy images.
- **No Pathological / Multi-Modal Complexity:** The dataset lacks raw histopathological whole-slide images, genomic sequencing sequences, or longitudinal electronic health records.
- **Overfitting Risk:** Because the dataset is relatively small, sophisticated models (both classical XGBoost and hybrid QML) risk memorizing patient characteristics rather than learning generalizable oncology patterns.

---

## 7. Clinical Validation Status

- **Zero Clinical Trials:** QureSight has not been tested in clinical workflows, prospective cohort studies, or hospital emergency settings.
- **No Regulatory Clearance:** The software has not received approval, certification, or clearance from regulatory bodies (e.g., FDA 510(k), CE mark, or CDSCO medical device rules).
- **Research Prototype:** QureSight is engineered strictly as an educational and scientific benchmarking platform to explore quantum algorithms under controlled conditions.

---

## 8. Medical Disclaimer

> **MANDATORY CLINICAL & LEGAL DISCLAIMER:**  
> QureSight is an exploratory research project developed exclusively for the Smart India Hackathon (SIH26139). **IT IS NOT A MEDICAL DEVICE AND MUST NOT BE USED FOR PATIENT CARE, SCREENING, DIAGNOSIS, OR TREATMENT DECISION-MAKING.**  
> The predictions, confidence scores, and feature sensitivity rankings provided by QureSight are computational outputs generated for benchmarking purposes only. Healthcare providers and patients must rely solely on licensed medical professionals, accredited laboratory diagnostics, and certified clinical protocols for medical evaluations.
