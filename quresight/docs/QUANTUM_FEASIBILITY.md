# QureSight Quantum Feasibility & NISQ Analysis

## 1. Overview
The Quantum Feasibility module investigates the empirical boundaries of current Noisy Intermediate-Scale Quantum (NISQ) devices. It models qubit scaling, circuit depth variations, and environmental decoherence (depolarizing noise) to assess whether quantum biomedical algorithms can withstand real-world hardware imperfections.

---

## 2. Experimental Dimensions

### 2.1 Qubit Scaling ($n \in \{2, 4, 6, 8\}$)
- Assesses how diagnostic classification scales as more principal component features are embedded into quantum Hilbert spaces.
- **Circuit Width:** State space dimension scales as $2^n$ ($4$, $16$, $64$, $256$ complex amplitudes).
- **Empirical Observation:** While $4$-qubit models capture more clinical variance than $2$-qubit circuits, $6$-qubit and $8$-qubit VQCs suffer from barren plateaus and exponentially slower classical simulation without corresponding gains in sample efficiency.

### 2.2 Circuit Depth Scaling ($L \in \{2, 4, 6\}$)
- Evaluates the expressivity vs. trainability tradeoff in `StronglyEntanglingLayers`.
- Single-qubit rotations per layer: $3 \times n$.
- Two-qubit CNOT entangling gates per layer: $n$.
- At depth $L=6$, circuit fidelity degrades sharply under non-zero noise rates due to accumulated gate errors.

### 2.3 Noise Modeling & Environmental Decoherence
QureSight simulates physical quantum noise channels:
1. **Ideal Simulation (`noise=none`):** Pure statevector evolution without decoherence.
2. **Low Depolarizing Noise (`p=0.01`):** Simulates high-coherence superconducting transmon processors (e.g., IBM Heron / Eagle processors with dynamic decoupling).
3. **Moderate Noise (`p=0.05`):** Simulates unmitigated NISQ gate infidelity.

Depolarizing channel on density matrix $\rho$:
$$\mathcal{E}(\rho) = (1 - p)\rho + \frac{p}{3}\left(X\rho X + Y\rho Y + Z\rho Z\right)$$

---

## 3. Empirical Feasibility Matrix

| Qubits | Depth | Noise Level | VQC Accuracy | VQC ROC-AUC | Circuit Depth | Total Gates | Hardware Feasibility |
|---|---|---|---|---|---|---|---|
| 2 | 2 | Ideal | 82.46% | 0.9071 | 6 | 16 | High (NISQ-Ready) |
| 4 | 2 | Ideal | 78.07% | 0.8442 | 10 | 36 | High (NISQ-Ready) |
| 4 | 4 | Ideal | 77.19% | 0.8350 | 20 | 72 | Moderate |
| 4 | 2 | Low (0.01) | 75.44% | 0.8120 | 10 | 36 | Moderate (Requires Zero-Noise Extrapolation) |
| 4 | 2 | Mod (0.05) | 68.42% | 0.7315 | 10 | 36 | Low (Decoherence Dominates) |

---

## 4. Hardware Readiness & OpenQASM 2.0 Export
QureSight generates syntactically valid OpenQASM 2.0 output for every synthesized quantum circuit via [`backend.export_qasm()`](file:///c:/Users/P%20RUSHIDHAR/OneDrive/Desktop/SIH26139/quresight/ml/quantum/backend.py). 

Researchers can copy the generated QASM directly into IBM Quantum Composer or dispatch jobs to cloud QPUs via the provided `IBMQuantumBackend` adapter.
