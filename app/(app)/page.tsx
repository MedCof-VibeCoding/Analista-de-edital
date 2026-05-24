"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { GenerationPreview } from "@/components/GenerationPreview";
import { UploadForm } from "@/components/UploadForm";
import type { GenerateResponse } from "@/lib/types/api";

export default function HomePage() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <main id="gerador" className="mx-auto max-w-6xl space-y-10 px-4 py-10 lg:px-8 lg:py-16">
      <section className="space-y-4 text-center lg:space-y-6">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--mc-border-strong)] bg-white/[0.03] px-3 py-1 text-xs font-medium mc-text-muted">
          <Sparkles className="h-3.5 w-3.5 text-[#ff4d6d]" />
          Pipeline com OpenAI · Gemini · DeepSeek
        </div>

        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight lg:text-6xl">
          Editais de Residência,
          <br />
          <span className="mc-gradient-text">posts em minutos.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-base mc-text-muted lg:text-lg">
          Faça upload do PDF do edital, escolha o provedor de IA e receba um
          post pronto pra revisão — com tabela de vagas por instituição,
          cronograma e SEO já preenchidos.
        </p>
      </section>

      <UploadForm onGenerated={setResult} busy={busy} setBusy={setBusy} />

      {result && (
        <GenerationPreview key={result.jobId} result={result} onUpdate={setResult} />
      )}
    </main>
  );
}
