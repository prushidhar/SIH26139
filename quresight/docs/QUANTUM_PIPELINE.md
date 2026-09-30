# QureSight Quantum Machine Learning Pipeline

> **Variational Quantum Classifiers, Quantum Kernel Estimation, and NISQ Mechanics.**  
> *Smart India Hackathon 2024 / SIH26139*

---

## 1. Quantum Pipeline Overview

In biomedical diagnostics, complex disease phenotypes often arise from non-linear, high-order correlations among biological markers that linear models struggle to isolate. Quantum computing offers a fundamentally different mathematical representation: mapping classical vectors into an exponentially large Hilbert state space $\mathcal{H} = (\mathbb{C}^2)^{\otimes N}$ using quantum superposition and multi-qubit entanglement.

QureSight implements two distinct quantum machine learning paradigms using **PennyLane**:
1. **Variational Quantum Classifier (VQC):** A parameterized quantum circuit (PQC) trained end-to-end via gradient-based optimization.
2. **Quantum Kernel Support Vector Classifier (QSVC):** A quantum feature map generating a non-linear inner-product Gram matrix evaluated on a classical Support Vector Machine.

---

## 2. Variational Quantum Classifier (VQC)

```text
|0⟩ ─── [Rx(x0)] ─── [ R(α0, β0, γ0) ] ──●───────── [ R(α'0, β'0, γ'0) ] ──●───────── [ ⟨σz^(0)⟩ ]
                                         │                                  │
|0⟩ ─── [Rx(x1)] ─── [ R(α1, β1, γ1) ] ──X──────●── [ R(α'1, β'1, γ'1) ] ──X──────●──
                                                │                                  │
|0⟩ ─── [Rx(x2)] ─── [ R(α2, β2, γ2) ] ─────────X── [ R(α'2, β'2, γ'2) ] ─────────X──
                                                │                                  │
|0⟩ ─── [Rx(x3)] ─── [ R(α3, β3, γ3) ] ─────────●── [ R(α'3, β'3, γ'3) ] ─────────●──
        \______/     \____________________________/ \____________________________/
       Embedding                Layer 1                        Layer 2
```

### 2.1 State Preparation: Angle Embedding
Each PCA-reduced feature vector $\mathbf{x} = [x_0, x_1, \dots, x_{N-1}]^T \in [0, \pi]^N$ is encoded into an $N$-qubit register initialized to the vacuum state $|0\rangle^{\otimes N}$:
$$|\psi(\mathbf{x})\rangle = \bigotimes_{j=0}^{N-1} R_x(x_j) |0\rangle = \bigotimes_{j=0}^{N-1} \left( \cos\frac{x_j}{2} |0\rangle - i \sin\frac{x_j}{2} |1\rangle \right)$$
Angle embedding provides linear feature encoding with circuit depth $\mathcal{O}(1)$, minimizing quantum gate overhead.

### 2.2 Parameterized Ansatz: StronglyEntanglingLayers
Following state preparation, a parameterized unitary ansatz $U(\mathbf{\theta})$ acts on the quantum state. QureSight employs PennyLane's `StronglyEntanglingLayers`:
- **Single-Qubit Rotations:** Each layer applies arbitrary Euler rotations $R(\alpha, \beta, \gamma) = R_z(\gamma) R_y(\beta) R_z(\alpha)$ to every individual qubit:
  $$U_j^{(l)}(\mathbf{\theta}_{j,l}) = \begin{bmatrix} e^{-i(\alpha+\gamma)/2} \cos\frac{\beta}{2} & -e^{-i(\alpha-\gamma)/2} \sin\frac{\beta}{2} \\ e^{i(\alpha-\gamma)/2} \sin\frac{\beta}{2} & e^{i(\alpha+\gamma)/2} \cos\frac{\beta}{2} \end{bmatrix}$$
- **Multi-Qubit Entanglement:** Entangling CNOT gates are applied in a closed ring topology across all qubits with ranges step-shifted across layers:
  $$\text{CNOT}_{(j, (j + r_l) \bmod N)}$$
- **Circuit Depth & Parameters:** For $N=4$ qubits and $L=2$ layers, the ansatz contains:
  $$N_{\text{weights}} = L \times N \times 3 = 2 \times 4 \times 3 = 24 \text{ trainable parameters}$$

### 2.3 Observable Measurement & Cost Function
The prediction is obtained by measuring the expectation value of the Pauli-Z operator on the readout qubit (qubit 0):
$$\hat{y}(\mathbf{x}; \mathbf{\theta}) = \langle \psi(\mathbf{x}) | U^\dagger(\mathbf{\theta}) \hat{\sigma}_z^{(0)} U(\mathbf{\theta}) | \psi(\mathbf{x}) \rangle \in [-1, 1]$$
- Continuous expectation values are mapped to class probabilities via the sigmoid function:
  $$p(y=1 | \mathbf{x}) = \frac{1}{1 + e^{-k \cdot \hat{y}}}$$
- Training minimizes Binary Cross-Entropy (BCE) or Mean Squared Error using Adam / Gradient Descent with learning rate $\eta = 0.1$ for 100 optimization epochs.

---

## 3. Quantum Kernel Support Vector Classifier (QSVC)

Rather than iteratively optimizing parameterized quantum circuits, Quantum Kernel estimation leverages quantum superposition to evaluate similarities between patient feature vectors directly in Hilbert space.

```text
|0⟩ ─ [H] ─ [Rz(2x0)] ──●─────────●── [H] ─ [Rz(-2x'0)] ──●─────────●─ Measure |0000⟩
                        │         │                       │         │
|0⟩ ─ [H] ─ [Rz(2x1)] ──X──●──────┼── [H] ─ [Rz(-2x'1)] ──X──●──────┼─
                           │      │                          │      │
|0⟩ ─ [H] ─ [Rz(2x2)] ─────X──●───┼── [H] ─ [Rz(-2x'2)] ─────X──●───┼─
                              │   │                             │   │
|0⟩ ─ [H] ─ [Rz(2x3)] ────────X───X── [H] ─ [Rz(-2x'3)] ────────X───X─
      \_____________________________/ \_____________________________/
               U_Φ(x)                            U_Φ†(x')
```

### 3.1 Non-Linear Feature Map: ZZ-Coupling
The classical vector $\mathbf{x} \in \mathbb{R}^N$ is embedded into quantum state space via the unitary transformation:
$$U_\Phi(\mathbf{x}) = \exp\left( i \sum_{j} \phi_j(x_j) Z_j + i \sum_{j < k} \phi_{jk}(x_j, x_k) Z_j Z_k \right) H^{\otimes N}$$
where:
- $\phi_j(x_j) = 2 x_j$
- $\phi_{jk}(x_j, x_k) = 2 (\pi - x_j)(\pi - x_k)$
The non-linear two-body interaction term $Z_j Z_k$ introduces genuine quantum entanglement that cannot be factored into product states, creating a feature space conjectured to be classically intractable for arbitrary high-depth interactions.

### 3.2 State Overlap Fidelity Kernel
The similarity between two patient vectors $\mathbf{x}$ and $\mathbf{x}'$ is defined as the transition fidelity between their respective quantum states:
$$K(\mathbf{x}, \mathbf{x}') = |\langle \psi(\mathbf{x}') | \psi(\mathbf{x}) \rangle|^2 = |\langle 0^{\otimes N} | U_\Phi^\dagger(\mathbf{x}') U_\Phi(\mathbf{x}) | 0^{\otimes N} \rangle|^2$$
- When $\mathbf{x} = \mathbf{x}'$, the states are identical, yielding $K(\mathbf{x}, \mathbf{x}) = 1.0$.
- When states are orthogonal in Hilbert space, $K(\mathbf{x}, \mathbf{x}') = 0.0$.

### 3.3 Gram Matrix Computation & Classical SVM
1. **Training Kernel Matrix:** The $N_{train} \times N_{train}$ symmetric Gram matrix $\mathbf{K}_{train}$ is precomputed across all pairs:
   $$(\mathbf{K}_{train})_{i,j} = K(\mathbf{x}_i, \mathbf{x}_j)$$
2. **Holdout Evaluation Matrix:** An $N_{test} \times N_{train}$ matrix is computed representing test instances evaluated against support training vectors:
   $$(\mathbf{K}_{test})_{m,i} = K(\mathbf{x}'_m, \mathbf{x}_i)$$
3. **Dual Optimization:** The precomputed kernel matrices are passed to scikit-learn's `SVC(kernel='precomputed', C=1.0)`:
   $$\max_{\mathbf{\alpha}} \sum_{i=1}^{N_{train}} \alpha_i - \frac{1}{2} \sum_{i,j=1}^{N_{train}} \alpha_i \alpha_j y_i y_j K(\mathbf{x}_i, \mathbf{x}_j) \quad \text{s.t.} \quad 0 \le \alpha_i \le C, \sum_i \alpha_i y_i = 0$$

---

## 4. Quantum Circuit Parameters & Scaling

| Parameter | VQC Default | QSVC Default | Configuration Scope |
| :--- | :--- | :--- | :--- |
| **Qubits ($N$)** | 4 | 4 | Configurable: 2, 3, 4, 5, 6 |
| **Circuit Layers ($L$)** | 2 | 1 (ZZ Map) | Configurable: 1 to 4 |
| **State Encoding** | Angle Embedding ($R_x$) | ZZ-Entangled Feature Map | Angle, Amplitude, ZZ-Feature Map |
| **Trainable Gates** | 24 Euler rotation parameters | 0 (Dual $\mathbf{\alpha}$ solved by SVM) | Analytic gradients vs Convex quadratic |
| **Optimizer** | Adam ($\text{lr}=0.1$) | Dual Quadratic Solver | SGD, Adam, L-BFGS |
| **Measurement** | Pauli-Z Expectation $\langle Z_0 \rangle$ | Projector Overlap $|\langle 0|0 \rangle|^2$ | Expectation vs Computational basis counts |

---

## 5. Quantum Simulator Note

QureSight utilizes PennyLane's **`default.qubit`** statevector simulator:
- **Exact Linear Algebra:** Computes exact wavefunctions via full statevector matrix-vector multiplications without stochastic shot noise.
- **Reproducible Research:** Provides numerical determinism with fixed random seeds (`seed=42`), allowing precise algorithmic comparisons.
- **Hardware Portability:** PennyLane abstracts device execution. The identical circuit definitions can target IBM Quantum hardware (`qiskit.ibmq`), Amazon Braket, or IonQ via backend plugins with API credentials.

---

## 6. NISQ Constraints & Practical Realities

Near-Term Intermediate-Scale Quantum (NISQ) devices impose distinct constraints that inform QureSight's architectural boundaries:

1. **Exponential Simulation Scaling:**
   Full statevector simulation requires $2^N$ complex floating-point numbers. While 4 qubits require only 16 amplitudes (trivial memory), simulating 30 qubits directly would require $2^{30} \times 16 \text{ bytes} \approx 17.17 \text{ Gigabytes}$ of RAM per circuit evaluation, making dimensionality reduction via PCA necessary for interactive benchmarking.
2. **Barren Plateau Phenomenon:**
   As circuit depth $L$ and qubit count $N$ grow, the variance of parameter gradients vanishes exponentially:
   $$\text{Var}_{\mathbf{\theta}}\left[ \frac{\partial \langle \hat{\mathcal{O}} \rangle}{\partial \theta_k} \right] \in \mathcal{O}\left( \frac{1}{2^N} \right)$$
   QureSight restricts VQC ansatz depth to $L=2$ layers and employs local Pauli-Z measurements $\hat{\sigma}_z^{(0)}$ rather than global observables $\hat{\sigma}_z^{\otimes N}$ to mitigate barren plateaus.
3. **Decoherence & Hardware Noise:**
   Physical qubits suffer from finite coherence times ($T_1$ relaxation and $T_2$ dephasing) and two-qubit gate errors ($\approx 0.5\% - 1.5\%$). QureSight provides a dedicated **Quantum Lab** to assess algorithmic degradation under simulated depolarization and phase-damping noise channels.
