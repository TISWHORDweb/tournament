import { StackCategory } from "@/lib/types";
import { STACK_CATEGORIES, STACK_COLORS, STACK_LABELS } from "@/lib/constants";
import { getPlayersGroupedByTeam } from "@/lib/tournament";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

function PlayerList({ players, emptyMessage }: { players: Array<{ fullName: string; registrationNumber: string }>; emptyMessage: string }) {
  if (players.length === 0) {
    return <p className="text-sm text-slate-600 italic py-4">{emptyMessage}</p>;
  }
  return (
    <ul className="divide-y divide-white/5">
      {players.map((p, i) => (
        <li key={p.registrationNumber} className="flex items-center gap-3 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-slate-400">
            {i + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-white">{p.fullName}</p>
            <p className="text-xs text-slate-500 font-mono">{p.registrationNumber}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function TeamsPage() {
  const grouped = await getPlayersGroupedByTeam();

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Tournament Teams
          </h1>
          <p className="mt-3 text-slate-400">All registered players by category and group</p>
        </div>

        <div className="space-y-12">
          {STACK_CATEGORIES.map((stack) => {
            const color = STACK_COLORS[stack].primary;

            if (stack === "RESERVE") {
              const players = grouped["RESERVE"] ?? [];
              return (
                <section key={stack}>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-1 w-8 rounded" style={{ backgroundColor: color }} />
                    <h2 className="font-display text-2xl font-bold text-white">
                      {STACK_LABELS.RESERVE}
                    </h2>
                    <span className="rounded-full bg-white/5 px-3 py-0.5 text-xs text-slate-400">
                      {players.length}/10
                    </span>
                  </div>
                  <div className="glass-card p-6">
                    <PlayerList players={players} emptyMessage="No reserve players yet" />
                  </div>
                </section>
              );
            }

            return (
              <section key={stack}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-1 w-8 rounded" style={{ backgroundColor: color }} />
                  <h2 className="font-display text-2xl font-bold text-white">
                    {STACK_LABELS[stack as StackCategory]}
                  </h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {(["A", "B"] as const).map((group) => {
                    const key = `${stack}_${group}`;
                    const players = grouped[key] ?? [];
                    return (
                      <div key={key} className="glass-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="font-display font-semibold text-white flex items-center gap-2">
                            <Users className="h-4 w-4" style={{ color }} />
                            Group {group}
                          </h3>
                          <span className="text-xs text-slate-500">{players.length}/9</span>
                        </div>
                        <PlayerList players={players} emptyMessage="No players registered yet" />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
