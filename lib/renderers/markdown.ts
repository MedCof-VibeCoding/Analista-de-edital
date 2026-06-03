import type { NoticeExtraction, RegistrationInfo, SeoMeta, VacancyRowSchema } from "@/lib/ai/schemas";
import type { z } from "zod";

type VacancyRow = z.infer<typeof VacancyRowSchema>;

export interface RenderMarkdownInput {
  extraction: NoticeExtraction;
  seo: SeoMeta;
}

const EMPTY_CELL = "—";

/**
 * Pure deterministic Markdown renderer. Same input → same output.
 */
export function renderMarkdown(input: RenderMarkdownInput): string {
  const { extraction, seo } = input;
  const sections: string[] = [];

  sections.push(`# ${extraction.blogTitle}`);
  sections.push(renderSeoFrontNote(seo));
  sections.push(extraction.intro);

  if (extraction.institutions.length > 0) {
    sections.push(
      [
        "## Instituições responsáveis",
        ...extraction.institutions.map((name) => `- ${name}`),
      ].join("\n"),
    );
  }

  if (extraction.registrationInfo) {
    sections.push(renderRegistrationInfo(extraction.registrationInfo));
  }

  if (extraction.vacancies.length > 0) {
    sections.push("## Vagas por instituição e especialidade");
    sections.push(renderVacanciesByInstitution(extraction));
  }

  if (extraction.selectionStages.length > 0) {
    sections.push(renderSelectionStages(extraction.selectionStages));
  }

  if (extraction.schedule.length > 0) {
    sections.push("## Cronograma");
    sections.push(renderScheduleTable(extraction.schedule));
  }

  sections.push(renderCta());

  return sections.filter((s) => s.trim().length > 0).join("\n\n") + "\n";
}

function renderSeoFrontNote(seo: SeoMeta): string {
  return `> **SEO Title:** ${seo.seoTitle}  \n> **Meta Description:** ${seo.metaDescription}  \n> **Slug:** \`${seo.slug}\``;
}

/**
 * Renders the Inscrições H2 section from registrationInfo fields.
 */
function renderRegistrationInfo(info: RegistrationInfo): string {
  const lines: string[] = ["## Inscrições"];
  if (info.period) {
    lines.push(`- **Período de inscrição:** ${info.period}`);
  }
  if (info.fee) {
    lines.push(`- **Taxa de inscrição:** ${info.fee}`);
  }
  if (info.exemptionPeriod) {
    lines.push(`- **Período de isenção:** ${info.exemptionPeriod}`);
  }
  if (info.exemptionCriteria) {
    lines.push(`- **Critérios de isenção:** ${info.exemptionCriteria}`);
  }
  return lines.join("\n");
}

function renderVacanciesByInstitution(extraction: NoticeExtraction): string {
  const groups = groupVacanciesByInstitution(extraction.vacancies);
  const blocks: string[] = [];

  for (const [institution, vacancies] of groups) {
    if (groups.size > 1) {
      blocks.push(`### ${institution}`);
    }
    blocks.push(renderVacanciesTable(vacancies, extraction.vacancyTableColumns ?? null));
  }

  return blocks.join("\n\n");
}

function groupVacanciesByInstitution(
  vacancies: VacancyRow[],
): Map<string, VacancyRow[]> {
  const groups = new Map<string, VacancyRow[]>();
  for (const vacancy of vacancies) {
    const key = vacancy.institution?.trim() || "Sem instituição informada";
    const existing = groups.get(key);
    if (existing) {
      existing.push(vacancy);
    } else {
      groups.set(key, [vacancy]);
    }
  }
  return groups;
}

/**
 * Renders vacancy table.
 * Priority 1: canonical column list from vacancyTableColumns (exact order + names from PDF).
 * Priority 2: infer columns from countsByModality keys (heuristic fallback).
 * Priority 3: simple Total / Reserva columns.
 */
function renderVacanciesTable(
  vacancies: VacancyRow[],
  vacancyTableColumns: string[] | null,
): string {
  if (vacancyTableColumns && vacancyTableColumns.length > 0) {
    return renderVacanciesTableWithColumns(vacancies, vacancyTableColumns);
  }

  const modalityKeys = collectModalityKeys(vacancies);
  if (modalityKeys.length > 0) {
    return renderVacanciesTableWithModalities(vacancies, modalityKeys);
  }

  return renderVacanciesTableSimple(vacancies);
}

/**
 * Renders vacancy table using the authoritative ordered column list from the schema.
 * Each cell resolves from countsByModality[col], with a fallback to vacancy.total
 * for columns whose name starts with "total" (case-insensitive) when countsByModality
 * is absent — ensuring backward-compatibility with older extractions.
 */
function renderVacanciesTableWithColumns(
  vacancies: VacancyRow[],
  columns: string[],
): string {
  const hasAnyNotes = vacancies.some((v) => v.notes?.trim());
  const header = [
    "Especialidade",
    ...columns,
    ...(hasAnyNotes ? ["Observações"] : []),
  ];
  const separator = header.map(() => "---");

  const rows = vacancies.map((v) => {
    const cells = [
      escapeCell(v.specialty),
      ...columns.map((col) => {
        const fromMap = v.countsByModality?.[col];
        if (fromMap != null) return String(fromMap);
        if (/^total/i.test(col) && v.total != null) return String(v.total);
        return EMPTY_CELL;
      }),
    ];
    if (hasAnyNotes) {
      cells.push(v.notes ? escapeCell(v.notes) : EMPTY_CELL);
    }
    return cells;
  });

  return buildMarkdownTable(header, separator, rows);
}

/** Collects all unique modality keys across a group of vacancy rows, sorted with AC first. */
function collectModalityKeys(vacancies: VacancyRow[]): string[] {
  const keySet = new Set<string>();
  for (const v of vacancies) {
    if (v.countsByModality) {
      for (const key of Object.keys(v.countsByModality)) {
        keySet.add(key);
      }
    }
  }
  if (keySet.size === 0) return [];

  const sorted = Array.from(keySet).sort((a, b) => {
    if (a === "AC") return -1;
    if (b === "AC") return 1;
    return a.localeCompare(b, "pt-BR");
  });

  return sorted;
}

function renderVacanciesTableWithModalities(
  vacancies: VacancyRow[],
  modalityKeys: string[],
): string {
  const hasAnyNotes = vacancies.some((v) => v.notes && v.notes.trim().length > 0);
  const header = [
    "Especialidade",
    "Total",
    ...modalityKeys,
    ...(hasAnyNotes ? ["Observações"] : []),
  ];
  const separator = header.map(() => "---");

  const rows = vacancies.map((v) => {
    const cells = [
      escapeCell(v.specialty),
      v.total != null ? String(v.total) : EMPTY_CELL,
      ...modalityKeys.map((key) =>
        v.countsByModality?.[key] != null ? String(v.countsByModality[key]) : EMPTY_CELL,
      ),
    ];
    if (hasAnyNotes) {
      cells.push(v.notes ? escapeCell(v.notes) : EMPTY_CELL);
    }
    return cells;
  });

  return buildMarkdownTable(header, separator, rows);
}

function renderVacanciesTableSimple(vacancies: VacancyRow[]): string {
  const hasAnyNotes = vacancies.some((v) => v.notes && v.notes.trim().length > 0);
  const header = hasAnyNotes
    ? ["Especialidade", "Total de Vagas", "Reserva", "Observações"]
    : ["Especialidade", "Total de Vagas", "Reserva"];
  const separator = header.map(() => "---");

  const rows = vacancies.map((vacancy) => {
    const base = [
      escapeCell(vacancy.specialty),
      vacancy.total != null ? String(vacancy.total) : EMPTY_CELL,
      vacancy.reserved != null ? String(vacancy.reserved) : EMPTY_CELL,
    ];
    return hasAnyNotes
      ? [...base, vacancy.notes ? escapeCell(vacancy.notes) : EMPTY_CELL]
      : base;
  });

  return buildMarkdownTable(header, separator, rows);
}

/**
 * Renders the Processo Seletivo H2 section. When there are multiple stages,
 * each stage gets an H3 heading. Single-stage editals render no H3.
 */
function renderSelectionStages(
  stages: NoticeExtraction["selectionStages"],
): string {
  const lines: string[] = ["## Processo Seletivo"];

  if (stages.length === 1) {
    lines.push("");
    lines.push(stages[0].description);
  } else {
    for (const stage of stages) {
      lines.push("");
      lines.push(`### ${stage.title}`);
      lines.push(stage.description);
    }
  }

  return lines.join("\n");
}

function renderScheduleTable(
  schedule: NoticeExtraction["schedule"],
): string {
  const header = ["Etapa", "Data", "Observações"];
  const separator = header.map(() => "---");
  const rows = schedule.map((item) => [
    escapeCell(item.label),
    item.date ? escapeCell(item.date) : EMPTY_CELL,
    item.notes ? escapeCell(item.notes) : EMPTY_CELL,
  ]);
  return buildMarkdownTable(header, separator, rows);
}

function renderCta(): string {
  return [
    "---",
    "",
    "**Quer aumentar suas chances de aprovação?** Conheça os cursos preparatórios da MEDCOF e prepare-se com quem entende de residência médica.",
  ].join("\n");
}

function buildMarkdownTable(
  header: string[],
  separator: string[],
  rows: string[][],
): string {
  return [
    `| ${header.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();
}
