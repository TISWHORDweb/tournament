"use client";

import { Users, Target, Shield, Timer } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { FLOODLIGHT, STACK_COLORS } from "@/lib/constants";

type StatsProps = {
  totalRegistered: number;
  remainingSlots: number;
  availableTeams: number;
  reserveRemaining: number;
  progressPercent: number;
};

export function TournamentStats(props: StatsProps) {
  const stats = [
    { label: "registered", value: props.totalRegistered, icon: Users, color: FLOODLIGHT },
    { label: "slots_left", value: props.remainingSlots, icon: Target, color: STACK_COLORS.BACKEND.primary },
    { label: "open_stacks", value: props.availableTeams, icon: Shield, color: STACK_COLORS.MOBILE.primary },
    { label: "reserve_left", value: props.reserveRemaining, icon: Timer, color: STACK_COLORS.UI_UX.primary },
  ];

  return (
    <section className="pitch-stripes-alt py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFC94A]">
            // live_stats
          </p>
          <h2 className="font-display mt-2 text-3xl uppercase tracking-wide text-[#F0EBE3] sm:text-4xl">
            Scoreboard
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <GlassCard key={stat.label} accentColor={stat.color}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#A8B5A8]">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-mono text-4xl font-bold text-[#F0EBE3]">
                    <AnimatedCounter value={stat.value} />
                  </p>
                </div>
                <div className="rounded-sm p-2.5" style={{ backgroundColor: `${stat.color}22` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-xs text-[#A8B5A8]">registration_progress</span>
            <span className="font-mono text-lg font-bold text-[#FFC94A]">
              <AnimatedCounter value={props.progressPercent} />%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden bg-[#0B2419]">
            <div
              className="h-full bg-[#FFC94A] transition-all duration-700"
              style={{ width: `${props.progressPercent}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[10px] text-[#6B7A6E]">
            {props.totalRegistered}/82 slots filled
          </p>
        </GlassCard>
      </div>
    </section>
  );
}
