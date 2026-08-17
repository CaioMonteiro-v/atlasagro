import { BADGE_STYLES, labelTipo } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function TipoBadge({ tipo }: { tipo: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        BADGE_STYLES[tipo] ?? "bg-stone-200 text-stone-700",
      )}
    >
      {labelTipo(tipo)}
    </span>
  );
}
