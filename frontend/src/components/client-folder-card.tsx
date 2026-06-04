import type { Client } from "@/app/page";
import { mediaUrl } from "@/lib/media";
import { BaseFolderCard } from "./base-folder-card";

const folderColors = ["#20aee8", "#f59e0b", "#e64997", "#cfcfcf", "#15968b", "#55efa0", "#e00606", "#ffd65a"];

function hashName(name: string) {
  return Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getClientColor(name: string) {
  return folderColors[hashName(name) % folderColors.length];
}

function getContrastColor(hex: string, opacity = 1) {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const base = luminance > 0.58 ? "0, 0, 0" : "255, 255, 255";
  return `rgba(${base}, ${opacity})`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ClientFolderCard({ client }: { client: Client }) {
  const color = getClientColor(client.name);
  const textMain = getContrastColor(color, 1);
  const textSub = getContrastColor(color, 0.72);
  const imageUrl = mediaUrl(client.photo_url);
  const description = client.notes || client.category || `${client.active_projects_count} active projects`;

  return (
    <BaseFolderCard color={color} ariaLabel={`Open ${client.name}`} className="flex-col overflow-hidden p-5">
      <div className="mb-7 flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-white/35 bg-white/20 shadow-sm">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={`${client.name} photo`} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-bold" style={{ color: textMain }}>
            {initials(client.name) || "C"}
          </span>
        )}
      </div>

      <div className="mt-auto">
        <h2 className="mb-2 line-clamp-1 text-xl font-bold tracking-tight" style={{ color: textMain }}>
          {client.name}
        </h2>
        <p className="line-clamp-2 min-h-10 text-sm leading-relaxed" style={{ color: textSub }}>
          {description}
        </p>
      </div>
    </BaseFolderCard>
  );
}
