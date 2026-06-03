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

export const VacancyRowSchema = z.object({
  institution: z
    .string()
    .describe(
      "Instituição que oferta esta especialidade. Deve corresponder EXATAMENTE a um item de institutions[].",
    ),
  specialty: z
    .string()
    .describe("Nome da especialidade médica conforme o edital."),
  total: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .describe(
      "Total de vagas ofertadas para a especialidade nesta instituição (incluindo as de reserva). Use null se não vier explicitado.",
    ),
  reserved: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .describe(
      "Vagas reservadas (PCD, cotas raciais/sociais, etc.) dentro do total. Use null se o edital não citar reserva e 0 quando o edital citar explicitamente que não há reserva.",
    ),
  countsByModality: z
    .record(z.string(), z.number().int().nonnegative())
    .nullable()
    .describe(
      "Distribuição por modalidade de concorrência conforme o edital. Chave = nome da modalidade (ex: 'AC', 'PPI', 'PCD', 'Militar', 'Trans', 'Indígenas'). Uma chave por modalidade — NUNCA agrupar categorias distintas. Use null quando o edital não detalhar modalidades.",
    ),
  notes: z
    .string()
    .nullable()
    .describe("Observação curta sobre a vaga (ex.: tipo de reserva). Use null se não houver."),
});

export const RegistrationInfoSchema = z.object({
  period: z
    .string()
    .nullable()
    .describe("Período de inscrição conforme o edital. Use null se não mencionado."),
  fee: z
    .string()
    .nullable()
    .describe("Valor da taxa de inscrição. Use null se não mencionado."),
  exemptionPeriod: z
    .string()
    .nullable()
    .describe("Período de solicitação de isenção da taxa. Use null se não mencionado."),
  exemptionCriteria: z
    .string()
    .nullable()
    .describe("Critérios para isenção da taxa (ex.: CadÚnico, hipossuficiência). Use null se não mencionado."),
});

export const SelectionStageSchema = z.object({
  title: z
    .string()
    .describe("Nome da etapa. Ex.: 'Prova Objetiva', 'Análise de Currículo', 'Entrevista'."),
  description: z
    .string()
    .describe(
      "Data, formato (presencial/online), peso e critérios de classificação da etapa. Sem repetir o cronograma.",
    ),
});

export const NoticeExtractionSchema = z.object({
  blogTitle: z
    .string()
    .describe("Título do post, com instituição e ano quando possível."),
  intro: z
    .string()
    .describe(
      "Introdução com 2 parágrafos separados por \\n\\n. Cada parágrafo: 2 a 3 linhas. Parágrafo 1: mencionar que o edital foi publicado e qual a banca/instituição responsável. Parágrafo 2: informar ao leitor que encontrará as principais informações no artigo (inscrições, vagas, cronograma, processo seletivo).",
    ),
  institutions: z
    .array(z.string())
    .describe("Instituições responsáveis pelo edital."),
  registrationInfo: RegistrationInfoSchema
    .nullable()
    .describe("Informações sobre inscrições. Use null se o edital não apresentar esses dados."),
  vacancyTableColumns: z
    .array(z.string())
    .nullable()
    .describe(
      "Lista ordenada dos cabeçalhos de colunas da tabela de vagas, excluindo a coluna Especialidade, " +
      "usando o texto EXATO do edital. Inclui a coluna de total e cada coluna de modalidade. " +
      "Ex.: ['Total', 'AC', 'PPI', 'PCD'] ou ['Total de Vagas', 'AC', 'Militar']. " +
      "Use null quando o edital não apresentar tabela de vagas com colunas nomeadas.",
    ),
  selectionStages: z
    .array(SelectionStageSchema)
    .describe(
      "Uma entrada por etapa do processo seletivo. Quando houver apenas uma etapa, gerar array com um único item.",
    ),
  vacancies: z
    .array(VacancyRowSchema)
    .describe("Uma entrada por par (instituição, especialidade) ofertado no edital."),
  schedule: z
    .array(ScheduleItemSchema)
    .describe("Cronograma do processo seletivo na ordem do edital."),
});

export type NoticeExtraction = z.infer<typeof NoticeExtractionSchema>;
export type RegistrationInfo = z.infer<typeof RegistrationInfoSchema>;
export type SelectionStage = z.infer<typeof SelectionStageSchema>;

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

/* ---------- Social media output ---------- */

export const SocialOutputSchema = z.object({
  reels: z
    .string()
    .describe("Roteiro narrado completo para Reels do Instagram (30–60 segundos). Inclui gancho, desenvolvimento e CTA."),
  carousel: z
    .array(z.string())
    .min(5)
    .max(8)
    .describe("Texto de cada slide do carrossel do Instagram (5 a 8 slides). Cada item é o conteúdo de um slide."),
  caption: z
    .string()
    .describe("Legenda completa para post de feed do Instagram: abertura impactante, contexto, emojis e hashtags relevantes."),
  tweet: z
    .string()
    .describe("Um único tweet (X/Twitter) resumindo o edital: gancho com emoji, datas/vagas principais em bullets com emojis e uma CTA curta. Mantenha conciso e escaneável."),
});

export type SocialOutput = z.infer<typeof SocialOutputSchema>;

/* ---------- Aggregate ---------- */

export interface AiPipelineResult {
  extraction: NoticeExtraction;
  seo: SeoMeta;
  quality: QualityReport;
  providerUsed: string;
  modelUsed: string;
}
