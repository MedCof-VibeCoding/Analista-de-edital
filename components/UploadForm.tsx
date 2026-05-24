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
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <h2 className="text-lg font-semibold">Gerar post a partir do edital</h2>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Envie o PDF do edital de residência médica e escolha o provedor de IA.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr,200px]">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">PDF do edital</span>
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-4 py-3 dark:border-gray-700">
            <FileUp className="h-4 w-4 text-gray-500" />
            <input
              type="file"
              accept="application/pdf"
              {...register("file", { required: true })}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
              disabled={busy}
            />
          </div>
          {fileName && (
            <span className="mt-1 block text-xs text-gray-500">Selecionado: {fileName}</span>
          )}
          {formState.errors.file && (
            <span className="mt-1 block text-xs text-red-500">Selecione um PDF.</span>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Provedor</span>
          <select
            {...register("provider", { required: true })}
            disabled={busy || loadingConfig}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
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
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
    </form>
  );
}
