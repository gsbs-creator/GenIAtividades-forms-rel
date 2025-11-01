// src/app/resultados/[id]/client-page.tsx
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { RespostaComAluno, AtividadeComQuestoes } from './page';

type Props = {
  atividade: AtividadeComQuestoes; 
  respostasIniciais: RespostaComAluno[];
};

export default function ClientPage({ atividade, respostasIniciais }: Props) {
  const [respostas, setRespostas] = useState(respostasIniciais);
  const [respostaSelecionada, setRespostaSelecionada] = useState<RespostaComAluno | null>(null);
  const [loading, setLoading] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);

  const handleSelecionarAluno = (resposta: RespostaComAluno) => {
    setRespostaSelecionada(resposta);
    setErroApi(null);
  };

 const handleGerarRelatorio = async () => {
    if (!respostaSelecionada || !atividade.questoes || !respostaSelecionada.respostas) {
        setErroApi("Dados incompletos para gerar o relatório.");
        return;
    }
    setLoading(true);
    setErroApi(null);
    console.log("--- INICIANDO GERAÇÃO DE RELATÓRIO ---");
    console.log("DADOS DE ATIVIDADE (procure por 'questoes'):", atividade);
    console.log("DADOS DO ALUNO (procure por 'respostas'):", respostaSelecionada);
    console.log("---------------------------------------");
    try {
      const response = await fetch('/api/gerar-relatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questoes: atividade.questoes,
          respostasDoAluno: respostaSelecionada.respostas,
          resposta_id: respostaSelecionada.id,
          nome_aluno: respostaSelecionada.nome_aluno
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao buscar relatório da API');
      }
      const respostaAtualizada = {
        ...respostaSelecionada,
        relatorio_gerado: data.relatorio,
      };
      setRespostas(respostas.map(r => 
        r.id === respostaSelecionada.id ? respostaAtualizada : r
      ));
      setRespostaSelecionada(respostaAtualizada);

    // --- CORREÇÃO DO CATCH ---
    } catch (error: unknown) { // <-- MUDANÇA DE 'any' PARA 'unknown'
      console.error("Erro em handleGerarRelatorio:", error);
      if (error instanceof Error) {
        setErroApi(error.message); // <-- Agora é seguro
      } else {
        setErroApi("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="container">
        <div className="card">
          <h1>📊 Resultados da Atividade: <span>{atividade.assunto}</span></h1>
          <p className="subtitulo">Selecione um aluno para ver o relatório de desempenho detalhado.</p>

          {erroApi && (
            <div className="erro-box">
              ⚠️ Erro de comunicação: {erroApi}
            </div>
          )}

          {respostas.length === 0 ? (
            <p>Nenhum aluno respondeu a esta atividade ainda.</p>
          ) : (
            <div className="resultados-container">
              {/* Lista de alunos */}
              <div className="lista-alunos">
                <h2>👩‍🎓 Alunos</h2>
                <ul>
                  {respostas.map((resposta) => (
                    <li
                      key={resposta.id}
                      className={`aluno-item ${respostaSelecionada?.id === resposta.id ? 'active' : ''}`}
                      onClick={() => handleSelecionarAluno(resposta)}
                    >
                      {resposta.nome_aluno}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Relatório do aluno */}
              <div className="detalhe-relatorio">
                {respostaSelecionada ? (
                  <div className="relatorio-selecionado">
                    <h2>📘 Relatório de {respostaSelecionada.nome_aluno}</h2>

                    {atividade.questoes && respostaSelecionada.respostas ? (
                      <>
                        <button
                          className="btn-purple"
                          onClick={handleGerarRelatorio}
                          disabled={loading}
                        >
                          {loading ? "Gerando..." : (respostaSelecionada.relatorio_gerado ? "🔁 Gerar Novamente" : "🪄 Gerar Relatório")}
                        </button>

                        <div className="relatorio-card">
                          {respostaSelecionada.relatorio_gerado ? (
                            <ReactMarkdown>{respostaSelecionada.relatorio_gerado}</ReactMarkdown>
                          ) : (
                            <p className="placeholder-text">
                              Clique em “Gerar Relatório” para criar a análise deste aluno.
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="aviso-box">
                        <strong>Atenção:</strong> Dados incompletos no banco de dados (questões ou respostas ausentes).
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relatorio-placeholder">
                    <p>👈 Selecione um aluno da lista para começar.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          padding: 30px;
          display: flex;
          justify-content: center;
        }
        .card {
          width: 100%;
          max-width: 1100px;
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        h1 {
          font-size: 2rem;
          color: #333;
          margin-bottom: 0.5rem;
        }
        h1 span {
          color: #6A44C4;
        }
        .subtitulo {
          color: #666;
          font-size: 1rem;
          margin-bottom: 2rem;
        }

        .resultados-container {
          display: flex;
          gap: 2.5rem;
        }

        .lista-alunos {
          flex: 1;
          background: #faf7ff;
          border: 1px solid #e5d8ff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: inset 0 0 10px rgba(106,68,196,0.05);
        }
        .lista-alunos h2 {
          font-size: 1.2rem;
          color: #6A44C4;
          border-bottom: 2px solid #e5d8ff;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .aluno-item {
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 8px;
          background-color: #f2f2f7;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        .aluno-item:hover {
          background-color: #e7ddff;
        }
        .aluno-item.active {
          background-color: #6A44C4;
          color: white;
          font-weight: bold;
        }

        .detalhe-relatorio {
          flex: 3;
        }
        .relatorio-selecionado h2 {
          color: #4a358d;
          margin-bottom: 1rem;
        }
        .btn-purple {
          background-color: #6A44C4;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.2s ease;
          margin-bottom: 15px;
        }
        .btn-purple:hover {
          background-color: #5a2fc8;
        }
        .btn-purple:disabled {
          background-color: #aaa;
          cursor: not-allowed;
        }

        .relatorio-card {
          background: #f9f9fc;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #eee;
          min-height: 200px;
          max-height: 60vh;
          overflow-y: auto;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
        }
        .placeholder-text {
          color: #777;
          font-style: italic;
        }
        .relatorio-placeholder {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #fafafa;
          border: 1px dashed #ccc;
          border-radius: 12px;
          height: 200px;
          color: #666;
          font-style: italic;
        }
        .erro-box {
          background: #fde8e8;
          color: #b71c1c;
          padding: 12px 18px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #e53935;
        }
        .aviso-box {
          background: #fff8e1;
          border-left: 4px solid #ffb300;
          padding: 12px 18px;
          border-radius: 8px;
          margin-top: 15px;
          color: #6d4c00;
        }

        @media (max-width: 768px) {
          .resultados-container {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
