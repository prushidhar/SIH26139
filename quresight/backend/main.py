from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import dataset, preprocessing, training, quantum_lab, explain, results
from .db.database import Database
import datetime

app = FastAPI(title="QureSight API", description="Hybrid Quantum-Classical Biomedical ML Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dataset.router)
app.include_router(preprocessing.router)
app.include_router(training.router)
app.include_router(quantum_lab.router)
app.include_router(explain.router)
app.include_router(results.router)

@app.on_event("startup")
def startup():
    db = Database()
    db.init_db()

@app.get("/api/health")
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "QureSight",
        "version": "1.0.0",
        "dataset_loaded": dataset.cached_dataset is not None,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
