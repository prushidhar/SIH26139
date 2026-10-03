import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  href?: string | false;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  variant?: "lockup" | "icon" | "full";
  inverted?: boolean;
}

export default function BrandLogo({
  className = "",
  href = "/home",
  showSubtitle = true,
  size = "md",
  showBadge = false,
  variant = "lockup",
  inverted = false,
}: BrandLogoProps) {
  const iconHeightClass =
    size === "sm"
      ? "h-7 w-7"
      : size === "lg"
      ? "h-11 w-11"
      : "h-9 w-9";

  const fullLogoHeightClass =
    size === "sm"
      ? "h-7 w-auto"
      : size === "lg"
      ? "h-11 w-auto"
      : "h-9 w-auto";

  const titleSizeClass =
    size === "sm"
      ? "text-[15px] sm:text-base leading-tight"
      : size === "lg"
      ? "text-xl sm:text-2xl leading-tight"
      : "text-base sm:text-lg leading-tight";

  const subtitleSizeClass =
    size === "sm"
      ? "text-[8px] tracking-wider"
      : size === "lg"
      ? "text-[10px] tracking-widest"
      : "text-[9px] tracking-wider";

  // If user requests the full rendered brand image lockup directly
  if (variant === "full") {
    const fullContent = (
      <span className={`inline-flex items-center group ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/quresight-logo-transparent.png"
          alt="QureSight — Quantum Clinical Insights Suite"
          className={`${fullLogoHeightClass} object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
        />
      </span>
    );

    if (href === false) return fullContent;
    return (
      <Link href={href} className="inline-flex items-center cursor-pointer">
        {fullContent}
      </Link>
    );
  }

  const content = (
    <span className={`inline-flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {/* Official QureSight Quantum Atomic & Icosahedral Emblem */}
      <span className={`relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconHeightClass}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/quresight-emblem.png"
          alt="QureSight Emblem"
          className="w-full h-full object-contain filter drop-shadow-[0_1px_2px_rgba(0,103,102,0.12)]"
        />
      </span>

      {variant !== "icon" && (
        <span className="flex flex-col text-left">
          <span
            className={`font-sans font-bold tracking-tight transition-colors ${
              inverted
                ? "text-white group-hover:text-[#00B489]"
                : "text-[#082827] group-hover:text-[#006766]"
            } ${titleSizeClass}`}
          >
            QureSight
          </span>
          {showSubtitle && (
            <span
              className={`font-mono uppercase font-semibold transition-colors ${
                inverted
                  ? "text-[#00B489]/90"
                  : "text-[#5A7470] group-hover:text-[#006766]"
              } ${subtitleSizeClass}`}
            >
              Quantum Clinical Insights Suite
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (href === false) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex items-center cursor-pointer">
      {content}
    </Link>
  );
}

