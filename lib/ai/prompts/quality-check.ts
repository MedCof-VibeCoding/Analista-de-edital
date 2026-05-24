import type { NoticeExtraction } from "../schemas";

export interface QualityCheckPromptInput {
  extraction: NoticeExtraction;
  extractedText: string;
}

export function buildQualityCheckPrompt(input: QualityCheckPromptInput): string {
  return `Tarefa: revisar o JSON extraído comparando contra o texto-fonte do edital e listar problemas como warnings.

Checklist obrigatório:
1. Datas ausentes ou ambíguas no schedule (label sem date, ou date com formato confuso).
2. Vagas sem número (counts vazio ou todas as entradas com count=null para uma especialidade) — quando o edital cita vagas.
3. total da especialidade ausente quando o edital exibe um total explícito.
4. Requisitos vagos como "ser médico" — sinalize com severity "warn".
5. Modalidades duplicadas em vacancyModalities (ex.: "Pré-requisito R1" e "Pre Requisito R1").
6. Conflito direto entre o JSON e o texto-fonte (números, datas ou instituições divergentes) — severity "error" com evidence.
7. blogTitle ou intro sem mencionar a instituição principal — severity "info".
8. vacancies[].institution que NÃO aparece em institutions[] (grafia divergente, sigla vs nome por extenso etc.) — severity "warn".

Para cada problema, retorne um warning com:
- field: caminho do dado afetado em notação ponto (ex.: "schedule[2].date", "vacancies[0].counts[1].count").
- severity: "info" para sugestões editoriais, "warn" para campos ausentes/duvidosos, "error" para inconsistência com a fonte.
- message: explicação curta em PT-BR.
- evidence: trecho curto do texto-fonte (máx. 200 caracteres) que sustenta o alerta, ou null.

Se nenhum problema for encontrado, retorne warnings: [].

JSON extraído:
${JSON.stringify(input.extraction, null, 2)}

Texto-fonte do edital:
"""
${input.extractedText}
"""`;
}
