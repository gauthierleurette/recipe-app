"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useLocale } from "@/context/LocaleContext";

type ExistingTag = { id: string; name: string };

type TagPickerProps = {
  selected: string[];
  onChange: (tags: string[]) => void;
};

export function TagPicker({ selected, onChange }: TagPickerProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [existingTags, setExistingTags] = useState<ExistingTag[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setExistingTags)
      .catch(() => {});
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function addTag(name: string) {
    const normalized = name.trim().toLowerCase();
    if (normalized && !selected.includes(normalized)) {
      onChange([...selected, normalized]);
    }
    setQuery("");
  }

  function removeTag(name: string) {
    onChange(selected.filter((t) => t !== name));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (query.trim()) addTag(query);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !query && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  }

  // Predefined tags flattened for filtering
  const predefinedTags = Object.values(t.tagCategories).flatMap((c) => c.tags);

  // Existing tags not yet selected, filtered by query
  const filteredExisting = existingTags.filter(
    (tag) =>
      !selected.includes(tag.name) &&
      (query === "" || tag.name.includes(query.toLowerCase()))
  );

  // Predefined tags not yet selected, filtered by query
  const filteredPredefined = predefinedTags.filter(
    (name) =>
      !selected.includes(name) &&
      !existingTags.some((t) => t.name === name) &&
      (query === "" || name.includes(query.toLowerCase()))
  );

  const hasDropdownContent = filteredExisting.length > 0 || filteredPredefined.length > 0;

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <span key={tag} className="tag-chip flex items-center gap-1">
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-orange-400 hover:text-orange-700 leading-none"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          placeholder={t.tagInputPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="field"
        />

        {/* Dropdown */}
        {open && hasDropdownContent && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-md max-h-72 overflow-y-auto">
            {/* Existing tags from DB */}
            {filteredExisting.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-stone-400 font-medium px-2 mb-1">{t.existingTags}</p>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {filteredExisting.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); addTag(tag.name); }}
                      className="badge hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      + {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Predefined categories */}
            {filteredPredefined.length > 0 && (
              <div className="p-2 border-t border-stone-100">
                {Object.entries(t.tagCategories).map(([key, category]) => {
                  const visibleTags = category.tags.filter(
                    (name) =>
                      !selected.includes(name) &&
                      !existingTags.some((t) => t.name === name) &&
                      (query === "" || name.includes(query.toLowerCase()))
                  );
                  if (visibleTags.length === 0) return null;
                  return (
                    <div key={key} className="mb-2 last:mb-0">
                      <p className="text-xs text-stone-400 font-medium px-2 mb-1">{category.label}</p>
                      <div className="flex flex-wrap gap-1.5 px-1">
                        {visibleTags.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); addTag(name); }}
                            className="badge hover:bg-stone-200 transition-colors cursor-pointer"
                          >
                            + {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
