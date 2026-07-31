"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 border border-slate-300 rounded-lg px-4 py-2 bg-white"
    >
      <LogOut className="w-4 h-4" /> Sign out
    </button>
  );
}
