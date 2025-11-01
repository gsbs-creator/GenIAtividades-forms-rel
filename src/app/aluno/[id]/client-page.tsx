// src/app/aluno/[id]/client-page.tsx (VERSÃO MELHORADA)
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown'; // <-- Precisamos disso
import { supabase } from '@/lib/supabaseCliente'; 

// Interfaces (presumi que você tem a Atividade vindo das props)
interface Questao {
  question: string;
  opcoes?: { [key: string]: string };
  correct_answer: string; // A API precisa disso
}
interface Atividade {
  id: number;
  assunto: string;
  questoes: Questao[];
}
interface Respostas {
    [key: number]: string;
}

// O componente recebe a 'atividade' do page.tsx (via props)
export default function ClientPage({ atividade }: { atividade: Atividade }) {
  const [respostasAluno, setRespostasAluno] = useState<Respostas>({});
  const [loading, setLoading] = useState(false);
  const [nomeAluno, setNomeAluno] = useState('');
  const [atividadeIniciada, setAtividadeIniciada] = useState(false);
  const [atividadeFinalizada, setAtividadeFinalizada] = useState(false);
  const [erro, setErro] = useState('');
  
  // NOVO ESTADO: Armazena o relatório para o aluno ver
  const [relatorioGerado, setRelatorioGerado] = useState('');

  const handleEnviarRespostas = async () => {
    if (Object.keys(respostasAluno).length !== atividade.questoes.length) {
        setErro('Por favor, responda todas as questões.');
        return;
    }

    setLoading(true);
    setErro('');
    try {
        // 1. Chama a API Unificada
        const responseApi = await fetch('/api/gerar-relatorio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questoes: atividade.questoes,
                respostasAluno: respostasAluno,
                atividade_id: atividade.id,
                nome_aluno: nomeAluno
            }),
        });

        if (!responseApi.ok) {
            const dataError = await responseApi.json();
            throw new Error(dataError.error || 'Falha ao buscar relatório da API');
        }
        
        // 2. Pega o relatório que a API retornou
        const dataApi = await responseApi.json();
        
        // 3. SALVA O RELATÓRIO NO ESTADO
        setRelatorioGerado(dataApi.relatorio);
        setAtividadeFinalizada(true); // Marca como finalizada

    } catch (error: any) {
        console.error(error);
        setErro(`Ocorreu um erro ao enviar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRespostaChange = (indiceQuestao: number, opcao: string) => {
    setRespostasAluno({ ...respostasAluno, [indiceQuestao]: opcao });
  };
  
  // --- Interface do Aluno ---
  if (!atividade) {
      return <main className="container"><p>Carregando atividade...</p></main>;
  }

  // MUDANÇA AQUI: Tela de "Obrigado" agora mostra o relatório
  if (atividadeFinalizada) {
    return (
        <main className="container">
            <div className="card">
                <h2>Atividade Enviada!</h2>
                <p>Obrigado, {nomeAluno}. Aqui está seu relatório de desempenho:</p>
                {/* Exibe o relatório que foi salvo no estado */}
                <div className="card" style={{backgroundColor: '#fafafa', maxHeight: '60vh', overflowY: 'auto', padding: '15px'}}>
                    <ReactMarkdown>{relatorioGerado}</ReactMarkdown>
                </div>
            </div>
        </main>
    );
  }

  // Tela para pedir o nome do aluno
  if (!atividadeIniciada) {
    // ... (seu código de pedir o nome continua igual) ...
    return (
        <main className="container">
            <div className="card">
                <h2>{atividade.assunto}</h2>
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

  // Tela de responder a atividade
  return (
    // ... (seu código de responder continua igual, SÓ REMOVI O '_') ...
    <main className="container">
      <header className="header">
        <Image src="/logo.png" alt="Logo GenIAtividades" width={200} height={100} priority />
      </header>
        <div className="card">
          <h2>Responda a Atividade, {nomeAluno}!</h2>
          {erro && <p style={{color: 'red'}}>{erro}</p>}
          {atividade.questoes.map((q, index) => (
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
          <button onClick={handleEnviarRespostas} disabled={loading} className="btn btn-success">
            {loading ? 'Enviando...' : 'Finalizar e Enviar'}
          </button>
        </div>
    </main>
  );
}