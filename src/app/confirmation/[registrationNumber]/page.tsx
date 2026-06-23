import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayerConfirmation } from "@/actions/registration";
import { STACK_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { CheckCircle, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ registrationNumber: string }>;
}) {
  const { registrationNumber } = await params;
  const player = await getPlayerConfirmation(registrationNumber);

  if (!player) notFound();

  const isPaid = player.paymentStatus === "PAID";

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 sm:p-12 text-center">
          <div
            className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
              isPaid ? "bg-green-500/20" : "bg-yellow-500/20"
            }`}
          >
            <CheckCircle className={`h-10 w-10 ${isPaid ? "text-green-400" : "text-yellow-400"}`} />
          </div>

          <h1 className="font-display text-3xl font-bold text-white">
            {isPaid ? "Registration Confirmed!" : "Registration Pending"}
          </h1>
          <p className="mt-3 text-slate-400">
            {isPaid
              ? "Welcome to the tournament. You have been assigned to your team."
              : "Complete payment to confirm your registration."}
          </p>

          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6 text-left space-y-4">
            <div className="flex justify-between border-b border-white/5 pb-3">
              <span className="text-slate-400">Registration Number</span>
              <span className="font-mono font-bold text-green-400">{player.registrationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Full Name</span>
              <span className="text-white">{player.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category</span>
              <span className="text-white">{STACK_LABELS[player.category]}</span>
            </div>
            {player.group && (
              <div className="flex justify-between">
                <span className="text-slate-400">Group</span>
                <span className="text-white">Group {player.group}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Status</span>
              <span className={isPaid ? "text-green-400" : "text-yellow-400"}>
                {player.paymentStatus}
              </span>
            </div>
            {player.paystackReference && (
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Ref</span>
                <span className="font-mono text-xs text-slate-300">{player.paystackReference}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Registered</span>
              <span className="text-white">{formatDate(player.createdAt)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/teams"
              className="btn-primary px-6 py-3"
            >
              View Teams
            </Link>
            {!isPaid && (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white"
              >
                <Download className="h-4 w-4" /> Complete Payment
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
