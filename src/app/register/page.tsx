"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLocale();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    if (password.length < 8) {
      setError(t.passwordTooShort);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      if (data.error === "emailTaken") setError(t.emailTaken);
      else if (data.error === "passwordTooShort") setError(t.passwordTooShort);
      else setError(t.errorGeneric);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-surface rounded-2xl shadow-sm border border-rim p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-ink mb-6 text-center">
          {t.registerTitle}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              {t.nameField}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              {t.emailField}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              {t.passwordField}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              {t.confirmNewPassword}
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="field"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? t.registering : t.createAccount}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-3">
          {t.alreadyHaveAccount}{" "}
          <Link href="/login" className="text-brand hover:text-brand-hover font-medium">
            {t.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
