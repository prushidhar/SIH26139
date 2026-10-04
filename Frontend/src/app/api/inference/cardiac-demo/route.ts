import { NextRequest, NextResponse } from "next/server";
import { generateCardiacTelemetry } from "@/lib/cardiacInferenceEngine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getBackendUrl(): string {
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return "http://127.0.0.1:8000";
}

export async function POST(req: NextRequest) {
  let sampleType = "mi";
  try {
    const body = await req.json();
    sampleType = (body.sample_type || "mi").toLowerCase().trim();
  } catch {
    // default to mi
  }

  const backendUrl = getBackendUrl();
  const targetEndpoint = `${backendUrl}/inference/cardiac-demo`;

  try {
    const resp = await fetch(targetEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sample_type: sampleType }),
      signal: AbortSignal.timeout(8000), // Fast 8s timeout to avoid Vercel edge termination
    });

    if (resp.ok) {
      const liveData = await resp.json();
      if (liveData && liveData.success !== false) {
        return NextResponse.json(liveData);
      }
    }
    console.warn(`[Cardiac Demo API] Upstream backend returned HTTP ${resp.status}. Activating autonomous edge engine.`);
  } catch (error: any) {
    console.warn(`[Cardiac Demo API] Upstream fetch note (${error?.message}). Activating autonomous edge engine.`);
  }

  // Autonomous Edge Engine Fallback
  const edgeTelemetry = generateCardiacTelemetry({
    sampleType: sampleType,
    filename: `sample_${sampleType}.jpg`,
  });

  return NextResponse.json(edgeTelemetry, { status: 200 });
}
