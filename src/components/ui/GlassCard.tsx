"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  accentColor,
}: {
  children: ReactNode;
  className?: string;
  accentColor?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("ttc-card p-6", className)}
      style={accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 2, borderLeftStyle: "solid" } : undefined}
    >
      {children}
    </div>
  );
}

export function ProgressBar({ percent, color = "#FFC94A" }: { percent: number; color?: string}) {
  return (
    <div className="h-1.5 w-full overflow-hidden bg-[#0B2419]">
      <div
        className="h-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, percent)}%`, backgroundColor: color }}
      />
    </div>
  );
}
