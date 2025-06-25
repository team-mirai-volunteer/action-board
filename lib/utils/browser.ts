export function getOrigin(): string {
  return typeof window !== "undefined" ? window.location.origin : "";
}

export function getCurrentUrl(): string {
  return typeof window !== "undefined" ? window.location.href : "";
}
