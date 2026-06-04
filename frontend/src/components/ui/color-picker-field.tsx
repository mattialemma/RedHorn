import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { IoColorPalette } from "react-icons/io5";

type ColorPickerFieldProps = {
  label: string;
  colors: string[];
  value: string;
  onChange: (color: string) => void;
};

export function ColorPickerField({ label, colors, value, onChange }: ColorPickerFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPickerOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPickerOpen]);

  return (
    <div>
      <h3 className="mb-6 text-sm font-bold text-slate-100">{label}</h3>
      <div className="grid w-fit grid-cols-4 items-center justify-items-start gap-x-4 gap-y-3">
        {colors.map((color) => {
          const isSelected = value === color;

          return (
            <button
              key={color}
              type="button"
              aria-label={`Seleziona colore ${color}`}
              onClick={() => onChange(color)}
              className={`h-11 w-11 rounded-full shadow-md transition-all hover:scale-110 ${
                isSelected ? "scale-110 ring-2 ring-blue-500 ring-offset-2 ring-offset-[#141920]" : "border border-white/10"
              }`}
              style={{ backgroundColor: color }}
            />
          );
        })}

        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            aria-label="Apri tabella colori personalizzata"
            onClick={() => setIsPickerOpen((current) => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white shadow-md transition-transform hover:scale-110"
            style={{ backgroundColor: value }}
          >
            <IoColorPalette
              size={21}
              aria-hidden="true"
              style={{ filter: "drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))" }}
            />
          </button>

          {isPickerOpen ? (
            <div className="absolute bottom-full right-0 z-[100] mb-3 rounded-xl border border-slate-700 bg-[#10151d] p-3 shadow-2xl">
              <HexColorPicker color={value} onChange={onChange} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

