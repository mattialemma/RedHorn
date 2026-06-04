import type { ReactNode } from "react";

type BaseFolderCardProps = {
  color: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel: string;
};

export function BaseFolderCard({ color, children, onClick, className = "", ariaLabel }: BaseFolderCardProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="group relative flex h-full min-h-[206px] w-full flex-col rounded-lg text-left outline-none transition-transform duration-200 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-white/50"
    >
      <div
        className="absolute left-0 top-0 h-8 w-[40%] rounded-t-md transition-colors"
        style={{ backgroundColor: color, filter: "brightness(0.75)" }}
      />
      <div
        className="absolute inset-x-0 top-[10px] z-0 h-6 rounded-t-lg transition-colors"
        style={{ backgroundColor: color, filter: "brightness(1.14)" }}
      />
      <div
        className={`relative z-10 mt-[14px] flex min-h-[192px] flex-1 rounded-lg border border-white/15 shadow-folder transition-colors ${className}`}
        style={{ backgroundColor: color }}
      >
        {children}
      </div>
    </button>
  );
}
