import "server-only";
import OpenAI from "openai";
import { z } from "zod";
import {
  AiProviderError,
  logAiRequest,
  type AiProvider,
  type GenerateStructuredArgs,
} from "./types";

interface DeepSeekProviderConfig {
  apiKey: string;
  model: string;
  baseURL: string;
}

/**
 * DeepSeek implementation using the OpenAI-compatible Chat Completions API with JSON mode.
 * Structured Outputs are NOT strictly enforced — we validate with Zod and retry once on failure.
 */
export function createDeepSeekProvider(config: DeepSeekProviderConfig): AiProvider {
  const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL });

  return {
    name: "deepseek",
    model: config.model,
    async generateStructured<T extends z.ZodTypeAny>(
      args: GenerateStructuredArgs<T>,
    ): Promise<z.infer<T>> {
      const jsonSchema = JSON.stringify(z.toJSONSchema(args.schema, { target: "draft-7" }), null, 2);
      const userWithSchema = `${args.user}\n\nResponda APENAS com um objeto JSON válido aderente exatamente a este JSON Schema (nome do schema: ${args.schemaName}):\n\`\`\`json\n${jsonSchema}\n\`\`\``;

      const attempt = async (extraInstruction?: string): Promise<unknown> => {
        const userContent = extraInstruction
          ? `${userWithSchema}\n\nObservação: ${extraInstruction}`
          : userWithSchema;
        try {
          logAiRequest({
            provider: "deepseek",
            model: config.model,
            url: `${client.baseURL}/chat/completions`,
            schemaName: args.schemaName,
          });
          const response = await client.chat.completions.create({
            model: config.model,
            messages: [
              { role: "system", content: args.system },
              { role: "user", content: userContent },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          });

          const content = response.choices[0]?.message?.content?.trim();
          if (!content) {
            throw new AiProviderError(
              "deepseek",
              "INVALID_RESPONSE",
              "DeepSeek retornou resposta vazia.",
            );
          }
          return JSON.parse(content);
        } catch (cause) {
          if (cause instanceof AiProviderError) throw cause;
          if (cause instanceof SyntaxError) {
            throw new AiProviderError(
              "deepseek",
              "INVALID_RESPONSE",
              `DeepSeek retornou JSON malformado: ${cause.message}`,
            );
          }
          throw new AiProviderError(
            "deepseek",
            "API_ERROR",
            `Falha na chamada DeepSeek: ${(cause as Error).message}`,
          );
        }
      };

      try {
        const parsed = await attempt();
        return args.schema.parse(parsed) as z.infer<T>;
      } catch (firstError) {
        const retryHint =
          firstError instanceof Error
            ? `A tentativa anterior falhou: ${firstError.message}. Garanta que o JSON corresponda ao schema.`
            : "A tentativa anterior falhou. Garanta que o JSON corresponda ao schema.";
        const parsedRetry = await attempt(retryHint);
        try {
          return args.schema.parse(parsedRetry) as z.infer<T>;
        } catch (cause) {
          throw new AiProviderError(
            "deepseek",
            "INVALID_RESPONSE",
            `Resposta do DeepSeek não corresponde ao schema após retry: ${(cause as Error).message}`,
          );
        }
      }
    },
  };
}
