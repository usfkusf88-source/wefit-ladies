import { cn } from "@/lib/utils";
import { statusMeta } from "@/lib/constants";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = statusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        meta.color,
        className
      )}
    >
      {meta.ar}
    </span>
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-gray-line bg-gray-soft px-2.5 py-0.5 text-xs font-medium text-zinc-700",
        className
      )}
    >
      {children}
    </span>
  );
}
