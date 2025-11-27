import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get database statistics for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch relevant data for context
    const [barbersData, servicesData, productsData, appointmentsData] = await Promise.all([
      supabase.from("barbers").select("id, name, phone, commission_percentage"),
      supabase.from("services").select("id, name, price, duration_minutes"),
      supabase.from("products").select("id, name, price, stock_quantity, category"),
      supabase.from("appointments")
        .select("id, status, appointment_date, appointment_time")
        .gte("appointment_date", new Date().toISOString().split('T')[0])
        .limit(50),
    ]);

    console.log("Database stats fetched");

    // Build context from database
    const context = `
Sistema de Gestão de Barbearia - Dados Atuais:

BARBEIROS (${barbersData.data?.length || 0} total):
${barbersData.data?.slice(0, 5).map(b => `- ${b.name} (Tel: ${b.phone}, Comissão: ${b.commission_percentage}%)`).join('\n')}

SERVIÇOS (${servicesData.data?.length || 0} total):
${servicesData.data?.map(s => `- ${s.name}: R$ ${s.price.toFixed(2)} (${s.duration_minutes}min)`).join('\n')}

PRODUTOS (${productsData.data?.length || 0} total):
${productsData.data?.slice(0, 10).map(p => `- ${p.name}: R$ ${p.price.toFixed(2)} (Estoque: ${p.stock_quantity}, Categoria: ${p.category || 'N/A'})`).join('\n')}

AGENDAMENTOS FUTUROS: ${appointmentsData.data?.length || 0} agendamentos

Use estas informações para responder perguntas sobre a barbearia.
`;

    const systemPrompt = `Você é um assistente virtual inteligente para um sistema de gestão de barbearia. Você tem acesso aos dados em tempo real da plataforma e pode ajudar com informações sobre:

- Barbeiros cadastrados e suas comissões
- Serviços disponíveis e preços
- Produtos em estoque e valores
- Agendamentos futuros e disponibilidade
- Relatórios e estatísticas do negócio

Responda de forma clara, objetiva e profissional. Use os dados fornecidos para dar respostas precisas. Se não souber algo específico que não está nos dados, seja honesto e sugira onde o usuário pode encontrar essa informação na plataforma.

${context}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos ao workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao se comunicar com o serviço de IA" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
