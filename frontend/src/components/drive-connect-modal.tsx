"use client";

import { useId, useState } from "react";
import { FiHardDrive, FiX } from "react-icons/fi";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export type DriveSettings = {
  google_account_email: string;
  drive_id: string;
  clients_root_folder_name: string;
  clients_root_folder_id: string;
  clients_root_folder_url: string;
  is_connected: boolean;
  oauth_available: boolean;
};

type DriveConnectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  driveSettings: DriveSettings | null;
  errorMessage?: string;
};

export function DriveConnectModal({ isOpen, onClose, driveSettings, errorMessage = "" }: DriveConnectModalProps) {
  const titleId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const oauthAvailable = driveSettings?.oauth_available ?? true;

  const connectDrive = async () => {
    setIsSubmitting(true);
    window.localStorage.setItem("redhorn_open_client_after_drive", "1");
    window.location.href = apiUrl("/drive/oauth/start/");
  };

  return (
    <Modal isOpen={isOpen} labelledBy={titleId}>
      <div className="flex max-h-[min(760px,calc(100vh-32px))] flex-col">
        <div className="flex items-start justify-between gap-6 px-9 pt-9">
          <div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-100">
              <FiHardDrive size={24} aria-hidden="true" />
            </div>
            <h2 id={titleId} className="text-3xl font-bold tracking-tight text-white">
              Connetti Google Drive
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-400">
              Accedi con Google e autorizza RedHorn a creare la cartella clienti nel tuo Drive.
            </p>
          </div>
          <button
            type="button"
            aria-label="Chiudi"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <FiX size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-4 px-9 py-8">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-5 py-4 text-sm leading-relaxed text-slate-300">
            Verrà creata automaticamente una cartella <span className="font-bold text-white">clients</span>. Dentro quella cartella verranno create le cartelle dei clienti.
          </div>
          {!oauthAvailable ? (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
              Configura prima Google OAuth sul server.
            </p>
          ) : null}
          {errorMessage ? (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <footer className="flex items-center justify-between border-t border-slate-700 px-9 py-6">
          <Button variant="ghost" onClick={onClose} className="px-0">
            Annulla
          </Button>
          <Button icon={<FiHardDrive size={18} />} onClick={connectDrive} disabled={isSubmitting || !oauthAvailable}>
            {isSubmitting ? "Apertura Google..." : "Continua con Google"}
          </Button>
        </footer>
      </div>
    </Modal>
  );
}
