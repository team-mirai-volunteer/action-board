export function getCurrentUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.href;
  }
  return "";
}

export function copyToClipboard(text: string): Promise<void> {
  if (typeof window !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error("Clipboard API not available"));
}
