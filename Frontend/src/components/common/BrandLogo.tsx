import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  href?: string | false;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
}

export default function BrandLogo({
  className = "",
  href = "/home",
  showSubtitle = true,
  size = "md",
  showBadge = false,
}: BrandLogoProps) {
  const iconSizeClass =
    size === "sm"
      ? "h-7 w-7 rounded-lg p-1"
      : size === "lg"
      ? "h-10 w-10 rounded-2xl p-2"
      : "h-8 w-8 rounded-xl p-1.5";

  const titleSizeClass =
    size === "sm"
      ? "text-sm sm:text-base"
      : size === "lg"
      ? "text-lg sm:text-xl"
      : "text-base sm:text-lg";

  const content = (
    <span className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* Saskia Brink Dribbble: Vector AI Diagnostics ribbon mark */}
      <span className={`relative flex items-center justify-center bg-primary text-primary-foreground shadow-xs transition-transform duration-200 group-hover:scale-105 border border-primary/20 shrink-0 ${iconSizeClass}`}>
        <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
          <path fill="url(#aid-g1)" d="M85.575 11.432c-1.823.354-3.598.995-5.154 2.019-1.227.807-2.285 1.836-3.182 2.995-.152.195-.298.393-.44.595-1.256 1.762-1.402 3.89-1.415 5.983 0 .184.149.334.332.334l14.538.079c10.934 0 15.265 7.284 15.265 16.71 0 9.419-4.818 16.288-15.76 16.299a.976.976 0 0 0-.195.02l-.088.002c-.88 0-1.772.002-2.636.145-3.338.549-5.412 3.126-5.207 6.389.197 3.12 2.45 5.684 5.742 5.821 3.423.143 6.13-.038 6.13-.038 16.991-1.493 26.191-13.419 26.191-28.638 0-1.759-.118-3.516-.37-5.256a32.246 32.246 0 0 0-1.11-4.952 28.6 28.6 0 0 0-1.843-4.545 26.078 26.078 0 0 0-2.566-4.061 24.982 24.982 0 0 0-7.267-6.368 27.491 27.491 0 0 0-4.682-2.156 31.647 31.647 0 0 0-7.453-1.648c-.44-.043-.878-.07-1.318-.089-.831-.034-1.67-.06-2.51-.06-1.679 0-3.362.1-5.002.42Z"/>
          <path fill="url(#aid-g2)" d="M65.47 11.01s-1.91-.065-3.508 1.587a6.045 6.045 0 0 0-1.395 2.044l-.062.142-.015.039a6.19 6.19 0 0 0-.427 1.82c-.091.823-.128 30.836-.128 30.836l-.097 4.512c-.045 4.06-3.182 7.214-7.223 7.263a7.224 7.224 0 0 1-3.098-.664c.927 1.601 1.85 3.206 2.78 4.806 2.722 4.69 7.208 6.61 12.184 5.348 4.625-1.172 7.61-5.201 7.646-10.546.013-1.822.024-5.465.024-5.465l.004-28.811c.168-5.956 1.669-11.163 7.294-12.656.155-.04.127-.265-.033-.265l-13.947.01Z"/>
          <path fill="url(#aid-g3)" d="M26.575 15.296C18.24 29.686 10.11 42.992 1.82 57.407-1.76 63.632.59 69.165 7.717 69.19c8.62.029 15.666.01 24.286 0 .879 0 1.771-.003 2.633-.145 3.337-.548 5.412-3.126 5.206-6.387-.196-3.12-2.45-5.766-5.74-5.904-.701-.028-3.674-.019-6.281-.01-1.382.006-2.66.012-3.446.01-4.892-.003-5.272 0-7.695 0a.055.055 0 0 1-.048-.084c.776-1.336 10.714-18.29 15.859-27.205l.117.004c.849 1.398 1.4 2.272 1.916 3.167 4.028 6.974 8.306 14.21 12.33 21.181a5.39 5.39 0 0 0 4.822 2.69c2.302-.072 4.12-1.112 5.43-2.688 1.396-1.68 1.081-4.499-.012-6.39-.005-.008-12.275-21.392-18.508-32.144-1.648-2.845-3.825-4.266-6-4.266-2.18 0-4.36 1.426-6.011 4.277Z"/>
          <defs>
            <linearGradient id="aid-g1" x1="97.54" x2="97.54" y1="11.013" y2="68.878" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff"/>
              <stop offset="1" stopColor="#74D0D2"/>
            </linearGradient>
            <linearGradient id="aid-g2" x1="64.534" x2="64.534" y1="11" y2="69.122" gradientUnits="userSpaceOnUse">
              <stop stopColor="#74D0D2"/>
              <stop offset="1" stopColor="#ffffff"/>
            </linearGradient>
            <linearGradient id="aid-g3" x1="58.038" x2=".166" y1="40.112" y2="40.112" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff"/>
              <stop offset="1" stopColor="#74D0D2"/>
            </linearGradient>
          </defs>
        </svg>
      </span>

      <span className="flex flex-col text-left">
        <span className={`font-sans font-bold tracking-tight text-ink group-hover:text-primary transition-colors leading-tight ${titleSizeClass}`}>
          AI Diagnostics
        </span>
        {showSubtitle && (
          <span className="font-mono text-[9px] tracking-wider uppercase font-semibold text-ink-soft">
            Clinical Screening Suite
          </span>
        )}
      </span>
    </span>
  );

  if (href === false) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}

