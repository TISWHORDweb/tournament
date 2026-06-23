import { getPublishedAnnouncements } from "@/lib/tournament";
import { formatDate } from "@/lib/utils";
import { Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

const TYPE_COLORS: Record<string, string> = {
  MATCH: "#22c55e",
  FIXTURE: "#3b82f6",
  TEAM_UPDATE: "#8b5cf6",
  VENUE: "#f59e0b",
  NEWS: "#64748b",
};

export default async function AnnouncementsPage() {
  const announcements = await getPublishedAnnouncements();

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Tournament Announcements
          </h1>
          <p className="mt-3 text-slate-400">Match dates, fixtures, venue info, and tournament news</p>
        </div>

        {announcements.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Megaphone className="mx-auto h-12 w-12 text-slate-600" />
            <p className="mt-4 text-slate-400">No announcements yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <article key={a.id} className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: TYPE_COLORS[a.type] ?? "#64748b" }}
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${TYPE_COLORS[a.type]}20`,
                          color: TYPE_COLORS[a.type],
                        }}
                      >
                        {a.type.replace("_", " ")}
                      </span>
                      <time className="text-xs text-slate-600">{formatDate(a.publishedAt)}</time>
                    </div>
                    <h2 className="mt-2 font-display text-xl font-semibold text-white">{a.title}</h2>
                    <p className="mt-3 text-slate-400 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
