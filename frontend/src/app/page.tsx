import { ClientsScreen } from "@/components/clients-screen";
import { apiUrl } from "@/lib/api";

export type Client = {
  id: number;
  name: string;
  category: string;
  status: string;
  notes: string;
  photo_url: string;
  drive_folder_id: string;
  drive_folder_url: string;
  drive_sync_status: string;
  drive_sync_error: string;
  active_projects_count: number;
  open_invoices_amount: string | null;
};

async function getClients(): Promise<Client[]> {
  try {
    const response = await fetch(apiUrl("/clients/"), { cache: "no-store" });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const clients = await getClients();

  return <ClientsScreen initialClients={clients} />;
}
