# QureSight Security, Compliance & Clinical Ethics

## 1. Overview
QureSight is engineered according to biomedical data governance principles, incorporating HIPAA / GDPR data privacy guidelines, input validation schemas, model explainability safeguards, and mandatory medical disclaimers.

---

## 2. Privacy & Biomarker De-Identification
- **Synthetic & De-Identified Datasets:** Default datasets (Wisconsin FNA, Cleveland Heart, NIDDK Diabetes) are completely anonymized open-access research benchmarks containing no Personally Identifiable Information (PII) or Protected Health Information (PHI).
- **Patient ID Anonymization:** When user inputs are recorded in `quresight.db`, synthetic pseudorandom IDs (`patient_id`) or anonymous UUIDv4 strings are assigned.
- **Zero Remote Telemetry:** All clinical data processing occurs locally within the user's execution environment; no clinical data is transmitted to external unverified servers.

---

## 3. Input Validation & API Hardening
- **Pydantic Schemas:** FastAPI endpoints enforce strict type validation and range checking for clinical features to reject malformed payloads and prevent buffer injection.
- **Range Constraints:** Biomarker inputs are validated against physiologically plausible ranges before feeding into standardizers or PCA transforms.
- **CORS Protection:** Configured with specific origin allowances (`http://localhost:3000`, `http://localhost:3001`, `127.0.0.1`) preventing cross-origin request forgery.

---

## 4. Explainability & Model Governance
- **Black-Box Mitigation:** High-stakes clinical decisions cannot rely on uninterpretable neural or quantum circuits. QureSight requires every prediction to return dual explanations:
  - **Classical:** TreeExplainer / LinearExplainer SHAP values with baseline expected values.
  - **Quantum:** Finite-difference expectation perturbation sensitivity ($\Delta\langle Z\rangle / \Delta x_i$).
- **Evidence-Based Routing:** Quantum models cannot be selected purely for novelty; they require higher empirical accuracy ($\delta \ge 0.02$) over classical models to prevent clinical degradation.

---

## 5. Statutory Medical Disclaimer
Every prediction interface, API payload, and exported report prominently displays the mandatory research disclaimer:

> **IMPORTANT CLINICAL NOTICE:** QureSight is an exploratory machine learning and quantum computing research decision-support prototype. It does not provide certified medical diagnoses and is not approved by medical regulatory bodies for standalone clinical triage. All predictions must be validated by qualified pathology and oncology professionals.
