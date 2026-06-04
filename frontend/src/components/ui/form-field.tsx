import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type FieldShellProps = {
  label: string;
  count?: string;
  error?: string;
  children: ReactNode;
};

function FieldShell({ label, count, error, children }: FieldShellProps) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-slate-100">{label}</span>
        {count ? <span className="text-xs font-medium text-slate-400">{count}</span> : null}
      </div>
      {children}
      {error ? <p className="mt-2 text-xs font-medium text-red-300">{error}</p> : null}
    </label>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  count?: string;
  error?: string;
};

export function TextField({ label, count, error, className = "", ...props }: TextFieldProps) {
  return (
    <FieldShell label={label} count={count} error={error}>
      <input
        aria-invalid={Boolean(error)}
        className={`h-[54px] w-full rounded-lg border bg-slate-800/70 px-5 text-base text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 ${
          error ? "border-red-400/70" : "border-slate-700"
        } ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  count?: string;
  error?: string;
};

export function TextAreaField({ label, count, error, className = "", ...props }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} count={count} error={error}>
      <textarea
        aria-invalid={Boolean(error)}
        className={`min-h-[142px] w-full resize-none rounded-lg border bg-slate-800/70 px-5 py-5 text-base text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 ${
          error ? "border-red-400/70" : "border-slate-700"
        } ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

type SelectFieldProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  value: string;
  trailingIcon?: ReactNode;
};

export function SelectField({ label, value, trailingIcon, className = "", ...props }: SelectFieldProps) {
  return (
    <FieldShell label={label}>
      <button
        type="button"
        className={`flex h-[54px] w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-800/70 px-5 text-base font-bold text-white outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 ${className}`}
        {...props}
      >
        <span>{value}</span>
        {trailingIcon}
      </button>
    </FieldShell>
  );
}
