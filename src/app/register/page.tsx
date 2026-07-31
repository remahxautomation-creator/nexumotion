"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { UserPlus, Loader2 } from "lucide-react";
import { useT } from "@/i18n/client";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", companyName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { t } = useT();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t("auth.registrationFailed"));
      setBusy(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/account");
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="w-6 h-6 text-[#0052CC]" />
          <h1 className="text-xl font-bold text-slate-900">{t("auth.createAccount")}</h1>
        </div>
        {error && (
          <div className="mb-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{error}</div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">{t("auth.fullName")}</label>
            <input value={form.name} onChange={set("name")}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">{t("auth.company")}</label>
            <input value={form.companyName} onChange={set("companyName")}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">{t("auth.email")}</label>
            <input type="email" required value={form.email} onChange={set("email")}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">{t("auth.passwordHint")}</label>
            <input type="password" required minLength={8} value={form.password} onChange={set("password")}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40" />
          </div>
          <button type="submit" disabled={busy}
            className="w-full bg-[#0052CC] hover:bg-[#003D99] text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} {t("auth.createAccount")}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-4 text-center">
          {t("auth.alreadyRegistered")} <Link href="/login" className="text-[#0052CC] font-medium">{t("auth.signIn")}</Link>
        </p>
        <p className="text-xs text-slate-400 mt-4 text-center">
          {t("auth.browseFreely")}
        </p>
      </div>
    </div>
  );
}
