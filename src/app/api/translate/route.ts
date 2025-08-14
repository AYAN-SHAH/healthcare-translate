import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { rateLimit } from "@/lib/rateLimit";

const bodySchema = z.object({
  text: z.string().min(1),
  targetLang: z.string().min(2).max(5), // e.g., 'en', 'es', 'ur'
  sourceLang: z.string().optional(),
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const limited = rateLimit(ip, 20, 60_000); // 20 req / minute / IP
  if (limited) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const json = await req.json();
  const parse = bodySchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { text, targetLang, sourceLang } = parse.data;

  const system = `You are a medical translation assistant. Translate clearly, preserve meaning, and keep/expand medical terminology accurately. Output ONLY the translation in ${targetLang}. If the input has patient-identifiable info, do not add extra details.`;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Source language: ${sourceLang ?? "auto"}\nText: ${text}` },
      ],
    });

    const translated = completion.choices[0]?.message?.content?.trim() || "";
    return NextResponse.json({ translated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("/api/translate error", errorMessage);
    return NextResponse.json({ error: "Translate failed" }, { status: 500 });
  }
}