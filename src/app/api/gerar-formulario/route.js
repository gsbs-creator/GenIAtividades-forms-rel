import { NextResponse } from 'next/server';

// Usando o nome do modelo que sabemos que está disponível
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

export async function POST(req) {
  try {
    const { assunto, numeroDeQuestoes } = await req.json();

    // --- PROMPT REFORÇADO E À PROVA DE FALHAS ---
    // Esta é a única parte que mudamos.
    const prompt = `
      Sua tarefa é criar um teste de múltipla escolha.
      Tópico: "${assunto}".
      Número de questões: ${numeroDeQuestoes}.
      
      REGRAS ESTRITAS DE FORMATAÇÃO DA RESPOSTA:
      1. Sua resposta DEVE ser um array de objetos JSON e NADA MAIS. Não inclua texto introdutório como "aqui está o seu formulário". A resposta deve começar com '[' e terminar com ']'.
      2. Cada objeto no array representa uma questão e DEVE conter TRÊS chaves: "question", "opcoes", e "correct_answer".
      3. A chave "question" DEVE ter como valor uma string com o texto da pergunta.
      4. A chave "opcoes" DEVE ter como valor um objeto JSON com QUATRO chaves: "A", "B", "C", e "D". Cada uma dessas chaves deve ter uma string como valor.
      5. A chave "correct_answer" DEVE ter como valor a letra da opção correta (ex: "C").

      Exemplo do formato OBRIGATÓRIO para um único objeto de questão:
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
      
      Gere o array JSON completo agora.
    `;
    
    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const responseData = await apiResponse.json();
    if (!apiResponse.ok || responseData.error) {
      console.error("ERRO DA API GOOGLE:", responseData.error);
      throw new Error(`Erro da API do Google: ${responseData.error?.message || 'Erro desconhecido'}`);
    }

    const text = responseData.candidates[0].content.parts[0].text;
    const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonResponse = JSON.parse(jsonText);
    
    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("ERRO DETALHADO NO GERAR-FORMULARIO:", error);
    return NextResponse.json({ error: "Falha ao gerar o formulário." }, { status: 500 });
  }
}