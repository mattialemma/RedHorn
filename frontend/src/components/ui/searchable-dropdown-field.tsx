import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import type { DropdownOption } from "./dropdown-field";

type SearchableDropdownFieldProps = {
  label: string;
  value: string;
  options: DropdownOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  onChange: (value: string) => void;
};

export function SearchableDropdownField({
  label,
  value,
  options,
  placeholder = "Seleziona",
  searchPlaceholder = "Cerca...",
  error,
  onChange,
}: SearchableDropdownFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder;

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative">
      <p className="mb-2 text-sm font-bold text-slate-100">{label}</p>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-[54px] w-full items-center justify-between rounded-lg border bg-slate-800/70 px-5 text-base font-bold text-white outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 ${
          error ? "border-red-400/70" : "border-slate-700"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <FiChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border border-slate-700 bg-[#1b222d] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-slate-700 px-3 py-2">
            <FiSearch className="text-slate-400" size={17} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setQuery("");
                    setIsOpen(false);
                  }}
                  className={`block w-full px-5 py-3 text-left text-sm transition-colors hover:bg-white/10 ${
                    option.value === value ? "font-bold text-white" : "text-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="px-5 py-3 text-sm text-slate-400">Nessun paese trovato.</p>
            )}
          </div>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs font-medium text-red-300">{error}</p> : null}
    </div>
  );
}

