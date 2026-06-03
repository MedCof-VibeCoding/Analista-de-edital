"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Link, Loader2, Share2, Type } from "lucide-react";
import type { ConfigResponse, ProviderName, SocialResponse } from "@/lib/types/api";

const PROVIDER_LABELS: Record<ProviderName, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  deepseek: "DeepSeek",
};

type InputMode = "url" | "text";

interface SocialFormValues {
  provider: ProviderName;
  text: string;
}

interface SocialFormProps {
  onGenerated: (result: SocialResponse) => void;
  busy: boolean;
  setBusy: (value: boolean) => void;
}

/** Validates a URL string without throwing. */
function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function SocialForm({ onGenerated, busy, setBusy }: SocialFormProps) {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [urlValue, setUrlValue] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fetchingUrl, setFetchingUrl] = useState(false);

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

  /** Fetches article text from URL via the server-side route. */
  async function fetchArticleText(url: string): Promise<string | null> {
    setFetchingUrl(true);
    try {
      const response = await fetch("/api/fetch-article", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = (await response.json()) as { text: string } | { error: string };

      if (!response.ok || "error" in payload) {
        const message = "error" in payload ? payload.error : "Erro ao buscar artigo.";
        setUrlError(message);
        toast.error(message);
        return null;
      }

      return (payload as { text: string }).text;
    } catch (cause) {
      const message = `Falha na requisição: ${(cause as Error).message}`;
      setUrlError(message);
      toast.error(message);
      return null;
    } finally {
      setFetchingUrl(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    let articleText: string;

    if (inputMode === "url") {
      if (!urlValue.trim()) {
        setUrlError("Informe a URL do artigo.");
        return;
      }
      if (!isValidUrl(urlValue.trim())) {
        setUrlError("URL inválida. Use o formato https://exemplo.com.br/blog/post.");
        return;
      }
      setUrlError(null);

      const fetched = await fetchArticleText(urlValue.trim());
      if (fetched === null) return;
      articleText = fetched;
    } else {
      if (!values.text.trim()) {
        toast.error("Cole o texto do blog antes de gerar.");
        return;
      }
      articleText = values.text;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: articleText, provider: values.provider }),
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

  const isLoading = busy || fetchingUrl;

  return (
    <form
      onSubmit={onSubmit}
      className="relative overflow-hidden rounded-2xl border border-[var(--mc-border-red)] bg-[var(--mc-primary-soft)] p-5 lg:p-6"
    >
      <div className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full bg-[var(--mc-primary)]/6 blur-[48px]" />
      <div className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--mc-primary)]/25 to-transparent" />

      <div className="relative flex flex-col gap-4">
        {/* Segmented control */}
        <div className="flex items-center gap-1 rounded-xl border border-[var(--mc-border)] bg-[var(--mc-surface)] p-1 w-fit">
          <button
            type="button"
            onClick={() => { setInputMode("url"); setUrlError(null); }}
            className={[
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all",
              inputMode === "url"
                ? "bg-[var(--mc-primary)] text-white shadow-sm"
                : "text-[var(--mc-text-muted)] hover:text-[var(--mc-text)]",
            ].join(" ")}
          >
            <Link className="h-3.5 w-3.5" />
            URL do Artigo
          </button>
          <button
            type="button"
            onClick={() => { setInputMode("text"); setUrlError(null); }}
            className={[
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all",
              inputMode === "text"
                ? "bg-[var(--mc-primary)] text-white shadow-sm"
                : "text-[var(--mc-text-muted)] hover:text-[var(--mc-text)]",
            ].join(" ")}
          >
            <Type className="h-3.5 w-3.5" />
            Colar Texto
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr,200px]">
          {/* Input area */}
          {inputMode === "url" ? (
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest mc-text-muted">
                URL do Artigo
              </span>
              <input
                type="url"
                value={urlValue}
                onChange={(e) => { setUrlValue(e.target.value); setUrlError(null); }}
                placeholder="https://www.grupomedcof.com.br/blog/exemplo-post"
                disabled={isLoading}
                className="mc-focus-ring w-full rounded-xl border border-[var(--mc-border-red)] bg-white/70 dark:bg-[#111827] px-4 py-3 text-sm text-[var(--mc-text)] placeholder:mc-text-dim dark:placeholder:text-white/30 transition-colors focus:bg-white/90 dark:focus:bg-[#0f172a]"
              />
              {urlError ? (
                <span className="mt-1.5 block text-xs text-[var(--mc-error)]">{urlError}</span>
              ) : (
                <span className="mt-1.5 block text-xs mc-text-muted">
                  Cole a URL de um artigo do blog ou insira manualmente o conteúdo.
                </span>
              )}
            </label>
          ) : (
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest mc-text-muted">
                Texto do Blog
              </span>
              <textarea
                {...register("text", { required: inputMode === "text" })}
                rows={6}
                placeholder="Cole aqui o texto do post de blog gerado…"
                disabled={isLoading}
                className="mc-focus-ring w-full resize-y rounded-xl border border-[var(--mc-border-red)] bg-white/70 dark:bg-[#111827] px-4 py-3 text-sm text-[var(--mc-text)] placeholder:mc-text-dim dark:placeholder:text-white/30 transition-colors focus:bg-white/90 dark:focus:bg-[#0f172a]"
              />
              {formState.errors.text && (
                <span className="mt-1.5 block text-xs text-[var(--mc-error)]">
                  Cole o texto do blog.
                </span>
              )}
            </label>
          )}

          {/* Provider selector */}
          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest mc-text-muted">
              Provedor IA
            </span>
            <select
              {...register("provider", { required: true })}
              disabled={isLoading || loadingConfig}
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
          disabled={isLoading || loadingConfig}
          className="mc-btn-primary mc-focus-ring w-full inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-sm font-semibold tracking-wide"
        >
          {fetchingUrl ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando artigo…
            </>
          ) : busy ? (
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
      </div>
    </form>
  );
}
