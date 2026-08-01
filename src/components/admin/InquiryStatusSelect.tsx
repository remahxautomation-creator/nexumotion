"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/client";

export default function InquiryStatusSelect({
  id,
  value,
  options,
}: {
  id: string;
  value: string;
  options: string[];
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { t } = useT();

  const change = async (next: string) => {
    setBusy(true);
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert(t("admin.updateFailed"));
  };

  return (
    <select
      defaultValue={value}
      disabled={busy}
      onChange={(e) => change(e.target.value)}
      className="text-xs border border-slate-300 rounded-md px-1.5 py-1 bg-white disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o} value={o}>{t(`inqStatus.${o}` as never)}</option>
      ))}
    </select>
  );
}
