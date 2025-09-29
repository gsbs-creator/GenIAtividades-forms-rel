import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuração correta, forçando a API v1
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1' });

export async function POST(req) {
  try {
    const { questoes, respostasDoAluno } = await req.json();

    if (!questoes || !respostasDoAluno) {
      return NextResponse.json({ error: 'Dados das questões e respostas são obrigatórios.' }, { status: 400 });
    }
  
    // CORREÇÃO: Usando o modelo que sabemos que é compatível com sua chave
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
    const prompt = `
      Você é um assistente pedagógico e sua tarefa é criar um relatório de desempenho de um aluno.
      
      DADOS DO TESTE:
      - Perguntas, Opções e Respostas Corretas: ${JSON.stringify(questoes, null, 2)}
      - Respostas que o Aluno marcou: ${JSON.stringify(respostasDoAluno, null, 2)}
      
      INSTRUÇÕES PARA O RELATÓRIO:
      1.  **Use formatação Markdown** para organizar o relatório.
      2.  Crie um título principal chamado "Relatório de Desempenho do Aluno".
      3.  Crie uma seção chamada "Desempenho Geral". Nela, calcule e mostre a porcentagem de acertos (ex: Acertou 3 de 5 questões (60%)).
      4.  Crie uma seção chamada "Análise das Questões Erradas". Para cada questão que o aluno errou, liste a pergunta e explique brevemente o conceito correto.
      5.  Crie uma seção final chamada "Sugestões de Estudo" com uma lista de tópicos para o aluno revisar.
      
      Use títulos com '##', negrito com '**', e listas com '*'.
    `;
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ relatorio: text });

  } catch (error) {
    console.error("ERRO DETALHADO NO GERAR-RELATORIO:", error);
    return NextResponse.json({ error: "Falha ao gerar o relatório." }, { status: 500 });
  }
}