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
4. selectionProcess: parágrafo único resumindo provas, fases e critérios. Sem repetir o cronograma.
5. vacancies: uma entrada por par (instituição, especialidade). Se a mesma especialidade for ofertada em mais de uma instituição, gere UMA linha para cada instituição. O campo institution deve coincidir EXATAMENTE com um nome listado em institutions[] — mesma grafia, sem abreviar nem mudar caixa.
   - total: número inteiro de vagas totais para a especialidade naquela instituição, conforme declarado no edital. SOME todas as modalidades (acesso direto, pré-requisitos, ano adicional, área de atuação, ampla concorrência e reserva) em um único número. Use null se o edital não trouxer total nem permitir somar com segurança.
   - reserved: número inteiro de vagas reservadas (PCD, cotas raciais, indígenas, sociais etc.) DENTRO do total. Use 0 quando o edital declara explicitamente que não há reserva e null quando o edital não trata do tema.
   - notes: use APENAS para esclarecer a natureza da reserva (ex.: "1 PCD; 1 negros") ou observações curtas. Não repita a especialidade.
6. schedule: respeite a ordem do edital. Não junte etapas distintas em uma só linha.

IMPORTANTE: se um campo não tem fonte clara no texto, retorne null ou lista vazia, NUNCA invente.

Texto extraído do edital:
"""
${input.extractedText}
"""`;
}
