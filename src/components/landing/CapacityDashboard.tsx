"use client";

import { StackCategory } from "@/lib/types";
import {
  GROUP_CAPACITY,
  RESERVE_CAPACITY,
  STACK_CATEGORIES,
  STACK_COLORS,
  STACK_LABELS,
} from "@/lib/constants";
import { OccupancyMap } from "@/lib/utils";
import { GlassCard, ProgressBar } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Props = { occupancy: OccupancyMap };

function CapacityCard({
  title,
  category,
  current,
  max,
  color,
}: {
  title: string;
  category: StackCategory;
  current: number;
  max: number;
  color: string;
}) {
  const percent = Math.round((current / max) * 100);
  const remaining = max - current;

  return (
    <GlassCard accentColor={color}>
      <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color }}>
        {STACK_COLORS[category].branch}
      </p>
      <h4 className="font-display mt-1 text-sm uppercase text-[#F0EBE3]">{title}</h4>
      <div className="mt-4 flex items-end justify-between">
        <p className="font-mono text-3xl font-bold text-[#F0EBE3]">
          <AnimatedCounter value={current} />
          <span className="text-lg text-[#6B7A6E]">/{max}</span>
        </p>
        <span className="font-mono text-sm" style={{ color }}>
          {percent}%
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar percent={percent} color={color} />
      </div>
      <p className="mt-2 font-mono text-[10px] text-[#6B7A6E]">
        {remaining > 0 ? `${remaining} slots open` : "FULL"}
      </p>
    </GlassCard>
  );
}

export function CapacityDashboard({ occupancy }: Props) {
  const cards: Array<{
    title: string;
    category: StackCategory;
    current: number;
    max: number;
    color: string;
  }> = [];

  for (const stack of STACK_CATEGORIES) {
    if (stack === "RESERVE") {
      cards.push({
        title: STACK_LABELS.RESERVE,
        category: "RESERVE",
        current: occupancy["RESERVE"] ?? 0,
        max: RESERVE_CAPACITY,
        color: STACK_COLORS.RESERVE.primary,
      });
    } else {
      (["A", "B"] as const).forEach((group) => {
        cards.push({
          title: `${STACK_LABELS[stack]} — Group ${group}`,
          category: stack,
          current: occupancy[`${stack}_${group}`] ?? 0,
          max: GROUP_CAPACITY,
          color: STACK_COLORS[stack].primary,
        });
      });
    }
  }

  return (
    <section className="pitch-stripes divider-dashed border-t py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFC94A]">
            // squad_capacity
          </p>
          <h2 className="font-display mt-2 text-3xl uppercase tracking-wide text-[#F0EBE3] sm:text-4xl">
            Slot Availability
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <CapacityCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
