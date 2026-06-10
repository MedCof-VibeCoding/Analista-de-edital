import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";
import {
  AiProviderError,
  logAiRequest,
  type AiProvider,
  type GenerateStructuredArgs,
} from "./types";

interface OpenAiProviderConfig {
  apiKey: string;
  model: string;
}

/**
 * OpenAI implementation using the Responses API with native Structured Outputs.
 */
export function createOpenAiProvider(config: OpenAiProviderConfig): AiProvider {
  const client = new OpenAI({ apiKey: config.apiKey });

  return {
    name: "openai",
    model: config.model,
    async generateStructured<T extends z.ZodTypeAny>(
      args: GenerateStructuredArgs<T>,
    ): Promise<z.infer<T>> {
      try {
        logAiRequest({
          provider: "openai",
          model: config.model,
          url: `${client.baseURL}/responses`,
          schemaName: args.schemaName,
        });
        const response = await client.responses.parse({
          model: config.model,
          input: [
            { role: "system", content: args.system },
            { role: "user", content: args.user },
          ],
          text: {
            format: zodTextFormat(args.schema, args.schemaName),
          },
        });

        if (!response.output_parsed) {
          throw new AiProviderError(
            "openai",
            "INVALID_RESPONSE",
            "OpenAI retornou resposta vazia ou inválida para o schema.",
          );
        }
        return response.output_parsed as z.infer<T>;
      } catch (cause) {
        if (cause instanceof AiProviderError) throw cause;
        throw new AiProviderError(
          "openai",
          "API_ERROR",
          `Falha na chamada OpenAI: ${(cause as Error).message}`,
        );
      }
    },
  };
}
