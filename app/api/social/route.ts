import { NextResponse } from "next/server";
import { z } from "zod";
import { SocialOutputSchema } from "@/lib/ai/schemas";
import { AiProviderError, getProvider } from "@/lib/ai/providers";
import { isProviderName, getServerConfig } from "@/lib/config/server";
import { buildSocialPrompt, SOCIAL_SYSTEM_PROMPT } from "@/lib/ai/prompts/social";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const RequestSchema = z.object({
  text: z.string().min(50, "O texto precisa ter pelo menos 50 caracteres."),
  provider: z.string().optional(),
});

export async function POST(request: Request) {
  const config = getServerConfig();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo inválido. Envie JSON com os campos 'text' e 'provider'." },
      { status: 400 },
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { text } = parsed.data;
  const providerName = (parsed.data.provider ?? config.defaultProvider).toLowerCase();

  if (!isProviderName(providerName)) {
    return NextResponse.json(
      { error: `Provider inválido: "${providerName}". Use openai, gemini ou deepseek.` },
      { status: 400 },
    );
  }

  let provider;
  try {
    provider = getProvider(providerName);
  } catch (cause) {
    if (cause instanceof AiProviderError && cause.code === "MISSING_KEY") {
      return NextResponse.json({ error: cause.message }, { status: 400 });
    }
    throw cause;
  }

  let result;
  try {
    result = await provider.generateStructured({
      schema: SocialOutputSchema,
      schemaName: "SocialOutput",
      system: SOCIAL_SYSTEM_PROMPT,
      user: buildSocialPrompt({ blogText: text }),
    });
  } catch (cause) {
    if (cause instanceof AiProviderError) {
      return NextResponse.json(
        { error: `Erro do provedor ${cause.provider}: ${cause.message}` },
        { status: 502 },
      );
    }
    if (cause instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Resposta da IA não corresponde ao schema esperado: ${cause.message}` },
        { status: 502 },
      );
    }
    throw cause;
  }

  return NextResponse.json({
    ...result,
    providerUsed: provider.name,
    modelUsed: provider.model,
  });
}
