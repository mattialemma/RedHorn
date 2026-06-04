import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "bg-white text-black hover:bg-slate-200 focus-visible:ring-white/50",
  ghost: "bg-transparent text-slate-400 hover:text-white focus-visible:ring-white/30",
};

export function Button({ variant = "primary", icon, className = "", children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex h-12 min-w-28 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClassNames[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

