import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand lockup. The provided asset has white "WF" + pink "LADIES" on a
 * transparent background, so it sits on dark surfaces. On light surfaces use
 * variant="dark" which renders the wordmark in ink via the text fallback.
 */
export function Logo({
  className,
  width = 150,
  height = 60,
  priority,
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logos/wefit-ladies-pink.png"
      alt="WEFIT Ladies"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}

/** Text wordmark for light backgrounds / print / emails. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-1 font-extrabold tracking-tight", className)}>
      <span className="text-ink">WEFIT</span>
      <span className="text-pink-brand">Ladies</span>
    </span>
  );
}
