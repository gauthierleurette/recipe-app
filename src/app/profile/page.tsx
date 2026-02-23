"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLocale();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!session) {
    router.push("/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmNewPassword) {
      setError(t.passwordMismatch);
      return;
    }
    if (newPassword.length < 8) {
      setError(t.passwordTooShort);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(t.passwordChanged);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } else {
      const data = await res.json();
      if (data.error === "incorrectPassword") setError(t.incorrectPassword);
      else if (data.error === "passwordTooShort") setError(t.passwordTooShort);
      else setError(t.errorGeneric);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">{t.profile}</h1>

      {/* Account info */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-6 space-y-3">
        <h2 className="font-semibold text-stone-800">{t.accountInfo}</h2>
        <p className="text-sm text-stone-600">{session.user.name}</p>
        <p className="text-sm text-stone-400">{session.user.email}</p>
      </section>

      {/* Change password */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-stone-800">{t.changePassword}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1">
              {t.currentPassword}
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1">
              {t.newPassword}
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1">
              {t.confirmNewPassword}
            </label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="field"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            {loading ? t.saving : t.changePassword}
          </button>
        </form>
      </section>
    </div>
  );
}
