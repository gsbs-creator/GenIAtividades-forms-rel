'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { RespostaComAluno } from './page';

type Props = {
  atividade: { id: number; assunto: string };
  respostasIniciais: RespostaComAluno[];
};

export default function ClientPage({ atividade, respostasIniciais }: Props) {
  const [respostaSelecionada, setRespostaSelecionada] = useState<RespostaComAluno | null>(null);

  return (
    <main className="container">
      <div className="card">
        <h1>Resultados da Atividade: {atividade.assunto}</h1>
        <p>Selecione um aluno para ver o relatório de desempenho detalhado.</p>
        
        {respostasIniciais.length === 0 ? (
            <p>Nenhum aluno respondeu a esta atividade ainda.</p>
        ) : (
            <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row' }}>
                <div style={{ flex: '1' }}>
                    <h2>Alunos:</h2>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {respostasIniciais.map((resposta) => (
                        <li key={resposta.id}
                            onClick={() => setRespostaSelecionada(resposta)}
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                                borderRadius: '5px',
                                backgroundColor: respostaSelecionada?.id === resposta.id ? '#6A44C4' : '#f0f0f0',
                                color: respostaSelecionada?.id === resposta.id ? 'white' : 'black',
                                marginBottom: '5px',
                            }}
                        >
                            {resposta.nome_aluno}
                        </li>
                        ))}
                    </ul>
                </div>

                <div style={{ flex: '3', borderLeft: '1px solid #ddd', paddingLeft: '2rem' }}>
                    {respostaSelecionada ? (
                        <div>
                            <h2>Relatório de {respostaSelecionada.nome_aluno}</h2>
                            <div className="card" style={{backgroundColor: '#fafafa', maxHeight: '60vh', overflowY: 'auto'}}>
                                <ReactMarkdown>
                                    {respostaSelecionada.relatorio_gerado}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <p>Selecione um aluno da lista para começar.</p>
                    )}
                </div>
            </div>
        )}
      </div>
    </main>
  );
}