import "server-only";
import { getServerConfig, type ProviderName } from "@/lib/config/server";
import { createOpenAiProvider } from "./openai";
import { createGeminiProvider } from "./gemini";
import { createDeepSeekProvider } from "./deepseek";
import { AiProviderError, type AiProvider } from "./types";

export { AiProviderError } from "./types";
export type { AiProvider, ProviderName } from "./types";

/**
 * Factory that returns the configured AiProvider. Throws AiProviderError with
 * code "MISSING_KEY" if the required API key is not set in env.
 */
export function getProvider(name: ProviderName): AiProvider {
  const config = getServerConfig();

  switch (name) {
    case "openai":
      if (!config.openai.apiKey) {
        throw new AiProviderError(
          "openai",
          "MISSING_KEY",
          "OPENAI_API_KEY não configurada no servidor.",
        );
      }
      return createOpenAiProvider({
        apiKey: config.openai.apiKey,
        model: config.openai.model,
      });
    case "gemini":
      if (!config.gemini.apiKey) {
        throw new AiProviderError(
          "gemini",
          "MISSING_KEY",
          "GEMINI_API_KEY não configurada no servidor.",
        );
      }
      return createGeminiProvider({
        apiKey: config.gemini.apiKey,
        model: config.gemini.model,
      });
    case "deepseek":
      if (!config.deepseek.apiKey) {
        throw new AiProviderError(
          "deepseek",
          "MISSING_KEY",
          "DEEPSEEK_API_KEY não configurada no servidor.",
        );
      }
      return createDeepSeekProvider({
        apiKey: config.deepseek.apiKey,
        model: config.deepseek.model,
        baseURL: config.deepseek.baseURL,
      });
  }
}
