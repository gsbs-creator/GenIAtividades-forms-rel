// src/app/api/gerar-relatorio/route.js (PROMPT MELHORADO)
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabaseCliente'; 

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const questoes = body.questoes;
    const respostasDoAluno = body.respostasAluno || body.respostasDoAluno; 
    const resposta_id = body.resposta_id;
    const atividade_id = body.atividade_id;
    // NOVO: Recebe o nome do aluno para personalizar o relatório
    const nomeAluno = body.nome_aluno || "Aluno(a)"; 

    if (!questoes || !respostasDoAluno) {
      return NextResponse.json({ error: 'Dados das questões e respostas são obrigatórios.' }, { status: 400 });
    }

    // --- PROMPT DE ALTO NÍVEL ---
    const prompt = `
      Você é um assistente pedagógico especialista, com um tom de voz empático, profissional e encorajador.
      Sua tarefa é criar um relatório de desempenho para um aluno chamado "${nomeAluno}".

      DADOS DO TESTE:
      - Questões e Respostas Corretas: ${JSON.stringify(questoes, null, 2)}
      - Respostas que o Aluno marcou: ${JSON.stringify(respostasDoAluno, null, 2)}
      
      INSTRUÇÕES ESTRITAS DE FORMATAÇÃO E CONTEÚDO (use Markdown):

      1.  **Título:** Comece com "## 🌟 Relatório de Desempenho de ${nomeAluno}".
      
      2.  **Desempenho Geral (Obrigatório):**
          - PRIMEIRO, calcule o número total de questões.
          - SEGUNDO, calcule o número de acertos (comparando as respostas do aluno com as respostas corretas).
          - TERCEIRO, calcule a porcentagem de acerto (acertos / total * 100).
          - QUARTO, exiba a seguinte frase: "Você acertou **X de Y questões** (o que equivale a **Z%** de acerto)." Substitua X, Y e Z pelos valores calculados.
          - QUINTO, escreva um breve parágrafo de feedback positivo sobre o desempenho geral.

      3.  **Análise Detalhada (Questão por Questão):**
          - Crie uma seção "## 💡 Análise Detalhada".
          - Para CADA questão (não apenas as erradas), liste:
            - "**Questão X:** [Texto da Pergunta]"
            - "**Sua Resposta:** [Letra da resposta do aluno] - [Texto da resposta do aluno]"
            - "**Status:** [Correto 👍] ou [Incorreto ❌]"
          - **APENAS SE ESTIVER INCORRETO**, adicione:
            - "**Resposta Correta:** [Letra da resposta correta] - [Texto da resposta correta]"
            - "**Explicação:** [Uma breve e clara explicação do conceito por trás da resposta correta]."
      
      4.  **Sugestões de Estudo:**
          - Crie uma seção "## 🚀 Próximos Passos e Sugestões".
          - Com base nas questões erradas, forneça uma lista (bullet points) de 2 a 3 tópicos específicos que o aluno deve revisar.
          - Termine com uma frase de encorajamento.
    `;
  
    // 5. Chamar a API da OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o é excelente para este tipo de tarefa
      messages: [ 
        { role: "system", content: "Você é um assistente pedagógico que gera relatórios detalhados e empáticos em Markdown." },
        { role: "user", content: prompt } 
      ]
    });

    const text = completion.choices[0].message.content;
    
    // 6. LÓGICA DE SALVAR (continua a mesma)
    if (text) {
        if (resposta_id) {
            console.log(`[API] Atualizando relatório para resposta_id: ${resposta_id}`);
            const { error: updateError } = await supabase
                .from('respostas_alunos')
                .update({ relatorio_gerado: text })
                .eq('id', resposta_id);
            if (updateError) console.error("ERRO AO ATUALIZAR NO SUPABASE:", updateError);

        } else if (atividade_id && nomeAluno) {
            console.log(`[API] Inserindo novo relatório para atividade_id: ${atividade_id}`);
            const { error: insertError } = await supabase
                .from('respostas_alunos')
                .insert([{
                    atividade_id: atividade_id,
                    nome_aluno: nomeAluno,
                    respostas: respostasDoAluno,
                    relatorio_gerado: text
                }]);
            if (insertError) console.error("ERRO AO INSERIR NO SUPABASE:", insertError);
        
        } else {
             console.log("[API] Apenas gerando relatório, sem salvar no DB.");
        }
    }

    // 7. Retorna o relatório para o frontend
    return NextResponse.json({ relatorio: text });

  } catch (error) {
    console.error("ERRO DETALHADO NO GERAR-RELATORIO (UNIFICADO):", error);
    return NextResponse.json({ error: "Falha ao gerar o relatório." }, { status: 500 });
  }
}