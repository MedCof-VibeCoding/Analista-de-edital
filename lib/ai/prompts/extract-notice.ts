export interface ExtractNoticePromptInput {
  extractedText: string;
  filename: string;
  currentDate: string;
}

export function buildExtractNoticePrompt(input: ExtractNoticePromptInput): string {
  return `Tarefa: extrair os dados principais do edital de residência médica abaixo e preencher um JSON aderente ao schema NoticeExtraction.

Contexto:
- Arquivo original: ${input.filename}
- Data de hoje: ${input.currentDate}

Diretrizes específicas:
1. blogTitle: inclua o nome da instituição principal e o ano do processo seletivo quando aparecerem.
2. intro: 3 a 5 frases, sem listar todos os requisitos — convide o leitor a continuar lendo.
3. institutions: cada instituição uma única vez, sem duplicar siglas e nomes por extenso.
4. requirements: itens curtos e objetivos. Não invente requisitos genéricos como "ser médico" se não estiverem no edital.
5. selectionProcess: parágrafo único resumindo provas, fases e critérios. Sem repetir o cronograma.
6. vacancyModalities: liste as modalidades de vaga encontradas (ex.: "Acesso Direto", "Pré-requisito R1", "Pré-requisito R3"). Normalize a grafia em PT-BR para EVITAR DUPLICATAS — variações como "PRÉ-REQUISITO R1" e "Pré-Requisito R1" devem virar a mesma string canônica. Use lista vazia [] se o edital não distinguir modalidades.
7. vacancies: uma entrada por par (instituição, especialidade). Se o edital ofertar a mesma especialidade em mais de uma instituição, gere UMA linha para cada instituição. O campo institution deve coincidir EXATAMENTE com um nome listado em institutions[] — use a mesma grafia, sem abreviar nem mudar caixa. counts deve conter UMA entrada para cada item de vacancyModalities, na mesma ordem; em count, use o número inteiro de vagas ou null quando a modalidade não se aplica à especialidade. total deve refletir o que o edital declara explicitamente — caso o edital não traga o total, use null e deixe o renderer calcular.
8. schedule: respeite a ordem do edital. Não junte etapas distintas em uma só linha.

IMPORTANTE: se um campo não tem fonte clara no texto, retorne null ou lista vazia, NUNCA invente.

Texto extraído do edital:
"""
${input.extractedText}
"""`;
}
