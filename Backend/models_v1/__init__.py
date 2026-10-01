"""
================================================================================
QURESIGHT MODELS V1 PACKAGE
================================================================================
Exposes the canonical inference pipelines:
  - QureSight-Classical: Dedicated Classical Baseline Benchmark Pipeline
  - QureSight-VQC: Dedicated Quantum Hybrid Baseline Simulator Pipeline
  - IBM Quantum: Dedicated Fine-Tuned Real IBM Quantum Hardware QPU Pipeline
================================================================================
"""

from .cx_01_pipeline import cx_01_pipeline, CX01ClassicalPipeline
from .transfinite_1_pipeline import transfinite_1_pipeline, Transfinite1Pipeline
from .aleph_1_pipeline import aleph_1_pipeline, Aleph1QpuPipeline
from .adaptive_router import AdaptiveModelRouter
from .hepatitis_pipeline import hepatitis_pipeline, HepatitisCPipeline
from .heart_tabular_pipeline import heart_tabular_pipeline, HeartTabularPipeline
from .cxr_transfer_pipeline import cxr_transfer_pipeline, CXRCardiomegalyQMLPipeline
from .donaire_liver_pipeline import donaire_liver_pipeline, DonaireLiverQMLPipeline
from .neurological_pipeline import neurological_pipeline, NeurologicalPipeline

__all__ = [
    "cx_01_pipeline",
    "CX01ClassicalPipeline",
    "transfinite_1_pipeline",
    "Transfinite1Pipeline",
    "aleph_1_pipeline",
    "Aleph1QpuPipeline",
    "hepatitis_pipeline",
    "HepatitisCPipeline",
    "heart_tabular_pipeline",
    "HeartTabularPipeline",
    "cxr_transfer_pipeline",
    "CXRCardiomegalyQMLPipeline",
    "donaire_liver_pipeline",
    "DonaireLiverQMLPipeline",
    "neurological_pipeline",
    "NeurologicalPipeline",
    "AdaptiveModelRouter",
    "compute_calibrated_clinical_risk",
    "calculate_morphometric_evidence_index",
]
