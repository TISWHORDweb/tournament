import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { logoutAction } from "@/actions/logout";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getAllPlayersForAdmin,
  getDashboardMetrics,
  getPublishedAnnouncements,
} from "@/lib/tournament";
import { LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin");

  const [players, metrics, announcements] = await Promise.all([
    getAllPlayersForAdmin(),
    getDashboardMetrics(),
    getPublishedAnnouncements(),
  ]);

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-end">
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </form>
        </div>
        <AdminDashboardClient
          players={players}
          announcements={announcements}
          metrics={metrics}
        />
        <p className="mt-8 text-center text-xs text-slate-600">
          <Link href="/" className="hover:text-green-400">
            ← Back to tournament site
          </Link>
        </p>
      </div>
    </div>
  );
}
