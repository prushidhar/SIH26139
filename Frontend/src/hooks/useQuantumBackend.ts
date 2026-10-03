"use client";

import { useState, useEffect, useCallback } from "react";

export type QuantumBackendType = "ibmq_eagle" | "gpu_simulator";

const STORAGE_KEY = "quresight_backend";
const EVENT_NAME = "quresight_backend_change";

export function useQuantumBackend() {
  // Default to verified local PennyLane statevector quantum simulator
  const [backend, setBackendState] = useState<QuantumBackendType>("gpu_simulator");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as QuantumBackendType | null;
      // QPU is locked unless credentials exist; always ensure simulator is active default
      if (stored === "gpu_simulator") {
        setBackendState("gpu_simulator");
      } else {
        localStorage.setItem(STORAGE_KEY, "gpu_simulator");
        setBackendState("gpu_simulator");
      }

      const handleCustomEvent = (e: Event) => {
        const customEvent = e as CustomEvent<QuantumBackendType>;
        if (customEvent.detail === "gpu_simulator" || customEvent.detail === "ibmq_eagle") {
          setBackendState(customEvent.detail);
        }
      };

      const handleStorageEvent = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && (e.newValue === "gpu_simulator" || e.newValue === "ibmq_eagle")) {
          setBackendState(e.newValue as QuantumBackendType);
        }
      };

      window.addEventListener(EVENT_NAME, handleCustomEvent);
      window.addEventListener("storage", handleStorageEvent);

      return () => {
        window.removeEventListener(EVENT_NAME, handleCustomEvent);
        window.removeEventListener("storage", handleStorageEvent);
      };
    }
  }, []);

  const setBackend = useCallback((newBackend: QuantumBackendType) => {
    setBackendState(newBackend);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newBackend);
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newBackend }));
    }
  }, []);

  return { backend, setBackend };
}
