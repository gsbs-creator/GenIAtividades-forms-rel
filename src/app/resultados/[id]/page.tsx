import { supabase } from '@/lib/supabaseCliente';
import ClientPage from './client-page'; // <-- LINHA CORRIGIDA
import { notFound } from 'next/navigation';

export type RespostaComAluno = {
  id: number;
  nome_aluno: string;
  relatorio_gerado: string;
};

async function getDadosDaAtividade(id: string) {
  const { data: atividade, error: errorAtividade } = await supabase
    .from('atividades')
    .select('id, assunto')
    .eq('id', id)
    .single();

  if (errorAtividade) return { props: null, error: 'Atividade não encontrada.' };
  
  const { data: respostas, error: errorRespostas } = await supabase
    .from('respostas_alunos')
    .select('id, nome_aluno, relatorio_gerado')
    .eq('atividade_id', id);

  if (errorRespostas) return { props: null, error: 'Erro ao buscar respostas.' };
  
  return {
    props: {
      atividade,
      respostas,
    },
    error: null
  };
}

export default async function ResultadosPage({ params }: { params: { id: string } }) {
  const { props, error } = await getDadosDaAtividade(params.id);

  if (error || !props) {
    return notFound();
  }

  return <ClientPage atividade={props.atividade} respostasIniciais={props.respostas} />;
}