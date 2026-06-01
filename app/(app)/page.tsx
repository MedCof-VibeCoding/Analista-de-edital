"use client";

import { Fragment, useState } from "react";
import {
  Sparkles,
  FileText,
  Table,
  Calendar,
  Search,
  Code,
  Layers,
  Check,
  X,
  ArrowRight,
  Globe,
} from "lucide-react";
import { GenerationPreview } from "@/components/GenerationPreview";
import { UploadForm } from "@/components/UploadForm";
import { SocialForm } from "@/components/SocialForm";
import { SocialPreview } from "@/components/SocialPreview";
import type { GenerateResponse, SocialResponse } from "@/lib/types/api";

// ---------------------------------------------------------------------------
// Hero mockup — editorial blog-post preview on the right panel
// ---------------------------------------------------------------------------
function HeroMockup() {
  return (
    <div className="relative w-full select-none">
      <div className="pointer-events-none absolute inset-0 translate-x-3 translate-y-4 rounded-[1.5rem] bg-[var(--mc-primary)]/8 blur-2xl" />
      <div className="mc-float relative">
        <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[var(--mc-primary)]/5 blur-[52px]" />
        <div className="absolute -top-5 -right-5 z-20 flex items-center gap-2 rounded-xl bg-[#6e1212] px-4 py-2.5 text-white shadow-lg ring-1 ring-white/10 font-[family-name:var(--font-poppins)] font-bold whitespace-nowrap">
          <span className="text-base">⚡</span>
          <span className="text-[11px] uppercase tracking-wide">Até 80% menos tempo operacional</span>
        </div>
        <div className="mc-glass relative overflow-hidden">
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--mc-primary)]/20 to-transparent" />
          {/* Browser chrome */}
          <div className="flex items-center gap-2.5 border-b border-[var(--mc-border)] bg-[var(--mc-primary-soft)] px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[var(--mc-primary)]/20" />
              <div className="h-2 w-2 rounded-full bg-[var(--mc-primary)]/20" />
              <div className="h-2 w-2 rounded-full bg-[var(--mc-primary)]/20" />
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[9px] font-semibold text-[#166534]">
              <span className="mc-pulse-dot h-1.5 w-1.5" style={{ background: "#166534", animation: "mc-pulse-dot 2.5s ease-in-out infinite" }} />
              Publicado
            </span>
            <Globe className="ml-1 h-3 w-3 shrink-0 mc-text-dim" />
            <span className="flex-1 truncate font-mono text-[10px] mc-text-dim">
              grupomedcof.com.br/blog/
              <span className="mc-text-muted">edital-residencia-medica-sirio-libanes</span>
            </span>
          </div>
          {/* Article body */}
          <div className="space-y-4 p-5 pb-6">
            <div className="flex items-center gap-1.5">
              <span className="mc-pill">
                <Sparkles className="h-2.5 w-2.5" />
                Post gerado com IA
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest mc-text-dim">
                Hospital Sírio-Libanês&nbsp;&nbsp;•&nbsp;&nbsp;São Paulo e Brasília
              </p>
              <h3 className="text-[15px] font-extrabold leading-tight tracking-tight">
                <span className="mc-gradient-text">Residência Médica Sírio-Libanês 2026/2027:</span>
                <br />
                <span className="text-[var(--mc-text)]">
                  edital publicado com vagas em acesso direto e pré-requisito
                </span>
              </h3>
              <p className="text-xs mc-text-muted leading-relaxed">
                O Hospital Sírio-Libanês divulgou o edital de residência médica 2026
                com vagas para acesso direto, pré-requisito e ano adicional em São
                Paulo e Brasília.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--mc-border)]">
              <div className="grid grid-cols-2 border-b border-[var(--mc-border)] bg-[var(--mc-primary-soft)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide mc-text-dim">
                <span>Especialidade</span>
                <span className="text-right">Vagas</span>
              </div>
              {[
                ["Anestesiologia", "9"],
                ["Clínica Médica", "9"],
                ["Med. Intensiva", "6"],
                ["Pediatria", "6"],
              ].map(([esp, vagas]) => (
                <div key={esp} className="grid grid-cols-2 border-b border-[var(--mc-border)]/40 px-3 py-2 text-xs last:border-0">
                  <span className="text-[var(--mc-text)]">{esp}</span>
                  <span className="text-right font-semibold text-[#166534]">{vagas}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider mc-text-dim">Cronograma</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Inscrições", date: "01/06 → 14/08" },
                  { label: "Prova obj.", date: "27/09" },
                ].map(({ label, date }) => (
                  <div key={label} className="flex items-center gap-1.5 rounded-lg border border-[var(--mc-border)] bg-white/60 px-2.5 py-1 text-[10px]">
                    <Calendar className="h-2.5 w-2.5 text-[var(--mc-primary)]" />
                    <span className="mc-text-muted">{label}</span>
                    <span className="font-semibold mc-text-muted">{date}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[var(--mc-border)] pt-3">
              {["Acesso direto", "Pré-requisito", "SEO otimizado"].map((metric) => (
                <span key={metric} className="rounded-full bg-[var(--mc-primary-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--mc-primary-light)]">
                  {metric}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature cards data
// ---------------------------------------------------------------------------
const FEATURES = [
  {
    Icon: FileText,
    title: "Resumo automático",
    description: "A IA lê o edital completo e gera um resumo estruturado com as informações essenciais.",
  },
  {
    Icon: Table,
    title: "Tabela de vagas",
    description: "Tabela organizada por especialidade, modalidade e número de vagas por instituição.",
  },
  {
    Icon: Calendar,
    title: "Cronograma formatado",
    description: "Todas as datas importantes do processo seletivo formatadas e prontas para publicação.",
  },
  {
    Icon: Search,
    title: "SEO otimizado",
    description: "Meta title, meta description e slug gerados automaticamente com foco em ranqueamento.",
  },
  {
    Icon: Code,
    title: "Markdown para blog",
    description: "Conteúdo em Markdown e HTML prontos para importar em qualquer CMS ou plataforma.",
  },
  {
    Icon: Layers,
    title: "Estrutura publicável",
    description: "Post com hierarquia de headings, formatação consistente e organização editorial correta.",
  },
] as const;

// ---------------------------------------------------------------------------
// Step cards data
// ---------------------------------------------------------------------------
const STEPS = [
  {
    number: "01",
    emoji: "📄",
    title: "Envie o edital",
    description: "Faça upload do PDF do edital de residência médica, concurso ou prova de título.",
  },
  {
    number: "02",
    emoji: "📰",
    title: "Gere a notícia para o blog",
    description: "O pipeline com OpenAI, Gemini ou DeepSeek extrai, organiza e formata as informações.",
  },
  {
    number: "03",
    emoji: "📱",
    title: "Transforme em conteúdo para Instagram",
    description: "Download do post em Markdown ou HTML, com SEO, tabelas e cronograma já preenchidos.",
  },
] as const;

// ---------------------------------------------------------------------------
// Before / After data
// ---------------------------------------------------------------------------
const BEFORE = [
  "Leitura manual de dezenas de páginas",
  "Horas organizando tabelas de vagas",
  "Formatação repetitiva e propensa a erros",
  "Publicação lenta e processo operacional",
];

const AFTER = [
  "IA extrai e estrutura tudo automaticamente",
  "Tabelas e cronograma gerados em segundos",
  "Conteúdo SEO-ready sem esforço manual",
  "Workflow escalável para múltiplos editais",
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function HomePage() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [socialResult, setSocialResult] = useState<SocialResponse | null>(null);
  const [socialBusy, setSocialBusy] = useState(false);

  return (
    <main className="mx-auto max-w-6xl px-4 lg:px-8">

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-labelledby="hero-heading"
        className="grid grid-cols-1 gap-8 py-16 lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-16 lg:py-24"
      >
        {/* LEFT — copy */}
        <div className="space-y-7">
          <h1
            id="hero-heading"
            className="text-3xl font-black italic leading-[1.06] tracking-[-0.03em] text-[var(--mc-text)] lg:text-4xl xl:text-5xl"
          >
            Transforme{" "}
            <span className="font-black text-[var(--mc-text)]">editais médicos</span>{" "}
            em{" "}
            <em className="font-black not-italic text-[#ad1f1f]">notícias</em>{" "}
            em minutos.
          </h1>

          <p className="text-base mc-text-muted leading-relaxed">
            Menos tempo organizando informações. Mais tempo produzindo conteúdo.
          </p>

          {/* Compact how-it-works */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {STEPS.map(({ number, emoji, title }, i) => (
              <Fragment key={number}>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--mc-primary-soft)] text-base ring-1 ring-[var(--mc-border-red)]">
                    {emoji}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--mc-text)]">
                      <span className="mc-text-dim mr-1">{number}</span>
                      {title}
                    </h3>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="ml-3.5 h-4 w-4 shrink-0 rotate-90 mc-text-dim sm:ml-0 sm:self-center sm:rotate-0" />
                )}
              </Fragment>
            ))}
          </div>

          <a
            href="#gerador"
            className="inline-flex items-center justify-center rounded-full bg-[#6e1212] px-10 py-4 text-base font-bold text-white transition-colors hover:bg-[#5a0e0e] font-[family-name:var(--font-poppins)]"
          >
            Gerar conteúdo agora
          </a>
        </div>

        {/* RIGHT — mockup */}
        <div className="hidden lg:flex lg:items-center lg:justify-center">
          <HeroMockup />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* UPLOAD FORM                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section id="gerador" className="mb-16 scroll-mt-20">
        <div className="mb-6">
          <div className="mb-3 flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1a6fcc] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
              <span className="mc-pulse-dot" />
              Tempo médio: 1 minuto
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#8a1818] lg:text-3xl">
            Gere notícias para o Blog MedCof
          </h2>
          <p className="mt-2 whitespace-nowrap text-sm leading-relaxed mc-text-muted">
            Em um só clique: converta editais importantes em artigos estruturados, otimizados para SEO e prontos para publicação.
          </p>
        </div>
        <UploadForm onGenerated={setResult} busy={busy} setBusy={setBusy} />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* GENERATION RESULT                                                    */}
      {/* ------------------------------------------------------------------ */}
      {result && (
        <section className="pb-16">
          <GenerationPreview key={result.jobId} result={result} onUpdate={setResult} />
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SOCIAL MEDIA TOOL                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section id="social" className="mb-16 scroll-mt-20">
        <div className="mb-6">
          <div className="mb-3 flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#02178a] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
              <span className="mc-pulse-dot" />
              Instagram · Reels · Carrossel · Tweet
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#02178a] lg:text-3xl">
            Gerar conteúdo para redes sociais
          </h2>
        </div>
        <SocialForm onGenerated={setSocialResult} busy={socialBusy} setBusy={setSocialBusy} />
        {socialResult && (
          <div className="mt-6">
            <SocialPreview result={socialResult} />
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* WHAT AI DELIVERS                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-labelledby="features-heading"
        className="mc-section border-t border-[var(--mc-border)]"
      >
        <div className="mb-14 text-center space-y-4">
          <div className="flex justify-center">
            <span className="mc-section-label">Capacidades</span>
          </div>
          <h2
            id="features-heading"
            className="text-3xl font-black tracking-[-0.025em] text-[var(--mc-text)] lg:text-4xl"
          >
            O que a{" "}
            <span className="mc-gradient-text">IA entrega</span>
          </h2>
          <p className="mx-auto max-w-md text-base mc-text-muted">
            Cada edital médico processado gera um conjunto completo de conteúdo
            editorial, estruturado e pronto para o blog.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="mc-glass mc-card-hover group relative flex flex-col gap-4 overflow-hidden p-6"
            >
              {/* Hover gradient */}
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-[var(--mc-primary)]/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mc-primary-soft)] ring-1 ring-[var(--mc-border-red)] transition-all duration-300 group-hover:ring-[var(--mc-primary-border)]">
                <Icon className="h-4.5 w-4.5 text-[var(--mc-primary)]" />
              </div>
              <div className="relative">
                <h3 className="mb-1 text-sm font-semibold text-[var(--mc-text)]">{title}</h3>
                <p className="text-xs mc-text-muted leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* BEFORE / AFTER                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-labelledby="comparison-heading"
        className="mc-section border-t border-[var(--mc-border)]"
      >
        <div className="mb-14 text-center space-y-4">
          <div className="flex justify-center">
            <span className="mc-section-label">Impacto real</span>
          </div>
          <h2
            id="comparison-heading"
            className="text-3xl font-black tracking-[-0.025em] text-[var(--mc-text)] lg:text-4xl"
          >
            Antes e{" "}
            <span className="mc-gradient-text">depois</span>
          </h2>
          <p className="mx-auto max-w-md text-base mc-text-muted">
            Veja como o processo de publicação de editais médicos muda com IA.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* BEFORE */}
          <div className="rounded-2xl border border-[var(--mc-border)] bg-white/50 p-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--mc-primary-soft)]">
                <X className="h-3.5 w-3.5 mc-text-dim" />
              </div>
              <h3 className="text-xs font-semibold mc-text-dim uppercase tracking-widest">
                Antes
              </h3>
            </div>
            <ul className="space-y-3.5">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm mc-text-dim">
                  <span className="mt-0.5 shrink-0 h-4 w-4 rounded-full border border-[var(--mc-border)] flex items-center justify-center">
                    <X className="h-2.5 w-2.5 opacity-40" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* AFTER */}
          <div className="mc-glass mc-top-line relative overflow-hidden rounded-2xl border border-[var(--mc-border-red)] p-6 space-y-5">
            {/* Inner red ambient */}
            <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[var(--mc-primary)]/5 blur-[40px]" />

            <div className="relative flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--mc-primary-soft)] ring-1 ring-[var(--mc-border-red)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--mc-primary)]" />
              </div>
              <h3 className="text-xs font-semibold mc-text-muted uppercase tracking-widest">
                Com IA
              </h3>
            </div>
            <ul className="relative space-y-3.5">
              {AFTER.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[var(--mc-text)]">
                  <span className="mt-0.5 shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--mc-primary-soft)] ring-1 ring-[var(--mc-border-red)]">
                    <Check className="h-2.5 w-2.5 text-[var(--mc-primary-light)] stroke-[2.5]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

    </main>
  );
}
