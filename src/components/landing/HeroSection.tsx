"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MatchTicket } from "./MatchTicket";

type HeroProps = {
  tournamentName: string;
  tagline: string;
  registrationOpen: boolean;
  deadline: string;
};

export function HeroSection({ tournamentName, tagline, registrationOpen, deadline }: HeroProps) {
  return (
    <section className="pitch-stripes divider-dashed border-b pt-28 pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 border border-dashed border-[rgba(255,201,74,0.25)] bg-[#112A1F] px-3 py-1.5">
              {registrationOpen && (
                <span className="live-dot h-2 w-2 shrink-0 rounded-full bg-[#FFC94A]" />
              )}
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A8B5A8]">
                {registrationOpen ? "live_registration" : "registration_closed"}
              </span>
            </div>

            <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-wide text-[#F0EBE3] sm:text-5xl lg:text-6xl">
              {tournamentName}
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#A8B5A8]">{tagline}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary px-7 py-3.5 text-base">
                Join Tournament
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/teams" className="btn-secondary px-7 py-3.5 text-base">
                View Squads
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-dashed border-[rgba(255,201,74,0.2)] pt-6 max-w-md">
              {[
                { label: "Squads", value: "5" },
                { label: "Capacity", value: "82" },
                { label: "Kickoff", value: "12 SEP" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#A8B5A8]">
                    {item.label}
                  </p>
                  <p className="font-mono mt-1 text-lg font-semibold text-[#FFC94A]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <MatchTicket
              tournamentName={tournamentName}
              deadline={deadline}
              registrationOpen={registrationOpen}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
