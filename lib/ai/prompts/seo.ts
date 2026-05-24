import type { NoticeExtraction } from "../schemas";

export interface SeoPromptInput {
  extraction: NoticeExtraction;
  currentDate: string;
}

export function buildSeoPrompt(input: SeoPromptInput): string {
  const compact = JSON.stringify(
    {
      blogTitle: input.extraction.blogTitle,
      institutions: input.extraction.institutions,
      vacancyModalities: input.extraction.vacancyModalities,
      specialties: input.extraction.vacancies.map((v) => v.specialty),
    },
    null,
    2,
  );

  return `Tarefa: gerar metadados de SEO para o post de blog sobre o edital descrito abaixo.

Data de hoje: ${input.currentDate}

Regras:
- seoTitle: até 60 caracteres ideais. Inclua "Residência Médica", a instituição principal e o ano sempre que possível. Sem clickbait.
- metaDescription: até 160 caracteres ideais. Comece com verbo de ação ("Confira", "Veja"), cite quantidade de vagas (somando totais conhecidos) e nome da instituição.
- slug: kebab-case, sem acentos nem caracteres especiais; até 80 caracteres. Inclua "residencia-medica-<instituicao>-<ano>" quando aplicável.

Dados do edital (JSON):
${compact}`;
}
