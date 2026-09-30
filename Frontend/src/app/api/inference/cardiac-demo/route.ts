import { NextRequest, NextResponse } from "next/server";

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
      signal: AbortSignal.timeout(30000),
    });

    if (resp.ok) {
      const liveData = await resp.json();
      return NextResponse.json(liveData);
    }

    const errText = await resp.text();
    return NextResponse.json(
      { error: "Cardiac demo backend inference failed", detail: errText },
      { status: resp.status }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Cardiac demo backend unreachable", detail: error?.message },
      { status: 503 }
    );
  }
}
