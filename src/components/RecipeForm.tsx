"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

type Ingredient = { name: string; quantity: string; unit: string };
type Step = { instruction: string };

type RecipeFormProps = {
  initial?: {
    id?: string;
    title?: string;
    description?: string;
    cuisine?: string;
    prepTime?: number | null;
    cookTime?: number | null;
    servings?: number | null;
    ingredients?: Ingredient[];
    steps?: Step[];
    tags?: string[];
  };
};

export function RecipeForm({ initial }: RecipeFormProps) {
  const router = useRouter();
  const isEditing = !!initial?.id;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [cuisine, setCuisine] = useState(initial?.cuisine ?? "");
  const [prepTime, setPrepTime] = useState(String(initial?.prepTime ?? ""));
  const [cookTime, setCookTime] = useState(String(initial?.cookTime ?? ""));
  const [servings, setServings] = useState(String(initial?.servings ?? ""));
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial?.ingredients ?? [{ name: "", quantity: "", unit: "" }]
  );
  const [steps, setSteps] = useState<Step[]>(
    initial?.steps ?? [{ instruction: "" }]
  );
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [existingTags, setExistingTags] = useState<{ id: string; name: string }[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setExistingTags)
      .catch(() => {});
  }, []);

  // --- Ingredients ---
  function addIngredient() {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  }
  function removeIngredient(i: number) {
    setIngredients(ingredients.filter((_, idx) => idx !== i));
  }
  function updateIngredient(i: number, field: keyof Ingredient, value: string) {
    setIngredients(
      ingredients.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing))
    );
  }

  // --- Steps ---
  function addStep() {
    setSteps([...steps, { instruction: "" }]);
  }
  function removeStep(i: number) {
    setSteps(steps.filter((_, idx) => idx !== i));
  }
  function updateStep(i: number, value: string) {
    setSteps(steps.map((s, idx) => (idx === i ? { instruction: value } : s)));
  }

  // --- Tags ---
  function addTag(name: string) {
    const normalized = name.trim().toLowerCase();
    if (normalized && !tags.includes(normalized)) {
      setTags([...tags, normalized]);
    }
    setTagInput("");
  }
  function removeTag(name: string) {
    setTags(tags.filter((t) => t !== name));
  }
  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  const suggestedTags = existingTags.filter(
    (t) => !tags.includes(t.name) && t.name.includes(tagInput.toLowerCase())
  );

  // --- Submit ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title,
      description,
      cuisine: cuisine.trim() || null,
      prepTime: prepTime || null,
      cookTime: cookTime || null,
      servings: servings || null,
      ingredients: ingredients.filter((i) => i.name.trim()),
      steps: steps.filter((s) => s.instruction.trim()),
      tags,
    };

    const url = isEditing ? `/api/recipes/${initial?.id}` : "/api/recipes";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const recipe = await res.json();

    for (const file of imageFiles) {
      const form = new FormData();
      form.append("file", file);
      form.append("recipeId", recipe.id);
      await fetch("/api/upload", { method: "POST", body: form });
    }

    router.push(`/recipes/${recipe.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Basic info */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-stone-800">Basic info</h2>

        <div>
          <label className="block text-sm font-medium text-stone-800 mb-1">Title *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-800 mb-1">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-800 mb-1">Cuisine</label>
          <input
            placeholder="e.g. Italian, Japanese, French…"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="field"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1">Prep (min)</label>
            <input type="number" min="0" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1">Cook (min)</label>
            <input type="number" min="0" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1">Servings</label>
            <input type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} className="field" />
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-stone-800">Tags</h2>

        {/* Selected tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="tag-chip flex items-center gap-1">
                #{t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="text-orange-400 hover:text-orange-700 leading-none"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag input */}
        <input
          placeholder="Type a tag and press Enter or comma…"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          className="field"
        />

        {/* Suggestions from existing tags */}
        {tagInput && suggestedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => addTag(t.name)}
                className="badge hover:bg-stone-200 transition-colors cursor-pointer"
              >
                + {t.name}
              </button>
            ))}
          </div>
        )}

        {/* Existing tags as quick-add chips */}
        {!tagInput && existingTags.filter((t) => !tags.includes(t.name)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {existingTags
              .filter((t) => !tags.includes(t.name))
              .map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => addTag(t.name)}
                  className="badge hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  + {t.name}
                </button>
              ))}
          </div>
        )}
      </section>

      {/* Ingredients */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-stone-800">Ingredients</h2>

        {ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input placeholder="Qty" value={ing.quantity} onChange={(e) => updateIngredient(i, "quantity", e.target.value)} className="field w-16" />
            <input placeholder="Unit" value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} className="field w-20" />
            <input placeholder="Ingredient name" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} className="field flex-1" />
            <button type="button" onClick={() => removeIngredient(i)} className="text-stone-400 hover:text-red-500 transition-colors px-1">✕</button>
          </div>
        ))}

        <button type="button" onClick={addIngredient} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
          + Add ingredient
        </button>
      </section>

      {/* Steps */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-stone-800">Steps</h2>

        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="mt-2 text-sm font-bold text-stone-400 w-5 shrink-0">{i + 1}</span>
            <textarea
              rows={2}
              placeholder={`Step ${i + 1}`}
              value={step.instruction}
              onChange={(e) => updateStep(i, e.target.value)}
              className="field flex-1"
            />
            <button type="button" onClick={() => removeStep(i)} className="mt-2 text-stone-400 hover:text-red-500 transition-colors px-1">✕</button>
          </div>
        ))}

        <button type="button" onClick={addStep} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
          + Add step
        </button>
      </section>

      {/* Photos */}
      {!isEditing && (
        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-stone-800">Photos</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
            className="text-sm text-stone-700 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
          />
        </section>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading ? "Saving…" : isEditing ? "Save changes" : "Create recipe"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-stone-500 hover:text-stone-700 font-medium px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
