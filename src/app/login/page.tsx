"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t.invalidCredentials);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-surface rounded-2xl shadow-sm border border-rim p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-ink mb-6 text-center">
          {t.appName}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? t.signingIn : t.signIn}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-3">
          {t.noAccount}{" "}
          <Link href="/register" className="text-brand hover:text-brand-hover font-medium">
            {t.createAccount}
          </Link>
        </p>
      </div>
    </div>
  );
}
