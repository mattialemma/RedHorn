import { IoMdAdd } from "react-icons/io";
import { BaseFolderCard } from "./base-folder-card";

type AddClientCardProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function AddClientCard({ onClick, disabled = false }: AddClientCardProps) {
  return (
    <BaseFolderCard color="#202738" ariaLabel="Add client" className={`p-2 ${disabled ? "pointer-events-none opacity-60" : ""}`} onClick={onClick}>
      <div className="flex min-h-[176px] w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-500/40 bg-slate-900/35 text-slate-300 transition-colors group-hover:border-white/35 group-hover:bg-white/5 group-hover:text-white">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950/35 shadow-inner">
          <IoMdAdd size={26} aria-hidden="true" />
        </div>
        <span className="text-lg font-medium tracking-wide">{disabled ? "Checking Drive..." : "Add client"}</span>
      </div>
    </BaseFolderCard>
  );
}
