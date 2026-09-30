# QureSight Database Architecture & Persistence

## 1. Overview
QureSight employs an embedded SQLite database located at [`quresight/results/quresight.db`](file:///c:/Users/P%20RUSHIDHAR/OneDrive/Desktop/SIH26139/quresight/results/quresight.db). Managed by [`quresight/backend/db/database.py`](file:///c:/Users/P%20RUSHIDHAR/OneDrive/Desktop/SIH26139/quresight/backend/db/database.py), it provides zero-configuration, ACID-compliant persistence for benchmark experiments, clinical prediction audits, background worker jobs, and generated clinical reports.

---

## 2. Relational Schema Definition

### 2.1 Table: `experiments`
Stores model training benchmarks, hyperparameters, and cross-validated metrics.
```sql
CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    dataset_name TEXT NOT NULL,
    experiment_type TEXT NOT NULL,
    config TEXT NOT NULL,          -- JSON object of hyperparameters
    metrics TEXT NOT NULL,         -- JSON object of metrics (AUC, Acc, F1, etc.)
    status TEXT NOT NULL,          -- 'queued', 'running', 'completed', 'failed'
    duration_seconds REAL DEFAULT 0.0
);
```

### 2.2 Table: `predictions`
Audits patient biomarker predictions, risk bands, and explainability contributions for clinical governance.
```sql
CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    patient_id TEXT,
    model_name TEXT NOT NULL,
    risk_score REAL NOT NULL,
    risk_band TEXT NOT NULL,       -- 'Low Risk', 'Moderate Risk', 'Elevated Risk'
    features TEXT NOT NULL,        -- JSON object of input clinical biomarkers
    contributions TEXT NOT NULL    -- JSON object of SHAP / sensitivity values
);
```

### 2.3 Table: `jobs`
Tracks asynchronous background jobs executing long-running quantum circuit simulations.
```sql
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL,          -- 'queued', 'running', 'completed', 'failed'
    progress REAL DEFAULT 0.0,
    result TEXT,                   -- JSON result payload upon completion
    error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### 2.4 Table: `reports`
Maintains generated clinical intelligence reports.
```sql
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    format TEXT NOT NULL,          -- 'json' or 'html'
    content TEXT NOT NULL          -- Full serialized report document
);
```

---

## 3. Data Integrity & Transactions
- **Connection Isolation:** Thread-local SQLite connections with context managers (`with sqlite3.connect(...) as conn:`) ensure connections are closed cleanly.
- **WAL Mode Compatibility:** Schema supports SQLite Write-Ahead Logging (WAL) for high concurrency between the FastAPI background worker threads and Next.js frontend queries.
- **Strict JSON Serialization:** Complex structures (feature weights, ROC curves, confusion matrices) are stored as validated JSON strings and deserialized dynamically upon API request.
