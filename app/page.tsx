"use client";

import { useState } from "react";
import { GenerationPreview } from "@/components/GenerationPreview";
import { UploadForm } from "@/components/UploadForm";
import type { GenerateResponse } from "@/lib/types/api";

export default function HomePage() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6 lg:p-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Gerador de Posts — Editais de Residência Médica
        </h1>
        <p className="text-sm text-gray-500">
          Faça upload do PDF do edital, escolha o provedor de IA e revise o post
          gerado antes de publicar.
        </p>
      </header>

      <UploadForm onGenerated={setResult} busy={busy} setBusy={setBusy} />

      {result && (
        <GenerationPreview key={result.jobId} result={result} onUpdate={setResult} />
      )}
    </main>
  );
}
