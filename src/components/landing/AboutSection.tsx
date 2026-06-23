"use client";

import { CheckCircle, CreditCard, Users, Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FLOODLIGHT } from "@/lib/constants";

const steps = [
  {
    icon: Users,
    title: "Register",
    description: "Fill in your details and pick your professional stack.",
  },
  {
    icon: CheckCircle,
    title: "Choose Squad",
    description: "Group A or B within your branch. Reserve bench open to all.",
  },
  {
    icon: CreditCard,
    title: "Pay & Confirm",
    description: "₦1,500 via Paystack. Instant squad assignment on success.",
  },
  {
    icon: Trophy,
    title: "Kickoff",
    description: "Merge onto the pitch — September 12, 2026.",
  },
];

export function AboutSection() {
  return (
    <section className="divider-dashed border-t py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFC94A]">
              // about_ttc
            </p>
            <h2 className="font-display mt-2 text-3xl uppercase tracking-wide text-[#F0EBE3] sm:text-4xl">
              Dev Squads. Real Turf.
            </h2>
            <p className="mt-6 leading-relaxed text-[#A8B5A8]">
              Tech Turf Championship brings together backend, frontend, mobile, and UI/UX
              professionals for a community football tournament. Squads are organized like
              git branches — discipline forks, group leaves, reserve on the trunk.
            </p>
            <ul className="mt-8 space-y-3 border-t border-dashed border-[rgba(255,201,74,0.15)] pt-6">
              {[
                "9 players per group · 82 total capacity",
                "Reserve bench: 10 substitute players",
                "Kickoff: 12 September 2026",
                "No accounts — register, pay, play",
              ].map((rule) => (
                <li key={rule} className="flex items-center gap-2 text-sm text-[#A8B5A8]">
                  <CheckCircle className="h-4 w-4 shrink-0" style={{ color: FLOODLIGHT }} />
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {steps.map((step) => (
              <GlassCard key={step.title}>
                <div className="mb-3 inline-flex rounded-sm p-2" style={{ backgroundColor: `${FLOODLIGHT}18` }}>
                  <step.icon className="h-5 w-5" style={{ color: FLOODLIGHT }} />
                </div>
                <h3 className="font-display text-sm uppercase text-[#F0EBE3]">{step.title}</h3>
                <p className="mt-2 text-sm text-[#A8B5A8]">{step.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
