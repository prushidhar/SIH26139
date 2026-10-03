import React from "react";
import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  href?: string | false;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  variant?: "lockup" | "icon" | "full";
  inverted?: boolean;
  theme?: "light" | "dark";
  useImage?: boolean;
}

export function QureSightEmblem({
  size = 32,
  className = "",
  theme = "light",
}: {
  size?: number;
  className?: string;
  theme?: "light" | "dark";
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`qs-grad-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme === "dark" ? "#00B489" : "#006766"} />
          <stop offset="100%" stopColor={theme === "dark" ? "#2DD4BF" : "#0D4F46"} />
        </linearGradient>
      </defs>

      {/* Orbit Ellipse 1 (tilted ~-25deg) */}
      <ellipse
        cx="44"
        cy="52"
        rx="34"
        ry="15"
        transform="rotate(-25 44 52)"
        stroke={`url(#qs-grad-${theme})`}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Orbit Ellipse 2 (tilted ~+58deg) */}
      <ellipse
        cx="44"
        cy="52"
        rx="34"
        ry="15"
        transform="rotate(58 44 52)"
        stroke={`url(#qs-grad-${theme})`}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Center Eye / Core */}
      <circle
        cx="43"
        cy="53"
        r="14"
        fill={`url(#qs-grad-${theme})`}
      />
      {/* Eye Pupil Crescent Highlight */}
      <path
        d="M48 45 A8 8 0 0 0 38 52 A9 9 0 0 1 48 45 Z"
        fill={theme === "dark" ? "#082827" : "#FFFFFF"}
      />
      <circle
        cx="47"
        cy="47"
        r="2.5"
        fill={theme === "dark" ? "#FFFFFF" : "#E6F7F4"}
      />

      {/* Faceted Icosahedron / Crystal Top-Right */}
      <g transform="translate(68, 12) scale(0.32)">
        <polygon
          points="50,5 90,25 90,75 50,95 10,75 10,25"
          fill="none"
          stroke={`url(#qs-grad-${theme})`}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <polygon
          points="50,5 50,50 10,25"
          fill="none"
          stroke={`url(#qs-grad-${theme})`}
          strokeWidth="4"
        />
        <polygon
          points="50,5 90,25 50,50"
          fill="none"
          stroke={`url(#qs-grad-${theme})`}
          strokeWidth="4"
        />
        <polygon
          points="10,25 50,50 10,75"
          fill="none"
          stroke={`url(#qs-grad-${theme})`}
          strokeWidth="4"
        />
        <polygon
          points="90,25 90,75 50,50"
          fill="none"
          stroke={`url(#qs-grad-${theme})`}
          strokeWidth="4"
        />
        <polygon
          points="10,75 50,95 50,50"
          fill="none"
          stroke={`url(#qs-grad-${theme})`}
          strokeWidth="4"
        />
        <polygon
          points="90,75 50,50 50,95"
          fill="none"
          stroke={`url(#qs-grad-${theme})`}
          strokeWidth="4"
        />
      </g>
    </svg>
  );
}

export default function BrandLogo({
  className = "",
  href = "/home",
  showSubtitle = true,
  size = "md",
  showBadge = false,
  variant = "lockup",
  inverted = false,
  theme,
  useImage = false,
}: BrandLogoProps) {
  const isDark = inverted || theme === "dark";

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
  if (variant === "full" || useImage) {
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
              isDark
                ? "text-white group-hover:text-[#00B489]"
                : "text-[#082827] group-hover:text-[#006766]"
            } ${titleSizeClass}`}
          >
            QureSight
          </span>
          {showSubtitle && (
            <span
              className={`font-mono uppercase font-semibold transition-colors ${
                isDark
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
