"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/actions/admin";
import { Lock, Loader2 } from "lucide-react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await adminLogin(password);
    setLoading(false);
    if (result.success) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 w-full max-w-md">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
          <Lock className="h-7 w-7 text-green-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Admin Access</h1>
        <p className="mt-2 text-sm text-slate-400">Enter your admin password to continue</p>
      </div>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Admin password"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-600 focus:border-green-500/50 focus:outline-none"
        required
      />

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary mt-6 w-full disabled:opacity-50"
      >
        {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Sign In"}
      </button>
    </form>
  );
}
