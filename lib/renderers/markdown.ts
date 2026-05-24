import type { NoticeExtraction, SeoMeta, VacancyRowSchema } from "@/lib/ai/schemas";
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

  if (extraction.vacancies.length > 0) {
    sections.push("## Vagas por instituição e especialidade");
    sections.push(renderVacanciesByInstitution(extraction));
  }

  if (extraction.requirements.length > 0) {
    sections.push(
      [
        "## Requisitos",
        ...extraction.requirements.map((item) => `- ${item}`),
      ].join("\n"),
    );
  }

  if (extraction.selectionProcess.trim().length > 0) {
    sections.push(["## Processo seletivo", extraction.selectionProcess].join("\n\n"));
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

function renderVacanciesByInstitution(extraction: NoticeExtraction): string {
  const groups = groupVacanciesByInstitution(extraction.vacancies);
  const blocks: string[] = [];

  for (const [institution, vacancies] of groups) {
    if (groups.size > 1) {
      blocks.push(`### ${institution}`);
    }
    blocks.push(renderVacanciesTable(vacancies, extraction.vacancyModalities));
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

function renderVacanciesTable(
  vacancies: VacancyRow[],
  modalities: string[],
): string {
  if (modalities.length === 0) {
    return renderSimpleVacanciesTable(vacancies);
  }

  const header = ["Especialidade", ...modalities, "Total"];
  const separator = header.map(() => "---");
  const rows = vacancies.map((vacancy) => {
    const lookup = buildModalityLookup(vacancy.counts);
    const cells = [escapeCell(vacancy.specialty)];
    for (const modality of modalities) {
      const value = lookup.get(modality);
      cells.push(value == null ? EMPTY_CELL : String(value));
    }
    cells.push(formatTotalCell(vacancy, modalities, lookup));
    return cells;
  });

  return buildMarkdownTable(header, separator, rows);
}

function buildModalityLookup(counts: VacancyRow["counts"]): Map<string, number | null> {
  const map = new Map<string, number | null>();
  for (const entry of counts) {
    map.set(entry.modality, entry.count);
  }
  return map;
}

function renderSimpleVacanciesTable(vacancies: VacancyRow[]): string {
  const header = ["Especialidade", "Vagas"];
  const separator = header.map(() => "---");
  const rows = vacancies.map((vacancy) => [
    escapeCell(vacancy.specialty),
    vacancy.total != null ? String(vacancy.total) : EMPTY_CELL,
  ]);
  return buildMarkdownTable(header, separator, rows);
}

function formatTotalCell(
  vacancy: VacancyRow,
  modalities: string[],
  lookup: Map<string, number | null>,
): string {
  if (vacancy.total != null) return String(vacancy.total);

  const values = modalities
    .map((modality) => lookup.get(modality))
    .filter((value): value is number => typeof value === "number");

  if (values.length === 0) return EMPTY_CELL;
  return String(values.reduce((sum, current) => sum + current, 0));
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
