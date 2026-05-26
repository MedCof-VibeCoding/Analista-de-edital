"use client";

import { useState } from "react";
import {
  Sparkles,
  Upload,
  Cpu,
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
import type { GenerateResponse } from "@/lib/types/api";

// ---------------------------------------------------------------------------
// Editorial blog-post preview shown on the hero right panel
// ---------------------------------------------------------------------------
function HeroMockup() {
  return (
    <div className="group mc-glass mc-glow-red relative overflow-hidden select-none transition-transform duration-300 hover:scale-[1.01]">
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#e60026]/12 blur-3xl" />

      {/* Browser address bar */}
      <div className="flex items-center gap-2 border-b border-[var(--mc-border)] bg-white/[0.02] px-4 py-2.5">
        <Globe className="h-3 w-3 shrink-0 mc-text-dim" />
        <span className="flex-1 truncate font-mono text-[10px] mc-text-dim">
          grupomedcof.com.br/blog/
          <span className="text-white/60">edital-residencia-medica-sirio-libanes</span>
        </span>
        <span className="flex items-center gap-1 rounded-full bg-[#22c55e]/15 px-2 py-0.5 text-[9px] font-semibold text-[#4ade80]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
          Publicado
        </span>
      </div>

      {/* Article body */}
      <div className="space-y-4 p-5 pb-6">
        {/* AI badge */}
        <div className="flex items-center gap-1.5">
          <span className="mc-pill">
            <Sparkles className="h-2.5 w-2.5" />
            Post gerado com IA
          </span>
        </div>

        {/* Institution + Headline */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest mc-text-dim">
            Hospital Sírio-Libanês&nbsp;&nbsp;•&nbsp;&nbsp;São Paulo e Brasília
          </p>
          <h3 className="text-[15px] font-extrabold leading-tight tracking-tight">
            <span className="mc-gradient-text">Residência Médica Sírio-Libanês 2026/2027:</span>
            <br />
            <span className="text-white/90">
              edital publicado com vagas em acesso direto e pré-requisito
            </span>
          </h3>
          <p className="text-xs mc-text-muted leading-relaxed">
            O Hospital Sírio-Libanês divulgou o edital de residência médica 2026
            com vagas para acesso direto, pré-requisito e ano adicional em São
            Paulo e Brasília.
          </p>
        </div>

        {/* Vagas table */}
        <div className="overflow-hidden rounded-xl border border-[var(--mc-border)]">
          <div className="grid grid-cols-2 border-b border-[var(--mc-border)] bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide mc-text-dim">
            <span>Especialidade</span>
            <span className="text-right">Vagas</span>
          </div>
          {[
            ["Anestesiologia", "9"],
            ["Clínica Médica", "9"],
            ["Med. Intensiva", "6"],
            ["Pediatria", "6"],
          ].map(([esp, vagas]) => (
            <div
              key={esp}
              className="grid grid-cols-2 border-b border-[var(--mc-border)]/40 px-3 py-2 text-xs last:border-0"
            >
              <span className="text-white/80">{esp}</span>
              <span className="text-right font-semibold text-[#86efac]">{vagas}</span>
            </div>
          ))}
        </div>

        {/* Cronograma chips */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider mc-text-dim">
            Cronograma
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Inscrições", date: "01/06 → 14/08" },
              { label: "Prova obj.", date: "27/09" },
            ].map(({ label, date }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--mc-border)] bg-white/[0.03] px-2.5 py-1 text-[10px]"
              >
                <Calendar className="h-2.5 w-2.5 text-[#ff4d6d]" />
                <span className="mc-text-muted">{label}</span>
                <span className="font-semibold text-white/70">{date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric pills */}
        <div className="flex flex-wrap gap-2 border-t border-[var(--mc-border)] pt-3">
          {["Acesso direto", "Pré-requisito", "SEO otimizado"].map((metric) => (
            <span
              key={metric}
              className="rounded-full bg-[var(--mc-primary-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[#ff7a8e]"
            >
              {metric}
            </span>
          ))}
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
    Icon: Upload,
    title: "Envie o edital",
    description: "Faça upload do PDF do edital de residência médica, concurso ou prova de título.",
  },
  {
    number: "02",
    Icon: Cpu,
    title: "A IA estrutura tudo",
    description: "O pipeline com OpenAI, Gemini ou DeepSeek extrai, organiza e formata as informações.",
  },
  {
    number: "03",
    Icon: FileText,
    title: "Receba o post pronto",
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

  return (
    <main className="mx-auto max-w-6xl px-4 lg:px-8">

      {/* ------------------------------------------------------------------ */}
      {/* HERO — split screen                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-labelledby="hero-heading"
        className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16"
      >
        {/* LEFT — copy + form */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--mc-border-strong)] bg-white/[0.03] px-3 py-1 text-xs font-medium mc-text-muted">
            <Sparkles className="h-3.5 w-3.5 text-[#ff4d6d]" />
            Pipeline com OpenAI · Gemini · DeepSeek
          </div>

          <div className="space-y-3">
            <h1
              id="hero-heading"
              className="text-4xl font-extrabold leading-[1.08] tracking-tight lg:text-5xl"
            >
              Transforme editais
              <br />
              <span className="mc-gradient-text">em posts com IA.</span>
            </h1>

            <p className="max-w-lg text-base mc-text-muted lg:text-lg">
              Envie o PDF do edital e receba conteúdo estruturado, tabelas
              automáticas e SEO pronto para publicação.
            </p>
          </div>

          <ul className="space-y-2">
            {[
              "Resumo estruturado do edital médico",
              "Tabelas de vagas por especialidade",
              "Cronograma formatado e pronto",
              "SEO pronto para publicação",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--mc-primary-soft)] text-[#ff4d6d]">
                  <Check className="h-3 w-3 stroke-[2.5]" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div id="gerador">
            <UploadForm onGenerated={setResult} busy={busy} setBusy={setBusy} />
          </div>
        </div>

        {/* RIGHT — static mockup preview (decorative) */}
        <div className="hidden lg:block">
          <HeroMockup />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* GENERATION RESULT (appears after upload)                            */}
      {/* ------------------------------------------------------------------ */}
      {result && (
        <section className="pb-16">
          <GenerationPreview key={result.jobId} result={result} onUpdate={setResult} />
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* HOW IT WORKS                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-labelledby="how-it-works-heading"
        className="mc-section border-t border-[var(--mc-border)]"
      >
        <div className="mb-10 text-center space-y-2">
          <h2
            id="how-it-works-heading"
            className="text-2xl font-extrabold tracking-tight lg:text-3xl"
          >
            Do PDF ao post em minutos
          </h2>
          <p className="mx-auto max-w-md text-sm mc-text-muted">
            Três passos para transformar qualquer edital médico em conteúdo
            pronto para publicação.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map(({ number, Icon, title, description }, i) => (
            <div key={number} className="relative flex gap-4 md:flex-col md:gap-0">
              {/* connector arrow between cards (desktop only) */}
              {i < STEPS.length - 1 && (
                <div className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 md:flex">
                  <ArrowRight className="h-4 w-4 mc-text-dim" />
                </div>
              )}

              <div className="mc-glass mc-card-hover flex flex-1 flex-col gap-4 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mc-primary-soft)]">
                    <Icon className="h-5 w-5 text-[#ff4d6d]" />
                  </div>
                  <span className="text-3xl font-black tracking-tighter mc-text-dim opacity-30">
                    {number}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">{title}</h3>
                  <p className="text-sm mc-text-muted leading-relaxed">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* WHAT AI DELIVERS                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-labelledby="features-heading"
        className="mc-section border-t border-[var(--mc-border)]"
      >
        <div className="mb-10 text-center space-y-2">
          <h2
            id="features-heading"
            className="text-2xl font-extrabold tracking-tight lg:text-3xl"
          >
            O que a IA entrega
          </h2>
          <p className="mx-auto max-w-md text-sm mc-text-muted">
            Cada edital médico processado gera um conjunto completo de conteúdo
            editorial, estruturado e pronto para o blog.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="mc-glass mc-card-hover flex flex-col gap-3 p-5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--mc-primary-soft)]">
                <Icon className="h-4.5 w-4.5 text-[#ff4d6d]" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
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
        <div className="mb-10 text-center space-y-2">
          <h2
            id="comparison-heading"
            className="text-2xl font-extrabold tracking-tight lg:text-3xl"
          >
            Antes e depois
          </h2>
          <p className="mx-auto max-w-md text-sm mc-text-muted">
            Veja como o processo de publicação de editais médicos muda com IA.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* BEFORE */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <X className="h-3.5 w-3.5 mc-text-muted" />
              </div>
              <h3 className="text-sm font-semibold mc-text-muted uppercase tracking-wider">
                Antes
              </h3>
            </div>
            <ul className="space-y-3">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm mc-text-muted">
                  <span className="mt-0.5 shrink-0 h-4 w-4 rounded-full border border-white/10 flex items-center justify-center">
                    <X className="h-2.5 w-2.5 opacity-50" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* AFTER */}
          <div className="mc-glass mc-glow-red rounded-xl border border-[var(--mc-primary)]/25 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mc-primary-soft)]">
                <Sparkles className="h-3.5 w-3.5 text-[#ff4d6d]" />
              </div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Com IA
              </h3>
            </div>
            <ul className="space-y-3">
              {AFTER.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="mt-0.5 shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--mc-primary-soft)]">
                    <Check className="h-2.5 w-2.5 text-[#ff4d6d] stroke-[2.5]" />
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
