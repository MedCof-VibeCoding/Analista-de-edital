export interface ExtractNoticePromptInput {
  extractedText: string;
  filename: string;
  currentDate: string;
}

export function buildExtractNoticePrompt(input: ExtractNoticePromptInput): string {
  return `Tarefa: extrair os dados principais do edital abaixo e preencher um JSON aderente ao schema NoticeExtraction.

Contexto:
- Arquivo original: ${input.filename}
- Data de hoje: ${input.currentDate}

Diretrizes por campo:

1. blogTitle
   Inclua o nome da instituição principal e o ano do processo seletivo quando aparecerem.
   Ex.: "Residência Médica Hospital Sírio-Libanês 2026/2027"

2. intro
   Dois parágrafos separados por \\n\\n. Cada parágrafo: 2 a 3 linhas.
   - Parágrafo 1: informar que o edital foi publicado, qual a banca/instituição responsável e o ano do processo.
   - Parágrafo 2: avisar ao leitor que encontrará no artigo as principais informações: inscrições, vagas, cronograma e processo seletivo.
   Não listar requisitos. Não inventar dados. Tom informativo e jornalístico.

3. institutions
   Cada instituição listada uma única vez. Não duplicar sigla e nome por extenso na mesma lista.

4. registrationInfo
   Extrair do edital:
   - period: período de inscrição (datas de abertura e encerramento).
   - fee: valor da taxa de inscrição.
   - exemptionPeriod: período para solicitar isenção da taxa.
   - exemptionCriteria: critérios que garantem isenção (ex.: CadÚnico, declaração de hipossuficiência).
   Use null para cada campo não mencionado no edital. Use null para o objeto inteiro se o edital não tratar de inscrições.

5. selectionStages
   Uma entrada por etapa do processo seletivo.
   - title: nome da etapa. Ex.: "Prova Objetiva", "Análise de Currículo", "Entrevista".
   - description: data, formato (presencial/online), peso na classificação e critérios de avaliação da etapa.
   Não repetir o cronograma. Quando houver apenas uma etapa, gerar array com um único item.

6. vacancyTableColumns
   Lista ordenada dos cabeçalhos de colunas da tabela de vagas do edital, EXCLUINDO a coluna "Especialidade".
   Usar o texto EXATO que aparece no cabeçalho da tabela no PDF.
   Incluir a coluna de total E cada coluna de modalidade, na ordem em que aparecem no edital.
   Exemplos:
     - edital simples (sem cotas): ["Total"]
     - edital com cotas raciais: ["Total", "AC", "PPI", "PCD"]
     - hospital militar: ["Total", "AC", "Militar"]
     - edital com múltiplas categorias: ["Total de Vagas", "AC", "PPI", "PCD", "Pessoas Trans", "Indígenas"]
   Use null quando o edital não apresentar uma tabela de vagas com colunas nomeadas.
   IMPORTANTE: os nomes definidos aqui serão usados como chaves em countsByModality — devem coincidir exatamente.

7. vacancies
   Uma entrada por par (instituição, especialidade).
   - institution: deve coincidir EXATAMENTE com um nome listado em institutions[] — mesma grafia, sem abreviar.
   - total: número inteiro de vagas totais para a especialidade naquela instituição. Use null se o edital não trouxer o total explicitamente.
   - reserved: vagas reservadas (PCD, cotas raciais/sociais etc.) dentro do total. Use 0 quando o edital declare explicitamente ausência de reserva; null quando o edital não mencionar o tema.
   - countsByModality: preencher quando vacancyTableColumns não for null. As chaves devem ser IDÊNTICAS aos valores de vacancyTableColumns (inclusive a coluna de total). Usar o número exato declarado no edital para cada modalidade.
     NUNCA agrupar modalidades distintas em uma única chave.
     NUNCA consolidar — se o edital mostrar AC e PPI separados, usar duas chaves separadas.
     Use null quando o edital não detalhar distribuição por colunas.
   - notes: usar APENAS para esclarecer a natureza da reserva ou observações curtas. Não repetir a especialidade.

8. schedule
   Respeitar a ordem do edital. Não juntar etapas distintas em uma só linha. Uma entrada por evento.

IMPORTANTE: se um campo não tem fonte clara no texto do edital, retornar null ou lista vazia. NUNCA inventar.

Texto extraído do edital:
"""
${input.extractedText}
"""`;
}
