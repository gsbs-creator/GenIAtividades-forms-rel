// src/app/api/gerar-formulario/route.js (VERSÃO OPENAI)
import { NextResponse } from 'next/server';
// NOVO: Importar o cliente OpenAI
import OpenAI from 'openai';

// NOVO: Inicializar o cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { assunto, numeroDeQuestoes } = await req.json();

    // --- PROMPT ADAPTADO PARA O JSON MODE DA OPENAI ---
    // Mudamos as regras para pedir um OBJETO JSON com uma chave 'formulario',
    // pois o JSON Mode da OpenAI garante um objeto '{...}'
    const prompt = `
      Sua tarefa é criar um teste de múltipla escolha.
      Tópico: "${assunto}".
      Número de questões: ${numeroDeQuestoes}.
      
      REGRAS ESTRITAS DE FORMATAÇÃO DA RESPOSTA:
      1. Sua resposta DEVE ser um ÚNICO OBJETO JSON e NADA MAIS. A resposta deve começar com '{' e terminar com '}'.
      2. Este objeto JSON deve conter uma ÚNICA chave: "formulario".
      3. O valor da chave "formulario" DEVE ser um array de objetos de questão.
      4. Cada objeto no array representa uma questão e DEVE conter TRÊS chaves: "question", "opcoes", e "correct_answer".
      5. A chave "question" DEVE ter como valor uma string com o texto da pergunta.
      6. A chave "opcoes" DEVE ter como valor um objeto JSON com QUATRO chaves: "A", "B", "C", e "D".
      7. A chave "correct_answer" DEVE ter como valor a letra da opção correta (ex: "C").

      Exemplo do formato OBRIGATÓRIO:
      {
        "formulario": [
          {
            "question": "Qual é a capital do Brasil?",
            "opcoes": {
              "A": "Rio de Janeiro",
              "B": "São Paulo",
              "C": "Brasília",
              "D": "Salvador"
            },
            "correct_answer": "C"
          }
        ]
      }
      
      Gere o objeto JSON completo agora.
    `;
    
    // MUDANÇA: Chamada da API usando o SDK da OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Ou "gpt-4-turbo" ou "gpt-3.5-turbo"
      response_format: { type: "json_object" }, // NOVO: Ativa o JSON Mode
      messages: [
        // Opcional, mas recomendado:
        { role: "system", content: "Você é um assistente que gera formulários educacionais em formato JSON." },
        // O prompt principal:
        { role: "user", content: prompt }
      ]
    });

    // MUDANÇA: Como acessamos a resposta
    const responseJsonString = completion.choices[0].message.content;
    
    // Não precisamos mais do .replace() para "```json", pois o JSON Mode retorna um JSON puro.
    const parsedResponse = JSON.parse(responseJsonString);
    
    // Retornamos apenas o array, para manter o comportamento original da sua API
    return NextResponse.json(parsedResponse.formulario);

  } catch (error) {
    // MUDANÇA: Atualizado o log de erro
    console.error("ERRO DETALHADO NO GERAR-FORMULARIO (OPENAI):", error);
    return NextResponse.json({ error: "Falha ao gerar o formulário." }, { status: 500 });
  }
}