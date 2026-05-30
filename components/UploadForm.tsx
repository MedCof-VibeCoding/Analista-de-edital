"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FileUp, Loader2, Sparkles } from "lucide-react";
import type { ConfigResponse, GenerateResponse, ProviderName } from "@/lib/types/api";

const PROVIDER_LABELS: Record<ProviderName, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  deepseek: "DeepSeek",
};

interface UploadFormValues {
  provider: ProviderName;
  file: FileList;
}

interface UploadFormProps {
  onGenerated: (result: GenerateResponse) => void;
  busy: boolean;
  setBusy: (value: boolean) => void;
}

export function UploadForm({ onGenerated, busy, setBusy }: UploadFormProps) {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const { register, handleSubmit, formState, watch, setValue } = useForm<UploadFormValues>({
    defaultValues: { provider: "openai" },
  });

  useEffect(() => {
    void fetch("/api/config")
      .then((res) => res.json() as Promise<ConfigResponse>)
      .then((data) => {
        setConfig(data);
        if (data.availableProviders.length > 0) {
          const initial = data.availableProviders.includes(data.defaultProvider)
            ? data.defaultProvider
            : data.availableProviders[0];
          setValue("provider", initial);
        }
      })
      .catch(() => toast.error("Falha ao carregar configuração do servidor."))
      .finally(() => setLoadingConfig(false));
  }, [setValue]);

  const selectedFile = watch("file");
  const fileName = selectedFile?.[0]?.name;

  const onSubmit = handleSubmit(async (values) => {
    if (!values.file?.[0]) {
      toast.error("Selecione um PDF do edital.");
      return;
    }

    setBusy(true);
    const formData = new FormData();
    formData.append("file", values.file[0]);
    formData.append("provider", values.provider);

    try {
      const response = await fetch("/api/generate", { method: "POST", body: formData });
      const payload = (await response.json()) as GenerateResponse | { error: string };

      if (!response.ok || "error" in payload) {
        const message = "error" in payload ? payload.error : "Erro inesperado.";
        toast.error(message);
        return;
      }

      toast.success(`Post gerado via ${PROVIDER_LABELS[payload.providerUsed]}.`);
      onGenerated(payload);
    } catch (cause) {
      toast.error(`Falha na requisição: ${(cause as Error).message}`);
    } finally {
      setBusy(false);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="relative overflow-hidden rounded-2xl border border-[var(--mc-border-red)] bg-[var(--mc-primary-soft)] p-5 lg:p-6"
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full bg-[var(--mc-primary)]/6 blur-[48px]" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[var(--mc-primary)]/4 blur-[56px]" />
      {/* Top line */}
      <div className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--mc-primary)]/25 to-transparent" />

      <div className="relative">
        <div className="grid gap-3 md:grid-cols-[1fr,200px]">
          {/* Upload zone */}
          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest mc-text-muted">
              PDF do Edital
            </span>
            <div className="mc-upload-zone flex min-h-[72px] items-center gap-4 rounded-xl border border-dashed border-[var(--mc-border-red)] bg-[var(--mc-primary-soft)] px-4 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--mc-primary-soft)] ring-1 ring-[var(--mc-border-red)]">
                <FileUp className="h-4.5 w-4.5 text-[var(--mc-primary)]" />
              </div>
              <div className="min-w-0 flex-1">
                {fileName ? (
                  <p className="truncate text-sm font-medium text-[var(--mc-text)]">{fileName}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-[var(--mc-text-muted)]">Selecione o PDF do edital</p>
                    <p className="text-[11px] mc-text-dim">Arraste e solte ou clique para navegar</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="application/pdf"
                {...register("file", { required: true })}
                className="sr-only"
                disabled={busy}
              />
            </div>
            {formState.errors.file && (
              <span className="mt-1.5 block text-xs text-[var(--mc-error)]">
                Selecione um PDF.
              </span>
            )}
          </label>

          {/* Provider selector */}
          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest mc-text-muted">
              Provedor IA
            </span>
            <select
              {...register("provider", { required: true })}
              disabled={busy || loadingConfig}
              className="mc-focus-ring h-[72px] w-full appearance-none rounded-xl border border-[var(--mc-border-red)] bg-[var(--mc-primary-soft)] px-3.5 text-sm font-medium text-[var(--mc-text)] transition-colors hover:border-[var(--mc-primary-border)]"
            >
              {(config?.allProviders ?? (["openai", "gemini", "deepseek"] as ProviderName[])).map(
                (provider) => {
                  const available = config?.availableProviders.includes(provider) ?? false;
                  const model = config?.models?.[provider];
                  return (
                    <option
                      key={provider}
                      value={provider}
                      disabled={!available}
                      title={!available ? "API key não configurada" : undefined}
                    >
                      {PROVIDER_LABELS[provider]}
                      {model ? ` · ${model}` : ""}
                      {!available ? " (sem chave)" : ""}
                    </option>
                  );
                },
              )}
            </select>
          </label>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={busy || loadingConfig}
          className="mc-btn-primary mc-focus-ring mt-4 w-full inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-sm font-semibold tracking-wide"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando edital…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Gerar post com IA
            </>
          )}
        </button>
      </div>
    </form>
  );
}
