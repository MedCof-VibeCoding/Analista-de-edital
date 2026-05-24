"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertOctagon, Download, Loader2, Save } from "lucide-react";
import { HtmlPreview } from "./HtmlPreview";
import { MarkdownEditor } from "./MarkdownEditor";
import { WarningsBanner } from "./WarningsBanner";
import type { GenerateResponse } from "@/lib/types/api";

type TabId = "markdown" | "html" | "data" | "warnings";

interface GenerationPreviewProps {
  result: GenerateResponse;
  onUpdate: (next: GenerateResponse) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "markdown", label: "Markdown" },
  { id: "html", label: "HTML" },
  { id: "data", label: "Dados" },
  { id: "warnings", label: "Avisos" },
];

export function GenerationPreview({ result, onUpdate }: GenerationPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("markdown");
  const [markdown, setMarkdown] = useState(result.markdown);
  const [html, setHtml] = useState(result.html);
  const [saving, setSaving] = useState(false);

  const isDirty = markdown !== result.markdown;

  const errorCount = useMemo(
    () => result.warnings.filter((w) => w.severity === "error").length,
    [result.warnings],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/outputs/${result.jobId}/save`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ markdown }),
      });
      const payload = (await response.json()) as
        | { jobId: string; markdown: string; html: string }
        | { error: string };

      if (!response.ok || "error" in payload) {
        const message = "error" in payload ? payload.error : "Erro inesperado.";
        toast.error(message);
        return;
      }

      setHtml(payload.html);
      onUpdate({ ...result, markdown: payload.markdown, html: payload.html });
      toast.success("Versão salva em disco.");
    } catch (cause) {
      toast.error(`Falha ao salvar: ${(cause as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mc-surface relative overflow-hidden rounded-3xl p-6 shadow-[0_20px_60px_-30px_rgba(230,0,38,0.3)] lg:p-8">
      <div className="pointer-events-none absolute -top-40 -left-20 h-72 w-72 rounded-full bg-[#e60026]/12 blur-3xl" />

      <header className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-lg font-bold tracking-tight">Preview do post</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md border border-[var(--mc-border)] bg-white/[0.04] px-2 py-1 font-mono mc-text-muted">
              job {result.jobId}
            </span>
            <span className="mc-pill">
              {result.providerUsed} · {result.modelUsed}
            </span>
            {errorCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-300">
                <AlertOctagon className="h-3 w-3" />
                {errorCount} inconsistência{errorCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              downloadFile(`${result.data.seo.slug || result.jobId}.md`, markdown, "text/markdown")
            }
            className="mc-btn-ghost mc-focus-ring inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm"
          >
            <Download className="h-4 w-4" />
            .md
          </button>
          <button
            type="button"
            onClick={() =>
              downloadFile(`${result.data.seo.slug || result.jobId}.html`, html, "text/html")
            }
            className="mc-btn-ghost mc-focus-ring inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm"
          >
            <Download className="h-4 w-4" />
            .html
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="mc-btn-primary mc-focus-ring inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar versão
          </button>
        </div>
      </header>

      <div className="relative mt-5">
        <WarningsBanner warnings={result.warnings} />
      </div>

      <nav className="relative mt-6 flex gap-1 border-b border-[var(--mc-border)]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                isActive
                  ? "border-b-2 border-[var(--mc-primary)] px-4 py-2.5 text-sm font-semibold text-white"
                  : "border-b-2 border-transparent px-4 py-2.5 text-sm font-medium mc-text-muted hover:text-white"
              }
            >
              {tab.label}
              {tab.id === "warnings" && result.warnings.length > 0 && (
                <span className="ml-1.5 rounded-full bg-white/10 px-1.5 text-[10px] font-semibold text-white/80">
                  {result.warnings.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="relative mt-5">
        {activeTab === "markdown" && (
          <MarkdownEditor value={markdown} onChange={setMarkdown} disabled={saving} />
        )}
        {activeTab === "html" && <HtmlPreview html={html} />}
        {activeTab === "data" && (
          <pre className="h-[60vh] overflow-auto rounded-2xl border border-[var(--mc-border)] bg-black/40 p-4 font-mono text-xs leading-relaxed text-[var(--mc-text)]">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
        {activeTab === "warnings" && <WarningsBanner warnings={result.warnings} />}
      </div>
    </section>
  );
}
