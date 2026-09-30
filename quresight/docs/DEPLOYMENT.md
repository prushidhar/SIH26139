# QureSight Deployment & Operations Guide

> **Local Windows Deployment, Environment Setup, and Production Recommendations.**  
> *Smart India Hackathon 2024 / SIH26139*

---

## 1. System Requirements

Before deploying QureSight, verify the following prerequisites:

| Requirement | Minimum | Recommended |
| :--- | :--- | :--- |
| **Operating System** | Windows 10/11 x64, Ubuntu 22.04 LTS, macOS 13+ | Windows 11 x64 or Ubuntu 22.04 LTS |
| **Python** | Python 3.11 or 3.12 | Python 3.12.x 64-bit |
| **Node.js** | Node.js 18.x LTS | Node.js 20.x LTS |
| **RAM** | 8 GB | 16 GB (for multi-qubit simulation) |
| **Storage** | 2 GB available space | 5 GB SSD storage |
| **Network** | Offline capable after dependency install | Active internet for package setup |

---

## 2. Local Windows Deployment (Step-by-Step)

Follow these exact steps using Windows PowerShell:

### Step 1: Open PowerShell as Administrator or Standard User
Navigate to your project root:
```powershell
cd "c:\Users\P RUSHIDHAR\OneDrive\Desktop\SIH26139\quresight"
```

### Step 2: Configure Python Virtual Environment
```powershell
# Create virtual environment named .venv
python -m venv .venv

# If script execution is blocked on Windows, enable RemoteSigned:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Upgrade package management
python -m pip install --upgrade pip setuptools wheel
```

### Step 3: Install Backend Dependencies
```powershell
pip install -r requirements.txt
```
*(Dependencies include: `fastapi`, `uvicorn`, `pennylane`, `scikit-learn`, `xgboost`, `shap`, `numpy`, `pandas`, `scipy`, `pydantic`)*

### Step 4: Configure Environment Variables
Copy the template configuration file:
```powershell
Copy-Item .env.example .env
```
Ensure directory targets exist:
```powershell
New-Item -ItemType Directory -Force -Path results, models, data, reports
```

### Step 5: Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

### Step 6: Start the Backend Service
In your primary terminal:
```powershell
# Starts FastAPI server on port 8001
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload
```
Verify the backend is live by opening:
`http://localhost:8001/health` or `http://localhost:8001/docs` (Swagger UI).

### Step 7: Start the Next.js Frontend
Open a **new** Windows PowerShell terminal window:
```powershell
cd "c:\Users\P RUSHIDHAR\OneDrive\Desktop\SIH26139\quresight\frontend"
npm run dev
```
Open your browser and navigate to:
**`http://localhost:3000`**

---

## 3. Environment Variables Reference

A complete `.env` file should contain the following settings:

```dotenv
# Frontend API Connection
NEXT_PUBLIC_API_URL=http://localhost:8001

# Backend Server Bindings
HOST=0.0.0.0
PORT=8001
DEBUG=true

# Storage and Persistence
QURESIGHT_DB_PATH=results/quresight.db
QURESIGHT_MODELS_PATH=models/
QURESIGHT_RESULTS_PATH=results/
QURESIGHT_DATA_PATH=data/

# Machine Learning & Quantum Simulation Settings
DEFAULT_RANDOM_SEED=42
QUANTUM_DEVICE=default.qubit
MAX_QUBITS_ALLOWED=8
DEFAULT_QUBITS=4
VQC_MAX_ITERATIONS=100
VQC_STEP_SIZE=0.1
```

---

## 4. Production Considerations

When transitioning QureSight from a local hackathon prototype to an institutional or cloud environment:

### 1. Web Server Daemonization
- Replace `uvicorn --reload` with **Gunicorn** managing multiple Uvicorn worker processes:
  ```bash
  gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
  ```
- Serve the Next.js frontend using a production build:
  ```bash
  cd frontend
  npm run build
  npm run start -p 3000
  ```

### 2. Reverse Proxy & SSL/TLS
- Deploy **Nginx** or **Traefik** as a reverse proxy in front of both frontend and backend.
- Terminate SSL/TLS (HTTPS) at the proxy level.
- Restrict FastAPI CORS origins strictly to authorized institutional domains:
  ```python
  origins = ["https://quresight.hospital.org"]
  ```

### 3. Compute Resource Allocation for Quantum Simulation
- Simulating parameterized circuits with 6+ qubits creates intensive CPU thread contention.
- Pin matrix multiplication workers via OpenMP/BLAS environment flags:
  ```bash
  export OMP_NUM_THREADS=4
  export MKL_NUM_THREADS=4
  ```

### 4. Database Migration
- Transition from local single-file SQLite (`results/quresight.db`) to a managed **PostgreSQL** instance for concurrent multi-clinician access and row-level security.
