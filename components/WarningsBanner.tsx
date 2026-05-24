"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import type { QualityWarning } from "@/lib/types/api";

interface WarningsBannerProps {
  warnings: QualityWarning[];
}

const SEVERITY_STYLE: Record<
  QualityWarning["severity"],
  { wrapper: string; icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  info: {
    wrapper: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200",
    icon: Info,
    label: "Sugestão",
  },
  warn: {
    wrapper: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
    icon: AlertTriangle,
    label: "Atenção",
  },
  error: {
    wrapper: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
    icon: ShieldAlert,
    label: "Inconsistência",
  },
};

export function WarningsBanner({ warnings }: WarningsBannerProps) {
  if (warnings.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
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
            className={`rounded-xl border px-4 py-3 text-sm ${style.wrapper}`}
          >
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <div className="font-medium">
                  {style.label} · <code className="text-xs">{warning.field}</code>
                </div>
                <p>{warning.message}</p>
                {warning.evidence && (
                  <p className="text-xs italic opacity-80">“{warning.evidence}”</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
