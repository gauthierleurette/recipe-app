"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TagPicker } from "./TagPicker";
import { useLocale } from "@/context/LocaleContext";

type Ingredient = { name: string; quantity: string; unit: string };
type Step = { instruction: string };

type ExistingImage = { id: string; path: string; alt: string };

type RecipeFormProps = {
  initial?: {
    id?: string;
    title?: string;
    description?: string;
    cuisine?: string;
    madeOn?: string | null;
    prepTime?: number | null;
    cookTime?: number | null;
    servings?: number | null;
    ingredients?: Ingredient[];
    steps?: Step[];
    tags?: string[];
    images?: ExistingImage[];
  };
};

export function RecipeForm({ initial }: RecipeFormProps) {
  const router = useRouter();
  const { t } = useLocale();
  const isEditing = !!initial?.id;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [cuisine, setCuisine] = useState(initial?.cuisine ?? "");
  const [madeOn, setMadeOn] = useState(
    initial?.madeOn
      ? initial.madeOn.slice(0, 10)
      : isEditing
      ? ""
      : new Date().toISOString().slice(0, 10)
  );
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
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(initial?.images ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // --- Image delete ---
  async function deleteExistingImage(id: string) {
    await fetch(`/api/images/${id}`, { method: "DELETE" });
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  }

  // --- Submit ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title,
      description,
      cuisine: cuisine.trim() || null,
      madeOn: madeOn || null,
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
      setError(t.errorGeneric);
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
      <section className="bg-surface rounded-2xl border border-rim shadow-sm p-6 space-y-4">
        <h2 className="font-display font-semibold text-ink">{t.basicInfo}</h2>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">{t.titleField}</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">{t.descriptionField}</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">{t.cuisineField}</label>
          <input
            placeholder={t.cuisinePlaceholder}
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="field"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t.prepField}</label>
            <input type="number" inputMode="numeric" min="0" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t.cookField}</label>
            <input type="number" inputMode="numeric" min="0" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t.servingsField}</label>
            <input type="number" inputMode="numeric" min="1" value={servings} onChange={(e) => setServings(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t.firstMadeField}</label>
            <input type="date" value={madeOn} onChange={(e) => setMadeOn(e.target.value)} className="field" />
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="bg-surface rounded-2xl border border-rim shadow-sm p-6 space-y-3">
        <h2 className="font-display font-semibold text-ink">{t.tagsSection}</h2>
        <TagPicker selected={tags} onChange={setTags} />
      </section>

      {/* Ingredients */}
      <section className="bg-surface rounded-2xl border border-rim shadow-sm p-6 space-y-3">
        <h2 className="font-display font-semibold text-ink">{t.ingredientsForm}</h2>

        {ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input inputMode="decimal" placeholder={t.qtyPlaceholder} value={ing.quantity} onChange={(e) => updateIngredient(i, "quantity", e.target.value)} className="field w-16" />
            <input placeholder={t.unitPlaceholder} value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} className="field w-20" />
            <input placeholder={t.ingredientNamePlaceholder} value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} className="field flex-1" />
            <button type="button" onClick={() => removeIngredient(i)} className="text-ink-3 hover:text-red-500 transition-colors px-1">✕</button>
          </div>
        ))}

        <button type="button" onClick={addIngredient} className="text-sm text-brand hover:text-brand-hover font-medium">
          {t.addIngredient}
        </button>
      </section>

      {/* Steps */}
      <section className="bg-surface rounded-2xl border border-rim shadow-sm p-6 space-y-3">
        <h2 className="font-display font-semibold text-ink">{t.stepsForm}</h2>

        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="mt-2 text-sm font-bold text-ink-3 w-5 shrink-0">{i + 1}</span>
            <textarea
              rows={2}
              placeholder={t.stepPlaceholder(i + 1)}
              value={step.instruction}
              onChange={(e) => updateStep(i, e.target.value)}
              className="field flex-1"
            />
            <button type="button" onClick={() => removeStep(i)} className="mt-2 text-ink-3 hover:text-red-500 transition-colors px-1">✕</button>
          </div>
        ))}

        <button type="button" onClick={addStep} className="text-sm text-brand hover:text-brand-hover font-medium">
          + {t.stepsForm}
        </button>
      </section>

      {/* Photos */}
      <section className="bg-surface rounded-2xl border border-rim shadow-sm p-6 space-y-3">
        <h2 className="font-display font-semibold text-ink">{t.photosSection}</h2>

        {existingImages.length > 0 && (
          <div>
            <p className="text-xs text-ink-3 mb-2">{t.existingPhotos}</p>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                  <Image src={img.path} alt={img.alt || ""} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => deleteExistingImage(img.id)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xl transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          {isEditing && <p className="text-xs text-ink-3 mb-2">{t.addMorePhotos}</p>}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
            className="text-sm text-ink-2 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-tint file:text-brand hover:file:bg-brand-mid"
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading ? t.saving : isEditing ? t.saveChanges : t.createRecipe}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-ink-3 hover:text-ink font-medium px-4 py-2.5 transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
