"use client";

import { useState } from "react";
import {
  approvePlayer,
  createAnnouncement,
  deleteAnnouncement,
  moveToReserve,
  removePlayer,
  transferPlayer,
} from "@/actions/admin";
import { AnnouncementType, StackCategory, TeamGroup } from "@/lib/types";
import { STACK_LABELS, formatCurrency } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Check,
  Download,
  Trash2,
  UserMinus,
  ArrowRightLeft,
  Plus,
  X,
} from "lucide-react";

type Player = {
  id: string;
  registrationNumber: string;
  fullName: string;
  phone: string;
  email: string;
  slackUsername: string | null;
  discordUsername: string | null;
  category: StackCategory;
  group: TeamGroup | null;
  status: string;
  paymentStatus: string;
  paystackReference: string | null;
  registrationFee: number;
  createdAt: Date;
  payment: { reference: string; amount: number; status: string; paidAt: Date | null } | null;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  published: boolean;
  publishedAt: Date;
};

type Metrics = {
  totalRegistrations: number;
  totalPlayers: number;
  totalPayments: number;
  availableSlots: number;
  reservePlayers: number;
  revenue: number;
};

export function AdminDashboardClient({
  players,
  announcements,
  metrics,
}: {
  players: Player[];
  announcements: Announcement[];
  metrics: Metrics;
}) {
  const [tab, setTab] = useState<"overview" | "players" | "announcements" | "payments">("overview");
  const [filter, setFilter] = useState<string>("all");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    type: "NEWS" as AnnouncementType,
  });
  const [transferModal, setTransferModal] = useState<{ playerId: string; name: string } | null>(null);
  const [transferData, setTransferData] = useState<{ category: StackCategory; group: TeamGroup }>({
    category: "BACKEND",
    group: "A",
  });

  const filteredPlayers =
    filter === "all"
      ? players
      : filter === "RESERVE"
        ? players.filter((p) => p.category === "RESERVE")
        : players.filter((p) => p.category === filter);

  const handleExportCSV = async () => {
    const res = await fetch("/api/admin/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tournament-players-${Date.now()}.csv`;
    a.click();
  };

  const handleExportExcel = async () => {
    const res = await fetch("/api/admin/export-excel");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tournament-players-${Date.now()}.xlsx`;
    a.click();
  };

  const handleCreateAnnouncement = async () => {
    await createAnnouncement(announcementForm);
    setShowAnnouncementForm(false);
    setAnnouncementForm({ title: "", content: "", type: "NEWS" });
    window.location.reload();
  };

  const handleTransfer = async () => {
    if (!transferModal) return;
    if (transferData.category === "RESERVE") {
      await moveToReserve(transferModal.playerId);
    } else {
      await transferPlayer(transferModal.playerId, transferData.category, transferData.group);
    }
    setTransferModal(null);
    window.location.reload();
  };

  const statCards = [
    { label: "Total Registrations", value: metrics.totalRegistrations },
    { label: "Paid Players", value: metrics.totalPlayers },
    { label: "Successful Payments", value: metrics.totalPayments },
    { label: "Available Slots", value: metrics.availableSlots },
    { label: "Reserve Players", value: metrics.reservePlayers },
    { label: "Revenue", value: formatCurrency(metrics.revenue) },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400">Manage players, payments, and announcements</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
          >
            <Download className="h-4 w-4" /> Excel
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["overview", "players", "announcements", "payments"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t ? "bg-green-500 text-white" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((s) => (
            <div key={s.label} className="glass-card p-6">
              <p className="text-sm text-slate-400">{s.label}</p>
              <p className="mt-2 font-display text-3xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "players" && (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {["all", "BACKEND", "FRONTEND", "MOBILE", "UI_UX", "RESERVE"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  filter === f ? "bg-green-500/20 text-green-400" : "bg-white/5 text-slate-400"
                }`}
              >
                {f === "all" ? "All" : STACK_LABELS[f as StackCategory]}
              </button>
            ))}
          </div>

          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-slate-400">
                  <th className="p-4">Player</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <p className="font-medium text-white">{p.fullName}</p>
                      <p className="text-xs text-slate-500 font-mono">{p.registrationNumber}</p>
                    </td>
                    <td className="p-4 text-slate-300">
                      {STACK_LABELS[p.category]}
                      {p.group ? ` · Grp ${p.group}` : ""}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.status === "APPROVED"
                            ? "bg-green-500/20 text-green-400"
                            : p.status === "REMOVED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={p.paymentStatus === "PAID" ? "text-green-400" : "text-yellow-400"}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {p.status !== "APPROVED" && (
                          <button
                            onClick={() => approvePlayer(p.id).then(() => window.location.reload())}
                            className="rounded p-1.5 hover:bg-green-500/20 text-green-400"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setTransferModal({ playerId: p.id, name: p.fullName })}
                          className="rounded p-1.5 hover:bg-blue-500/20 text-blue-400"
                          title="Transfer"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </button>
                        {p.category !== "RESERVE" && (
                          <button
                            onClick={() => moveToReserve(p.id).then(() => window.location.reload())}
                            className="rounded p-1.5 hover:bg-orange-500/20 text-orange-400"
                            title="Move to Reserve"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        )}
                        {p.category === "RESERVE" && (
                          <button
                            onClick={() =>
                              setTransferModal({ playerId: p.id, name: p.fullName })
                            }
                            className="rounded p-1.5 hover:bg-purple-500/20 text-purple-400"
                            title="Promote to Team"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removePlayer(p.id).then(() => window.location.reload())}
                          className="rounded p-1.5 hover:bg-red-500/20 text-red-400"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "announcements" && (
        <div>
          <button
            onClick={() => setShowAnnouncementForm(true)}
            className="btn-primary mb-4 px-4 py-2 text-sm"
          >
            <Plus className="h-4 w-4" /> New Announcement
          </button>

          {showAnnouncementForm && (
            <div className="glass-card mb-6 p-6 space-y-4">
              <div className="flex justify-between">
                <h3 className="font-semibold text-white">Create Announcement</h3>
                <button onClick={() => setShowAnnouncementForm(false)}>
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <input
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Title"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              />
              <textarea
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Content"
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              />
              <select
                value={announcementForm.type}
                onChange={(e) =>
                  setAnnouncementForm((f) => ({ ...f, type: e.target.value as AnnouncementType }))
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              >
                {(["MATCH", "FIXTURE", "TEAM_UPDATE", "VENUE", "NEWS"] as AnnouncementType[]).map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateAnnouncement}
                className="btn-primary px-6 py-2 text-sm"
              >
                Publish
              </button>
            </div>
          )}

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="glass-card p-4 flex justify-between items-start">
                <div>
                  <span className="text-xs text-green-400 uppercase">{a.type.replace("_", " ")}</span>
                  <h3 className="font-semibold text-white">{a.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{a.content}</p>
                  <p className="text-xs text-slate-600 mt-2">{formatDate(a.publishedAt)}</p>
                </div>
                <button
                  onClick={() => deleteAnnouncement(a.id).then(() => window.location.reload())}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-slate-400">
                <th className="p-4">Player</th>
                <th className="p-4">Reference</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Paid At</th>
              </tr>
            </thead>
            <tbody>
              {players
                .filter((p) => p.payment)
                .map((p) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="p-4 text-white">{p.fullName}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {p.payment?.reference}
                    </td>
                    <td className="p-4 text-slate-300">
                      {formatCurrency(p.payment?.amount ?? 0)}
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          p.payment?.status === "PAID" ? "text-green-400" : "text-yellow-400"
                        }
                      >
                        {p.payment?.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {p.payment?.paidAt ? formatDate(p.payment.paidAt) : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6">
            <h3 className="font-display text-lg font-bold text-white">
              Transfer {transferModal.name}
            </h3>
            <div className="mt-4 space-y-3">
              <select
                value={transferData.category}
                onChange={(e) =>
                  setTransferData((d) => ({
                    ...d,
                    category: e.target.value as StackCategory,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              >
                {(["BACKEND", "FRONTEND", "MOBILE", "UI_UX", "RESERVE"] as StackCategory[]).map(
                  (c) => (
                    <option key={c} value={c}>
                      {STACK_LABELS[c]}
                    </option>
                  )
                )}
              </select>
              {transferData.category !== "RESERVE" && (
                <select
                  value={transferData.group}
                  onChange={(e) =>
                    setTransferData((d) => ({ ...d, group: e.target.value as TeamGroup }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                >
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                </select>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setTransferModal(null)}
                className="flex-1 rounded-full border border-white/10 py-2 text-sm text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="btn-primary flex-1 py-2 text-sm"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
