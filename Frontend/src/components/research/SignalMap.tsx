"use client";

import React, { useState } from "react";
import { SignalTransformResult } from "@/services/research.service";
import { Sliders, Eye, Sparkles } from "lucide-react";

interface SignalMapProps {
  data: SignalTransformResult;
}

export default function SignalMap({ data }: SignalMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<SignalTransformResult["latent_space_points"][0] | null>(
    data.latent_space_points[0] || null
  );

  const points = data.latent_space_points;
  if (!points || points.length === 0) return null;

  // Compute bounding box for PC1 and PC2
  const pc1Vals = points.map((p) => p.pc1);
  const pc2Vals = points.map((p) => p.pc2);

  const minX = Math.min(...pc1Vals);
  const maxX = Math.max(...pc1Vals);
  const minY = Math.min(...pc2Vals);
  const maxY = Math.max(...pc2Vals);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  // ViewBox dimensions
  const width = 500;
  const height = 340;
  const padding = 40;

  const toSvgX = (x: number) => padding + ((x - minX) / rangeX) * (width - 2 * padding);
  const toSvgY = (y: number) => height - padding - ((y - minY) / rangeY) * (height - 2 * padding);

  return (
    <div className="rounded-xl border border-hairline bg-parchment p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
            Latent Manifold Projection
          </span>
          <h3 className="text-base font-serif font-bold text-ink">
            2D PCA Space & Quantum Angle Coordinate Plane
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span className="text-ink">Benign (0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
            <span className="text-ink">Malignant (1)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Scatter Plot */}
        <div className="lg:col-span-2 relative bg-cream-deep/40 rounded-lg border border-hairline/80 p-2 flex items-center justify-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[360px]">
            {/* Grid lines */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="currentColor"
              className="text-hairline"
              strokeWidth="1.5"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="currentColor"
              className="text-hairline"
              strokeWidth="1.5"
            />

            {/* Zero axes if applicable */}
            {minX < 0 && maxX > 0 && (
              <line
                x1={toSvgX(0)}
                y1={padding}
                x2={toSvgX(0)}
                y2={height - padding}
                stroke="currentColor"
                className="text-hairline/70"
                strokeDasharray="3 3"
              />
            )}
            {minY < 0 && maxY > 0 && (
              <line
                x1={padding}
                y1={toSvgY(0)}
                x2={width - padding}
                y2={toSvgY(0)}
                stroke="currentColor"
                className="text-hairline/70"
                strokeDasharray="3 3"
              />
            )}

            {/* Scatter points */}
            {points.map((p) => {
              const cx = toSvgX(p.pc1);
              const cy = toSvgY(p.pc2);
              const isSelected = selectedPoint?.id === p.id;
              const color = p.label === 1 ? "#d97706" : "#059669";

              return (
                <circle
                  key={p.id}
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 6.5 : 4}
                  fill={color}
                  fillOpacity={isSelected ? 1.0 : 0.75}
                  stroke={isSelected ? "#1c1917" : "#ffffff"}
                  strokeWidth={isSelected ? 2 : 1}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setSelectedPoint(p)}
                />
              );
            })}

            {/* Axis labels */}
            <text
              x={width / 2}
              y={height - 10}
              textAnchor="middle"
              className="text-[10px] font-mono fill-ink-soft"
            >
              Principal Component 1 (PC1)
            </text>
            <text
              x={15}
              y={height / 2}
              textAnchor="middle"
              transform={`rotate(-90 15 ${height / 2})`}
              className="text-[10px] font-mono fill-ink-soft"
            >
              Principal Component 2 (PC2)
            </text>
          </svg>
        </div>

        {/* Selected Sample State & Rotation Angle Inspector */}
        <div className="rounded-lg border border-hairline bg-cream-deep/60 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-ink-soft">Selected Sample</span>
            {selectedPoint && (
              <span className="font-mono text-xs font-semibold text-ink">
                Patient #{selectedPoint.id}
              </span>
            )}
          </div>

          {selectedPoint ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded border border-hairline">
                <div className="text-[10px] font-mono text-ink-soft uppercase">Diagnostic Ground Truth</div>
                <div className="text-sm font-semibold mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedPoint.label === 1 ? "bg-amber-600" : "bg-emerald-600"
                    }`}
                  />
                  {selectedPoint.label === 1 ? "Malignant (Class 1)" : "Benign (Class 0)"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 bg-white rounded border border-hairline">
                  <div className="text-[10px] text-ink-soft">PC1 Coord</div>
                  <div className="font-semibold text-ink">{selectedPoint.pc1}</div>
                </div>
                <div className="p-2.5 bg-white rounded border border-hairline">
                  <div className="text-[10px] text-ink-soft">PC2 Coord</div>
                  <div className="font-semibold text-ink">{selectedPoint.pc2}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-ink-soft uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-quantum" />
                  Quantum Qubit Rotation Angles [−π, π]
                </div>
                <div className="space-y-1 font-mono">
                  {selectedPoint.angles.map((angle, wireIdx) => (
                    <div
                      key={wireIdx}
                      className="flex items-center justify-between p-2 rounded bg-white border border-hairline"
                    >
                      <span className="text-quantum font-medium">Qubit [{wireIdx}] Wire</span>
                      <span className="text-ink font-semibold">{angle.toFixed(4)} rad</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-ink-soft text-center py-8">
              Click any point on the manifold scatter plot to inspect its quantum angle coordinates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
