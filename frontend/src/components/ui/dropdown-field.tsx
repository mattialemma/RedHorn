import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export type DropdownOption = {
  label: string;
  value: string;
};

type DropdownFieldProps = {
  label: string;
  value: string;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
};

export function DropdownField({ label, value, options, placeholder = "Seleziona", error, onChange }: DropdownFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder;

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
        <span>{selectedLabel}</span>
        <FiChevronDown size={20} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border border-slate-700 bg-[#1b222d] py-2 shadow-2xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`block w-full px-5 py-3 text-left text-sm transition-colors hover:bg-white/10 ${
                option.value === value ? "font-bold text-white" : "text-slate-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs font-medium text-red-300">{error}</p> : null}
    </div>
  );
}
