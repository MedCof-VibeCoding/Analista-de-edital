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
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Preview do post</h2>
          <p className="mt-1 text-xs text-gray-500">
            Job <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-900">{result.jobId}</code>
            {" · "}
            <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
              {result.providerUsed} · {result.modelUsed}
            </span>
            {errorCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-red-700 dark:bg-red-950 dark:text-red-200">
                <AlertOctagon className="h-3 w-3" />
                {errorCount} inconsistência(s)
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadFile(`${result.data.seo.slug || result.jobId}.md`, markdown, "text/markdown")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            <Download className="h-4 w-4" />
            .md
          </button>
          <button
            type="button"
            onClick={() => downloadFile(`${result.data.seo.slug || result.jobId}.html`, html, "text/html")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            <Download className="h-4 w-4" />
            .html
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar versão
          </button>
        </div>
      </header>

      <div className="mt-4">
        <WarningsBanner warnings={result.warnings} />
      </div>

      <nav className="mt-6 flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                isActive
                  ? "border-b-2 border-indigo-600 px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300"
                  : "border-b-2 border-transparent px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }
            >
              {tab.label}
              {tab.id === "warnings" && result.warnings.length > 0 && (
                <span className="ml-1 rounded-full bg-gray-100 px-1.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {result.warnings.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-4">
        {activeTab === "markdown" && (
          <MarkdownEditor value={markdown} onChange={setMarkdown} disabled={saving} />
        )}
        {activeTab === "html" && <HtmlPreview html={html} />}
        {activeTab === "data" && (
          <pre className="h-[60vh] overflow-auto rounded-lg border border-gray-300 bg-gray-50 p-4 text-xs leading-relaxed dark:border-gray-700 dark:bg-gray-950">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
        {activeTab === "warnings" && <WarningsBanner warnings={result.warnings} />}
      </div>
    </section>
  );
}
