import Link from "next/link";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { TournamentStats } from "@/components/landing/TournamentStats";
import { GitBranchStructure } from "@/components/landing/GitBranchStructure";
import { CapacityDashboard } from "@/components/landing/CapacityDashboard";
import { getOccupancyMap, getPublishedAnnouncements, getTournamentSettings } from "@/lib/tournament";
import { calculateStats, formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { FLOODLIGHT } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, occupancy, announcements] = await Promise.all([
    getTournamentSettings(),
    getOccupancyMap(),
    getPublishedAnnouncements(),
  ]);

  const stats = calculateStats(occupancy);

  return (
    <>
      <HeroSection
        tournamentName={settings.tournamentName}
        tagline={settings.tournamentTagline}
        registrationOpen={settings.registrationOpen}
        deadline={settings.registrationDeadline.toISOString()}
      />
      <TournamentStats {...stats} />
      <AboutSection />
      <GitBranchStructure occupancy={occupancy} />
      <CapacityDashboard occupancy={occupancy} />

      {announcements.length > 0 && (
        <section className="pitch-stripes-alt divider-dashed border-t py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-2xl uppercase tracking-wide text-[#F0EBE3]">
                Dispatch
              </h2>
              <Link
                href="/announcements"
                className="inline-flex items-center gap-1 font-mono text-xs text-[#FFC94A] hover:underline"
              >
                view_all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="ttc-card p-5">
                  <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: FLOODLIGHT }}>
                    {a.type.replace("_", " ")}
                  </span>
                  <h3 className="font-display mt-2 text-base uppercase text-[#F0EBE3]">{a.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#A8B5A8]">{a.content}</p>
                  <p className="mt-3 font-mono text-[10px] text-[#6B7A6E]">{formatDate(a.publishedAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
