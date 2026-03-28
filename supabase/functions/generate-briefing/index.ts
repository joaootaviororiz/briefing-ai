import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, targetAudience, campaignObjective, toneOfVoice, mainChannel } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Você é um especialista em marketing digital e criação de campanhas publicitárias. Gere um briefing de campanha completo e estruturado em português brasileiro com base nas informações abaixo:

- Produto/Serviço: ${productName}
- Público-alvo: ${targetAudience}
- Objetivo da campanha: ${campaignObjective}
- Tom de voz: ${toneOfVoice}
- Canal principal: ${mainChannel}

Estruture o briefing com as seguintes seções (use cabeçalhos markdown ##):

## Título da Campanha
Crie um título criativo e memorável para a campanha.

## Público Resumido
Descreva o público-alvo de forma concisa em 2-3 frases, incluindo perfil demográfico, comportamental e dores principais.

## Ideias Criativas
Apresente exatamente 3 ideias criativas diferentes, numeradas (1, 2, 3). Cada ideia deve ter um nome curto e uma descrição de 2-3 frases explicando o conceito.

## Exemplos de Copy
Escreva exatamente 2 exemplos de textos prontos para usar no canal ${mainChannel}. Cada copy deve ser realista e pronto para publicação.

## Sugestão de Canais
Liste os canais recomendados (incluindo ${mainChannel} como principal) com uma breve justificativa para cada um. Sugira também formatos de conteúdo ideais para cada canal.

## Call to Action
Sugira 3 opções de call to action (CTA) claros e persuasivos que podem ser usados na campanha. Explique brevemente quando usar cada um.

Seja criativo, prático e direto. Use linguagem profissional mas acessível.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Você é um estrategista de marketing digital brasileiro experiente. Responda sempre em português brasileiro." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione créditos na sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar briefing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const briefing = data.choices?.[0]?.message?.content || "Não foi possível gerar o briefing.";

    return new Response(JSON.stringify({ briefing }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
