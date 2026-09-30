const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API error: ${res.statusText}`)
  }
  return res.json()
}

export async function getHealth() {
  return fetchAPI('/health')
}

export async function getDefaultDataset() {
  return fetchAPI('/api/data/default', { method: 'POST' })
}

export async function uploadDataset(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/api/data/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export async function profileDataset() {
  return fetchAPI('/api/data/profile')
}

export async function preprocess(config: any) {
  return fetchAPI('/api/preprocess', { method: 'POST', body: JSON.stringify(config) })
}

export async function trainClassical(models: string[]) {
  return fetchAPI('/api/models/train/classical', { method: 'POST', body: JSON.stringify({ models }) })
}

export async function trainQuantum(config: any) {
  return fetchAPI('/api/models/train/quantum', { method: 'POST', body: JSON.stringify(config) })
}

export async function benchmark() {
  return fetchAPI('/api/benchmark', { method: 'POST' })
}

export async function runQuantumExperiments(config: any) {
  return fetchAPI('/api/quantum/experiments', { method: 'POST', body: JSON.stringify(config) })
}

export async function getCircuitInfo(config: any) {
  return fetchAPI('/api/quantum/circuit', { method: 'POST', body: JSON.stringify(config) })
}

export async function explain(config: any) {
  return fetchAPI('/api/explain', { method: 'POST', body: JSON.stringify(config) })
}

export async function predict(features: Record<string, number>, model_name?: string) {
  return fetchAPI('/api/predict', { method: 'POST', body: JSON.stringify({ features, model_name }) })
}

export async function getResults() {
  return fetchAPI('/api/results')
}

export async function getResult(id: string) {
  return fetchAPI(`/api/results/${id}`)
}

export async function getPredictions() {
  return fetchAPI('/api/predictions')
}

export async function listDatasets() {
  return fetchAPI('/api/datasets')
}

export async function selectDataset(datasetId: string) {
  return fetchAPI(`/api/datasets/${datasetId}/select`, { method: 'POST' })
}

export async function generateReport() {
  return fetchAPI('/api/reports', { method: 'POST' })
}

export async function listReports() {
  return fetchAPI('/api/reports')
}

export async function getReport(id: string) {
  return fetchAPI(`/api/reports/${id}`)
}

export function getReportHtmlUrl(id: string) {
  return `${API_BASE}/api/reports/${id}/html`
}
