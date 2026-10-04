"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, ShieldAlert, User as UserIcon } from "lucide-react";
import ChatMarkdownRenderer from "@/components/chat/ChatMarkdownRenderer";

interface AiDoctorConsultationTabProps {
  patientInfo: {
    name: string;
    patient_id: string;
    age: number;
    gender: string;
  };
  biomarkers: Record<string, number>;
  screeningResult: any;
  activeEngine: string;
  aiSynthesis: any;
}

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

// QureSight Nexus Website Logo Icon
function QureSightLogo({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-lg bg-black text-white flex items-center justify-center shrink-0 shadow-xs border border-white/10"
    >
      <svg viewBox="0 0 32 32" className="w-[60%] h-[60%]" fill="none">
        <path
          d="M16 5 L17.5 13.5 L26 15 L17.5 16.5 L16 25 L14.5 16.5 L6 15 L14.5 13.5 Z"
          fill="#FFFFFF"
        />
        <circle cx="16" cy="15" r="2.2" fill="#10B981" />
        <circle cx="9" cy="8" r="1.2" fill="#10B981" opacity="0.8" />
        <circle cx="23" cy="22" r="1.2" fill="#10B981" opacity="0.8" />
      </svg>
    </div>
  );
}

function FormattedMessageContent({ content }: { content: string }) {
  return <ChatMarkdownRenderer content={content} isBot={true} />;
}

export default function AiDoctorConsultationTab({
  patientInfo,
  biomarkers,
  screeningResult,
  activeEngine,
  aiSynthesis,
}: AiDoctorConsultationTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const rVal = biomarkers.radius_mean || 12.2;
  const aVal = biomarkers.area_mean || 458.7;
  const pVal = biomarkers.perimeter_mean || 78.2;
  const isMalignant = screeningResult.prediction_label === "Malignant";
  const riskScore = screeningResult.composite_risk_score ?? 35.4;

  // Load user profile avatar from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAvatar = localStorage.getItem("quresight_user_avatar");
      if (storedAvatar) {
        setUserAvatar(storedAvatar);
      }
    }
  }, []);

  // Initialize consultation message with complete clinical overview
  useEffect(() => {
    const summaryText =
      aiSynthesis?.summary_paragraph ||
      aiSynthesis?.executive_summary ||
      (isMalignant
        ? `Biopsy screening for ${patientInfo.name} shows noticeable cell enlargement with a mean radius of ${rVal} μm and indentation count of ${biomarkers.concave_points_mean || 0.14}. This pattern indicates cellular atypical proliferation requiring clinical follow-up.`
        : `The biopsy screening for ${patientInfo.name} shows reassuring and healthy measurements with a low risk score. The cells are of standard size with smooth, uniform borders typical of healthy non-cancerous breast tissue.`);

    const morphologyText =
      aiSynthesis?.morphological_breakdown ||
      `Total cell area is ${aVal} μm² and perimeter is ${pVal} μm (${
        isMalignant
          ? "elevated above normal thresholds, indicating nuclear expansion"
          : "within normal healthy ranges, indicating stable and healthy cellular morphology"
      }). Border smoothness is measured at ${biomarkers.smoothness_mean || 0.09}.`;

    const recommendationText =
      screeningResult.clinical_action ||
      "Routine annual screening mammography and clinical breast examination recommended.";

    const initialContent = `**Evaluation for ${patientInfo.name} (${patientInfo.patient_id}):**

**1. Summary of Findings:**
${summaryText}

**2. Cell Morphology:**
${morphologyText}

**3. Engine Assessment (${activeEngine}):**
Assessment indicates **${screeningResult.prediction_label || "Benign"}** with a composite risk score of **${riskScore.toFixed(1)} / 100** and certainty of **${(screeningResult.confidence ?? 50.6).toFixed(1)}%**.

**4. Clinical Recommendations:**
${recommendationText}`;

    setMessages([
      {
        role: "assistant",
        content: initialContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [
    aiSynthesis,
    patientInfo.name,
    patientInfo.patient_id,
    isMalignant,
    rVal,
    aVal,
    pVal,
    biomarkers.concave_points_mean,
    biomarkers.smoothness_mean,
    activeEngine,
    screeningResult.prediction_label,
    screeningResult.confidence,
    screeningResult.clinical_action,
    riskScore,
  ]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    const query = inputValue.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/ask-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          patientInfo,
          biomarkers,
          screeningResult,
          activeEngine,
          history: messages.slice(-4),
        }),
      });

      const data = await response.json();
      const assistantReply: Message = {
        role: "assistant",
        content:
          data.answer ||
          "I have processed the patient's data, but was unable to formulate an explanation. Please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantReply]);
    } catch (err) {
      console.error("Consultation send error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "A temporary network timeout occurred while querying the clinical reasoning model. Please try asking again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#DFEBE8] shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Header: Strictly "QureSight AI" with Website Logo */}
      <div className="px-5 py-3.5 border-b border-[#DFEBE8]/80 flex items-center gap-2.5 bg-[#F7FAF9]/15">
        <QureSightLogo size={26} />
        <h3 className="text-sm font-bold text-[#082827] tracking-tight font-sans font-bold">QureSight AI</h3>
      </div>

      {/* Conversation Stream Container (Clean & Centered) */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#F7FAF9]/5">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => {
            const isAssistant = msg.role === "assistant";
            return (
              <div
                key={index}
                className={`flex items-start gap-2.5 ${
                  isAssistant ? "justify-start" : "justify-end"
                }`}
              >
                {/* Left Side: QureSight AI Logo */}
                {isAssistant && <QureSightLogo size={24} />}

                {/* Message Bubble: Snug, readable width wrapping into next lines */}
                <div
                  className={`rounded-2xl p-4 shadow-2xs ${
                    isAssistant
                      ? "w-fit max-w-[480px] sm:max-w-[500px] bg-white border border-[#DFEBE8] text-[#082827]"
                      : "w-fit max-w-[380px] sm:max-w-[420px] bg-[#082827] text-white font-medium"
                  }`}
                >
                  {isAssistant ? (
                    <FormattedMessageContent content={msg.content} />
                  ) : (
                    <div className="whitespace-pre-line text-xs leading-relaxed">{msg.content}</div>
                  )}
                  <span
                    className={`text-[9px] font-mono block mt-1.5 text-right ${
                      isAssistant ? "text-[#082827]-muted" : "text-white/60"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Right Side: User Profile Avatar */}
                {!isAssistant && (
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-[#082827] text-white flex items-center justify-center shrink-0 text-xs shadow-2xs border border-[#DFEBE8] mt-0.5">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="User Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={13} className="text-white" />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5">
              <QureSightLogo size={24} />
              <div className="bg-white border border-[#DFEBE8] rounded-2xl px-3.5 py-2 text-xs text-[#5A7470] flex items-center gap-2 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-quantum animate-pulse" />
                <span className="font-mono text-xs text-[#5A7470]">thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* Floating Centered Typing Bar */}
      <div className="p-3 bg-white">
        <div className="max-w-lg mx-auto space-y-1.5">
          <div className="flex items-center gap-2 bg-[#F7FAF9]/40 border border-[#DFEBE8] rounded-xl px-3 py-2 focus-within:border-quantum focus-within:ring-2 focus-within:ring-quantum/10 transition-all shadow-2xs">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask QureSight AI about these findings..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-xs text-[#082827] placeholder:text-[#082827]-muted"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="w-7 h-7 rounded-lg bg-[#082827] hover:bg-[#082827]/90 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0"
            >
              <Send size={12} />
            </button>
          </div>

          <p className="text-[10px] text-[#082827]-muted text-center leading-relaxed">
            <ShieldAlert size={10} className="inline mr-1 text-amber-600 align-sub" />
            AI interpretations are for reference only. Please verify diagnostic decisions with a qualified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}
