import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} · Skillign`
      : "Skillign · Catálogo de skills frontend";
  }, [title]);
}

export function safeInternalPath(value, fallback = "/") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }
  return value;
}

export function firstName(name) {
  return (name || "").trim().split(/\s+/)[0] || "";
}

export function formatCount(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}
