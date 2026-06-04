export function apiUrl(path: string) {
  const baseUrl =
    typeof window === "undefined"
      ? process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
      : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
