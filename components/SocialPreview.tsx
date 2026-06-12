"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Film, Image, MessageSquare, Send } from "lucide-react";
import type { SocialResponse } from "@/lib/types/api";

type TabId = "reels" | "carousel" | "caption" | "tweet";

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: "reels",    label: "Reels",     Icon: Film          },
  { id: "carousel", label: "Carrossel", Icon: Image         },
  { id: "caption",  label: "Legenda",   Icon: MessageSquare },
  { id: "tweet",    label: "Tweet",     Icon: Send          },
];

interface SocialPreviewProps {
  result: SocialResponse;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado para a área de transferência.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mc-focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--mc-border)] bg-white/70 dark:bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-[var(--mc-text-muted)] transition-colors hover:bg-white/90 dark:hover:bg-white/[0.10]"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

export function SocialPreview({ result }: SocialPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("reels");

  const contentByTab: Record<TabId, string> = {
    reels:    result.reels,
    carousel: result.carousel.join("\n\n---\n\n"),
    caption:  result.caption,
    tweet:    result.tweet,
  };

  return (
    <section className="mc-surface relative overflow-hidden rounded-3xl p-6 shadow-[var(--mc-shadow-soft)] lg:p-8">
      <div className="pointer-events-none absolute -top-40 -left-20 h-72 w-72 rounded-full bg-[var(--mc-primary)]/5 blur-[80px]" />

      <header className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight text-[var(--mc-text)]">
            Conteúdo para redes sociais
          </h3>
          <p className="text-xs mc-text-muted">
            Gerado via <span className="font-semibold">{result.providerUsed}</span> · {result.modelUsed}
          </p>
        </div>
        <CopyButton text={contentByTab[activeTab]} />
      </header>

      <nav className="relative mt-6 flex gap-1 border-b border-[var(--mc-border)]">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={
                isActive
                  ? "inline-flex items-center gap-1.5 border-b-2 border-[var(--mc-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--mc-text)]"
                  : "inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium mc-text-muted hover:text-[var(--mc-text)]"
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="relative mt-5">
        {activeTab === "reels" && (
          <pre className="whitespace-pre-wrap rounded-2xl border border-[var(--mc-border)] bg-[#fff1f2] dark:bg-white/[0.03] p-5 font-sans text-sm leading-relaxed text-[var(--mc-text)]">
            {result.reels}
          </pre>
        )}

        {activeTab === "carousel" && (
          <div className="space-y-3">
            {result.carousel.map((slide, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-xl border border-[var(--mc-border)] bg-white/70 dark:bg-white/[0.04] p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--mc-primary-soft)] text-xs font-black text-[var(--mc-primary)]">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-[var(--mc-text)]">{slide}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "caption" && (
          <pre className="whitespace-pre-wrap rounded-2xl border border-[var(--mc-border)] bg-[#fff1f2] dark:bg-white/[0.03] p-5 font-sans text-sm leading-relaxed text-[var(--mc-text)]">
            {result.caption}
          </pre>
        )}

        {activeTab === "tweet" && (
          <div className="rounded-xl border border-[var(--mc-border)] bg-white/70 dark:bg-white/[0.04] p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--mc-text)]">
              {result.tweet}
            </p>
            <p className="mt-2 text-[10px] mc-text-dim">{result.tweet.length}/280 caracteres</p>
          </div>
        )}
      </div>
    </section>
  );
}
