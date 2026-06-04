import type { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  children: ReactNode;
  labelledBy: string;
};

export function Modal({ isOpen, children, labelledBy }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6" role="presentation">
      <section
        aria-labelledby={labelledBy}
        aria-modal="true"
        role="dialog"
        className="max-h-[calc(100vh-32px)] w-full max-w-[738px] overflow-hidden rounded-xl border border-slate-700 bg-[#141920] shadow-2xl"
      >
        {children}
      </section>
    </div>
  );
}

