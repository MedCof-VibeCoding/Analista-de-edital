export const SOCIAL_SYSTEM_PROMPT = `
Você é um especialista em marketing de conteúdo médico e estrategista de redes sociais.
Seu trabalho é transformar textos de blog sobre editais de residência médica em conteúdo
otimizado para Instagram e X/Twitter, mantendo precisão técnica e linguagem acessível ao público médico.

Regras:
- Sempre use linguagem em português do Brasil.
- Seja direto, informativo e use um tom profissional mas acessível.
- Para Reels: crie roteiros dinâmicos com gancho nos 3 primeiros segundos.
- Para carrossel: cada slide deve ter uma ideia central clara e concisa.
- Para legenda de feed: inclua emojis estratégicos e hashtags relevantes ao final.
- Para thread X/Twitter: cada post deve ser independente mas encadear a narrativa.
`.trim();

export interface BuildSocialPromptInput {
  blogText: string;
}

/**
 * Builds the user prompt for the social media generation call.
 */
export function buildSocialPrompt({ blogText }: BuildSocialPromptInput): string {
  return `
Com base no texto de blog abaixo sobre um edital de residência médica, gere os 4 formatos de conteúdo para redes sociais:

1. **reels**: Roteiro completo narrado para Reels do Instagram (30–60 segundos). Comece com um gancho forte, explique os pontos principais do edital de forma dinâmica e termine com uma chamada para ação (CTA) como "Acesse o link na bio para saber mais".

2. **carousel**: Lista de 5 a 8 slides para carrossel do Instagram. Cada slide deve ter título curto + 1-2 frases de texto. O primeiro slide é o gancho, os intermediários são os destaques do edital, o último é o CTA.

3. **caption**: Legenda completa para post de feed do Instagram. Comece com uma frase impactante, contextualize o edital, use emojis relevantes ao longo do texto e finalize com hashtags médicas pertinentes (ex: #residenciamédica #edital2026 #medicinabrasileira).

4. **thread**: Sequência de 4 a 8 posts para thread no X/Twitter. Cada post deve ter no máximo 280 caracteres. O primeiro apresenta o tema, os seguintes detalham vagas/cronograma/destaques, o último tem o CTA.

---

TEXTO DO BLOG:
${blogText}
`.trim();
}
