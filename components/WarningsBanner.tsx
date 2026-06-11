"use client";

import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import type { QualityWarning } from "@/lib/types/api";

interface WarningsBannerProps {
  warnings: QualityWarning[];
}

const SEVERITY_STYLE: Record<
  QualityWarning["severity"],
  { wrapper: string; icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  info: {
    wrapper:
      "border-sky-400/40 bg-sky-500/10 text-sky-900 dark:border-sky-500/50 dark:bg-sky-950/40 dark:text-sky-200",
    icon: Info,
    label: "Sugestão",
  },
  warn: {
    wrapper:
      "border-amber-400/40 bg-amber-500/10 text-amber-900 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-200",
    icon: AlertTriangle,
    label: "Atenção",
  },
  error: {
    wrapper:
      "border-red-400/40 bg-red-500/10 text-red-900 dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-200",
    icon: ShieldAlert,
    label: "Inconsistência",
  },
};

export function WarningsBanner({ warnings }: WarningsBannerProps) {
  if (warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
        Nenhum alerta identificado pelo quality-check.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {warnings.map((warning, index) => {
        const style = SEVERITY_STYLE[warning.severity];
        const Icon = style.icon;
        return (
          <div
            key={`${warning.field}-${index}`}
            className={`rounded-2xl border px-4 py-3 text-sm ${style.wrapper}`}
          >
            <div className="flex items-start gap-2.5">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <div className="font-semibold">
                  {style.label}{" "}
                  <code className="rounded bg-black/20 px-1.5 py-0.5 text-[11px] font-mono opacity-90 dark:bg-white/10 dark:opacity-100">
                    {warning.field}
                  </code>
                </div>
                <p className="text-[13px] leading-relaxed opacity-95 dark:opacity-100">{warning.message}</p>
                {warning.evidence && (
                  <p className="text-xs italic opacity-70 dark:opacity-90">&quot;{warning.evidence}&quot;</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
