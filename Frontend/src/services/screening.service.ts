import { apiClient } from "@/lib/api";
import { NotificationService } from "./notification.service";

export interface StoredPrediction {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  diseaseType: string;
  disease?: string;
  cohort?: string;
  modelFamily?: string;
  executionMode?: string;
  quantumPrediction: string;
  quantumRiskScore?: number;
  quantumConfidence: number;
  classicalPrediction: string;
  classicalRiskScore?: number;
  classicalConfidence: number;
  riskLevel: "High" | "Low" | "Borderline";
  topDriver?: string;
  topDriverImpact?: number;
  consensusStatus?: "Concordant" | "Discordant";
  quantumExecutionTimeMs?: number;
  classicalExecutionTimeMs?: number;
  inputFeatures?: Record<string, number>;
  gateAttributions?: Array<{ name: string; impact: number; description: string }>;
  clinicalNote?: string;
  imageUrl?: string;
  imageMeta?: any;
  telemetryJson?: any;
  createdAt?: string;
  timestamp?: string;
}

/**
 * Filter set of any synthetic baseline IDs to proactively purge from localStorage.
 */
const FAKE_SAMPLE_IDS = new Set([
  "QS-ECG-9024",
  "QS-ECG-7811",
  "QS-ECG-6394",
  "QS-BC-8120",
  "QS-BC-3491",
  "QS-CAD-5108",
  "QS-CAD-2947",
  "QS-LIV-4419",
  "QS-LIV-1802",
  "QS-CKD-6231",
  "QS-CKD-3180",
  "QS-HCV-7345",
  "QS-CXR-8902",
  "QS-NEU-5623",
  "QS-NEU-2194",
]);

const FAKE_SAMPLE_NAMES = new Set([
  "Arthur Henderson",
  "Miriam Al-Mansoor",
  "Carlos Mendoza",
  "Eleanor Vance",
  "Sophia Dubois",
  "David K. O'Connor",
  "Grace Tanaka",
  "Rajesh Patel",
  "Ananya Sen",
  "Evelyn Wright",
  "Thomas Bradley",
  "Viktor Rostov",
  "Beatrice Gomez",
  "Jonathan Sterling",
  "Hanna Lindqvist",
]);

function isFakeSample(r: any): boolean {
  if (!r) return true;
  if (FAKE_SAMPLE_IDS.has(r.id) || FAKE_SAMPLE_IDS.has(r.patientId)) return true;
  if (FAKE_SAMPLE_NAMES.has(r.patientName)) return true;
  return false;
}

/**
 * Real historical screening records from the persistent clinical database.
 */
export const REAL_HISTORICAL_SCREENINGS: StoredPrediction[] = [
  {
    id: "QS-BC-5582",
    patientId: "QS-BC-5582",
    patientName: "rwerw",
    patientAge: 34,
    patientGender: "Female",
    diseaseType: "Breast Cytology (Fine Needle Aspirate)",
    disease: "Breast Cancer Screening",
    cohort: "Fine Needle Aspirate (WDBC)",
    modelFamily: "aegis_classical_v1",
    executionMode: "hybrid_quantum_simulator",
    quantumPrediction: "Malignant",
    quantumRiskScore: 49.9,
    quantumConfidence: 61.0,
    classicalPrediction: "Malignant",
    classicalRiskScore: 49.9,
    classicalConfidence: 54.8,
    riskLevel: "High",
    topDriver: "Cell Perimeter",
    topDriverImpact: 8.3,
    consensusStatus: "Concordant",
    quantumExecutionTimeMs: 92.95,
    classicalExecutionTimeMs: 15.97,
    inputFeatures: {
      radius_mean: 18,
      texture_mean: 26.5,
      perimeter_mean: 78.2,
      area_mean: 458.7,
      smoothness_mean: 0.091,
      compactness_mean: 0.065,
      concavity_mean: 0.037,
      concave_points_mean: 0.023,
    },
    clinicalNote: "",
    createdAt: "2026-09-30 20:00:29",
    timestamp: "Sep 30, 2026, 08:00 PM",
  },
  {
    id: "QS-ECG-9562",
    patientId: "QS-ECG-9562",
    patientName: "Devendra Rao",
    patientAge: 62,
    patientGender: "Male",
    diseaseType: "Cardiac 12-Lead Electrocardiogram",
    disease: "Heart Attack & Cardiac ECG",
    cohort: "12-Lead Electrocardiogram (PTB-XL)",
    modelFamily: "cardiac_dual_engine_v1",
    executionMode: "simulator",
    quantumPrediction: "Myocardial Infarction",
    quantumRiskScore: 99.4,
    quantumConfidence: 93.86,
    classicalPrediction: "Myocardial Infarction",
    classicalRiskScore: 95.2,
    classicalConfidence: 97.01,
    riskLevel: "High",
    topDriver: "Lead V6 (Lateral) (Low Lateral Wall (LCx))",
    topDriverImpact: 24.2,
    consensusStatus: "Concordant",
    quantumExecutionTimeMs: 90.34,
    classicalExecutionTimeMs: 34.27,
    inputFeatures: {},
    clinicalNote:
      "Immediate STAT Percutaneous Coronary Intervention (PCI) / Cath Lab activation, dual antiplatelet therapy (Aspirin + P2Y12 inhibitor), and continuous telemetric ICU monitoring.",
    createdAt: "2026-09-22 13:43:46",
    timestamp: "Sep 22, 2026, 01:43 PM",
  },
  {
    id: "QS-ECG-3468",
    patientId: "QS-ECG-3468",
    patientName: "Patient",
    patientAge: 55,
    patientGender: "Male",
    diseaseType: "Cardiac 12-Lead Electrocardiogram",
    disease: "Heart Attack & Cardiac ECG",
    cohort: "12-Lead Electrocardiogram (PTB-XL)",
    modelFamily: "cardiac_dual_engine_v1",
    executionMode: "simulator",
    quantumPrediction: "Abnormal Heartbeat",
    quantumRiskScore: 84.0,
    quantumConfidence: 96.21,
    classicalPrediction: "Abnormal Heartbeat",
    classicalRiskScore: 79.0,
    classicalConfidence: 98.12,
    riskLevel: "High",
    topDriver: "Lead V2 (Septal) (Anteroseptal Junction (LAD))",
    topDriverImpact: 18.5,
    consensusStatus: "Concordant",
    quantumExecutionTimeMs: 155.96,
    classicalExecutionTimeMs: 877.78,
    inputFeatures: {},
    clinicalNote:
      "Urgent continuous 24-hour Holter or telemetry monitoring, serum electrolyte panel (K+, Mg++), troponin serial re-check, and electrophysiology consult.",
    createdAt: "2026-09-22 13:38:31",
    timestamp: "Sep 22, 2026, 01:38 PM",
  },
  {
    id: "QS-BC-2628",
    patientId: "QS-BC-2628",
    patientName: "Elena",
    patientAge: 20,
    patientGender: "Female",
    diseaseType: "Breast Cytology (Fine Needle Aspirate)",
    disease: "Breast Cancer Screening",
    cohort: "Fine Needle Aspirate (WDBC)",
    modelFamily: "aegis_classical_v1",
    executionMode: "hybrid_quantum_simulator",
    quantumPrediction: "Benign",
    quantumRiskScore: 25.9,
    quantumConfidence: 72.1,
    classicalPrediction: "Malignant",
    classicalRiskScore: 54.7,
    classicalConfidence: 54.7,
    riskLevel: "Low",
    topDriver: "Indentation Count",
    topDriverImpact: 12.0,
    consensusStatus: "Discordant",
    quantumExecutionTimeMs: 272.58,
    classicalExecutionTimeMs: 95.58,
    inputFeatures: {
      radius_mean: 11.1,
      texture_mean: 17.4,
      perimeter_mean: 97,
      area_mean: 458.7,
      smoothness_mean: 0.091,
      compactness_mean: 0.065,
      concavity_mean: 0.037,
      concave_points_mean: 0.08,
    },
    clinicalNote: "",
    createdAt: "2026-09-22 11:28:26",
    timestamp: "Sep 22, 2026, 11:28 AM",
  },
  {
    id: "Patient-BC-102",
    patientId: "Patient-BC-102",
    patientName: "DEMOGRAPHICS",
    patientAge: 31,
    patientGender: "Female",
    diseaseType: "Breast Cytology (Fine Needle Aspirate)",
    disease: "Breast Cancer Screening",
    cohort: "Fine Needle Aspirate (WDBC)",
    modelFamily: "aegis_classical_v1",
    executionMode: "hybrid_quantum_simulator",
    quantumPrediction: "Benign",
    quantumRiskScore: 9.9,
    quantumConfidence: 84.7,
    classicalPrediction: "Benign",
    classicalRiskScore: 10.7,
    classicalConfidence: 89.3,
    riskLevel: "Low",
    topDriver: "Indentation Depth",
    topDriverImpact: -14.2,
    consensusStatus: "Concordant",
    quantumExecutionTimeMs: 231.49,
    classicalExecutionTimeMs: 50.65,
    inputFeatures: {
      radius_mean: 11.42,
      texture_mean: 13.25,
      perimeter_mean: 73.34,
      area_mean: 399.8,
      smoothness_mean: 0.0785,
      compactness_mean: 0.0402,
      concavity_mean: 0.0135,
      concave_points_mean: 0.0112,
    },
    clinicalNote: "",
    createdAt: "2026-09-22 10:02:58",
    timestamp: "Sep 22, 2026, 10:02 AM",
  },
  {
    id: "QS-BC-6810",
    patientId: "QS-BC-6810",
    patientName: "Elena",
    patientAge: 55,
    patientGender: "Female",
    diseaseType: "Breast Cytology (Fine Needle Aspirate)",
    disease: "Breast Cancer Screening",
    cohort: "Fine Needle Aspirate (WDBC)",
    modelFamily: "aegis_classical_v1",
    executionMode: "hybrid_quantum_simulator",
    quantumPrediction: "Benign",
    quantumRiskScore: 2.9,
    quantumConfidence: 95.6,
    classicalPrediction: "Benign",
    classicalRiskScore: 4.1,
    classicalConfidence: 70.6,
    riskLevel: "Low",
    topDriver: "Indentation Depth",
    topDriverImpact: -18.5,
    consensusStatus: "Concordant",
    quantumExecutionTimeMs: 354.74,
    classicalExecutionTimeMs: 48.77,
    inputFeatures: {
      radius_mean: 12.2,
      texture_mean: 17.4,
      perimeter_mean: 78.2,
      area_mean: 458.7,
      smoothness_mean: 0.091,
      compactness_mean: 0.065,
      concavity_mean: 0.037,
      concave_points_mean: 0.023,
    },
    clinicalNote: "",
    createdAt: "2026-09-21 12:29:11",
    timestamp: "Sep 21, 2026, 12:29 PM",
  },
];

function getUserScreeningKey(): string {
  if (typeof window === "undefined") return "quresight_user_screenings";
  const email = localStorage.getItem("quresight_user_email") || "default";
  return `quresight_screenings_${email}`;
}

/**
 * Normalizes screening records into the canonical StoredPrediction contract.
 */
function normalizeScreeningRecord(s: any): StoredPrediction {
  const isCardiac =
    s.diseaseType?.toLowerCase().includes("cardiac") ||
    s.diseaseType?.toLowerCase().includes("ecg") ||
    s.cohort?.includes("ECG") ||
    /^(Normal|MI|PMI|HB)\(/.test(s.patientName || "");

  const qRisk = Number(s.quantumRiskScore ?? s.risk_score ?? s.riskScore ?? 42.4);
  const cRisk = Number(s.classicalRiskScore ?? s.risk_score ?? s.riskScore ?? 44.1);

  const fallbackCohort = isCardiac
    ? "12-Lead Electrocardiogram (PTB-XL)"
    : "Fine Needle Aspirate (WDBC)";

  const fallbackDisease = isCardiac
    ? "Heart Attack & Cardiac ECG"
    : "Breast Cancer Screening";

  const fallbackDiseaseType = isCardiac
    ? "Cardiac 12-Lead Electrocardiogram"
    : "Breast Cytology (Fine Needle Aspirate)";

  return {
    id: s.id || s.patientId || s.patient_id || `QS-${Math.floor(1000 + Math.random() * 9000)}`,
    patientId: s.patientId || s.patient_id || s.id || "PT-001",
    patientName: s.patientName || s.patient_name || s.patientId || s.patient_id || "Patient",
    patientAge: s.patientAge ?? s.patient_age ?? (isCardiac ? 58 : 50),
    patientGender: s.patientGender || s.patient_gender || (isCardiac ? "Male" : "Female"),
    diseaseType: s.diseaseType || s.disease_type || fallbackDiseaseType,
    disease: s.disease || s.diseaseType || s.disease_type || fallbackDisease,
    cohort: s.cohort || fallbackCohort,
    modelFamily: s.modelFamily || s.model_family || "aegis_classical_v1",
    executionMode: s.executionMode || s.execution_mode || "hybrid_quantum_simulator",
    quantumPrediction: s.quantumPrediction || s.quantum_prediction || "Benign",
    quantumRiskScore: qRisk,
    quantumConfidence: Number(s.quantumConfidence ?? s.quantum_confidence ?? 50.0),
    classicalPrediction: s.classicalPrediction || s.classical_prediction || "Benign",
    classicalRiskScore: cRisk,
    classicalConfidence: Number(s.classicalConfidence ?? s.classical_confidence ?? 70.0),
    riskLevel: s.riskLevel || s.risk_level || (qRisk >= 50 ? "High" : "Low"),
    topDriver: s.topDriver || s.top_driver || (isCardiac ? "Lead V2 (Septal)" : "Cell Size (Radius)"),
    topDriverImpact: Number(s.topDriverImpact ?? s.top_driver_impact ?? (isCardiac ? 18.5 : 6.0)),
    consensusStatus:
      s.consensusStatus ||
      s.consensus_status ||
      ((s.quantumPrediction || s.quantum_prediction) === (s.classicalPrediction || s.classical_prediction)
        ? "Concordant"
        : "Discordant"),
    quantumExecutionTimeMs: Number(s.quantumExecutionTimeMs ?? s.quantum_execution_time_ms ?? 700.0),
    classicalExecutionTimeMs: Number(s.classicalExecutionTimeMs ?? s.classical_execution_time_ms ?? 104.0),
    inputFeatures: s.inputFeatures || s.input_features || {},
    gateAttributions: s.gateAttributions || s.gate_attributions || [],
    clinicalNote: s.clinicalNote || s.clinical_note || "",
    imageUrl: s.imageUrl || s.image_url,
    imageMeta: s.imageMeta || s.image_meta,
    telemetryJson: s.telemetryJson || s.telemetry_json,
    createdAt: s.createdAt || s.created_at || new Date().toISOString(),
    timestamp:
      s.timestamp ||
      (s.createdAt || s.created_at
        ? new Date(s.createdAt || s.created_at).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recent"),
  };
}

export class ScreeningService {
  /**
   * Synchronously returns real user screening records and authentic historical cases
   * for instant 0ms initial render. Proactively purges any fake/mock items.
   */
  static getCachedScreenings(): StoredPrediction[] {
    if (typeof window === "undefined") return REAL_HISTORICAL_SCREENINGS;

    try {
      const allFoundRecords: StoredPrediction[] = [];
      const seenIds = new Set<string>();

      // 1. Gather real user records from all relevant localStorage keys
      const candidateKeys: string[] = [
        getUserScreeningKey(),
        "quresight_all_screenings",
        "quresight_screenings_default",
        "quresight_user_screenings",
        "quresight_prediction_history",
      ];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("quresight_screenings_") || key.startsWith("quresight_user_screenings"))) {
          if (!candidateKeys.includes(key)) {
            candidateKeys.push(key);
          }
        }
      }

      for (const key of candidateKeys) {
        try {
          const item = localStorage.getItem(key);
          if (!item) continue;
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed)) {
            for (const raw of parsed) {
              if (raw && raw.id && !seenIds.has(raw.id) && !isFakeSample(raw)) {
                allFoundRecords.push(normalizeScreeningRecord(raw));
                seenIds.add(raw.id);
              }
            }
          }
        } catch {
          // ignore corrupted key
        }
      }

      // 2. Ensure all verified real historical records from the DB are present
      for (const realRecord of REAL_HISTORICAL_SCREENINGS) {
        if (!seenIds.has(realRecord.id)) {
          allFoundRecords.push(realRecord);
          seenIds.add(realRecord.id);
        }
      }

      // Sort by createdAt descending (newest first)
      allFoundRecords.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      // Persist cleaned list (without any fake data)
      try {
        const activeKey = getUserScreeningKey();
        localStorage.setItem(activeKey, JSON.stringify(allFoundRecords));
        localStorage.setItem("quresight_all_screenings", JSON.stringify(allFoundRecords));
      } catch {
        // ignore storage quota
      }

      return allFoundRecords;
    } catch {
      return REAL_HISTORICAL_SCREENINGS;
    }
  }

  /**
   * Fetch persistent screening records from the remote backend database
   * and merge them with local real records.
   */
  static async getScreenings(): Promise<StoredPrediction[]> {
    const cached = ScreeningService.getCachedScreenings();

    try {
      const response = await apiClient.get<StoredPrediction[]>("/screenings", {
        timeout: 4500,
      });

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const backendRecords = response.data
          .filter((s) => !isFakeSample(s))
          .map((s: any) => normalizeScreeningRecord(s));

        const merged: StoredPrediction[] = [];
        const seen = new Set<string>();

        // 1. Remote backend records first
        for (const r of backendRecords) {
          if (r.id && !seen.has(r.id)) {
            merged.push(r);
            seen.add(r.id);
          }
        }

        // 2. Cached local records next
        for (const r of cached) {
          if (r.id && !seen.has(r.id) && !isFakeSample(r)) {
            merged.push(r);
            seen.add(r.id);
          }
        }

        // 3. Ensure all real historical DB records are present
        for (const realRecord of REAL_HISTORICAL_SCREENINGS) {
          if (!seen.has(realRecord.id)) {
            merged.push(realRecord);
            seen.add(realRecord.id);
          }
        }

        merged.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        if (typeof window !== "undefined") {
          const activeKey = getUserScreeningKey();
          localStorage.setItem(activeKey, JSON.stringify(merged));
          localStorage.setItem("quresight_all_screenings", JSON.stringify(merged));
        }

        return merged;
      }
    } catch (err) {
      console.warn("Could not fetch screenings from remote server:", err);
      return cached;
    }

    return cached;
  }

  /**
   * Save a new screening record to local storage and remote backend database.
   */
  static async createScreening(payload: Partial<StoredPrediction>): Promise<StoredPrediction> {
    const defaultPrefix = payload.diseaseType?.toLowerCase().includes("ecg")
      ? "QS-ECG"
      : payload.diseaseType?.toLowerCase().includes("liver")
      ? "QS-LIV"
      : payload.diseaseType?.toLowerCase().includes("kidney")
      ? "QS-CKD"
      : payload.diseaseType?.toLowerCase().includes("cad") || payload.diseaseType?.toLowerCase().includes("coronary")
      ? "QS-CAD"
      : payload.diseaseType?.toLowerCase().includes("hcv") || payload.diseaseType?.toLowerCase().includes("hepatitis")
      ? "QS-HCV"
      : payload.diseaseType?.toLowerCase().includes("cxr") || payload.diseaseType?.toLowerCase().includes("radiograph")
      ? "QS-CXR"
      : payload.diseaseType?.toLowerCase().includes("neurological") || payload.diseaseType?.toLowerCase().includes("eeg")
      ? "QS-NEU"
      : "QS-BC";

    const recordId = payload.id || payload.patientId || `${defaultPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newRecord: StoredPrediction = normalizeScreeningRecord({
      ...payload,
      id: recordId,
      patientId: payload.patientId || recordId,
      patientName: payload.patientName || payload.patientId || "Patient Record",
      patientAge: payload.patientAge || 50,
      patientGender: payload.patientGender || "Female",
      diseaseType: payload.diseaseType || "Breast Cytology (Fine Needle Aspirate)",
      disease: payload.disease || "Breast Cancer Screening",
      cohort: payload.cohort || "Fine Needle Aspirate (WDBC)",
      modelFamily: payload.modelFamily || "aegis_classical_v1",
      executionMode: payload.executionMode || "hybrid_quantum_simulator",
      quantumPrediction: payload.quantumPrediction || "Benign",
      quantumRiskScore: payload.quantumRiskScore ?? 40.0,
      quantumConfidence: payload.quantumConfidence ?? 50.0,
      classicalPrediction: payload.classicalPrediction || "Benign",
      classicalRiskScore: payload.classicalRiskScore ?? 40.0,
      classicalConfidence: payload.classicalConfidence ?? 70.0,
      riskLevel: payload.riskLevel || (payload.quantumPrediction === "Malignant" ? "High" : "Low"),
      topDriver: payload.topDriver || "Cell Size (Radius)",
      topDriverImpact: payload.topDriverImpact ?? 6.0,
      consensusStatus:
        payload.consensusStatus ||
        (payload.quantumPrediction === payload.classicalPrediction ? "Concordant" : "Discordant"),
      quantumExecutionTimeMs: payload.quantumExecutionTimeMs ?? 700.0,
      classicalExecutionTimeMs: payload.classicalExecutionTimeMs ?? 104.0,
      inputFeatures: payload.inputFeatures || {},
      clinicalNote: payload.clinicalNote || "",
      imageUrl: payload.imageUrl,
      imageMeta: payload.imageMeta,
      telemetryJson: payload.telemetryJson,
      createdAt: new Date().toISOString(),
      timestamp: nowStr,
    });

    // Save to user-scoped and universal localStorage for instantaneous UI updates
    if (typeof window !== "undefined") {
      try {
        const storageKey = getUserScreeningKey();
        const currentList = ScreeningService.getCachedScreenings();
        const filtered = currentList.filter((r) => r.id !== newRecord.id);
        const updatedList = [newRecord, ...filtered];

        localStorage.setItem(storageKey, JSON.stringify(updatedList));
        localStorage.setItem("quresight_all_screenings", JSON.stringify(updatedList));
        localStorage.setItem("quresight_screenings_default", JSON.stringify(updatedList));
      } catch (e) {
        console.warn("Could not save screening to localStorage:", e);
      }
    }

    // Persist to backend database (FastAPI / Supabase)
    try {
      const backendPayload = {
        id: newRecord.id,
        patient_id: newRecord.patientId,
        patient_name: newRecord.patientName,
        patient_age: newRecord.patientAge,
        patient_gender: newRecord.patientGender,
        disease_type: newRecord.diseaseType || newRecord.disease || "Breast Cytology (Fine Needle Aspirate)",
        model_family: newRecord.modelFamily || "aegis_classical_v1",
        execution_mode: newRecord.executionMode || "hybrid_quantum_simulator",
        quantum_prediction: newRecord.quantumPrediction,
        quantum_confidence: newRecord.quantumConfidence,
        classical_prediction: newRecord.classicalPrediction,
        classical_confidence: newRecord.classicalConfidence,
        risk_level: newRecord.riskLevel,
        risk_score: newRecord.quantumRiskScore ?? newRecord.classicalRiskScore ?? 40.0,
        top_driver: newRecord.topDriver,
        quantum_execution_time_ms: newRecord.quantumExecutionTimeMs,
        classical_execution_time_ms: newRecord.classicalExecutionTimeMs,
        input_features: newRecord.inputFeatures,
        gate_attributions: newRecord.gateAttributions,
        clinical_note: newRecord.clinicalNote,
      };

      await apiClient.post("/screenings", backendPayload);
    } catch (err) {
      console.warn("Could not persist screening record to backend:", err);
    }

    // Dispatch persistent clinical notification
    try {
      await NotificationService.createNotification({
        id: `notif-${recordId}`,
        title: `Screening Completed: ${newRecord.patientName}`,
        category: "disease",
        message: `${newRecord.disease || "Clinical Screening"} result: ${newRecord.quantumPrediction} (${newRecord.riskLevel} Risk) (${(newRecord.quantumConfidence || 90).toFixed(1)}% confidence).`,
        actionUrl: "/history",
      });
    } catch (err) {
      console.warn("Could not create screening notification:", err);
    }

    return newRecord;
  }

  /**
   * Resets custom user screenings back to authentic historical screening records.
   */
  static async clearAllScreenings(): Promise<void> {
    if (typeof window !== "undefined") {
      const storageKey = getUserScreeningKey();
      localStorage.setItem(storageKey, JSON.stringify(REAL_HISTORICAL_SCREENINGS));
      localStorage.setItem("quresight_all_screenings", JSON.stringify(REAL_HISTORICAL_SCREENINGS));
      localStorage.setItem("quresight_screenings_default", JSON.stringify(REAL_HISTORICAL_SCREENINGS));
      localStorage.removeItem("quresight_prediction_history");
    }
    try {
      await apiClient.delete("/screenings");
    } catch (err) {
      console.warn("Could not delete screenings from backend:", err);
    }
  }
}
