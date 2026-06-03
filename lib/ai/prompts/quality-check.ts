import type { NoticeExtraction } from "../schemas";

export interface QualityCheckPromptInput {
  extraction: NoticeExtraction;
  extractedText: string;
}

export function buildQualityCheckPrompt(input: QualityCheckPromptInput): string {
  return `Tarefa: revisar o JSON extraído comparando contra o texto-fonte do edital e listar problemas como warnings.

Checklist obrigatório:
1. Datas ausentes ou ambíguas no schedule (label sem date, ou date com formato confuso).
2. vacancies[].total nulo quando o edital exibe número explícito de vagas — severity "warn".
3. vacancies[].reserved maior que vacancies[].total — severity "error".
4. vacancies[].reserved nulo quando o edital menciona reserva/cota/PCD para aquela especialidade — severity "warn".
5. Conflito direto entre o JSON e o texto-fonte (números, datas ou instituições divergentes) — severity "error" com evidence.
6. blogTitle ou intro sem mencionar a instituição principal — severity "info".
7. vacancies[].institution que NÃO aparece em institutions[] (grafia divergente, sigla vs nome por extenso) — severity "warn".
8. registrationInfo.period nulo quando o edital menciona período de inscrição — severity "warn".
9. selectionStages vazio quando o edital descreve etapas do processo seletivo — severity "warn".
10. vacancies[].countsByModality nulo quando o edital apresenta distribuição de vagas por modalidades de concorrência (AC, PPI, PCD ou similares) — severity "warn".
11. vacancyTableColumns não nulo mas alguma chave presente em vacancies[].countsByModality não aparece em vacancyTableColumns — severity "warn" (indica divergência entre a definição dos headers e os dados por linha).

Para cada problema, retornar um warning com:
- field: caminho do dado afetado em notação ponto (ex.: "schedule[2].date", "vacancies[0].countsByModality").
- severity: "info" para sugestões editoriais, "warn" para campos ausentes/duvidosos, "error" para inconsistência com a fonte.
- message: explicação curta em PT-BR.
- evidence: trecho curto do texto-fonte (máx. 200 caracteres) que sustenta o alerta, ou null.

Se nenhum problema for encontrado, retornar warnings: [].

JSON extraído:
${JSON.stringify(input.extraction, null, 2)}

Texto-fonte do edital:
"""
${input.extractedText}
"""`;
}
