"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Cpu,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { playQuantumCompletionSound } from "@/lib/sound";

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type?: "success" | "quantum" | "info" | "warning";
  actionUrl?: string;
  actionLabel?: string;
  duration?: number;
  playAudio?: boolean;
}

// Global Event Emitter for Toast Notifications
const TOAST_EVENT = "quresight_show_toast";

export function showToast(toast: Omit<ToastItem, "id">) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent(TOAST_EVENT, {
      detail: {
        ...toast,
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      },
    });
    window.dispatchEvent(event);
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>;
      if (customEvent.detail) {
        const newToast = customEvent.detail;
        setToasts((prev) => [newToast, ...prev].slice(0, 4));

        // Play bespoke quantum audio cue for model completion notifications
        if (newToast.type === "quantum" || newToast.playAudio) {
          playQuantumCompletionSound();
        }

        // Auto dismiss
        const duration = newToast.duration || 5000;
        setTimeout(() => {
          removeToast(newToast.id);
        }, duration);
      }
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={16} className="text-[#00B489] shrink-0" />;
      case "quantum":
        return <Sparkles size={16} className="text-[#006766] shrink-0" />;
      case "warning":
        return <AlertTriangle size={16} className="text-amber-500 shrink-0" />;
      case "info":
      default:
        return <Cpu size={16} className="text-[#006766] shrink-0" />;
    }
  };

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none font-sans">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.94 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto w-full bg-white/95 backdrop-blur-xl rounded-2xl border border-[#DFEBE8] shadow-[0_12px_40px_-10px_rgba(0,103,102,0.18)] p-3.5 pr-4 flex items-start gap-3 relative overflow-hidden"
          >
            {/* Left Accent Bar */}
            <div
              className={`w-1 self-stretch rounded-full shrink-0 ${
                toast.type === "success"
                  ? "bg-[#00B489]"
                  : toast.type === "warning"
                  ? "bg-amber-500"
                  : "bg-[#006766]"
              }`}
            />

            {/* Icon */}
            <div className="mt-0.5">{getIcon(toast.type)}</div>

            {/* Body */}
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="font-sans text-xs font-bold text-[#082827] tracking-tight truncate">
                {toast.title}
              </h4>
              <p className="text-[11.5px] text-[#5A7470] leading-snug mt-0.5 break-words">
                {toast.message}
              </p>

              {toast.actionUrl && (
                <Link
                  href={toast.actionUrl}
                  onClick={() => removeToast(toast.id)}
                  className="inline-flex items-center gap-1 text-[10.5px] font-mono text-[#006766] hover:underline font-semibold mt-1.5 cursor-pointer"
                >
                  <span>{toast.actionLabel || "View Details"}</span>
                  <ArrowRight size={10} />
                </Link>
              )}
            </div>

            {/* Top-Right Cross Button to dismiss */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss alert"
              className="p-1 rounded-lg hover:bg-[#E6F7F4] text-[#5A7470] hover:text-[#082827] transition-colors cursor-pointer shrink-0 -mr-1 -mt-0.5 group"
            >
              <X size={14} className="group-hover:rotate-90 transition-transform duration-150" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
