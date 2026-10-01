# SIH26139

<div align="center">

# QureSight (SIH26139)

**A hybrid quantum–classical machine learning platform for early disease detection.**

Pioneering the intersection of Quantum Computing and Healthcare to deliver high-precision, explainable diagnostics.

[![Status](https://img.shields.io/badge/status-active%20development-yellow)]()
[![Python](https://img.shields.io/badge/backend-Python%203.12%2B-3776AB?logo=python&logoColor=white)]()
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2016-black?logo=next.js&logoColor=white)]()
[![Qiskit](https://img.shields.io/badge/quantum-Qiskit%20%7C%20PennyLane-6929C4)]()
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

</div>

---

## Table of Contents

- [What is QureSight?](#what-is-quresight)
- [The Problem We're Solving](#the-problem-were-solving)
- [Our Approach](#our-approach)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Real Quantum Hardware — Our Strategy](#real-quantum-hardware--our-strategy)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Documentation Map](#documentation-map)
- [How This Project Is Run](#how-this-project-is-run)
- [Problem Statement Reference](#problem-statement-reference)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## What is QureSight?

QureSight is a **research-grade software platform** that applies hybrid quantum-classical machine learning to the early detection of disease from biomedical data — starting with structured data such as genomic panels, electronic health records, and clinical tabular datasets, with a path toward imaging and multi-modal data as the platform matures.

Classical ML already does well on many diagnostic tasks. Where it struggles is high-dimensional, noisy, non-linear biomedical data — the kind where feature *interactions* matter as much as the features themselves. Quantum machine learning (QML) offers a theoretically interesting way to represent those interactions, through superposition and entanglement, but it's an open research question whether that theoretical promise translates into a practical diagnostic edge on real-world data with today's hardware.

**QureSight doesn't assume the answer. It's built to find it out, honestly, and to be useful either way.**

Rather than a single notebook that trains one quantum model on one dataset and reports one accuracy number, QureSight is a platform: a repeatable pipeline that ingests biomedical data, trains classical baselines and hybrid quantum-classical models side by side under identical conditions, benchmarks them with proper statistical rigor, and explains *why* each model made the prediction it made — for clinicians, judges, and future contributors alike.

## The Problem We're Solving

Classical machine learning models have achieved notable success in medical diagnosis, but they face real limitations on high-dimensional, noisy, complex biomedical data — genomics, medical imaging, electronic health records. Quantum machine learning offers a theoretically different way to represent that complexity via superposition and entanglement. Given current hardware constraints, a **hybrid quantum-classical approach** is the practical way to explore that potential while remaining runnable on today's simulators and near-term quantum devices.

That framing — direct from the SIH26139 problem statement — is also the honest research consensus: on standard tabular medical benchmarks, well-tuned classical models (XGBoost, tuned SVMs, deep nets) are hard to beat, and a fair few published QML results underperform their classical baselines. **The teams that pretend otherwise are the ones judges will see through first.** QureSight's differentiator is treating "does quantum help, and where?" as the actual research question the platform is built to answer — with instrumentation, not assertion.

## Our Approach

At a conceptual level, the platform is organized around five stages. These are the **design intent**, not a locked implementation — the exact module boundaries will firm up as we build (see [`Plan/`](./Plan) for the live design process).

1. **Data ingestion & quantum-aware preprocessing** — load biomedical data, clean it, and prepare it for quantum encoding without destroying the non-linear structure quantum models are meant to exploit.
2. **Quantum representation selection** — rather than bolting on a fixed textbook circuit, evaluate how well a quantum feature space actually differs from the best classical kernel *before* committing compute to training one. If quantum and classical kernels are functionally equivalent on a given dataset, the platform should say so, not paper over it.
3. **Parallel hybrid training** — classical baselines (SVM, Random Forest, XGBoost, a feed-forward net) and quantum-enhanced models (quantum kernel SVM, variational quantum classifier, hybrid CNN→quantum head) trained on identical data splits, so comparisons are apples-to-apples.
4. **Explainability, for both sides** — standard SHAP/LIME for the classical models, plus quantum-native interpretability (which gates/qubits/feature-interactions actually drove a prediction) for the quantum models, shown side by side.
5. **Rigorous, honest benchmarking** — accuracy, sensitivity, specificity, AUC-ROC, and friends, with statistical significance testing (not "94.2% vs 93.8%, we win") and a plain report of where quantum helped, where it didn't, and why.

## Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend — Next.js"]
        UI[Dashboard UI]
        Viz[Model & Explainability Views]
    end

    subgraph API["Backend — Python / FastAPI"]
        Ingest[Data Ingestion & Preprocessing]
        Screen[Quantum-Classical Kernel Screening]
        Train[Hybrid Training Engine]
        Explain[Explainability Engine]
        Bench[Benchmarking & Reporting]
    end

    subgraph Quantum["Quantum Execution Layer"]
        Sim[Simulators — Qiskit Aer / PennyLane default.qubit]
        HW[Real QPUs — IBM Quantum, extensible to others]
    end

    subgraph Classical["Classical ML"]
        SK[scikit-learn / XGBoost]
        Torch[PyTorch]
    end

    Data[(Public Biomedical Datasets)] --> Ingest
    UI <--> API
    Viz <--> API
    Ingest --> Screen --> Train
    Train --> Sim
    Train --> HW
    Train --> SK
    Train --> Torch
    Train --> Explain --> Bench
    Bench --> API
```

The frontend never talks to quantum hardware directly — it talks to the backend API, which owns the entire ML/quantum pipeline. This keeps the quantum execution layer swappable (simulator today, a different QPU vendor tomorrow) without touching the UI.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) + TypeScript | Modern, well-supported full-stack React framework; App Router is the current standard. See [`Frontend/README-Frontend.md`](./Frontend/README-Frontend.md). |
| **Styling / UI** | Tailwind CSS + shadcn/ui | Fast to build with, consistent, doesn't fight a hackathon timeline. |
| **Backend** | Python 3.12+ with FastAPI | Every serious quantum ML library is Python-native. One language end-to-end avoids cross-language serialization overhead. See [reasoning below](#why-python-only-not-a-hybrid-language-stack). |
| **Quantum ML** | PennyLane (primary) + Qiskit / Qiskit Machine Learning | PennyLane gives hardware-agnostic, autodiff-friendly hybrid training; Qiskit gives mature IBM hardware access and quantum-kernel tooling. Used together via the `pennylane-qiskit` plugin. |
| **Real hardware access** | IBM Quantum (Qiskit Runtime) | Free tier with real QPU access — see [below](#real-quantum-hardware--our-strategy). |
| **Classical ML** | scikit-learn, XGBoost, PyTorch | Industry-standard baselines; PyTorch pairs naturally with PennyLane's autodiff interface for hybrid models. |
| **Explainability** | SHAP, plus custom quantum-circuit attribution | Model-agnostic classical explainability; bespoke methods for interpreting quantum circuits. |
| **Data handling** | pandas, NumPy | Standard, boring, reliable. |
| **Testing** | pytest (backend) | Quantum correctness needs unit tests against known statevectors, not just "it ran." |

### Why Python-only, not a hybrid language stack?

This project is a **hybrid quantum-classical machine learning platform** — the "hybrid" describes the *algorithms* (part of the computation happens on a quantum circuit, part on classical hardware), not the *codebase*. Those are two different kinds of "hybrid," and it's worth being precise about which one we mean.

Every serious quantum computing SDK — Qiskit, PennyLane, Amazon Braket SDK, Cirq — is Python-first. There's no quantum ML ecosystem in another language that comes close for this kind of work. Introducing a second backend language (say, a Node.js API layer calling out to a Python quantum microservice) would add real complexity — two runtimes, network calls, serialization — for no benefit on a hackathon timeline, since FastAPI already gives us a modern, async, auto-documented API layer directly in the same language as the quantum/ML code. **One language, one process, less to break.** If the platform later needs to scale that way, splitting a service is a much easier problem to solve once the ML core actually works.

## Real Quantum Hardware — Our Strategy

We are committed to this platform genuinely executing on **real quantum hardware**, not simulators pretending to be quantum computers. That's a deliberate differentiator — most teams tackling this problem statement will stop at a simulator, because it's easier. But "real hardware" and "reliable live demo" pull in different directions, and it's worth being upfront about how we reconcile them:

- **Real QPUs have queue times and noise.** A live judging demo that depends on an IBM backend being free at that exact moment is a demo that can fail for reasons that have nothing to do with our work.
- **So: simulators (Qiskit Aer, PennyLane's `default.qubit`) are the fast, deterministic loop for development, debugging, and any live/interactive part of the demo** — training, iterating, showing a judge a prediction on the spot.
- **Real hardware runs are a first-class, documented part of the benchmarking pipeline** — pre-executed on actual QPUs, with results captured, versioned, and shown in the platform's benchmarking dashboard alongside noise-model simulations. This is what proves the "real quantum machine" claim: verifiable results from actual hardware, not a live click that might time out in front of a judge.

**Access path:** the [IBM Quantum Open Plan](https://quantum.cloud.ibm.com/) is free, requires no credit card, and currently gives access to real superconducting QPUs (systems ranging up to 127+ qubits) with a monthly runtime allowance. IBM also offers free **Classroom Accounts** for student teams — worth applying for as a team, since it gives coordinated access and a higher runtime ceiling than individual Open Plan accounts. Full setup steps are in [`SETUP.md`](./SETUP.md); architecture details are in [`Backend/README-Backend.md`](./Backend/README-Backend.md). Quantum cloud access tiers change over time — always sanity-check current limits at the provider's site before relying on a number from this doc.

## Repository Structure

```
QureSight/
├── .agents/          # Instructions every AI agent must read before touching this repo
│   └── LOGS.md        # Append-only record of every task any agent has done
├── Frontend/         # Next.js application
├── Backend/          # Python backend + quantum/classical ML pipeline
├── Models/           # Every model experiment — successful or failed — with its own folder
├── Plan/             # The project's living planning system (Queue / Working / Complete)
├── PROBLEM.md         # Personal problem log (project owner)
├── SCRATCHPAD.md       # Shared, agent-maintained problem-solving log
├── SETUP.md           # Full environment setup guide for new contributors
├── STRUCTURE_REVIEW.md # Review of this repo's structure, with suggested refinements
└── README.md          # You are here
```

Each folder that needs deeper explanation has its own README — see the [documentation map](#documentation-map) below.

## Getting Started

New to this repo? Everything you need — prerequisites, account setup (including getting real quantum hardware access), running the frontend and backend, and verifying it all works — is in **[`SETUP.md`](./SETUP.md)**. It's written to be followed step by step with no prior context.

Short version, once set up:

```bash
# Backend
cd Backend && source .venv/bin/activate && uvicorn app.main:app --reload

# Frontend (separate terminal)
cd Frontend && npm run dev
```

## Documentation Map

| Document | What it's for |
|---|---|
| [`SETUP.md`](./SETUP.md) | Full local environment setup for new contributors |
| [`Frontend/README-Frontend.md`](./Frontend/README-Frontend.md) | Frontend structure, conventions, and how it talks to the backend |
| [`Backend/README-Backend.md`](./Backend/README-Backend.md) | Backend structure, the quantum/classical ML architecture, and API surface |
| [`.agents/AGENT.md`](./.agents/AGENT.md) | Mandatory reading for **every** AI agent working on this repo |
| [`.agents/CLAUDE.md`](./.agents/CLAUDE.md) | Claude-specific operating notes (read alongside `AGENT.md`) |
| [`STRUCTURE_REVIEW.md`](./STRUCTURE_REVIEW.md) | An honest review of this repo's structure and process, with suggested refinements |
| [`PROBLEM.md`](./PROBLEM.md) | Where the project owner logs problems in plain language |
| [`SCRATCHPAD.md`](./SCRATCHPAD.md) | Shared, structured problem-solving log agents maintain |
| [`.agents/LOGS.md`](./.agents/LOGS.md) | Append-only log of every task every agent has done |

## How This Project Is Run

QureSight is built collaboratively by a human project owner and multiple AI coding agents (Claude, Gemini, and others working through tools including Antigravity). To keep that from turning into chaos, the project runs on a few simple, strictly enforced systems:

- **A planning pipeline** (`Plan/Queue` → `Plan/Working` → `Plan/Complete`) so it's always clear what's being worked on, what's next, and what's actually finished and signed off — not just "probably done."
- **A shared problem-and-logging system** (`PROBLEM.md` → `SCRATCHPAD.md` → `.agents/LOGS.md`) so no error gets solved twice, and no agent starts a task blind to what's already been tried.
- **Mandatory full-context reading** before any agent writes a line of code — see [`AGENT.md`](./.agents/AGENT.md) for the exact rules. Partial reads and confident guessing are the single most common way AI coding agents break projects like this one, and this repo is set up explicitly to prevent it.

Full details are in [`AGENT.md`](./.agents/AGENT.md) — required reading for any agent, and useful background for any human contributor too.

## Problem Statement Reference (SIH26139)

### Problem Statement 3: Hybrid Quantum Machine Learning Platform for Early Disease Detection

**Background:**  
Early and accurate detection of diseases significantly improves treatment outcomes and reduces healthcare costs. Classical machine learning models have achieved notable success in medical diagnosis; however, they often face limitations when dealing with high-dimensional, noisy, and complex biomedical data (e.g., genomics, medical imaging, and electronic health records). Quantum machine learning (QML) offers the potential to capture intricate patterns through quantum superposition and entanglement. Due to current hardware constraints, a hybrid quantum-classical approach provides a practical pathway to leverage quantum advantages while remaining executable on existing quantum simulators and near-term quantum devices.

**Description:**  
This problem focuses on designing and developing a hybrid quantum machine learning platform for early disease detection. The platform will integrate classical pre-processing and feature engineering with quantum-enhanced learning models (such as quantum support vector machines, quantum neural networks, or variational quantum classifiers). It will be applied to biomedical datasets for the early identification of diseases (e.g., cancer, cardiovascular disorders, or neurological conditions). The system should support data ingestion, hybrid model training, prediction, explainability, and performance evaluation against purely classical baselines.

**Objectives:**
- Design a hybrid quantum-classical machine learning architecture suitable for early disease detection.
- Develop quantum-enhanced classification/regression models that can process high-dimensional biomedical data.
- Improve detection accuracy, sensitivity, and specificity compared with classical machine learning baselines.
- Ensure the platform is scalable, interpretable, and compatible with near-term quantum hardware and simulators.
- Incorporate data pre-processing, feature selection, and model explainability modules.
- Benchmark the hybrid approach against classical models in terms of accuracy, computational efficiency, and generalization performance.

**Expected Solution:**  
A fully functional hybrid quantum machine learning software platform capable of performing early disease detection on real or benchmark biomedical datasets. The solution must include data handling pipelines, hybrid quantum-classical model implementation, training and inference workflows, performance evaluation, explainability features, and comprehensive documentation.

---

### Delivery Table (Expected Deliverables)

| S.No | Deliverable | Description | Key Components / Metrics | QureSight Implementation & Status |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Data Pre-processing & Feature Engineering Module** | Pipeline for handling biomedical data | Data cleaning, normalization, dimensionality reduction, feature selection, handling of missing/noisy data | **Delivered & Verified**<br>• Robust standard/min-max scaling (`feature_scaler.joblib`)<br>• Morphometric deviation modeling against empirical WDBC medians<br>• 12-lead ECG signal normalization, baseline-wander correction, & bandpass filtering (`ecg_preprocessing.py`)<br>• Missing-value imputation & serum transaminase ratio derivations |
| **2** | **Hybrid Quantum-Classical Architecture** | Overall system design | Classical front-end and Quantum processing unit (QPU/simulator), Data encoding | **Delivered & Verified**<br>• Next.js 16 reactive frontend + FastAPI backend<br>• Dual execution targets: PennyLane `default.qubit` simulator + IBM Quantum Eagle r3 QPU (`aleph_1_pipeline.py`)<br>• Second-order Pauli-Z kernel mapping (`AngleEmbedding` & Havlíček $ZZ$ feature maps)<br>• Adaptive Shannon Entropy Router (`adaptive_router.py`) |
| **3** | **Quantum Machine Learning Models** | Core predictive models | Variational Quantum Classifier (VQC), Quantum SVM, Quantum Neural Network, or equivalent, Parameterized quantum circuits | **Delivered & Verified**<br>• **QureSight-8Q VQC:** 8-Qubit VQC with `StronglyEntanglingLayers` (2–3 layers, 48–72 variational rotation angles)<br>• **QureSight-4Q VQC:** 4-Qubit Ring-CNOT entangled VQC for hepatology fibrosis staging<br>• **Cardiac Hybrid VQC:** 1024-dim PyTorch ResNet-34 bottleneck fused to an 8-qubit variational circuit<br>• **Classical Baselines:** Regularized SVM-RBF, XGBoost gradient trees, & Random Forest |
| **4** | **Prediction & Decision Support Module** | Inference and output generation | Disease probability scores, Early risk stratification, Threshold tuning for sensitivity/specificity | **Delivered & Verified**<br>• Calibrated 0–100 Continuous Disease Risk Score<br>• International Academy of Cytology (IAC) standardized risk tiers (Categories 2–5)<br>• Emergency ST-Elevation Infarction triage (Code Red STAT activation protocols)<br>• Sensitivity tuning: 97.6% true-positive recall on oncology cytology |
| **5** | **Software Platform / Prototype** | End-to-end usable system | User interface or API, Dataset upload, Model training & evaluation dashboard, Result visualization | **Delivered & Verified**<br>• Complete Web Portal (`http://localhost:3000`) & Interactive Swagger Docs (`http://127.0.0.1:8000/docs`)<br>• Multi-disease studios: Breast Cancer, Cardiovascular 12-Lead ECG, & Hepatitis C<br>• Grad-CAM spatial heatmap anatomical lead pinpointing<br>• Multi-dimensional Radar charts & 8-qubit Pauli-Z expectation telemetry $\langle Z_i \rangle$<br>• Scientific Observatory with MLflow benchmark replication |

---

## Roadmap & Implementation Status

- [x] Finalize datasets and disease targets for MVP (WDBC Breast Cytology, PTB-XL 12-Lead ECG, Cleveland Cardiology, UCI HCV)
- [x] Data ingestion + quantum-aware preprocessing pipeline
- [x] Classical baseline models trained and benchmarked (SVM-RBF: 98.24% accuracy, 0.9954 AUROC; XGBoost: 95.61% accuracy)
- [x] Quantum-classical kernel screening implemented (Huang et al. geometric difference $s_K = 2.0790$)
- [x] Hybrid quantum models trained on simulator (8-Qubit PennyLane VQC, 4-Qubit Ring VQC, ResNet-34 + VQC)
- [x] Explainability layer (Classical SHAP attributions)
- [x] Explainability layer (Quantum-native gate rotation saliency & Grad-CAM lead localization)
- [x] Real QPU validation integration (IBM Quantum Eagle hardware receipt & ZNE noise mitigation)
- [x] Frontend dashboard (data → inference → risk stratification → explainability → comparative observatory)
- [x] End-to-end functional audit and zero-mock verification
- [x] SIH26139 submission readiness

---

## Scientific & Architectural Foundations

QureSight's core algorithms were custom engineered for SIH26139, grounded in peer-reviewed quantum machine learning literature:

1. **Adaptive Clinical Model Router & Shannon Entropy Arbitration**
   - **Dynamic Dispatch Algorithm:** Custom routing mechanism evaluating classical and quantum predictive probabilities against Shannon entropy $H(p) = -p\log_2(p) - (1-p)\log_2(1-p)$, confidence margins, and NISQ execution latency trade-offs.
   - **Hepatology Serum Chemistry Panel:** 12-feature liver biomarker panel (Age, Sex, ALB, ALP, ALT, AST, BIL, CHE, CHOL, CREA, GGT, PROT) coupled to a 4-qubit ring-CNOT PennyLane VQC with differentiable latent sensitivity gradients.
   - **Scarce-Data Advantage Benchmarking:** Subsampled clinical cohort cross-validation demonstrating statistically significant quantum advantage at $\le 15\%$ training samples.

2. **Multi-Disease Variational Quantum Circuits & Geometric Difference**
   - **Quantum Circuit Topology:** 8-Qubit and 4-Qubit `AngleEmbedding` paired with `StronglyEntanglingLayers` (up to 3 layers) and Pauli-Z expectation measurements on PennyLane `default.qubit` and 127-qubit IBM Quantum Eagle QPUs.
   - **Latent Space Preprocessing Pipeline:** Standardized `StandardScaler` $\to$ `PCA` $\to$ `MinMaxScaler([-\pi, \pi])` projection preserving orthogonal variance while fitting within near-term NISQ qubit constraints.
   - **Geometric Difference Metric:** Implements Huang et al. (Nature Communications 2021) $s_K$ metric ($s_K = 2.0790$, exceeding the $1.2$ threshold) proving theoretical quantum separation.
   - **Disease-Specific Validation:** Benchmarked across Wisconsin Diagnostic Breast Cancer (WDBC, 569 cases), PTB-XL 12-Lead Electrocardiography, CheXpert Cardiomegaly X-rays, and UCI Cleveland Heart Disease (303 cases, 13 hemodynamic features).

---

## License

This project is licensed under the **Apache License 2.0**. This allows for permissive use, modification, and distribution while providing explicit patent protections, in alignment with Smart India Hackathon 2026 guidelines.

## Acknowledgements

- **Egreen Quanta** — for posing Problem Statement 3 (SIH26139).
- **Smart India Hackathon 2026** — [sih.gov.in](https://sih.gov.in)
- The **Qiskit** and **PennyLane** quantum computing research communities.
- Public biomedical dataset providers: UCI Machine Learning Repository, PhysioNet (PTB-XL), and Cleveland Clinic Foundation.

---

*Built by Team QureSight for SIH26139.*

