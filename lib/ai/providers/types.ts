import type { z } from "zod";
import type { ProviderName } from "@/lib/config/server";

export type { ProviderName };

export interface GenerateStructuredArgs<T extends z.ZodTypeAny> {
  schema: T;
  schemaName: string;
  system: string;
  user: string;
}

/**
 * Common interface implemented by every AI provider. The pipeline depends only on this.
 */
export interface AiProvider {
  readonly name: ProviderName;
  readonly model: string;
  generateStructured<T extends z.ZodTypeAny>(
    args: GenerateStructuredArgs<T>,
  ): Promise<z.infer<T>>;
}

/**
 * Logs the outgoing AI request with its endpoint, model and provider for observability.
 */
export function logAiRequest(args: {
  provider: ProviderName;
  model: string;
  url: string;
  schemaName: string;
}): void {
  console.info(
    `[AI request] provider=${args.provider} model=${args.model} schema=${args.schemaName} url=${args.url}`,
  );
}

export class AiProviderError extends Error {
  readonly provider: ProviderName;
  readonly code: "MISSING_KEY" | "INVALID_RESPONSE" | "API_ERROR";

  constructor(
    provider: ProviderName,
    code: AiProviderError["code"],
    message: string,
  ) {
    super(message);
    this.provider = provider;
    this.code = code;
    this.name = "AiProviderError";
  }
}
