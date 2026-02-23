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

  function toggleTag(name: string) {
    if (selected.includes(name)) removeTag(name);
    else addTag(name);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (query.trim()) addTag(query);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
    // Backspace intentionally does NOT remove selected tags — only clears typed query
  }

  // All predefined tag names (English keys)
  const predefinedNames = Object.values(t.tagCategories).flatMap((c) => c.tags);

  function matchesQuery(name: string) {
    if (query === "") return true;
    const q = query.toLowerCase();
    return name.includes(q) || (t.tagLabels[name] ?? "").toLowerCase().includes(q);
  }

  // Existing tags from DB that are not in predefined list, not yet selected
  const filteredExisting = existingTags.filter(
    (tag) =>
      !selected.includes(tag.name) &&
      !predefinedNames.includes(tag.name) &&
      matchesQuery(tag.name)
  );

  const hasDropdownContent =
    filteredExisting.length > 0 ||
    Object.values(t.tagCategories).some((c) => c.tags.some(matchesQuery));

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <span key={tag} className="tag-chip flex items-center gap-1">
              #{t.tagLabels[tag] ?? tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-brand hover:text-brand-hover leading-none"
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
          <div className="absolute z-20 mt-1 w-full bg-surface border border-rim rounded-xl shadow-md max-h-72 overflow-y-auto">
            {/* Custom existing tags from DB */}
            {filteredExisting.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-ink-3 font-medium px-2 mb-1">{t.existingTags}</p>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {filteredExisting.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); addTag(tag.name); }}
                      className="badge hover:bg-surface-alt transition-colors cursor-pointer"
                    >
                      + {t.tagLabels[tag.name] ?? tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Predefined categories — always visible, selected ones highlighted */}
            <div className="p-2 border-t border-rim">
              {Object.entries(t.tagCategories).map(([key, category]) => {
                const visibleTags = category.tags.filter(matchesQuery);
                if (visibleTags.length === 0) return null;
                return (
                  <div key={key} className="mb-2 last:mb-0">
                    <p className="text-xs text-ink-3 font-medium px-2 mb-1">{category.label}</p>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {visibleTags.map((name) => {
                        const isSelected = selected.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); toggleTag(name); }}
                            className={`badge transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-brand-mid text-brand border-brand-line hover:bg-brand-tint"
                                : "hover:bg-surface-alt"
                            }`}
                          >
                            {isSelected ? "✓" : "+"} {t.tagLabels[name] ?? name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
