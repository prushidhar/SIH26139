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
    <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
            Latent Manifold Projection
          </span>
          <h3 className="text-base font-bold text-[#082827] mt-0.5">
            2D PCA Space & Quantum Angle Coordinate Plane
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00B489] inline-block" />
            <span className="text-[#082827] font-semibold">Benign (0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-[#082827] font-semibold">Malignant (1)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Scatter Plot */}
        <div className="lg:col-span-2 relative bg-[#F8FBFA] rounded-2xl border border-[#DFEBE8] p-3 flex items-center justify-center">
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
        <div className="rounded-2xl border border-[#DFEBE8] bg-[#FAFDFD] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#5A7470]">Selected Sample</span>
            {selectedPoint && (
              <span className="font-mono text-xs font-bold text-[#006766] bg-[#E6F7F4] px-2 py-0.5 rounded-full border border-[#00B489]/25">
                Patient #{selectedPoint.id}
              </span>
            )}
          </div>

          {selectedPoint ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-[#DFEBE8] shadow-2xs">
                <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Diagnostic Ground Truth</div>
                <div className="text-sm font-bold text-[#082827] mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedPoint.label === 1 ? "bg-amber-500" : "bg-[#00B489]"
                    }`}
                  />
                  {selectedPoint.label === 1 ? "Malignant (Class 1)" : "Benign (Class 0)"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-3 bg-white rounded-xl border border-[#DFEBE8] shadow-2xs">
                  <div className="text-[10px] font-bold text-[#5A7470]">PC1 Coord</div>
                  <div className="font-bold text-[#082827] mt-0.5">{selectedPoint.pc1}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#DFEBE8] shadow-2xs">
                  <div className="text-[10px] font-bold text-[#5A7470]">PC2 Coord</div>
                  <div className="font-bold text-[#082827] mt-0.5">{selectedPoint.pc2}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#006766]" />
                  Quantum Qubit Rotation Angles [−π, π]
                </div>
                <div className="space-y-1.5 font-mono">
                  {selectedPoint.angles.map((angle, wireIdx) => (
                    <div
                      key={wireIdx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#DFEBE8] shadow-2xs"
                    >
                      <span className="text-[#006766] font-semibold">Qubit [{wireIdx}] Wire</span>
                      <span className="text-[#082827] font-bold">{angle.toFixed(4)} rad</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#5A7470] text-center py-8">
              Click any point on the manifold scatter plot to inspect its quantum angle coordinates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
