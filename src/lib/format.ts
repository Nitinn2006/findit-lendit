export function formatRelative(dateInput: string | Date) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDate(dateInput: string | Date) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function daysUntil(dateInput: string | Date) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
