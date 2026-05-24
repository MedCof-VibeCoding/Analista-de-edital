"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FileUp, Loader2, Sparkles, Wand2 } from "lucide-react";
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
      className="mc-surface relative overflow-hidden rounded-3xl p-6 shadow-[0_20px_60px_-30px_rgba(230,0,38,0.35)] lg:p-8"
    >
      <div className="pointer-events-none absolute -top-32 -right-20 h-64 w-64 rounded-full bg-[#e60026]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#ff1a3d]/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-[#ff4d6d]" />
          <h2 className="text-lg font-bold tracking-tight">Gerar post a partir do edital</h2>
        </div>
        <p className="mt-1 text-sm mc-text-muted">
          Envie o PDF do edital de residência médica e escolha o provedor de IA.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr,220px]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider mc-text-muted">
              PDF do edital
            </span>
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--mc-border-strong)] bg-white/[0.02] px-4 py-3 transition-colors hover:border-[#ff4d6d]/60">
              <FileUp className="h-4 w-4 text-[#ff4d6d]" />
              <input
                type="file"
                accept="application/pdf"
                {...register("file", { required: true })}
                className="block w-full text-sm text-[var(--mc-text)] file:mr-3 file:rounded-lg file:border-0 file:bg-white/5 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-white/10"
                disabled={busy}
              />
            </div>
            {fileName && (
              <span className="mt-1.5 block text-xs mc-text-dim">{fileName}</span>
            )}
            {formState.errors.file && (
              <span className="mt-1.5 block text-xs text-[var(--mc-error)]">
                Selecione um PDF.
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider mc-text-muted">
              Provedor
            </span>
            <select
              {...register("provider", { required: true })}
              disabled={busy || loadingConfig}
              className="mc-focus-ring w-full appearance-none rounded-2xl border border-[var(--mc-border-strong)] bg-white/[0.03] px-3 py-2.5 text-sm font-medium"
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

        <button
          type="submit"
          disabled={busy || loadingConfig}
          className="mc-btn-primary mc-focus-ring mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Gerar post
            </>
          )}
        </button>
      </div>
    </form>
  );
}
