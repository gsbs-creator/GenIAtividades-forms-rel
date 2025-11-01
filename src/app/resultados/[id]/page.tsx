// src/app/resultados/[id]/page.tsx
import { supabase } from '@/lib/supabaseCliente';
import ClientPage from './client-page';
import { notFound } from 'next/navigation';

export type RespostaComAluno = {
  id: number;
  nome_aluno: string;
  relatorio_gerado: string | null;
  respostas: any; 
};

export type AtividadeComQuestoes = {
  id: number;
  assunto: string;
  questoes: any; 
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

// Esta parte está correta
export default async function ResultadosPage({ params }: { params: { id: string } }) {
  
  // MUDANÇA AQUI: Desestruturamos o 'id' primeiro para calar o aviso
  const { id } = params;
  const { props, error } = await getDadosDaAtividade(id); // E usamos a variável 'id'

  if (error || !props) {
    return notFound();
  }

  return <ClientPage atividade={props.atividade} respostasIniciais={props.respostas} />;
}