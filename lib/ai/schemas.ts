import { z } from "zod";

/* ---------- Call 1: Notice extraction ---------- */

export const ScheduleItemSchema = z.object({
  label: z
    .string()
    .describe("Etapa do cronograma. Ex.: 'Inscrições', 'Prova objetiva'."),
  date: z
    .string()
    .nullable()
    .describe(
      "Data ou intervalo no formato textual do edital. Use null se ausente.",
    ),
  notes: z
    .string()
    .nullable()
    .describe("Observação curta opcional. Use null se não houver."),
});

export const VacancyModalityCountSchema = z.object({
  modality: z
    .string()
    .describe(
      "Nome da modalidade. Deve corresponder EXATAMENTE a um dos itens de vacancyModalities.",
    ),
  count: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .describe(
      "Quantidade de vagas para esta modalidade nesta especialidade. Use null quando a modalidade não se aplica.",
    ),
});

export const VacancyRowSchema = z.object({
  institution: z
    .string()
    .describe(
      "Instituição que oferta esta especialidade. Deve corresponder EXATAMENTE a um item de institutions[].",
    ),
  specialty: z
    .string()
    .describe("Nome da especialidade médica conforme o edital."),
  counts: z
    .array(VacancyModalityCountSchema)
    .describe(
      "Uma entrada por modalidade ofertada para esta especialidade. Inclua uma entrada por item de vacancyModalities (use count=null quando não se aplica).",
    ),
  total: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .describe(
      "Total de vagas para a especialidade conforme o edital. Use null se não vier explicitado.",
    ),
  notes: z
    .string()
    .nullable()
    .describe("Observação curta sobre a vaga. Use null se não houver."),
});

export const NoticeExtractionSchema = z.object({
  blogTitle: z
    .string()
    .describe("Título do post, com instituição e ano quando possível."),
  intro: z
    .string()
    .describe(
      "Parágrafo introdutório de 3 a 5 frases apresentando o edital.",
    ),
  institutions: z
    .array(z.string())
    .describe("Instituições responsáveis pelo edital."),
  requirements: z
    .array(z.string())
    .describe("Requisitos principais para os candidatos."),
  selectionProcess: z
    .string()
    .describe(
      "Resumo do processo seletivo: provas, fases, critérios de classificação.",
    ),
  vacancyModalities: z
    .array(z.string())
    .describe(
      "Lista canônica e normalizada das modalidades de vaga (ex.: ['Acesso Direto', 'Pré-requisito R1']).",
    ),
  vacancies: z
    .array(VacancyRowSchema)
    .describe("Uma entrada por especialidade ofertada no edital."),
  schedule: z
    .array(ScheduleItemSchema)
    .describe("Cronograma do processo seletivo na ordem do edital."),
});

export type NoticeExtraction = z.infer<typeof NoticeExtractionSchema>;

/* ---------- Call 2: SEO ---------- */

export const SeoSchema = z.object({
  seoTitle: z
    .string()
    .max(70)
    .describe("Título SEO com até 60 caracteres ideais (máx. 70)."),
  metaDescription: z
    .string()
    .max(180)
    .describe("Meta description com até 160 caracteres ideais (máx. 180)."),
  slug: z
    .string()
    .describe("Slug em kebab-case sem acentos para a URL do post."),
});

export type SeoMeta = z.infer<typeof SeoSchema>;

/* ---------- Call 3: Quality check ---------- */

export const WarningSeverity = z.enum(["info", "warn", "error"]);

export const QualityWarningSchema = z.object({
  field: z
    .string()
    .describe(
      "Caminho do campo afetado em notação ponto. Ex.: 'vacancies[0].countsByModality'.",
    ),
  severity: WarningSeverity,
  message: z.string().describe("Descrição do problema em PT-BR."),
  evidence: z
    .string()
    .nullable()
    .describe(
      "Trecho curto do texto-fonte que sustenta o alerta. Use null se não houver evidência direta.",
    ),
});

export const QualityReportSchema = z.object({
  warnings: z.array(QualityWarningSchema),
});

export type QualityReport = z.infer<typeof QualityReportSchema>;
export type QualityWarning = z.infer<typeof QualityWarningSchema>;

/* ---------- Aggregate ---------- */

export interface AiPipelineResult {
  extraction: NoticeExtraction;
  seo: SeoMeta;
  quality: QualityReport;
  providerUsed: string;
  modelUsed: string;
}
