# MedCof — Editor de Editais

Aplicação Next.js 16 para transformar editais de residência médica em **posts editoriais prontos** (Markdown + HTML + dados estruturados), usando um pipeline de IA multi-provider (OpenAI · Gemini · DeepSeek).

- Upload de PDF (extração local com `unpdf`, sem enviar o arquivo para terceiros)
- Pipeline de 3 chamadas: **extração estruturada → SEO → quality-check**
- Saída salva em `outputs/{jobId}/` com `post.md`, `post.html`, `data.json`
- Login com credencial fixa (sem banco de dados)

---

## 1. Pré-requisitos

| Ferramenta | Versão mínima | Observação |
| --- | --- | --- |
| Node.js | **20.x LTS** ou superior | Next 16 exige Node ≥ 20.9 |
| npm | 10.x | Já vem com o Node 20 |
| Git | qualquer | Apenas para clonar o repositório |

Pelo menos uma chave de API entre:

- **OpenAI** — `https://platform.openai.com/api-keys`
- **Google Gemini** — `https://aistudio.google.com/apikey`
- **DeepSeek** — `https://platform.deepseek.com/api_keys`

Você pode rodar com apenas um provider configurado; os outros ficam desabilitados no seletor da UI.

---

## 2. Clonar o repositório

```bash
git clone <url-do-repo> medcof-editais-blogs
cd medcof-editais-blogs
```

---

## 3. Instalar dependências

```bash
npm install
```

Isso instala Next 16, React 19, Tailwind 4, OpenAI SDK, `@google/genai`, `unpdf`, `markdown-it`, `sanitize-html`, etc.

---

## 4. Configurar variáveis de ambiente

Copie o template e edite com suas chaves:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

Abra `.env.local` e preencha:

```env
# Provider padrão quando a UI não enviar nenhum: openai | gemini | deepseek
AI_PROVIDER=gemini

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5

# Google Gemini
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash

# DeepSeek (API OpenAI-compatível)
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com

# App
MAX_PDF_MB=20
OUTPUTS_DIR=./outputs

# Auth (V1: credenciais fixas, sem banco)
AUTH_USERNAME=admin
AUTH_PASSWORD=Blogbonito123
AUTH_SESSION_SECRET=please-change-me-in-production
```

### Notas importantes

- **`AI_PROVIDER`**: define o provedor pré-selecionado no formulário. A UI permite trocar por request.
- **Chaves vazias** fazem o provider sumir do seletor — não é erro.
- **`AUTH_SESSION_SECRET`**: em produção, troque por uma string aleatória longa (ex.: `openssl rand -hex 32`). Cookies de sessão são assinados com HMAC-SHA256 usando esse segredo.
- **`MAX_PDF_MB`**: limite do upload (default 20 MB). Acompanha o `bodySizeLimit` de Server Actions em `next.config.ts` (25 MB).

---

## 5. Rodar em desenvolvimento

```bash
npm run dev
```

A aplicação sobe em `http://localhost:3000`.

### Fluxo de login

1. Qualquer acesso à raiz `/` redireciona para `/login`.
2. Use as credenciais definidas em `.env.local` (default: `admin` / `Blogbonito123`).
3. Após autenticar, o cookie `mc_session` é setado (HttpOnly, válido por 7 dias) e você cai no gerador.
4. Botão **Sair** no canto superior direito limpa a sessão.

### Fluxo de geração

1. Selecione o provedor de IA.
2. Faça upload do PDF do edital (máx. `MAX_PDF_MB`).
3. Aguarde o pipeline: extração → SEO → quality-check.
4. Revise o resultado nas abas **Markdown / HTML / Dados / Avisos**.
5. Edite o Markdown se necessário e clique em **Salvar** para persistir; **Baixar** exporta `.md` ou `.html`; **Regenerar** roda o pipeline novamente sobre o mesmo PDF.

---

## 6. Onde ficam os outputs

Cada execução cria uma pasta em `outputs/{jobId}/`:

```
outputs/
└── 7gK3aZqLp9c/
    ├── data.json   # extração + SEO + warnings
    ├── post.md     # markdown editorial
    └── post.html   # HTML sanitizado
```

A pasta `outputs/` está no `.gitignore`. Apague à vontade.

---

## 7. Comandos úteis

```bash
npm run dev      # servidor de desenvolvimento (Turbopack)
npm run build    # build de produção
npm run start    # serve o build de produção (rode `npm run build` antes)
npm run lint     # ESLint
npx tsc --noEmit # type-check sem emitir arquivos
```

---

## 8. Build & deploy de produção

```bash
npm run build
npm run start
```

Pontos de atenção para deploy:

- Garanta que **todas as variáveis de ambiente** estejam configuradas no host (`AUTH_*`, `*_API_KEY`, `MAX_PDF_MB`, `OUTPUTS_DIR`).
- **`AUTH_SESSION_SECRET` obrigatório em produção** — sem isso, qualquer cookie emitido em dev seria válido em prod.
- `OUTPUTS_DIR` precisa ser um diretório com permissão de escrita. Em ambientes serverless efêmeros (Vercel, Lambda) os arquivos somem entre invocações — considere apontar para object storage (S3, R2) numa próxima iteração.
- `unpdf` está em `serverExternalPackages` (`next.config.ts`), o que permite rodar em runtimes serverless sem ajustes de webpack.

---

## 9. Estrutura do projeto

```
.
├── app/
│   ├── (app)/              # rotas autenticadas (header + footer)
│   │   ├── layout.tsx
│   │   └── page.tsx        # tela principal do gerador
│   ├── login/
│   │   └── page.tsx        # formulário de login
│   ├── api/
│   │   ├── generate/       # POST: PDF → pipeline → salva job
│   │   ├── outputs/[jobId] # GET/PUT: leitura e edição de jobs
│   │   ├── config/         # GET: providers disponíveis, limites
│   │   ├── login/          # POST: valida credenciais e seta cookie
│   │   └── logout/         # POST: limpa cookie
│   ├── layout.tsx          # html/body + Toaster
│   └── globals.css         # tema MedCof (CSS vars vermelho)
├── components/
│   ├── SiteHeader.tsx · SiteFooter.tsx · LogoutButton.tsx
│   ├── UploadForm.tsx · GenerationPreview.tsx
│   ├── MarkdownEditor.tsx · HtmlPreview.tsx · WarningsBanner.tsx
├── lib/
│   ├── ai/
│   │   ├── providers/      # openai · gemini · deepseek (+ factory)
│   │   ├── prompts/        # system · extract-notice · seo · quality-check
│   │   ├── schemas.ts      # zod schemas (NoticeExtraction, Seo, Quality)
│   │   └── pipeline.ts     # orquestra as 3 chamadas
│   ├── auth/               # config + session HMAC (Edge-compatible)
│   ├── pdf/extract-text.ts # unpdf wrapper
│   ├── renderers/          # markdown.ts · html.ts
│   ├── storage/local-output-store.ts
│   ├── config/server.ts    # leitura de env
│   └── types/api.ts
├── public/medcof-logo.png
├── outputs/                # gerado em runtime (gitignored)
├── proxy.ts                # Next 16: proxy de auth (era middleware.ts)
├── next.config.ts
├── eslint.config.mjs
└── tsconfig.json
```

---

## 10. Troubleshooting

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| `Cannot find module '../../app/page.js'` no `tsc` | cache stale do `.next` após mover arquivos | `Remove-Item -Recurse -Force .next` (PowerShell) e rode de novo |
| Login fica em loop redirecionando | cookie não foi setado (provavelmente `AUTH_SESSION_SECRET` mudou entre restarts) | mantenha o `AUTH_SESSION_SECRET` estável no `.env.local` |
| Upload retorna `PDF não contém texto extraível` | edital é uma imagem escaneada | atualmente sem OCR; rode o PDF por uma ferramenta OCR antes |
| Provider não aparece no seletor | chave de API vazia no `.env.local` | preencha `OPENAI_API_KEY` / `GEMINI_API_KEY` / `DEEPSEEK_API_KEY` |
| Erro de `body size limit` | PDF acima do `bodySizeLimit` | aumente em `next.config.ts → experimental.serverActions.bodySizeLimit` |
| Warning `react-hooks/incompatible-library` no ESLint | conhecido do `react-hook-form` + React Compiler | benigno, pode ignorar |

---

## 11. Stack

- **Next.js 16** (App Router, Turbopack, route groups, `proxy.ts`)
- **React 19** · **TypeScript 5.7** · **Tailwind CSS 4**
- **Zod 4** (schemas + `z.toJSONSchema()` nativo)
- **OpenAI SDK** (Responses API + structured outputs)
- **`@google/genai`** (Gemini com `responseSchema`)
- **DeepSeek** via OpenAI SDK + JSON mode + validação Zod com retry
- **`unpdf`** (extração de PDF local)
- **`markdown-it`** + **`sanitize-html`** (renderização determinística)
- **`react-hook-form`** + **`sonner`** (UX)
- **`lucide-react`** (ícones)
