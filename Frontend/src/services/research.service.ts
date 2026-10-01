import { apiClient } from "@/lib/api";

export interface ResearchOverview {
  research_question: string;
  hypothesis: string;
  active_experiment: {
    id: string;
    name: string;
    primary_dataset: string;
    status: string;
    updated_at: string;
  };
  strongest_classical: {
    model: string;
    accuracy: string;
    auroc: number;
    f1_score: number;
    condition: string;
    badge: string;
  };
  strongest_quantum: {
    model: string;
    accuracy: string;
    advantage_margin: string;
    p_value: string;
    condition: string;
    badge: string;
  };
  current_evidence_summary: string;
  pipeline_stages: Array<{
    id: string;
    name: string;
    status: string;
    details: string;
  }>;
}

export interface ObservatoryDatasetSummary {
  id: string;
  name: string;
  description: string;
  source: string;
  sample_count: number;
  feature_count: number;
  target_column: string;
  class_distribution: Record<string, number>;
  missing_values: number;
  missing_percentage: number;
  duplicate_rows: number;
  data_health_score: number;
  quantum_ready: boolean;
}

export interface DatasetDetail {
  success: boolean;
  id: string;
  metadata: any;
  sample_count: number;
  feature_count: number;
  feature_names: string[];
  class_distribution: Record<string, number>;
  quality_audit: {
    total_cells: number;
    missing_cells: number;
    missing_pct: number;
    duplicated_records: number;
    constant_features: number;
    data_integrity: string;
  };
  distributions: Record<string, {
    mean: number;
    std: number;
    min: number;
    q25: number;
    median: number;
    q75: number;
    max: number;
  }>;
  correlations: Record<string, Record<string, number>>;
}

export interface SignalTransformResult {
  success: boolean;
  dataset_id: string;
  n_samples: number;
  raw_feature_count: number;
  selected_features: string[];
  feature_rankings: Array<{
    feature: string;
    importance: number;
    rank: number;
  }>;
  pca_analysis: {
    components: number;
    explained_variance_ratio: number[];
    cumulative_variance: number;
    quantum_qubits_mapped: number;
  };
  latent_space_points: Array<{
    id: number;
    pc1: number;
    pc2: number;
    pc3: number;
    label: number;
    angles: number[];
  }>;
  sample_quantum_state: {
    qubit_wires: string[];
    sample_rotation_angles_rad: number[];
    encoding_gate: string;
  };
}

export interface ModelCandidate {
  id: string;
  name: string;
  family: "classical" | "quantum";
  architecture: string;
  accuracy: string;
  auroc: number;
  f1_score: number;
  sensitivity: string;
  specificity: string;
  runtime_ms: number;
  resource_cost: string;
  provenance: string;
  badge: string;
}

export interface ModelArenaResponse {
  success: boolean;
  dataset_id: string;
  candidates: ModelCandidate[];
  evaluation_protocol: string;
}

export interface QuantumFeasibilityResponse {
  success: boolean;
  verdict: string;
  verdict_summary: string;
  qubit_scaling: Array<{
    n_qubits: number;
    circuit_depth: number;
    total_gates: number;
    cnot_gates: number;
    trainable_parameters: number;
    statevector_memory_mb: number;
    simulated_latency_ms: number;
  }>;
  noise_impact: Array<{
    noise_level: string;
    depolarizing_p: number;
    vqc_accuracy: number;
    auroc: number;
    state_fidelity: number;
  }>;
  scarce_data_crossover: Array<{
    split_pct: number;
    samples: number;
    classical_svm: number;
    quantum_vqc: number;
    delta: string;
    winner: string;
  }>;
  hardware_recommendation: {
    simulator: string;
    qpu_target: string;
    mitigation_protocol: string;
  };
}

export interface EvidenceMatrixRow {
  dimension: string;
  lr: string;
  rf: string;
  xgb: string;
  svm: string;
  q_vqc: string;
  unit: string;
  leading_family: string;
}

export interface EvidenceMatrixResponse {
  success: boolean;
  matrix: EvidenceMatrixRow[];
  protocol: string;
  provenance: string;
}

export interface ExplainabilityResponse {
  success: boolean;
  dataset_id: string;
  global_concordance_index: number;
  interpretability_metrics: {
    classical_method: string;
    quantum_method: string;
    feature_attributions: Array<{
      name: string;
      label: string;
      shap_weight: number;
      quantum_sensitivity: number;
      concordance: string;
    }>;
  };
  sample_case_audit: {
    case_id: string;
    condition: string;
    classical_pred: string;
    quantum_pred: string;
    concordance_score: number;
    key_drivers: string[];
    quantum_gradient_note: string;
  };
  fidelity_guarantee: string;
}

export interface DecisionConsoleResponse {
  success: boolean;
  router_status: string;
  arbitration_protocol: string;
  entropy_threshold_bits: number;
  operational_tiers: Array<{
    tier: string;
    condition: string;
    action: string;
    latency_guarantee: string;
    cohort_coverage: string;
    badge: string;
  }>;
  safety_guardrails: string[];
  live_telemetry_stats: {
    total_screenings_routed: number;
    classical_only_resolved: number;
    dual_consensus_engaged: number;
    quantum_arbitrated_boundary: number;
    discordance_aversion_rate: string;
  };
}

export interface VaultExperiment {
  id: string;
  title: string;
  dataset: string;
  date: string;
  hypothesis: string;
  classical_baseline: string;
  quantum_result: string;
  advantage_delta: string;
  conclusion: string;
  status: string;
}

export interface VaultResponse {
  success: boolean;
  experiments: VaultExperiment[];
}

export class ResearchService {
  static async getOverview(): Promise<ResearchOverview> {
    const res = await apiClient.get<ResearchOverview>("/research/overview");
    return res.data;
  }

  static async getDatasets(): Promise<ObservatoryDatasetSummary[]> {
    const res = await apiClient.get<{ success: boolean; datasets: ObservatoryDatasetSummary[] }>("/research/datasets");
    return res.data.datasets;
  }

  static async getDatasetDetail(datasetId: string): Promise<DatasetDetail> {
    const res = await apiClient.get<DatasetDetail>(`/research/datasets/${datasetId}`);
    return res.data;
  }

  static async transformSignal(datasetId: string, nComponents: number = 4, nTopFeatures: number = 8): Promise<SignalTransformResult> {
    const res = await apiClient.post<SignalTransformResult>("/research/signal/transform", {
      dataset_id: datasetId,
      n_components: nComponents,
      n_top_features: nTopFeatures,
    });
    return res.data;
  }

  static async getModelArena(datasetId: string = "breast_cancer"): Promise<ModelArenaResponse> {
    const res = await apiClient.get<ModelArenaResponse>(`/research/models/arena?dataset_id=${datasetId}`);
    return res.data;
  }

  static async getQuantumFeasibility(): Promise<QuantumFeasibilityResponse> {
    const res = await apiClient.get<QuantumFeasibilityResponse>("/research/quantum/feasibility");
    return res.data;
  }

  static async getEvidenceMatrix(): Promise<EvidenceMatrixResponse> {
    const res = await apiClient.get<EvidenceMatrixResponse>("/research/evidence/matrix");
    return res.data;
  }

  static async getExplainability(datasetId: string = "breast_cancer"): Promise<ExplainabilityResponse> {
    const res = await apiClient.get<ExplainabilityResponse>(`/research/explainability?dataset_id=${datasetId}`);
    return res.data;
  }

  static async getDecisionConsole(): Promise<DecisionConsoleResponse> {
    const res = await apiClient.get<DecisionConsoleResponse>("/research/decision/console");
    return res.data;
  }

  static async getVaultExperiments(): Promise<VaultExperiment[]> {
    const res = await apiClient.get<VaultResponse>("/research/vault");
    return res.data.experiments;
  }

  static async getQiskitHardwareProfile(qubits: number = 4, circuitType: string = "vqc"): Promise<any> {
    const res = await apiClient.get<any>(`/research/quantum/qiskit-profile?qubits=${qubits}&circuit_type=${circuitType}`);
    return res.data;
  }

  static async getCXRCases(): Promise<any> {
    const res = await apiClient.get<any>("/research/transfer-learning/cxr-cases");
    return res.data.cases;
  }
}
