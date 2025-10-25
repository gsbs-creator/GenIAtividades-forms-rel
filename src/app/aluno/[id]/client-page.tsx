'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabaseCliente'; // Importamos nosso conector

// Interfaces continuam as mesmas
interface Questao {
  question: string;
  opcoes?: { [key: string]: string };
  correct_answer: string;
}
interface Respostas {
    [key: number]: string;
}

export default function ClientPage() {
  const params = useParams();
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostasAluno, setRespostasAluno] = useState<Respostas>({});
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState('');
  
  // Novos estados para o fluxo do aluno
  const [nomeAluno, setNomeAluno] = useState('');
  const [atividadeIniciada, setAtividadeIniciada] = useState(false);
  const [erro, setErro] = useState('');

  // Efeito para buscar as questões no banco de dados
  useEffect(() => {
    const buscarAtividade = async () => {
      if (!params.id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('atividades')
        .select('questoes') // Queremos apenas a coluna 'questoes'
        .eq('id', params.id) // Onde o ID bate com o da URL
        .single(); // Esperamos apenas um resultado

      if (error || !data) {
        console.error("Erro ao buscar atividade:", error);
        setErro("Atividade não encontrada ou o link é inválido.");
      } else {
        setQuestoes(data.questoes as Questao[]);
      }
      setLoading(false);
    };

    buscarAtividade();
  }, [params.id]);

  const handleGerarRelatorio = async () => {
    if (Object.keys(respostasAluno).length !== questoes.length) {
        alert('Por favor, responda todas as questões antes de finalizar.');
        return;
    }

    setLoading(true);
    setRelatorio('');
    try {
        // 1. Gera o relatório com a IA (isso não muda)
        const responseApi = await fetch('/api/gerar-relatorio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questoes, respostasAluno }),
        });
        if (!responseApi.ok) throw new Error('Falha ao buscar relatório da API');
        const dataApi = await responseApi.json();
        const relatorioGerado = dataApi.relatorio;

        // 2. Salva o resultado no banco de dados!
        const { error: errorSupabase } = await supabase
            .from('respostas_alunos')
            .insert([{
                atividade_id: params.id,
                nome_aluno: nomeAluno,
                respostas: respostasAluno,
                relatorio_gerado: relatorioGerado,
            }]);

        if (errorSupabase) {
            throw new Error(`Erro ao salvar a resposta: ${errorSupabase.message}`);
        }

        setRelatorio(relatorioGerado); // Mostra o relatório na tela

    } catch (error) {
        console.error(error);
        alert('Ocorreu um erro ao finalizar a atividade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespostaChange = (indiceQuestao: number, opcao: string) => {
    setRespostasAluno({ ...respostasAluno, [indiceQuestao]: opcao });
  };
  
  // Telas diferentes para cada etapa
  if (loading && !atividadeIniciada) return <main className="container"><p>Carregando atividade...</p></main>;
  if (erro) return <main className="container"><p style={{color: 'red'}}>{erro}</p></main>;

  // Tela para pedir o nome do aluno
  if (!atividadeIniciada) {
    return (
        <main className="container">
            <div className="card">
                <h2>Iniciar Atividade</h2>
                <p>Digite seu nome para começar.</p>
                <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={nomeAluno}
                    onChange={(e) => setNomeAluno(e.target.value)}
                    className="form-input"
                />
                <button
                    onClick={() => setAtividadeIniciada(true)}
                    disabled={!nomeAluno.trim()}
                    className="btn btn-primary"
                >
                    Começar
                </button>
            </div>
        </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <Image src="/logo.png" alt="Logo GenIAtividades" width={200} height={100} priority />
      </header>

      {!relatorio && (
        <div className="card">
          <h2>Responda a Atividade, {nomeAluno}!</h2>
          {questoes.map((q, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <p><strong>{index + 1}. {q.question}</strong></p>
              {q.opcoes && Object.entries(q.opcoes).map(([letra, texto]) => (
                <label key={letra} className="radio-option">
                  <input type="radio" name={`questao_${index}`} value={letra} onChange={() => handleRespostaChange(index, letra)} />
                  {letra}) {texto}
                </label>
              ))}
            </div>
          ))}
          <button onClick={handleGerarRelatorio} disabled={loading} className="btn btn-success">
            {loading ? 'Analisando...' : 'Finalizar e Enviar'}
          </button>
        </div>
      )}

      {relatorio && (
        <div className="card">
            <h2>Resultado da Atividade</h2>
            <p>Sua atividade foi enviada! O professor receberá o relatório abaixo.</p>
            <ReactMarkdown>{relatorio}</ReactMarkdown>
        </div>
      )}
    </main>
  );
}