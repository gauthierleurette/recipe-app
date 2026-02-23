"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TagPicker } from "./TagPicker";
import { useLocale } from "@/context/LocaleContext";

type Ingredient = { name: string; quantity: string; unit: string };
type Step = { instruction: string };

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
    initial?.madeOn ? initial.madeOn.slice(0, 10) : ""
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
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-stone-800">{t.basicInfo}</h2>

        <div>
          <label className="block text-sm font-medium text-stone-800 mb-1">{t.titleField}</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-800 mb-1">{t.descriptionField}</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-800 mb-1">{t.cuisineField}</label>
          <input
            placeholder={t.cuisinePlaceholder}
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="field"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1">{t.prepField}</label>
            <input type="number" min="0" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1">{t.cookField}</label>
            <input type="number" min="0" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1">{t.servingsField}</label>
            <input type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1">{t.firstMadeField}</label>
            <input type="date" value={madeOn} onChange={(e) => setMadeOn(e.target.value)} className="field" />
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-stone-800">{t.tagsSection}</h2>
        <TagPicker selected={tags} onChange={setTags} />
      </section>

      {/* Ingredients */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-stone-800">{t.ingredientsForm}</h2>

        {ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input placeholder={t.qtyPlaceholder} value={ing.quantity} onChange={(e) => updateIngredient(i, "quantity", e.target.value)} className="field w-16" />
            <input placeholder={t.unitPlaceholder} value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} className="field w-20" />
            <input placeholder={t.ingredientNamePlaceholder} value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} className="field flex-1" />
            <button type="button" onClick={() => removeIngredient(i)} className="text-stone-400 hover:text-red-500 transition-colors px-1">✕</button>
          </div>
        ))}

        <button type="button" onClick={addIngredient} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
          {t.addIngredient}
        </button>
      </section>

      {/* Steps */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-stone-800">{t.stepsForm}</h2>

        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="mt-2 text-sm font-bold text-stone-400 w-5 shrink-0">{i + 1}</span>
            <textarea
              rows={2}
              placeholder={t.stepPlaceholder(i + 1)}
              value={step.instruction}
              onChange={(e) => updateStep(i, e.target.value)}
              className="field flex-1"
            />
            <button type="button" onClick={() => removeStep(i)} className="mt-2 text-stone-400 hover:text-red-500 transition-colors px-1">✕</button>
          </div>
        ))}

        <button type="button" onClick={addStep} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
          + {t.stepsForm}
        </button>
      </section>

      {/* Photos */}
      {!isEditing && (
        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-stone-800">{t.photosSection}</h2>
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
          {loading ? t.saving : isEditing ? t.saveChanges : t.createRecipe}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-stone-500 hover:text-stone-700 font-medium px-4 py-2.5 transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
