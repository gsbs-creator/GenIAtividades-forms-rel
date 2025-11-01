// src/app/aluno/[id]/page.tsx
import { supabase } from '@/lib/supabaseCliente';
import ClientPage from './client-page';
import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from 'next';

// Viewport e Metadata (estão corretos)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};
export const metadata: Metadata = {
  title: "Responder Atividade - GenIAtividades",
  description: "Página para responder a uma atividade gerada pela plataforma.",
};

// FUNÇÃO PARA BUSCAR A ATIVIDADE (NO SERVIDOR)
async function getAtividadeParaAluno(id: string) {
  try {
    const { data: atividade, error } = await supabase
      .from('atividades')
      .select('id, assunto, questoes') // Pega o assunto e as questões
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return atividade;

  } catch (error) {
    console.error("Erro ao buscar atividade para o aluno:", error);
    return null;
  }
}

// A PÁGINA PRECISA RECEBER 'params'
export default async function Page({ params }: { params: { id: string } }) {
  
  // Busca a atividade específica usando o ID da URL
  const atividade = await getAtividadeParaAluno(params.id);

  if (!atividade) {
    return notFound(); // Mostra 404 se a atividade não existir
  }

  // Renderiza o ClientPage E passa os dados da atividade para ele
  return <ClientPage atividade={atividade} />;
}