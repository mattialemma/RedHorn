const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "http://localhost:8100";

export function mediaUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${mediaBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

