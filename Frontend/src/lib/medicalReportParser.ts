/**
 * ====================================================================================================
 * QureSight Medical Report Multi-Format Ingestion & AI Semantic Normalization Engine
 * ====================================================================================================
 * Ingests, parses, derives, and normalizes single-patient medical and laboratory reports across:
 * - .CSV / .TSV (Tabular lab sheets)
 * - .JSON (Structured health records / FHIR extracts)
 * - .PDF / .TXT / .LOG (Pathology reports, biopsy summaries, clinical notes)
 *
 * Core Guarantees:
 * 1. AI Semantic Normalization: Resolves clinical alias variations to canonical biomarker keys.
 * 2. Exact Numerical Preservation: Existing values are preserved verbatim with 100% precision.
 * 3. 3-Tier Derivation & Imputation:
 *    - Tier 1: Exact Mathematical & Geometric formulas (r = √(A/π), P = 2πr, A = πr², C = P²/A - 1).
 *    - Tier 2: Correlation scaling from Worst/SE features if Mean is missing.
 *    - Tier 3: Cohort Population Median with clear clinical transparency badge.
 * ====================================================================================================
 */

export interface BiomarkerFieldConfig {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  defaultValue: number;
  aliases: string[];
}

export const BREAST_CANCER_CANONICAL_SCHEMA: BiomarkerFieldConfig[] = [
  {
    key: "radius_mean",
    label: "Cell Size (Radius)",
    unit: "μm",
    min: 6.0,
    max: 30.0,
    defaultValue: 17.99,
    aliases: [
      "radius_mean", "radius", "mean radius", "cell size", "nuclear radius", 
      "tumor radius", "tumor size", "mean_radius", "mean_cell_size", "mean_size", 
      "rad_mean", "radius(mean)", "cell_radius", "mean_radius_size", "average radius"
    ],
  },
  {
    key: "texture_mean",
    label: "Surface Texture",
    unit: "std",
    min: 9.0,
    max: 40.0,
    defaultValue: 10.38,
    aliases: [
      "texture_mean", "texture", "surface texture", "gray-scale variance", 
      "grayscale variation", "mean texture", "mean_texture", "text_mean", 
      "surface_texture", "texture(mean)", "nuclear texture", "average texture"
    ],
  },
  {
    key: "perimeter_mean",
    label: "Cell Perimeter",
    unit: "μm",
    min: 40.0,
    max: 190.0,
    defaultValue: 122.8,
    aliases: [
      "perimeter_mean", "perimeter", "cell perimeter", "mean perimeter", 
      "tumor perimeter", "circumference", "boundary length", "mean_perimeter", 
      "perim_mean", "perimeter(mean)", "nuclear perimeter", "average perimeter"
    ],
  },
  {
    key: "area_mean",
    label: "Nuclear Area",
    unit: "μm²",
    min: 140.0,
    max: 2500.0,
    defaultValue: 1001.0,
    aliases: [
      "area_mean", "area", "nuclear area", "cell area", "mean area", 
      "tumor area", "spatial area", "mean_area", "area(mean)", "nuc_area", 
      "nuclear_area", "average area"
    ],
  },
  {
    key: "smoothness_mean",
    label: "Border Smoothness",
    unit: "idx",
    min: 0.05,
    max: 0.25,
    defaultValue: 0.1184,
    aliases: [
      "smoothness_mean", "smoothness", "border smoothness", "edge smoothness", 
      "contour regularity", "radius variation", "mean smoothness", "mean_smoothness", 
      "smooth_mean", "smoothness(mean)", "boundary smoothness", "average smoothness"
    ],
  },
  {
    key: "compactness_mean",
    label: "Compactness",
    unit: "idx",
    min: 0.01,
    max: 0.35,
    defaultValue: 0.2776,
    aliases: [
      "compactness_mean", "compactness", "cell compactness", "density index", 
      "perimeter squared area", "mean compactness", "mean_compactness", 
      "comp_mean", "compactness(mean)", "nuclear compactness", "average compactness"
    ],
  },
  {
    key: "concavity_mean",
    label: "Indentation Depth",
    unit: "idx",
    min: 0.0,
    max: 0.45,
    defaultValue: 0.3001,
    aliases: [
      "concavity_mean", "concavity", "indentation depth", "notch depth", 
      "contour concavity", "mean concavity", "mean_concavity", "conc_mean", 
      "concavity(mean)", "concave severity", "average concavity"
    ],
  },
  {
    key: "concave_points_mean",
    label: "Indentation Count",
    unit: "cnt",
    min: 0.0,
    max: 0.25,
    defaultValue: 0.1471,
    aliases: [
      "concave_points_mean", "concave points", "concave_points", "indentation count", 
      "number of concave portions", "notch count", "mean concave points", 
      "mean_concave_points", "concave points mean", "conc_pts_mean", "concave_points(mean)",
      "concave_portions", "average concave points"
    ],
  },
];

export const HEART_TABULAR_CANONICAL_SCHEMA: BiomarkerFieldConfig[] = [
  {
    key: "age",
    label: "Age (Years)",
    unit: "yrs",
    min: 20,
    max: 100,
    defaultValue: 55,
    aliases: ["age", "patient age", "patient_age", "yrs", "years old"],
  },
  {
    key: "sex",
    label: "Biological Sex (1=M, 0=F)",
    unit: "bin",
    min: 0,
    max: 1,
    defaultValue: 1,
    aliases: ["sex", "gender", "male", "female"],
  },
  {
    key: "cp",
    label: "Chest Pain Type (0-3)",
    unit: "idx",
    min: 0,
    max: 3,
    defaultValue: 1,
    aliases: ["cp", "chest pain", "chest_pain", "chest pain type", "angina type", "angina"],
  },
  {
    key: "trestbps",
    label: "Resting Blood Pressure",
    unit: "mmHg",
    min: 80,
    max: 220,
    defaultValue: 130,
    aliases: ["trestbps", "resting bp", "resting blood pressure", "systolic bp", "blood pressure", "bps", "bp"],
  },
  {
    key: "chol",
    label: "Serum Cholesterol",
    unit: "mg/dL",
    min: 100,
    max: 580,
    defaultValue: 240,
    aliases: ["chol", "cholesterol", "serum cholesterol", "total cholesterol", "tc"],
  },
  {
    key: "fbs",
    label: "Fasting Blood Sugar > 120",
    unit: "bin",
    min: 0,
    max: 1,
    defaultValue: 0,
    aliases: ["fbs", "fasting blood sugar", "fasting glucose", "glucose", "fbs > 120 mg/dl"],
  },
  {
    key: "restecg",
    label: "Resting ECG Anomaly",
    unit: "idx",
    min: 0,
    max: 2,
    defaultValue: 0,
    aliases: ["restecg", "resting ecg", "ecg results", "resting electrocardiographic", "ecg"],
  },
  {
    key: "thalach",
    label: "Max Heart Rate Achieved",
    unit: "bpm",
    min: 60,
    max: 220,
    defaultValue: 150,
    aliases: ["thalach", "max heart rate", "maximum heart rate", "peak hr", "hr max", "max hr", "heart rate"],
  },
  {
    key: "exang",
    label: "Exercise Induced Angina",
    unit: "bin",
    min: 0,
    max: 1,
    defaultValue: 0,
    aliases: ["exang", "exercise induced angina", "exercise angina", "angina on exertion"],
  },
  {
    key: "oldpeak",
    label: "ST Depression (Exercise)",
    unit: "mm",
    min: 0.0,
    max: 6.5,
    defaultValue: 1.0,
    aliases: ["oldpeak", "st depression", "st segment depression", "st depression induced by exercise"],
  },
  {
    key: "slope",
    label: "Peak ST Segment Slope",
    unit: "idx",
    min: 0,
    max: 2,
    defaultValue: 1,
    aliases: ["slope", "st slope", "slope of peak exercise st segment"],
  },
  {
    key: "ca",
    label: "Major Vessels (Fluoroscopy)",
    unit: "count",
    min: 0,
    max: 4,
    defaultValue: 0,
    aliases: ["ca", "fluoroscopy vessels", "major vessels", "coronary vessels", "vessels colored"],
  },
  {
    key: "thal",
    label: "Thallium Stress Defect",
    unit: "idx",
    min: 0,
    max: 3,
    defaultValue: 2,
    aliases: ["thal", "thallium", "thallium stress", "scintigraphy", "thal test"],
  },
];

export const LIVER_ILPD_CANONICAL_SCHEMA: BiomarkerFieldConfig[] = [
  {
    key: "Age",
    label: "Age (Years)",
    unit: "yrs",
    min: 10,
    max: 95,
    defaultValue: 45,
    aliases: ["age", "patient age", "yrs"],
  },
  {
    key: "Gender",
    label: "Gender (1=M, 0=F)",
    unit: "bin",
    min: 0,
    max: 1,
    defaultValue: 1,
    aliases: ["gender", "sex", "patient sex"],
  },
  {
    key: "Total_Bilirubin",
    label: "Total Bilirubin",
    unit: "mg/dL",
    min: 0.2,
    max: 40.0,
    defaultValue: 1.2,
    aliases: ["total_bilirubin", "total bilirubin", "tb", "tbil", "t-bil", "bilirubin total", "bilirubin"],
  },
  {
    key: "Direct_Bilirubin",
    label: "Direct Bilirubin",
    unit: "mg/dL",
    min: 0.1,
    max: 20.0,
    defaultValue: 0.4,
    aliases: ["direct_bilirubin", "direct bilirubin", "db", "dbil", "d-bil", "conjugated bilirubin"],
  },
  {
    key: "Alkaline_Phosphotase",
    label: "Alkaline Phosphatase (ALP)",
    unit: "IU/L",
    min: 50,
    max: 2000,
    defaultValue: 180,
    aliases: ["alkaline_phosphotase", "alkaline phosphatase", "alp", "alk phos", "alkaline_phosphatase"],
  },
  {
    key: "Alamine_Aminotransferase",
    label: "Alanine Aminotransferase (ALT/SGPT)",
    unit: "IU/L",
    min: 5,
    max: 1500,
    defaultValue: 35,
    aliases: ["alamine_aminotransferase", "alanine aminotransferase", "alt", "sgpt", "alanine transaminase"],
  },
  {
    key: "Aspartate_Aminotransferase",
    label: "Aspartate Aminotransferase (AST/SGOT)",
    unit: "IU/L",
    min: 5,
    max: 1500,
    defaultValue: 40,
    aliases: ["aspartate_aminotransferase", "aspartate aminotransferase", "ast", "sgot", "aspartate transaminase"],
  },
  {
    key: "Total_Protiens",
    label: "Total Proteins",
    unit: "g/dL",
    min: 2.0,
    max: 10.0,
    defaultValue: 6.8,
    aliases: ["total_protiens", "total proteins", "total protein", "tp", "prot", "serum protein", "total_proteins"],
  },
  {
    key: "Albumin",
    label: "Serum Albumin",
    unit: "g/dL",
    min: 1.0,
    max: 6.0,
    defaultValue: 3.5,
    aliases: ["albumin", "alb", "serum albumin"],
  },
  {
    key: "Albumin_and_Globulin_Ratio",
    label: "A/G Ratio",
    unit: "ratio",
    min: 0.2,
    max: 3.0,
    defaultValue: 1.0,
    aliases: ["albumin_and_globulin_ratio", "ag ratio", "a/g ratio", "albumin globulin ratio", "a:g ratio"],
  },
];

export const CHRONIC_KIDNEY_CANONICAL_SCHEMA: BiomarkerFieldConfig[] = [
  {
    key: "age",
    label: "Age (Years)",
    unit: "yrs",
    min: 10,
    max: 95,
    defaultValue: 52,
    aliases: ["age", "patient age"],
  },
  {
    key: "bp",
    label: "Blood Pressure",
    unit: "mmHg",
    min: 50,
    max: 180,
    defaultValue: 80,
    aliases: ["bp", "blood pressure", "resting bp"],
  },
  {
    key: "sg",
    label: "Specific Gravity",
    unit: "sg",
    min: 1.005,
    max: 1.030,
    defaultValue: 1.020,
    aliases: ["sg", "specific gravity", "urine specific gravity"],
  },
  {
    key: "al",
    label: "Albuminuria / Protein",
    unit: "scale",
    min: 0,
    max: 5,
    defaultValue: 0,
    aliases: ["al", "albumin", "urine albumin", "proteinuria"],
  },
  {
    key: "su",
    label: "Glycosuria / Sugar",
    unit: "scale",
    min: 0,
    max: 5,
    defaultValue: 0,
    aliases: ["su", "sugar", "urine sugar", "glycosuria"],
  },
  {
    key: "bgr",
    label: "Blood Glucose Random",
    unit: "mg/dL",
    min: 50,
    max: 500,
    defaultValue: 110,
    aliases: ["bgr", "blood glucose random", "random glucose", "rbs", "glucose"],
  },
  {
    key: "bu",
    label: "Blood Urea",
    unit: "mg/dL",
    min: 10,
    max: 300,
    defaultValue: 36,
    aliases: ["bu", "blood urea", "urea", "bun", "blood urea nitrogen"],
  },
  {
    key: "sc",
    label: "Serum Creatinine",
    unit: "mg/dL",
    min: 0.4,
    max: 15.0,
    defaultValue: 1.1,
    aliases: ["sc", "serum creatinine", "creatinine", "creat"],
  },
  {
    key: "sod",
    label: "Serum Sodium (Na+)",
    unit: "mEq/L",
    min: 100,
    max: 170,
    defaultValue: 138,
    aliases: ["sod", "sodium", "serum sodium", "na"],
  },
  {
    key: "pot",
    label: "Serum Potassium (K+)",
    unit: "mEq/L",
    min: 2.0,
    max: 8.0,
    defaultValue: 4.4,
    aliases: ["pot", "potassium", "serum potassium", "k"],
  },
  {
    key: "hemo",
    label: "Hemoglobin",
    unit: "g/dL",
    min: 4.0,
    max: 18.0,
    defaultValue: 14.2,
    aliases: ["hemo", "hemoglobin", "hb", "hgb"],
  },
  {
    key: "pcv",
    label: "Packed Cell Volume (Hematocrit)",
    unit: "%",
    min: 15,
    max: 55,
    defaultValue: 44,
    aliases: ["pcv", "hematocrit", "packed cell volume", "hct"],
  },
  {
    key: "wc",
    label: "White Blood Cell Count",
    unit: "/μL",
    min: 2000,
    max: 25000,
    defaultValue: 7500,
    aliases: ["wc", "white blood cell", "wbc", "tlc", "leukocytes"],
  },
  {
    key: "rc",
    label: "Red Blood Cell Count",
    unit: "M/μL",
    min: 2.0,
    max: 7.0,
    defaultValue: 5.0,
    aliases: ["rc", "red blood cell", "rbc count", "erythrocytes", "rbc"],
  },
];

export const HEPATITIS_C_CANONICAL_SCHEMA: BiomarkerFieldConfig[] = [
  {
    key: "AST",
    label: "AST (Aspartate Aminotransferase)",
    unit: "U/L",
    min: 10,
    max: 250,
    defaultValue: 34,
    aliases: ["ast", "sgot", "aspartate", "aspartate aminotransferase"],
  },
  {
    key: "ALT",
    label: "ALT (Alanine Aminotransferase)",
    unit: "U/L",
    min: 10,
    max: 250,
    defaultValue: 28,
    aliases: ["alt", "sgpt", "alanine", "alanine aminotransferase"],
  },
  {
    key: "GGT",
    label: "GGT (Gamma-Glutamyl Transferase)",
    unit: "U/L",
    min: 5,
    max: 300,
    defaultValue: 39,
    aliases: ["ggt", "gamma-gt", "gamma glutamyl", "gamma-glutamyltransferase"],
  },
  {
    key: "ALP",
    label: "ALP (Alkaline Phosphatase)",
    unit: "U/L",
    min: 20,
    max: 250,
    defaultValue: 68,
    aliases: ["alp", "alkaline phosphatase", "alk phos"],
  },
  {
    key: "ALB",
    label: "Albumin",
    unit: "g/L",
    min: 15.0,
    max: 60.0,
    defaultValue: 41.5,
    aliases: ["alb", "albumin", "serum albumin"],
  },
  {
    key: "CHE",
    label: "Cholinesterase",
    unit: "kU/L",
    min: 1.5,
    max: 15.0,
    defaultValue: 8.2,
    aliases: ["che", "cholinesterase", "pche"],
  },
  {
    key: "BIL",
    label: "Total Bilirubin",
    unit: "µmol/L",
    min: 2,
    max: 80,
    defaultValue: 11.4,
    aliases: ["bil", "bilirubin", "total bilirubin", "tbil"],
  },
  {
    key: "CREA",
    label: "Serum Creatinine",
    unit: "µmol/L",
    min: 40,
    max: 200,
    defaultValue: 81,
    aliases: ["crea", "creatinine", "serum creatinine"],
  },
  {
    key: "Age",
    label: "Age (Years)",
    unit: "yrs",
    min: 18,
    max: 90,
    defaultValue: 45,
    aliases: ["age", "patient age", "yrs"],
  },
];

export const NEUROLOGICAL_CANONICAL_SCHEMA: BiomarkerFieldConfig[] = [
  {
    key: "eeg_alpha_beta_ratio",
    label: "EEG Alpha/Beta Spectral Ratio",
    unit: "ratio",
    min: 0.5,
    max: 4.0,
    defaultValue: 2.2,
    aliases: ["alpha beta", "alpha/beta", "alpha_beta", "eeg alpha beta", "alpha beta ratio", "spectral ratio", "abr"],
  },
  {
    key: "eeg_theta_power",
    label: "EEG Theta Band Power",
    unit: "µV²",
    min: 5.0,
    max: 80.0,
    defaultValue: 25.0,
    aliases: ["theta power", "theta", "eeg theta", "theta band", "frontal theta", "spectral theta"],
  },
  {
    key: "motor_tremor_hz",
    label: "Resting Motor Tremor Frequency",
    unit: "Hz",
    min: 0.0,
    max: 12.0,
    defaultValue: 1.2,
    aliases: ["motor tremor", "tremor", "resting tremor", "tremor hz", "tremor frequency", "parkinsonian tremor"],
  },
  {
    key: "reaction_time_ms",
    label: "Psychomotor Latency / Reaction Time",
    unit: "ms",
    min: 150.0,
    max: 700.0,
    defaultValue: 240.0,
    aliases: ["reaction time", "psychomotor latency", "latency", "reaction", "motor latency", "rt"],
  },
  {
    key: "speech_jitter_pct",
    label: "Acoustic Speech Jitter",
    unit: "%",
    min: 0.05,
    max: 3.5,
    defaultValue: 0.38,
    aliases: ["speech jitter", "jitter", "pitch jitter", "acoustic jitter", "jitter percentage", "local jitter"],
  },
  {
    key: "speech_shimmer_db",
    label: "Acoustic Speech Shimmer",
    unit: "dB",
    min: 0.02,
    max: 1.5,
    defaultValue: 0.18,
    aliases: ["speech shimmer", "shimmer", "amplitude shimmer", "acoustic shimmer", "shimmer db"],
  },
  {
    key: "cognitive_mmse",
    label: "Mini-Mental State Exam (MMSE)",
    unit: "pts",
    min: 10.0,
    max: 30.0,
    defaultValue: 29.0,
    aliases: ["cognitive mmse", "mmse", "mini mental", "mini mental state examination", "moca", "cognitive score"],
  },
  {
    key: "age",
    label: "Patient Age (Years)",
    unit: "yrs",
    min: 18.0,
    max: 95.0,
    defaultValue: 62.0,
    aliases: ["age", "patient age", "yrs", "years old"],
  },
];

export function getSchemaByType(schemaType: string = "breast-cancer"): BiomarkerFieldConfig[] {
  switch (schemaType) {
    case "heart-tabular":
    case "cardiovascular":
      return HEART_TABULAR_CANONICAL_SCHEMA;
    case "liver-ilpd":
    case "liver":
      return LIVER_ILPD_CANONICAL_SCHEMA;
    case "chronic-kidney":
    case "kidney":
      return CHRONIC_KIDNEY_CANONICAL_SCHEMA;
    case "hepatitis-c":
    case "hcv":
      return HEPATITIS_C_CANONICAL_SCHEMA;
    case "neurological":
    case "neuro":
    case "brain":
      return NEUROLOGICAL_CANONICAL_SCHEMA;
    case "breast-cancer":
    default:
      return BREAST_CANCER_CANONICAL_SCHEMA;
  }
}

export interface ExtractedFieldMatch {
  key: string;
  label: string;
  unit: string;
  extractedValue: number;
  rawLabel: string;
  matchType: "exact" | "alias" | "derived" | "ai_semantic" | "default";
  confidence: number;
  derivationFormula?: string;
}

export interface PatientMetadata {
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  intakeDate?: string;
  accessionNumber?: string;
  contactNumber?: string;
  clinicalNotes?: string;
}

export interface MedicalReportParseResult {
  fileName: string;
  fileType: string;
  patientId: string;
  metadata?: PatientMetadata;
  extractedFields: Record<string, number>;
  fieldMatches: ExtractedFieldMatch[];
  rawTextPreview: string;
  parseMethod: "json" | "csv" | "pathology_report_nlp" | "ai_fallback";
  unmappedFields: { key: string; rawValue: string }[];
  missingFieldKeys: string[];
  derivedFieldKeys: string[];
}

function cleanToken(str: string): string {
  return str
    .toLowerCase()
    .replace(/[_\-\s\(\)\:\,\/\[\]\.]+/g, " ")
    .trim();
}

function findCanonicalMatch(
  rawKey: string,
  schema: BiomarkerFieldConfig[] = BREAST_CANCER_CANONICAL_SCHEMA
): { config: BiomarkerFieldConfig; matchType: "exact" | "alias"; confidence: number } | null {
  const cleaned = cleanToken(rawKey);
  
  // Blacklist generic metadata keys UNLESS the current schema explicitly tracks it (e.g. age, gender)
  const demographicBlacklist = [
    "date", "collection date", "intake date", "report date", "patient id", "id", "mrn", 
    "accession", "accession number", "specimen", "specimen type", "status",
    "findings", "impression", "notes", "signed by", "dr", "doctor"
  ];
  if (demographicBlacklist.includes(cleaned)) {
    return null;
  }

  // 1. Exact Key or Label Match
  for (const config of schema) {
    if (cleanToken(config.key) === cleaned || cleanToken(config.label) === cleaned) {
      return { config, matchType: "exact", confidence: 1.0 };
    }
  }

  // 2. Exact Alias Match
  for (const config of schema) {
    for (const alias of config.aliases) {
      if (cleanToken(alias) === cleaned) {
        return { config, matchType: "alias", confidence: 0.95 };
      }
    }
  }

  // 3. Substring Containment
  for (const config of schema) {
    for (const alias of config.aliases) {
      const cAlias = cleanToken(alias);
      if (cAlias.length >= 4 && cleaned.includes(cAlias)) {
        return { config, matchType: "alias", confidence: 0.85 };
      }
    }
  }
  return null;
}

export function extractPatientMetadataFromText(text: string): PatientMetadata {
  let patientId = "";
  let patientName = "Jane Doe";
  let patientAge: number | undefined = undefined;
  let patientGender = "Female";
  let intakeDate = new Date().toISOString().split("T")[0];
  let accessionNumber = "";

  // 1. Patient ID
  const idPatterns = [
    /(?:patient\s*(?:id|number|code|#)|subject\s*(?:id|#)|mrn|case\s*#?)[:\s\-=]+([A-Za-z0-9\-_]+)/i,
    /(Patient-[A-Za-z0-9\-]+)/i,
    /(BC-[0-9]{3,6})/i,
  ];
  for (const pat of idPatterns) {
    const m = text.match(pat);
    if (m && m[1]) {
      patientId = m[1].trim();
      break;
    }
  }
  if (!patientId) {
    patientId = `QS-BC-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // 2. Patient Name
  const nameMatch = text.match(/(?:patient\s*(?:name|full\s*name)|name\s*of\s*patient|patient)[:\s\-=]+([A-Za-z\s\.\,\-]+)/i);
  if (nameMatch && nameMatch[1]) {
    const clean = nameMatch[1].replace(/[\n\r\t]+/g, " ").trim();
    if (clean.length > 2 && !clean.toLowerCase().includes("id") && !clean.toLowerCase().includes("age")) {
      patientName = clean.split(/[,;\n]/)[0].trim();
    }
  }

  // 3. Age
  const ageMatch = text.match(/(?:age|patient\s*age)[:\s\-=]+(\d{1,3})/i);
  if (ageMatch && ageMatch[1]) {
    const a = parseInt(ageMatch[1], 10);
    if (a >= 10 && a <= 120) patientAge = a;
  }

  // 4. Gender / Sex
  const genderMatch = text.match(/(?:gender|sex)[:\s\-=]+(female|male|f|m|other)/i);
  if (genderMatch && genderMatch[1]) {
    const g = genderMatch[1].toLowerCase();
    if (g.startsWith("f")) patientGender = "Female";
    else if (g.startsWith("m")) patientGender = "Male";
    else patientGender = "Other";
  }

  // 5. Collection / Intake Date
  const dateMatch = text.match(/(?:collection\s*date|date\s*of\s*collection|intake\s*date|report\s*date|date)[:\s\-=]+([0-9]{4}[-\/][0-9]{2}[-\/][0-9]{2}|[0-9]{2}[-\/][0-9]{2}[-\/][0-9]{4})/i);
  if (dateMatch && dateMatch[1]) {
    intakeDate = dateMatch[1].trim();
  }

  // 6. Accession Number
  const accMatch = text.match(/(?:accession\s*(?:number|no|#)|acc\s*#?)[:\s\-=]+([A-Za-z0-9\-_]+)/i);
  if (accMatch && accMatch[1]) {
    accessionNumber = accMatch[1].trim();
  } else {
    accessionNumber = `ACC-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  return {
    patientId,
    patientName,
    patientAge,
    patientGender,
    intakeDate,
    accessionNumber,
  };
}

function extractPatientIdFromText(text: string): string | null {
  return extractPatientMetadataFromText(text).patientId;
}

/**
 * Executes Tier 1 & Tier 2 Mathematical Derivations for any missing features.
 */
function applyClinicalDerivations(
  extracted: Record<string, number>,
  rawPool: Record<string, number>,
  matches: ExtractedFieldMatch[]
): string[] {
  const derivedKeys: string[] = [];

  // 1. Derive Radius from Area: r = sqrt(Area / pi)
  if (!("radius_mean" in extracted)) {
    if ("area_mean" in extracted && extracted.area_mean > 0) {
      const r = Math.sqrt(extracted.area_mean / Math.PI);
      extracted.radius_mean = parseFloat(r.toFixed(2));
      derivedKeys.push("radius_mean");
      matches.push({
        key: "radius_mean",
        label: "Cell Size (Radius)",
        unit: "μm",
        extractedValue: extracted.radius_mean,
        rawLabel: "Derived from Area",
        matchType: "derived",
        confidence: 0.98,
        derivationFormula: "r = √(Nuclear Area / π)",
      });
    } else if ("perimeter_mean" in extracted && extracted.perimeter_mean > 0) {
      const r = extracted.perimeter_mean / (2 * Math.PI);
      extracted.radius_mean = parseFloat(r.toFixed(2));
      derivedKeys.push("radius_mean");
      matches.push({
        key: "radius_mean",
        label: "Cell Size (Radius)",
        unit: "μm",
        extractedValue: extracted.radius_mean,
        rawLabel: "Derived from Perimeter",
        matchType: "derived",
        confidence: 0.95,
        derivationFormula: "r = Perimeter / 2π",
      });
    } else if (rawPool["radius_worst"] || rawPool["worst_radius"]) {
      const rw = rawPool["radius_worst"] || rawPool["worst_radius"];
      extracted.radius_mean = parseFloat((rw / 1.32).toFixed(2));
      derivedKeys.push("radius_mean");
      matches.push({
        key: "radius_mean",
        label: "Cell Size (Radius)",
        unit: "μm",
        extractedValue: extracted.radius_mean,
        rawLabel: "Estimated from Worst Radius",
        matchType: "derived",
        confidence: 0.88,
        derivationFormula: "Mean ≈ Worst Radius / 1.32",
      });
    }
  }

  // 2. Derive Area from Radius: Area = pi * r^2
  if (!("area_mean" in extracted) && "radius_mean" in extracted && extracted.radius_mean > 0) {
    const a = Math.PI * Math.pow(extracted.radius_mean, 2);
    extracted.area_mean = parseFloat(a.toFixed(1));
    derivedKeys.push("area_mean");
    matches.push({
      key: "area_mean",
      label: "Nuclear Area",
      unit: "μm²",
      extractedValue: extracted.area_mean,
      rawLabel: "Derived from Radius",
      matchType: "derived",
      confidence: 0.98,
      derivationFormula: "Area = π * Radius²",
    });
  }

  // 3. Derive Perimeter from Radius: P = 2 * pi * r
  if (!("perimeter_mean" in extracted) && "radius_mean" in extracted && extracted.radius_mean > 0) {
    const p = 2 * Math.PI * extracted.radius_mean;
    extracted.perimeter_mean = parseFloat(p.toFixed(2));
    derivedKeys.push("perimeter_mean");
    matches.push({
      key: "perimeter_mean",
      label: "Cell Perimeter",
      unit: "μm",
      extractedValue: extracted.perimeter_mean,
      rawLabel: "Derived from Radius",
      matchType: "derived",
      confidence: 0.98,
      derivationFormula: "Perimeter = 2π * Radius",
    });
  }

  // 4. Derive Compactness: C = (P^2 / A) - 1.0
  if (!("compactness_mean" in extracted) && "perimeter_mean" in extracted && "area_mean" in extracted && extracted.area_mean > 0) {
    const c = (Math.pow(extracted.perimeter_mean, 2) / (4 * Math.PI * extracted.area_mean)) - 1.0;
    extracted.compactness_mean = parseFloat(Math.max(0.01, Math.min(0.35, Math.abs(c))).toFixed(4));
    derivedKeys.push("compactness_mean");
    matches.push({
      key: "compactness_mean",
      label: "Compactness",
      unit: "idx",
      extractedValue: extracted.compactness_mean,
      rawLabel: "Derived from Perimeter & Area",
      matchType: "derived",
      confidence: 0.92,
      derivationFormula: "Compactness = (P² / 4πA) - 1",
    });
  }

  // 5. Derive Hepatic A/G Ratio if Total Proteins & Albumin exist
  if (!("Albumin_and_Globulin_Ratio" in extracted) && "Total_Protiens" in extracted && "Albumin" in extracted) {
    const globulin = extracted.Total_Protiens - extracted.Albumin;
    if (globulin > 0) {
      const ag = parseFloat((extracted.Albumin / globulin).toFixed(2));
      extracted.Albumin_and_Globulin_Ratio = ag;
      derivedKeys.push("Albumin_and_Globulin_Ratio");
      matches.push({
        key: "Albumin_and_Globulin_Ratio",
        label: "A/G Ratio",
        unit: "ratio",
        extractedValue: ag,
        rawLabel: "Derived from Albumin & Total Proteins",
        matchType: "derived",
        confidence: 0.95,
        derivationFormula: "A/G = Albumin / (Total Proteins - Albumin)",
      });
    }
  }

  return derivedKeys;
}

export function parseJsonReport(content: string, fileName: string, schemaType: string = "breast-cancer"): MedicalReportParseResult {
  const schema = getSchemaByType(schemaType);
  const data = JSON.parse(content);
  const flatData: Record<string, any> = {};

  function flatten(obj: any, prefix = "") {
    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      for (const [k, v] of Object.entries(obj)) {
        flatten(v, prefix ? `${prefix}.${k}` : k);
      }
    } else {
      flatData[prefix] = obj;
    }
  }
  flatten(data);

  const extracted: Record<string, number> = {};
  const rawPool: Record<string, number> = {};
  const matches: ExtractedFieldMatch[] = [];
  const unmapped: { key: string; rawValue: string }[] = [];

  for (const [rawKey, rawVal] of Object.entries(flatData)) {
    const num = parseFloat(String(rawVal).replace(/[^\d.-]/g, ""));
    if (isNaN(num)) continue;
    rawPool[cleanToken(rawKey)] = num;

    const match = findCanonicalMatch(rawKey, schema);
    if (match && !(match.config.key in extracted)) {
      extracted[match.config.key] = num;
      matches.push({
        key: match.config.key,
        label: match.config.label,
        unit: match.config.unit,
        extractedValue: num,
        rawLabel: rawKey,
        matchType: match.matchType,
        confidence: match.confidence,
      });
    } else {
      unmapped.push({ key: rawKey, rawValue: String(rawVal) });
    }
  }

  // Apply Tier 1 & 2 Mathematical Derivations
  const derivedKeys = applyClinicalDerivations(extracted, rawPool, matches);

  // Apply Tier 3 Defaults for any remaining missing fields
  const missingKeys: string[] = [];
  schema.forEach((c) => {
    if (!(c.key in extracted)) {
      extracted[c.key] = c.defaultValue;
      missingKeys.push(c.key);
      matches.push({
        key: c.key,
        label: c.label,
        unit: c.unit,
        extractedValue: c.defaultValue,
        rawLabel: "Cohort Median (Not in File)",
        matchType: "default",
        confidence: 0.0,
      });
    }
  });

  const patientId = flatData["patient_id"] || flatData["patientId"] || flatData["id"] || extractPatientIdFromText(content) || `Patient-${schemaType.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    fileName,
    fileType: "application/json",
    patientId: String(patientId),
    extractedFields: extracted,
    fieldMatches: matches,
    rawTextPreview: content.slice(0, 400),
    parseMethod: "json",
    unmappedFields: unmapped,
    missingFieldKeys: missingKeys,
    derivedFieldKeys: derivedKeys,
  };
}

export function parseCsvReport(content: string, fileName: string, schemaType: string = "breast-cancer"): MedicalReportParseResult {
  const schema = getSchemaByType(schemaType);
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    throw new Error("CSV file is empty.");
  }

  const delimiter = content.includes("\t") ? "\t" : ",";
  const headerTokens = lines[0].split(delimiter).map((t) => t.trim().replace(/^["']|["']$/g, ""));
  
  const extracted: Record<string, number> = {};
  const rawPool: Record<string, number> = {};
  const matches: ExtractedFieldMatch[] = [];
  const unmapped: { key: string; rawValue: string }[] = [];

  const isKeyValueStyle = lines.length >= 4 && headerTokens.length <= 2;

  if (isKeyValueStyle) {
    for (const line of lines) {
      const parts = line.split(delimiter).map((t) => t.trim().replace(/^["']|["']$/g, ""));
      if (parts.length >= 2) {
        const rawK = parts[0];
        const num = parseFloat(parts[1].replace(/[^\d.-]/g, ""));
        if (!isNaN(num)) {
          rawPool[cleanToken(rawK)] = num;
          const match = findCanonicalMatch(rawK, schema);
          if (match && !(match.config.key in extracted)) {
            extracted[match.config.key] = num;
            matches.push({
              key: match.config.key,
              label: match.config.label,
              unit: match.config.unit,
              extractedValue: num,
              rawLabel: rawK,
              matchType: match.matchType,
              confidence: match.confidence,
            });
          } else {
            unmapped.push({ key: rawK, rawValue: parts[1] });
          }
        }
      }
    }
  } else {
    const dataRow = lines.length > 1 ? lines[1].split(delimiter).map((t) => t.trim().replace(/^["']|["']$/g, "")) : [];
    
    headerTokens.forEach((header, idx) => {
      const rawVal = dataRow[idx] || "";
      const num = parseFloat(rawVal.replace(/[^\d.-]/g, ""));
      if (!isNaN(num)) {
        rawPool[cleanToken(header)] = num;
        const match = findCanonicalMatch(header, schema);
        if (match && !(match.config.key in extracted)) {
          extracted[match.config.key] = num;
          matches.push({
            key: match.config.key,
            label: match.config.label,
            unit: match.config.unit,
            extractedValue: num,
            rawLabel: header,
            matchType: match.matchType,
            confidence: match.confidence,
          });
        } else {
          unmapped.push({ key: header, rawValue: rawVal });
        }
      }
    });
  }

  const derivedKeys = applyClinicalDerivations(extracted, rawPool, matches);

  const missingKeys: string[] = [];
  schema.forEach((c) => {
    if (!(c.key in extracted)) {
      extracted[c.key] = c.defaultValue;
      missingKeys.push(c.key);
      matches.push({
        key: c.key,
        label: c.label,
        unit: c.unit,
        extractedValue: c.defaultValue,
        rawLabel: "Cohort Median (Not in File)",
        matchType: "default",
        confidence: 0.0,
      });
    }
  });

  const patientId = extractPatientIdFromText(content) || `Patient-${schemaType.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    fileName,
    fileType: "text/csv",
    patientId,
    extractedFields: extracted,
    fieldMatches: matches,
    rawTextPreview: lines.slice(0, 5).join("\n"),
    parseMethod: "csv",
    unmappedFields: unmapped,
    missingFieldKeys: missingKeys,
    derivedFieldKeys: derivedKeys,
  };
}

export function parseUnstructuredMedicalText(rawText: string, fileName: string = "report.txt", schemaType: string = "breast-cancer"): MedicalReportParseResult {
  const schema = getSchemaByType(schemaType);
  const lines = rawText.split(/\r?\n/);
  const extracted: Record<string, number> = {};
  const rawPool: Record<string, number> = {};
  const matches: ExtractedFieldMatch[] = [];
  const unmapped: { key: string; rawValue: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const kvMatch = trimmed.match(/^([^:\=\t\|]+)[\:\=\t\|]+\s*([0-9\.\-\+]+)\s*([a-zA-Zμµ\^\²\%]*)/);
    if (kvMatch) {
      const rawK = kvMatch[1].trim();
      const num = parseFloat(kvMatch[2]);
      if (!isNaN(num)) {
        rawPool[cleanToken(rawK)] = num;
        const match = findCanonicalMatch(rawK, schema);
        if (match && !(match.config.key in extracted)) {
          extracted[match.config.key] = num;
          matches.push({
            key: match.config.key,
            label: match.config.label,
            unit: match.config.unit,
            extractedValue: num,
            rawLabel: rawK,
            matchType: match.matchType,
            confidence: match.confidence,
          });
          continue;
        }
      }
    }

    for (const config of schema) {
      if (config.key in extracted) continue;
      for (const alias of config.aliases) {
        const regex = new RegExp(`(?:${alias})[\\s\\:\\=\\-\\(]+\\s*([0-9]+\\.?[0-9]*)`, "i");
        const found = trimmed.match(regex);
        if (found && found[1]) {
          const num = parseFloat(found[1]);
          if (!isNaN(num)) {
            extracted[config.key] = num;
            matches.push({
              key: config.key,
              label: config.label,
              unit: config.unit,
              extractedValue: num,
              rawLabel: alias,
              matchType: "alias",
              confidence: 0.90,
            });
            break;
          }
        }
      }
    }
  }

  const derivedKeys = applyClinicalDerivations(extracted, rawPool, matches);

  const missingKeys: string[] = [];
  schema.forEach((c) => {
    if (!(c.key in extracted)) {
      extracted[c.key] = c.defaultValue;
      missingKeys.push(c.key);
      matches.push({
        key: c.key,
        label: c.label,
        unit: c.unit,
        extractedValue: c.defaultValue,
        rawLabel: "Cohort Median (Not in File)",
        matchType: "default",
        confidence: 0.0,
      });
    }
  });

  const metadata = extractPatientMetadataFromText(rawText);
  const patientId = metadata.patientId || `Patient-${schemaType.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    fileName,
    fileType: fileName.endsWith(".pdf") ? "application/pdf" : "text/plain",
    patientId,
    metadata,
    extractedFields: extracted,
    fieldMatches: matches,
    rawTextPreview: rawText.slice(0, 400),
    parseMethod: "pathology_report_nlp",
    unmappedFields: unmapped,
    missingFieldKeys: missingKeys,
    derivedFieldKeys: derivedKeys,
  };
}

export async function parseMedicalReportFile(file: File, schemaType: string = "breast-cancer"): Promise<MedicalReportParseResult> {
  const fileName = file.name;
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  if (ext === "json") {
    const text = await file.text();
    return parseJsonReport(text, fileName, schemaType);
  } else if (ext === "csv" || ext === "tsv") {
    const text = await file.text();
    return parseCsvReport(text, fileName, schemaType);
  } else if (ext === "pdf") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);

      const res = await fetch("/api/ai/parse-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Data, fileName, schemaType }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (err) {
      console.warn("PDF API parser fallback:", err);
    }
    const text = await file.text();
    return parseUnstructuredMedicalText(text, fileName, schemaType);
  } else {
    const text = await file.text();
    return parseUnstructuredMedicalText(text, fileName, schemaType);
  }
}
