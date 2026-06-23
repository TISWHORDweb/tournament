"use client";

import { useEffect, useState } from "react";

const EVENT_DATE = "12 SEP 2026";
const VENUE = "COMMUNITY TURF · LAGOS";

function getTimeLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function BarcodeStrip({ seed }: { seed: string } ) {
  const bars = Array.from({ length: 52 }, (_, i) => {
    const h = ((seed.charCodeAt(i % seed.length) + i * 7) % 5) + 2;
    return h;
  });

  return (
    <div className="flex items-end justify-center gap-[1px] h-10 w-full px-2" aria-hidden>
      {bars.map((h, i) => (
        <div
          key={i}
          className="bg-[#0B2419]"
          style={{ width: i % 3 === 0 ? 2 : 1, height: `${h * 5}px`, opacity: 0.85 }}
        />
      ))}
    </div>
  );
}

function PerforatedDivider() {
  return (
    <div className="relative my-0 flex items-center py-1">
      <div className="absolute -left-3 h-6 w-6 rounded-full bg-[#0B2419]" />
      <div className="absolute -right-3 h-6 w-6 rounded-full bg-[#0B2419]" />
      <div className="flex w-full items-center">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="mx-[2px] h-1 w-1 shrink-0 rounded-full bg-[#0B2419]/60"
          />
        ))}
      </div>
    </div>
  );
}

type MatchTicketProps = {
  tournamentName: string;
  deadline: string;
  registrationOpen: boolean;
};

export function MatchTicket({ tournamentName, deadline, registrationOpen }: MatchTicketProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    setMounted(true);
    setTime(getTimeLeft(deadline));
    const interval = setInterval(() => setTime(getTimeLeft(deadline)), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const countdown = [
    { label: "D", value: time.days },
    { label: "H", value: time.hours },
    { label: "M", value: time.minutes },
    { label: "S", value: time.seconds },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="overflow-hidden rounded-sm border border-dashed border-[rgba(255,201,74,0.25)] bg-[#F5F0E6] text-[#0B2419] shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        {/* Ticket header stub */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] font-medium tracking-[0.25em] text-[#6B6560]">
                ADMIT ONE
              </p>
              <h2 className="font-display mt-1 text-2xl uppercase leading-none tracking-wide text-[#0B2419] sm:text-3xl">
                {tournamentName}
              </h2>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] tracking-widest text-[#6B6560]">TTC</p>
              <p className="font-mono text-xs font-semibold text-[#0B2419]">{EVENT_DATE}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#0B2419]/15 pt-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-[#6B6560]">
                Venue
              </p>
              <p className="font-mono text-[11px] font-medium">{VENUE}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {registrationOpen && (
                <span className="live-dot mr-1.5 inline-block h-2 w-2 rounded-full bg-[#C17B5C]" />
              )}
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B6560]">
                {registrationOpen ? "Reg open" : "Reg closed"}
              </span>
            </div>
          </div>
        </div>

        <PerforatedDivider />

        {/* Countdown stub */}
        <div className="bg-[#EDE8DC] px-5 py-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#6B6560]">
            // registration_closes_in
          </p>

          {mounted && time.expired ? (
            <p className="font-mono mt-2 text-sm text-[#C17B5C]">DEADLINE_PASSED</p>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {countdown.map((unit) => (
                <div
                  key={unit.label}
                  className="border border-dashed border-[#0B2419]/20 bg-[#F5F0E6] px-2 py-2.5 text-center"
                >
                  <p className="font-mono text-2xl font-bold tabular-nums leading-none text-[#0B2419]">
                    {mounted ? String(unit.value).padStart(2, "0") : "--"}
                  </p>
                  <p className="font-mono mt-1 text-[9px] tracking-widest text-[#6B6560]">
                    {unit.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t border-dashed border-[#0B2419]/15 pt-3">
            <p className="font-mono text-[8px] tracking-[0.15em] text-[#6B6560] mb-2">
              SCAN_AT_GATE · REF TTC-2026
            </p>
            <BarcodeStrip seed={deadline} />
          </div>
        </div>
      </div>
    </div>
  );
}
