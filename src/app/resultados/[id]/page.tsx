// src/app/resultados/[id]/page.tsx (CORRIGIDO)
import { supabase } from '@/lib/supabaseCliente';
import ClientPage from './client-page';
import { notFound } from 'next/navigation';

// --- DEFINIÇÕES DE TIPO ADICIONADAS ---
// Define como é um objeto de resposta, ex: { "0": "A", "1": "C" }
interface RespostasAluno {
  [key: string]: string;
}

// Define como é uma única questão
interface Questao {
  question: string;
  opcoes: { [key: string]: string };
  correct_answer: string;
}
// --- FIM DAS ADIÇÕES ---

export type RespostaComAluno = {
  id: number;
  nome_aluno: string;
  relatorio_gerado: string | null;
  respostas: RespostasAluno; // <-- CORRIGIDO (era 'any')
};

export type AtividadeComQuestoes = {
  id: number;
  assunto: string;
  questoes: Questao[]; // <-- CORRIGIDO (era 'any')
};

async function getDadosDaAtividade(id: string) {
  
  console.log(`[Servidor] Buscando dados para Atividade ID: ${id}`);
  const { data: atividade, error: errorAtividade } = await supabase
    .from('atividades')
    .select('id, assunto, questoes')
    .eq('id', id)
    .single();

  if (errorAtividade) {
    console.error("[Servidor] ERRO AO BUSCAR ATIVIDADE:", errorAtividade);
    return { props: null, error: 'Atividade não encontrada.' };
  }
  
  const { data: respostas, error: errorRespostas } = await supabase
    .from('respostas_alunos')
    .select('id, nome_aluno, relatorio_gerado, respostas')
    .eq('atividade_id', id);

  if (errorRespostas) {
    console.error("[Servidor] ERRO AO BUSCAR RESPOSTAS:", errorRespostas);
    return { props: null, error: 'Erro ao buscar respostas.' };
  }
  
  console.log("[Servidor] Dados buscados com sucesso.");

  return {
    props: {
      atividade: atividade as AtividadeComQuestoes, 
      respostas: respostas as RespostaComAluno[],
    },
    error: null
  };
}

export default async function ResultadosPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { props, error } = await getDadosDaAtividade(id); 

  if (error || !props) {
    return notFound();
  }

  return <ClientPage atividade={props.atividade} respostasIniciais={props.respostas} />;
}