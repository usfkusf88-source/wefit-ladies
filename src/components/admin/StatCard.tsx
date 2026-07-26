import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div className={cn("stat-card", accent && "bg-ink text-white")}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-sm font-medium", accent ? "text-white/60" : "text-zinc-500")}>{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
          {hint && <p className={cn("mt-1 text-xs", accent ? "text-white/50" : "text-zinc-400")}>{hint}</p>}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            accent ? "bg-white/10 text-pink-300" : "bg-pink-brand/10 text-pink-brand"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
