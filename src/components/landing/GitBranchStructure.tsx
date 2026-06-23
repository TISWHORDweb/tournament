"use client";

import { useState } from "react";
import { StackCategory } from "@/lib/types";
import {
  GROUP_CAPACITY,
  RESERVE_CAPACITY,
  STACK_COLORS,
  STACK_LABELS,
  STACK_SHORT,
} from "@/lib/constants";
import { OccupancyMap } from "@/lib/utils";

type Props = { occupancy: OccupancyMap };

const stacks: StackCategory[] = ["BACKEND", "FRONTEND", "MOBILE", "UI_UX"];

/** Git-branch diagram: main → discipline branches → group A|B leaves, reserve on trunk */
export function GitBranchStructure({ occupancy }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const branchLayout = stacks.map((stack, i) => ({
    stack,
    x: 80 + i * 145,
    color: STACK_COLORS[stack].primary,
  }));

  return (
    <section className="pitch-stripes-alt divider-dashed border-t py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFC94A]">
            git log --graph --oneline
          </p>
          <h2 className="font-display mt-2 text-3xl uppercase tracking-wide text-[#F0EBE3] sm:text-4xl">
            Squad Branch Map
          </h2>
          <p className="mt-3 text-sm text-[#A8B5A8]">
            main splits into discipline branches · each forks into Group A &amp; B · reserve stays on
            trunk until kickoff merge
          </p>
        </div>

        <div className="ttc-card overflow-x-auto p-6 sm:p-8">
          <svg
            viewBox="0 0 640 420"
            className="w-full min-w-[560px]"
            fill="none"
            role="img"
            aria-label="Git branch diagram of tournament team structure"
          >
            {/* Kickoff merge — top */}
            <g>
              <circle cx="320" cy="36" r="14" fill="#0F2E20" stroke="#FFC94A" strokeWidth="2" />
              <text
                x="320"
                y="40"
                textAnchor="middle"
                fill="#FFC94A"
                fontSize="9"
                fontFamily="var(--font-jetbrains), monospace"
              >
                ●
              </text>
              <text
                x="320"
                y="68"
                textAnchor="middle"
                fill="#F0EBE3"
                fontSize="11"
                fontFamily="var(--font-jetbrains), monospace"
              >
                main (kickoff)
              </text>
              <text
                x="320"
                y="82"
                textAnchor="middle"
                fill="#A8B5A8"
                fontSize="8"
                fontFamily="var(--font-jetbrains), monospace"
              >
                merge @ 12 SEP 2026
              </text>
            </g>

            {/* Trunk down to reserve */}
            <line
              x1="320"
              y1="50"
              x2="320"
              y2="100"
              stroke="#FFC94A"
              strokeWidth="2"
              strokeDasharray="4 2"
              opacity="0.6"
            />

            {/* Horizontal branch bar */}
            <line x1="80" y1="100" x2="560" y2="100" stroke="#A8B5A8" strokeWidth="1.5" opacity="0.4" />

            {branchLayout.map(({ stack, x, color }, i) => {
              const countA = occupancy[`${stack}_A`] ?? 0;
              const countB = occupancy[`${stack}_B`] ?? 0;
              const branchName = STACK_COLORS[stack].branch;

              return (
                <g key={stack}>
                  {/* Branch line down */}
                  <line
                    x1={x}
                    y1="100"
                    x2={x}
                    y2="140"
                    stroke={color}
                    strokeWidth="2"
                  />

                  {/* Commit node — discipline */}
                  <g
                    onMouseEnter={() => setHovered(stack)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "default" }}
                  >
                    <rect
                      x={x - 52}
                      y="140"
                      width="104"
                      height="44"
                      rx="2"
                      fill={hovered === stack ? "#143828" : "#112A1F"}
                      stroke={color}
                      strokeWidth={hovered === stack ? 2 : 1}
                      strokeDasharray="4 2"
                    />
                    <text
                      x={x}
                      y="158"
                      textAnchor="middle"
                      fill={color}
                      fontSize="9"
                      fontFamily="var(--font-jetbrains), monospace"
                    >
                      {branchName}
                    </text>
                    <text
                      x={x}
                      y="172"
                      textAnchor="middle"
                      fill="#A8B5A8"
                      fontSize="8"
                      fontFamily="var(--font-jetbrains), monospace"
                    >
                      {STACK_SHORT[stack]} · {countA + countB}/{GROUP_CAPACITY * 2}
                    </text>
                  </g>

                  {/* Fork to A & B */}
                  <line x1={x} y1="184" x2={x - 28} y2="220" stroke={color} strokeWidth="1.5" opacity="0.7" />
                  <line x1={x} y1="184" x2={x + 28} y2="220" stroke={color} strokeWidth="1.5" opacity="0.7" />

                  {(["A", "B"] as const).map((group, gi) => {
                    const gx = x + (gi === 0 ? -28 : 28);
                    const count = group === "A" ? countA : countB;
                    const nodeId = `${stack}_${group}`;

                    return (
                      <g
                        key={nodeId}
                        onMouseEnter={() => setHovered(nodeId)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <circle
                          cx={gx}
                          cy="228"
                          r="6"
                          fill={color}
                          opacity={hovered === nodeId ? 1 : 0.85}
                        />
                        <rect
                          x={gx - 36}
                          y="248"
                          width="72"
                          height="36"
                          rx="2"
                          fill={hovered === nodeId ? "#143828" : "#0F2E20"}
                          stroke={color}
                          strokeWidth="1"
                          strokeDasharray="3 2"
                        />
                        <text
                          x={gx}
                          y="264"
                          textAnchor="middle"
                          fill="#F0EBE3"
                          fontSize="8"
                          fontFamily="var(--font-jetbrains), monospace"
                        >
                          grp-{group.toLowerCase()}
                        </text>
                        <text
                          x={gx}
                          y="276"
                          textAnchor="middle"
                          fill={color}
                          fontSize="8"
                          fontFamily="var(--font-jetbrains), monospace"
                        >
                          {count}/{GROUP_CAPACITY}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Reserve on trunk */}
            <line
              x1="320"
              y1="100"
              x2="320"
              y2="300"
              stroke={STACK_COLORS.RESERVE.primary}
              strokeWidth="1.5"
              strokeDasharray="6 3"
              opacity="0.5"
            />
            <g
              onMouseEnter={() => setHovered("RESERVE")}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x="248"
                y="310"
                width="144"
                height="48"
                rx="2"
                fill={hovered === "RESERVE" ? "#143828" : "#112A1F"}
                stroke={STACK_COLORS.RESERVE.primary}
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text
                x="320"
                y="332"
                textAnchor="middle"
                fill={STACK_COLORS.RESERVE.primary}
                fontSize="9"
                fontFamily="var(--font-jetbrains), monospace"
              >
                reserve (trunk)
              </text>
              <text
                x="320"
                y="346"
                textAnchor="middle"
                fill="#A8B5A8"
                fontSize="8"
                fontFamily="var(--font-jetbrains), monospace"
              >
                {occupancy["RESERVE"] ?? 0}/{RESERVE_CAPACITY} substitutes · open merge
              </text>
            </g>

            {/* Legend */}
            <text
              x="16"
              y="400"
              fill="#A8B5A8"
              fontSize="7"
              fontFamily="var(--font-jetbrains), monospace"
            >
              * {STACK_LABELS.BACKEND.split(" ")[0]}={STACK_COLORS.BACKEND.primary}
            </text>
            <text
              x="16"
              y="412"
              fill="#A8B5A8"
              fontSize="7"
              fontFamily="var(--font-jetbrains), monospace"
            >
              frontend · mobile · ui-ux · reserve
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
