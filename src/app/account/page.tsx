import { UserCircle } from "lucide-react";

export const metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <UserCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h1 className="text-xl font-bold text-slate-900">Account</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
        Sign-in, order history, project/BOM manager, and saved searches arrive in the next
        phase (NextAuth integration). Guest checkout is available without an account.
      </p>
    </div>
  );
}
