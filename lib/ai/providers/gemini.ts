import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  AiProviderError,
  logAiRequest,
  type AiProvider,
  type GenerateStructuredArgs,
} from "./types";

interface GeminiProviderConfig {
  apiKey: string;
  model: string;
}

/**
 * Google Gemini implementation using responseSchema + JSON mode.
 * Gemini accepts JSON Schema directly via the `responseSchema` config field.
 */
export function createGeminiProvider(config: GeminiProviderConfig): AiProvider {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });

  return {
    name: "gemini",
    model: config.model,
    async generateStructured<T extends z.ZodTypeAny>(
      args: GenerateStructuredArgs<T>,
    ): Promise<z.infer<T>> {
      const jsonSchema = z.toJSONSchema(args.schema, { target: "draft-7" });
      const responseSchema = stripUnsupportedKeywords(jsonSchema);

      let rawText: string;
      try {
        logAiRequest({
          provider: "gemini",
          model: config.model,
          url: `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`,
          schemaName: args.schemaName,
        });
        const response = await ai.models.generateContent({
          model: config.model,
          contents: [{ role: "user", parts: [{ text: args.user }] }],
          config: {
            systemInstruction: args.system,
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.2,
          },
        });
        rawText = response.text ?? "";
      } catch (cause) {
        throw new AiProviderError(
          "gemini",
          "API_ERROR",
          `Falha na chamada Gemini: ${(cause as Error).message}`,
        );
      }

      if (!rawText.trim()) {
        throw new AiProviderError(
          "gemini",
          "INVALID_RESPONSE",
          "Gemini retornou resposta vazia.",
        );
      }

      try {
        const parsed = JSON.parse(rawText) as unknown;
        return args.schema.parse(parsed) as z.infer<T>;
      } catch (cause) {
        throw new AiProviderError(
          "gemini",
          "INVALID_RESPONSE",
          `Resposta do Gemini não corresponde ao schema esperado: ${(cause as Error).message}`,
        );
      }
    },
  };
}

const UNSUPPORTED_KEYS = new Set([
  "$schema",
  "$ref",
  "definitions",
  "$defs",
  "propertyNames",
  "additionalProperties",
  "patternProperties",
  "unevaluatedProperties",
  "if",
  "then",
  "else",
  "oneOf",
]);

/**
 * Gemini's responseSchema is OpenAPI 3.0-ish and rejects several JSON Schema keywords.
 * Strip them recursively so the schema stays acceptable.
 */
function stripUnsupportedKeywords(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUnsupportedKeywords);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !UNSUPPORTED_KEYS.has(key))
      .map(([key, val]) => [key, stripUnsupportedKeywords(val)] as const);
    return Object.fromEntries(entries);
  }
  return value;
}
