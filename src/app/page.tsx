'use client';
import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseCliente'; 

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
      const response = await fetch('/api/gerar-formulario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assunto, numeroDeQuestoes }),
      });
      if (!response.ok) throw new Error('Falha ao buscar questões da API');
      
      const questoes: Questao[] = await response.json();

      const { data, error } = await supabase
        .from('atividades')
        .insert([{ assunto: assunto, questoes: questoes }])
        .select()

      if (error) {
        throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
      }

      const novaAtividadeId = data[0].id;
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
        <Image 
          src="/logo.png" 
          alt="Logo GenIAtividades" 
          width={200} 
          height={100} 
          priority
        />
      </header>

      {/* ======================================= */}
      {/* SEÇÃO DO FORMULÁRIO (RESTAURADA)    */}
      {/* ======================================= */}
      <div className="card">
        <h2>Área do Professor</h2>
        <p>Crie uma nova atividade para seus alunos.</p>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder="Digite o assunto (ex: Fotossíntese)"
          className="form-input"
        />
        <input
          type="number"
          value={numeroDeQuestoes}
          onChange={(e) => setNumeroDeQuestoes(Number(e.target.value))}
          className="form-input"
          style={{ width: '100px', display: 'inline-block', marginRight: '1rem' }}
        />
        <button onClick={handleGerarFormulario} disabled={loading || !assunto} className="btn btn-primary">
          {loading ? 'Gerando...' : 'Gerar Formulário'}
        </button>
      </div>

      {/* ======================================= */}
      {/* SEÇÃO DE RESULTADOS COM TODOS OS BOTÕES */}
      {/* ======================================= */}
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
  );
}