"use client";

import { useState } from "react";
import { StackCategory, TeamGroup } from "@/lib/types";
import { createRegistration } from "@/actions/registration";
import { STACK_LABELS, STACK_SHORT, formatCurrency } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  User,
  Users,
} from "lucide-react";

type Availability = Awaited<
  ReturnType<typeof import("@/actions/registration").getRegistrationAvailability>
>;

type FormData = {
  fullName: string;
  phone: string;
  email: string;
  slackUsername: string;
  discordUsername: string;
  category: StackCategory | "";
  group: TeamGroup | "";
};

const STEPS = ["Personal Info", "Category", "Group", "Payment"];

export function RegistrationWizard({
  availability,
  registrationFee,
}: {
  availability: Availability;
  registrationFee: number;
}) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    slackUsername: "",
    discordUsername: "",
    category: "",
    group: "",
  });

  const update = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  };

  const canProceed = () => {
    if (step === 0) return form.fullName && form.phone && form.email;
    if (step === 1) return !!form.category;
    if (step === 2) return form.category === "RESERVE" || !!form.group;
    return true;
  };

  const getCategoryAvailability = (cat: StackCategory) => {
    const item = availability.availability.find((a) => a.category === cat);
    if (!item) return { remaining: 0, available: false };
    if (cat === "RESERVE" && "remaining" in item) {
      return { remaining: item.remaining, available: item.available };
    }
    if ("groups" in item && item.groups) {
      const total = item.groups.reduce((s, g) => s + g.remaining, 0);
      return { remaining: total, available: item.groups.some((g) => g.available) };
    }
    return { remaining: 0, available: false };
  };

  const getGroupAvailability = (group: TeamGroup) => {
    const item = availability.availability.find((a) => a.category === form.category);
    if (!item || !("groups" in item) || !item.groups) return { remaining: 0, available: false };
    const g = item.groups.find((x) => x.group === group);
    return g ?? { remaining: 0, available: false };
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    const result = await createRegistration({
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      slackUsername: form.slackUsername || undefined,
      discordUsername: form.discordUsername || undefined,
      category: form.category as StackCategory,
      group: form.category === "RESERVE" ? null : (form.group as TeamGroup),
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error || "Something went wrong");
      return;
    }
    if (result.paymentUrl) {
      window.location.href = result.paymentUrl;
    }
  };

  const next = () => {
    if (step === 1 && form.category === "RESERVE") {
      setStep(3);
      return;
    }
    if (step < 3) setStep((s) => s + 1);
    else handlePayment();
  };

  const back = () => {
    if (step === 3 && form.category === "RESERVE") setStep(1);
    else setStep((s) => Math.max(0, s - 1));
  };

  if (!availability.settings.registrationOpen) {
    return (
      <div className="glass-card p-12 text-center">
        <h2 className="font-display text-2xl font-bold text-white">Registration Closed</h2>
        <p className="mt-3 text-slate-400">Registration is not currently open. Check back later.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Progress */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                  i <= step ? "bg-green-500 text-white" : "bg-slate-800 text-slate-500"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-xs sm:block", i <= step ? "text-white" : "text-slate-500")}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn("mx-2 hidden h-px w-8 sm:block", i < step ? "bg-green-500" : "bg-slate-700")} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {step === 0 && (
          <div>
              <div className="mb-6 flex items-center gap-3">
                <User className="h-6 w-6 text-green-400" />
                <h2 className="font-display text-xl font-bold text-white">Personal Information</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Full Name *", field: "fullName" as const, type: "text", placeholder: "John Doe" },
                  { label: "Phone Number *", field: "phone" as const, type: "tel", placeholder: "+234..." },
                  { label: "Email Address *", field: "email" as const, type: "email", placeholder: "john@example.com" },
                  { label: "Slack Username", field: "slackUsername" as const, type: "text", placeholder: "@john" },
                  { label: "Discord Username", field: "discordUsername" as const, type: "text", placeholder: "john#1234" },
                ].map((input) => (
                  <div key={input.field} className={input.field === "fullName" ? "sm:col-span-2" : ""}>
                    <label className="mb-1.5 block text-sm text-slate-400">{input.label}</label>
                    <input
                      type={input.type}
                      value={form[input.field]}
                      onChange={(e) => update(input.field, e.target.value)}
                      placeholder={input.placeholder}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="mb-6 flex items-center gap-3">
                <Users className="h-6 w-6 text-green-400" />
                <h2 className="font-display text-xl font-bold text-white">Select Your Category</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["BACKEND", "FRONTEND", "MOBILE", "UI_UX", "RESERVE"] as StackCategory[]).map((cat) => {
                  const { remaining, available } = getCategoryAvailability(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        update("category", cat);
                        update("group", "");
                      }}
                      className={cn(
                        "rounded-xl border p-4 text-left transition",
                        form.category === cat
                          ? "border-green-500 bg-green-500/10"
                          : available
                            ? "border-white/10 bg-white/5 hover:border-white/20"
                            : "border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed"
                      )}
                    >
                      <p className="font-semibold text-white">{STACK_LABELS[cat]}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {available ? `${remaining} slots remaining` : "Full"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-6 flex items-center gap-3">
                <Users className="h-6 w-6 text-green-400" />
                <h2 className="font-display text-xl font-bold text-white">
                  Select Group — {STACK_SHORT[form.category as StackCategory]}
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {(["A", "B"] as TeamGroup[]).map((group) => {
                  const { remaining, available } = getGroupAvailability(group);
                  return (
                    <button
                      key={group}
                      type="button"
                      disabled={!available}
                      onClick={() => update("group", group)}
                      className={cn(
                        "rounded-xl border p-6 text-center transition",
                        form.group === group
                          ? "border-green-500 bg-green-500/10"
                          : available
                            ? "border-white/10 bg-white/5 hover:border-white/20"
                            : "border-white/5 opacity-50 cursor-not-allowed"
                      )}
                    >
                      <p className="font-display text-2xl font-bold text-white">Group {group}</p>
                      <p className="mt-2 text-sm text-slate-400">
                        {available ? `${remaining} of 9 slots left` : "Full"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-6 flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-green-400" />
                <h2 className="font-display text-xl font-bold text-white">Payment</h2>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Name</span>
                  <span className="text-white">{form.fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Category</span>
                  <span className="text-white">{STACK_LABELS[form.category as StackCategory]}</span>
                </div>
                {form.category !== "RESERVE" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Group</span>
                    <span className="text-white">Group {form.group}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="font-semibold text-white">Registration Fee</span>
                  <span className="font-display text-xl font-bold text-green-400">
                    {formatCurrency(registrationFee)}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                You will be redirected to Paystack for secure payment. Your spot is reserved upon successful payment.
              </p>
            </div>
          )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canProceed() || loading}
            className="btn-primary px-8 py-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step === 3 ? (
              <>Pay with Paystack <CreditCard className="h-4 w-4" /></>
            ) : (
              <>Continue <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
