"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { GenerationPreview } from "@/components/GenerationPreview";
import type { GenerateResponse } from "@/lib/types/api";

export default function AnalysisDetailPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId;

  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analyses/${jobId}`);
      const payload = (await response.json()) as GenerateResponse | { error: string };
      if (!response.ok || "error" in payload) {
        const message = "error" in payload ? payload.error : "Erro inesperado.";
        toast.error(message);
        return;
      }
      setResult(payload);
    } catch (cause) {
      toast.error(`Falha ao carregar análise: ${(cause as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleDelete = async () => {
    if (!window.confirm("Excluir esta análise permanentemente?")) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/analyses/${jobId}`, { method: "DELETE" });
      const payload = (await response.json()) as { deleted?: boolean; error?: string };
      if (!response.ok || payload.error) {
        toast.error(payload.error ?? "Erro ao excluir.");
        return;
      }
      toast.success("Análise excluída.");
      router.push("/analises");
    } catch (cause) {
      toast.error(`Falha ao excluir: ${(cause as Error).message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/analises"
          className="mc-btn-ghost mc-focus-ring inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para análises
        </Link>
        {result && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="mc-focus-ring inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3.5 py-1.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60 dark:border-red-900/50 dark:bg-red-950/30"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Excluir
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 mc-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando análise...
        </div>
      ) : result ? (
        <GenerationPreview key={result.jobId} result={result} onUpdate={setResult} />
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--mc-border)] py-20 text-center mc-text-muted">
          Análise não encontrada.
        </div>
      )}
    </main>
  );
}
