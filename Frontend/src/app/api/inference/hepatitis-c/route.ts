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
  try {
    const body = await req.json();
    const backendUrl = getBackendUrl();

    const res = await fetch(`${backendUrl}/inference/hepatitis-c`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }

    const errJson = await res.json().catch(() => ({}));
    return NextResponse.json(
      errJson.detail
        ? { detail: errJson.detail }
        : { error: "Hepatitis C backend inference failed", status: res.status },
      { status: res.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Hepatology Python backend unreachable", detail: err?.message },
      { status: 503 }
    );
  }
}
