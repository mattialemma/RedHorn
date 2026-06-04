"use client";

import { useEffect, useMemo, useState } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import type { Client } from "@/app/page";
import { AddClientCard } from "./add-client-card";
import { CreateClientModal } from "./client-form/create-client-modal";
import { ClientFolderCard } from "./client-folder-card";

type ClientsScreenProps = {
  initialClients: Client[];
};

export function ClientsScreen({ initialClients }: ClientsScreenProps) {
  const [clients, setClients] = useState(initialClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) => client.name.toLowerCase().includes(query));
  }, [clients, searchQuery]);

  useEffect(() => {
    if (!isCreateClientOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCreateClientOpen]);

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#050506] text-white"
      style={{ background: "radial-gradient(circle at center, #303030 0%, #111 47%, #030303 82%)" }}
    >
      <section className={`min-h-screen transition duration-200 ${isCreateClientOpen ? "scale-[0.99] blur-sm" : ""}`}>
        <nav className="flex h-[84px] items-center justify-between border-b border-white/10 px-8 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Clients</h1>
          <div className="flex items-center gap-7">
            <button type="button" aria-label="Notifications" className="relative rounded-full p-2 text-white transition-colors hover:bg-white/10">
              <IoIosNotificationsOutline size={30} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Profile" className="h-11 w-11 rounded-full bg-slate-200 transition-transform hover:scale-105" />
          </div>
        </nav>

        <div className="px-8 pb-10 pt-12">
          <header className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="mb-1 text-4xl font-bold tracking-tight sm:text-5xl">Hello, Admin</h2>
            <p className="text-lg text-slate-400">Organize and manage your active project folders.</p>
          </header>

          <div className="relative mx-auto mb-14 max-w-[542px]">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Enter project's name"
              aria-label="Search clients"
              className="h-[42px] w-full rounded-full border border-black/10 bg-white px-4 pr-12 text-base text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus:ring-4 focus:ring-white/20"
            />
            <IoSearch className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-neutral-900" size={22} aria-hidden="true" />
          </div>

          <section className="grid grid-cols-1 gap-x-8 gap-y-[50px] md:grid-cols-2 xl:grid-cols-4" aria-label="Client folders">
            {!searchQuery.trim() ? <AddClientCard onClick={() => setIsCreateClientOpen(true)} /> : null}

            {filteredClients.map((client) => (
              <ClientFolderCard key={client.id} client={client} />
            ))}
          </section>

          {filteredClients.length === 0 ? (
            <p className="mt-12 text-center text-sm text-slate-400">
              {clients.length === 0 ? "No clients found." : `No clients found matching "${searchQuery}".`}
            </p>
          ) : null}
        </div>
      </section>
      <CreateClientModal
        isOpen={isCreateClientOpen}
        onClose={() => setIsCreateClientOpen(false)}
        onCreated={(client) => {
          setClients((current) => [...current, client].sort((a, b) => a.name.localeCompare(b.name)));
          setIsCreateClientOpen(false);
        }}
      />
    </main>
  );
}
