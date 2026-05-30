"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Share2, Sparkles } from "lucide-react";
import type { ConfigResponse, ProviderName, SocialResponse } from "@/lib/types/api";

const PROVIDER_LABELS: Record<ProviderName, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  deepseek: "DeepSeek",
};

interface SocialFormValues {
  provider: ProviderName;
  text: string;
}

interface SocialFormProps {
  onGenerated: (result: SocialResponse) => void;
  busy: boolean;
  setBusy: (value: boolean) => void;
}

export function SocialForm({ onGenerated, busy, setBusy }: SocialFormProps) {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const { register, handleSubmit, formState, setValue } = useForm<SocialFormValues>({
    defaultValues: { provider: "openai", text: "" },
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

  const onSubmit = handleSubmit(async (values) => {
    if (!values.text.trim()) {
      toast.error("Cole o texto do blog antes de gerar.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: values.text, provider: values.provider }),
      });
      const payload = (await response.json()) as SocialResponse | { error: string };

      if (!response.ok || "error" in payload) {
        const message = "error" in payload ? payload.error : "Erro inesperado.";
        toast.error(message);
        return;
      }

      toast.success(`Conteúdo gerado via ${PROVIDER_LABELS[payload.providerUsed]}.`);
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
      <div className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full bg-[var(--mc-primary)]/6 blur-[48px]" />
      <div className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--mc-primary)]/25 to-transparent" />

      <div className="relative grid gap-3 md:grid-cols-[1fr,200px]">
        {/* Textarea */}
        <label className="block">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest mc-text-muted">
            Texto do Blog
          </span>
          <textarea
            {...register("text", { required: true })}
            rows={6}
            placeholder="Cole aqui o texto do post de blog gerado…"
            disabled={busy}
            className="mc-focus-ring w-full resize-y rounded-xl border border-[var(--mc-border-red)] bg-white/70 px-4 py-3 text-sm text-[var(--mc-text)] placeholder:mc-text-dim transition-colors focus:bg-white/90"
          />
          {formState.errors.text && (
            <span className="mt-1.5 block text-xs text-[var(--mc-error)]">
              Cole o texto do blog.
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
            Gerando conteúdo…
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Gerar para redes sociais
          </>
        )}
      </button>
    </form>
  );
}
