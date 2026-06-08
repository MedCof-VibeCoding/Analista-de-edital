import "server-only";

export type ProviderName = "openai" | "gemini" | "deepseek";

const DEFAULT_OPENAI_MODEL = "gpt-5.5";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-pro";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat";
const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export interface ServerConfig {
  defaultProvider: ProviderName;
  openai: { apiKey: string | null; model: string };
  gemini: { apiKey: string | null; model: string };
  deepseek: { apiKey: string | null; model: string; baseURL: string };
  maxPdfBytes: number;
  outputsDir: string;
  mongo: { uri: string | null; dbName: string };
}

const DEFAULT_MONGO_DB = "medcof_editais";

/**
 * Reads and validates env vars once per process. Throws if AI_PROVIDER value is invalid.
 */
export function getServerConfig(): ServerConfig {
  const rawProvider = (process.env.AI_PROVIDER ?? "openai").trim().toLowerCase();
  if (!isProviderName(rawProvider)) {
    throw new Error(
      `AI_PROVIDER inválido: "${rawProvider}". Use openai | gemini | deepseek.`,
    );
  }

  const maxPdfMb = Number(process.env.MAX_PDF_MB ?? "20");
  const safeMaxPdfMb = Number.isFinite(maxPdfMb) && maxPdfMb > 0 ? maxPdfMb : 20;

  return {
    defaultProvider: rawProvider,
    openai: {
      apiKey: emptyToNull(process.env.OPENAI_API_KEY),
      model: process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
    },
    gemini: {
      apiKey: emptyToNull(process.env.GEMINI_API_KEY),
      model: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
    },
    deepseek: {
      apiKey: emptyToNull(process.env.DEEPSEEK_API_KEY),
      model: process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_DEEPSEEK_MODEL,
      baseURL: process.env.DEEPSEEK_BASE_URL?.trim() || DEFAULT_DEEPSEEK_BASE_URL,
    },
    maxPdfBytes: safeMaxPdfMb * 1024 * 1024,
    outputsDir: process.env.OUTPUTS_DIR?.trim() || "./outputs",
    mongo: {
      uri: emptyToNull(process.env.MONGODB_URI),
      dbName: process.env.MONGODB_DB?.trim() || DEFAULT_MONGO_DB,
    },
  };
}

export function isProviderName(value: string): value is ProviderName {
  return value === "openai" || value === "gemini" || value === "deepseek";
}

/**
 * Returns the providers that are actually usable (have an API key set).
 */
export function listAvailableProviders(config: ServerConfig): ProviderName[] {
  const list: ProviderName[] = [];
  if (config.openai.apiKey) list.push("openai");
  if (config.gemini.apiKey) list.push("gemini");
  if (config.deepseek.apiKey) list.push("deepseek");
  return list;
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}
