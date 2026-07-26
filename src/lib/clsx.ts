// Tiny classnames helper (no external dep) to keep the bundle lean.
type ClassValue = string | number | null | false | undefined | Record<string, boolean> | ClassValue[];

export function clsx(...args: ClassValue[]): string {
  const out: string[] = [];
  for (const a of args) {
    if (!a) continue;
    if (typeof a === "string" || typeof a === "number") {
      out.push(String(a));
    } else if (Array.isArray(a)) {
      const inner = clsx(...a);
      if (inner) out.push(inner);
    } else if (typeof a === "object") {
      for (const [k, v] of Object.entries(a)) {
        if (v) out.push(k);
      }
    }
  }
  return out.join(" ");
}
