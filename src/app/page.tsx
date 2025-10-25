'use client';
import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseCliente'; // <-- LINHA CORRETA

// A interface não muda
interface Questao {
  question: string;
  opcoes?: { [key: string]: string };
  correct_answer: string;
}

export default function ProfessorPage() {
  const [assunto, setAssunto] = useState('');
  const [numeroDeQuestoes, setNumeroDeQuestoes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [linkParaAluno, setLinkParaAluno] = useState('');

  const handleGerarFormulario = async () => {
    setLoading(true);
    setLinkParaAluno('');
    try {
      // 1. Gera as questões usando nossa API interna (isso não muda)
      const response = await fetch('/api/gerar-formulario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assunto, numeroDeQuestoes }),
      });
      if (!response.ok) throw new Error('Falha ao buscar questões da API');
      
      const questoes: Questao[] = await response.json();

      // --- A MÁGICA DO BANCO DE DADOS ACONTECE AQUI ---
      // 2. Salva a atividade gerada no Supabase
      const { data, error } = await supabase
        .from('atividades') // Escolhe a tabela 'atividades'
        .insert([
          { assunto: assunto, questoes: questoes } // Insere os dados
        ])
        .select() // Pede para o Supabase retornar o que foi inserido

      if (error) {
        throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
      }

      // 3. Pega o ID da atividade recém-criada
      const novaAtividadeId = data[0].id;
      
      // 4. Cria o link simples e limpo para o aluno
      const url = `${window.location.origin}/aluno/${novaAtividadeId}`;
      
      setLinkParaAluno(url);

    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao gerar e salvar a atividade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkParaAluno);
    alert('Link copiado para a área de transferência!');
  };

 return (
    <main className="container">
      <header className="header">
        {/* ... seu header com a logo ... */}
      </header>

      <div className="card">
        {/* ... seu formulário para criar a atividade ... */}
      </div>

      {linkParaAluno && (
        <div className="card">
          <h2>Atividade Gerada com Sucesso!</h2>
          
          <p>Copie e envie o link abaixo para seus alunos responderem:</p>
          <input type="text" readOnly value={linkParaAluno} className="form-input"/>
          <button onClick={copiarLink} className="btn btn-success" style={{marginBottom: '2rem'}}>
            Copiar Link para Aluno
          </button>

          <hr style={{border: 'none', borderBottom: '1px solid #eee', margin: '1rem 0'}} />

          <p>Use o link abaixo para acompanhar os resultados desta atividade:</p>
          <a href={`/resultados/${linkParaAluno.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
             <button className="btn btn-primary">Ver Página de Resultados</button>
          </a>

          {/* ======================================= */}
          {/* NOVO BOTÃO PARA ATRIBUIR À TURMA     */}
          {/* ======================================= */}
          <hr style={{border: 'none', borderBottom: '1px solid #eee', margin: '1rem 0'}} />
          <p><strong>Passo final:</strong> Atribua esta atividade a uma de suas turmas cadastradas.</p>
          <a href={
              `http://geniatividades.infinityfree.me/professor/painel_professor.php?menu=atribuir` +
              `&atividadeId=${linkParaAluno.split('/').pop()}` +
              `&assunto=${encodeURIComponent(assunto)}` +
              `&linkAluno=${encodeURIComponent(linkParaAluno)}` +
              `&linkResultados=${encodeURIComponent(window.location.origin + '/resultados/' + linkParaAluno.split('/').pop())}`
            }
          >
             <button className="btn btn-primary" style={{backgroundColor: '#28a745'}}>Atribuir a uma Turma</button>
          </a>
        </div>
      )}
    </main>
  );}