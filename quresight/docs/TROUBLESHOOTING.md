# QureSight Operational Troubleshooting Guide

## 1. Environment & Setup Issues

### 1.1 Python Virtual Environment
- **Issue:** `ModuleNotFoundError: No module named 'pennylane'` or `'xgboost'`
- **Fix:** Ensure execution uses the virtual environment python interpreter:
  ```powershell
  & "c:\Users\P RUSHIDHAR\OneDrive\Desktop\SIH26139\Backend\.venv\Scripts\python.exe" -m pip install -r quresight/requirements.txt
  ```

### 1.2 Windows PowerShell Command Execution
- **Issue:** `File npm.ps1 cannot be loaded because running scripts is disabled on this system`
- **Fix:** On Windows PowerShell, invoke `npm.cmd` rather than `npm`:
  ```powershell
  npm.cmd run dev
  # or for production build
  npm.cmd run build
  npm.cmd run start -- -p 3001
  ```

---

## 2. Server Port Conflicts

### 2.1 Backend Port 8001 Conflict
- **Symptom:** `[Errno 10048] error while attempting to bind on address ('127.0.0.1', 8001)`
- **Solution:** Identify the process occupying port 8001 and terminate it:
  ```powershell
  Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue | Select-Object OwningProcess
  Stop-Process -Id <PID> -Force
  ```

### 2.2 Frontend Port 3001 Conflict
- **Symptom:** Next.js fails to bind to port 3001 or falls back to port 3002.
- **Solution:** Identify the process occupying port 3001 and terminate it:
  ```powershell
  Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object OwningProcess
  Stop-Process -Id <PID> -Force
  ```

---

## 3. Quantum Simulation Performance Tuning

### 3.1 VQC Autograd Gradient Computation Latency
- **Issue:** Training VQC with full dataset takes excessive time.
- **Resolution:** QureSight's `VQCTrainer` utilizes mini-batch Adam optimization (`batch_size=32`, `epochs=10`). Avoid full-batch parameter-shift gradients on >100 samples in statevector simulation.

### 3.2 Quantum Kernel Gram Matrix Latency
- **Issue:** $N \times N$ Gram matrix takes several minutes.
- **Resolution:** QureSight uses vectorized state evaluation (`states1 @ states2.conj().T`). Statevectors are pre-computed once per sample ($\mathcal{O}(N)$ calls), slashing execution time from 7 minutes to 1.01 seconds.

---

## 4. Verification & Testing

### 4.1 Running the Automated Test Suite
Execute the full pytest suite:
```powershell
& "c:\Users\P RUSHIDHAR\OneDrive\Desktop\SIH26139\Backend\.venv\Scripts\python.exe" -m pytest "quresight/tests" -v
```
All 17 tests across API, classical ML, quantum simulation, and preprocessing should report `PASSED`.

### 4.2 Verifying Backend and Frontend Status
- Backend health check:
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/health" -Method Get
  ```
- Frontend page check:
  ```powershell
  Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing
  ```
