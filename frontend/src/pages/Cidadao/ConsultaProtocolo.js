import React, { useEffect, useState } from 'react';

const url = "http://localhost:3000/manifestacoes";

const ConsultaProtocolo = () => {
  const [protocoloDigitado, setProtocoloDigitado] = useState('');
  const [resultado, setResultado] = useState(null);
  const [manifestacoes, setManifestacoes] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setManifestacoes(data);
      } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
      }
    }

    fetchData();
  }, []);

  const buscarManifestacao = () => {
    const achado = manifestacoes.find(
      (item) => Number(item.protocolo) === Number(protocoloDigitado)
    );

    if (achado) {
      setResultado(achado);
    } else {
      setResultado('not-found'); 
    }

  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Consulta de Manifestação</h2>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl">
        <input
          type="text"
          placeholder="Digite o número do protocolo"
          value={protocoloDigitado}
          onChange={(e) => setProtocoloDigitado(e.target.value)}
          className="w-full sm:w-auto flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={buscarManifestacao}
          className="bg-blue-700 text-white px-6 py-2 rounded-md shadow hover:bg-blue-800 transition"
        >
          Consultar
        </button>
      </div>

      {resultado === 'not-found' && (
        <p className="text-red-600 mt-6">
          Nenhuma manifestação encontrada com esse protocolo.
        </p>
      )}

      {resultado && resultado !== 'not-found' && (
        <div className="bg-white mt-8 p-6 rounded-lg shadow-md border w-full max-w-xl">
          <p><strong>Data e Hora:</strong> {resultado.dataHora}</p>
          <p><strong>Situação:</strong> {resultado.situacao}</p>
          <p><strong>Resposta:</strong> {resultado.resposta || 'Ainda não houve resposta.'}</p>

          {resultado.anexo ? (
  <p>
    <strong>Anexo:</strong>{' '}
    <span className="text-gray-800">{resultado.anexo}</span>
    <br />
    <span className="text-sm text-gray-500 italic">
      (O arquivo foi registrado, mas não está disponível para download direto. Isso requer backend com upload real.)
    </span>
  </p>
) : (
  <p><strong>Anexo:</strong> Nenhum anexo enviado.</p>
)} 
        </div>
      )}
    </div>
  );
};

export default ConsultaProtocolo;
