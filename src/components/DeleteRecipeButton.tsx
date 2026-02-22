"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteRecipeButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this recipe? This cannot be undone.")) return;

    setLoading(true);
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
