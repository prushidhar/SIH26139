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
  let filename = "ecg_upload.jpg";
  let imageBase64 = "";

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      imageBase64 = body.image_base64 || "";
      filename = body.filename || "ecg_upload.jpg";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (file && typeof file !== "string" && "arrayBuffer" in file) {
        const arrayBuf = await file.arrayBuffer();
        imageBase64 = Buffer.from(arrayBuf).toString("base64");
        filename = (file as any).name || "ecg_upload.jpg";
      } else if (formData.get("image_base64")) {
        imageBase64 = String(formData.get("image_base64"));
        filename = String(formData.get("filename") || "ecg_upload.jpg");
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        { detail: "No ECG image file or base64 data provided in request." },
        { status: 400 }
      );
    }

    const backendUrl = getBackendUrl();
    const targetEndpoint = `${backendUrl}/inference/cardiac-ecg`;

    const upstreamResp = await fetch(targetEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_base64: imageBase64,
        filename: filename,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (upstreamResp.ok) {
      const liveData = await upstreamResp.json();
      return NextResponse.json(liveData);
    }

    const errJson = await upstreamResp.json().catch(() => ({}));
    return NextResponse.json(
      errJson.detail
        ? { detail: errJson.detail }
        : { error: "Cardiac ECG inference failed", status: upstreamResp.status },
      { status: upstreamResp.status }
    );
  } catch (error: any) {
    console.error("[Cardiac ECG API] Upstream error:", error);
    return NextResponse.json(
      { error: "Cardiac ECG backend unreachable", detail: error?.message },
      { status: 503 }
    );
  }
}
