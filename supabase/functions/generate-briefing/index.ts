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

## Resumo da Campanha
Uma visão geral concisa do que a campanha propõe.

## Ideia Criativa Principal
O conceito central que guiará toda a comunicação.

## Sugestões de Abordagem
3-4 estratégias práticas de como abordar o público.

## Exemplos de Copy
3 exemplos de textos prontos para usar no canal indicado.

## Canais e Formatos Recomendados
Sugestões de canais complementares e formatos de conteúdo ideais.

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
