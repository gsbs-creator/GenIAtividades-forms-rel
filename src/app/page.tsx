'use client';
import { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown'; // <-- Importamos a nova biblioteca

// Interface 100% alinhada com o novo prompt
interface Questao {
  question: string;
  opcoes?: { [key: string]: string };
  correct_answer: string;
}
interface Respostas {
    [key: number]: string;
}

export default function HomePage() {
  const [assunto, setAssunto] = useState('');
  const [numeroDeQuestoes, setNumeroDeQuestoes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostasAluno, setRespostasAluno] = useState<Respostas>({});
  const [relatorio, setRelatorio] = useState('');

  const handleGerarFormulario = async () => {
    setLoading(true);
    setQuestoes([]);
    setRelatorio('');
    try {
      const response = await fetch('/api/gerar-formulario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assunto, numeroDeQuestoes }),
      });
      if (!response.ok) throw new Error('Falha ao buscar questões da API');
      const data = await response.json();
      setQuestoes(data);
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao gerar o formulário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarRelatorio = async () => {
    const questoesParaRelatorio = questoes.map(q => ({
        pergunta: q.question,
        opcoes: q.opcoes,
        resposta_correta: q.correct_answer
    }));

    setLoading(true);
    setRelatorio('');
    try {
        const response = await fetch('/api/gerar-relatorio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questoes: questoesParaRelatorio, respostasDoAluno: respostasAluno }),
        });
        if (!response.ok) throw new Error('Falha ao buscar relatório da API');
        const data = await response.json();
        setRelatorio(data.relatorio);
    } catch (error) {
        console.error(error);
        alert('Ocorreu um erro ao gerar o relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespostaChange = (indiceQuestao: number, opcao: string) => {
    setRespostasAluno({ ...respostasAluno, [indiceQuestao]: opcao });
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

      {/* Card para o Professor */}
      <div className="card">
        <h2>Para o Professor</h2>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder="Digite o assunto (ex: Fotossíntese)"
          className="form-input"
        />
        <div className="professor-controls">
            <input
              type="number"
              value={numeroDeQuestoes}
              onChange={(e) => setNumeroDeQuestoes(Number(e.target.value))}
              className="form-input"
              style={{ width: '100px', marginRight: '1rem' }}
            />
            <button onClick={handleGerarFormulario} disabled={loading || !assunto} className="btn btn-primary">
              {loading ? 'Gerando...' : 'Gerar Formulário'}
            </button>
        </div>
      </div>

      {/* Card para o Aluno com ANIMAÇÃO */}
      {questoes.length > 0 && (
        <div className="card fade-in-start fade-in-end">
          <h2>Formulário para o Aluno</h2>
          {questoes.map((q, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <p><strong>{index + 1}. {q.question}</strong></p>
              
              {q.opcoes && Object.entries(q.opcoes).map(([letra, texto]) => (
                <label key={letra} className="radio-option">
                  <input
                    type="radio"
                    id={`q${index}_${letra}`}
                    name={`questao_${index}`}
                    value={letra}
                    onChange={() => handleRespostaChange(index, letra)}
                  />
                  {letra}) {texto}
                </label>
              ))}
            </div>
          ))}
          <button onClick={handleGerarRelatorio} disabled={loading} className="btn btn-success">
            {loading ? 'Analisando...' : 'Finalizar e Gerar Relatório'}
          </button>
        </div>
      )}

      {/* Card para o Relatório com ANIMAÇÃO */}
      {relatorio && (
        <div className="card fade-in-start fade-in-end">
            <ReactMarkdown>
              {relatorio}
            </ReactMarkdown>
        </div>
      )}
    </main>
  );
}