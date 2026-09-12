import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="gradient-primary relative flex h-7 w-7 items-center justify-center rounded-lg shadow-glow">
        <Activity className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          Crypto<span className="gradient-primary bg-clip-text text-transparent">Pulse</span>
        </span>
      )}
    </span>
  );
}
