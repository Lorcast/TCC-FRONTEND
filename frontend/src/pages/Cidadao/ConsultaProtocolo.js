// ConsultaProtocolo.js
import React, { useCallback, useState } from 'react';
import { supabase } from '../../supabaseClient'; // Importa a conexão com o Supabase

const ConsultaProtocolo = () => {
  // Estados da página
  const [protocoloDigitado, setProtocoloDigitado] = useState('');
  const [resultado, setResultado] = useState(null); // Guarda o resultado da busca
  const [isLoading, setIsLoading] = useState(false); // Controla o feedback de "carregando"
  const [error, setError] = useState(null); // Guarda mensagens de erro

  // Função que busca os dados no Supabase ao clicar no botão
  const buscarManifestacao = useCallback(async () => {
    // 1. Prepara a busca: limpa dados antigos e ativa o "carregando"
    setResultado(null);
    setError(null);
    if (!protocoloDigitado.trim()) {
      setError("Por favor, digite um número de protocolo.");
      return;
    }
    setIsLoading(true);

    try {
      // 2. Executa a busca no Supabase
      const { data, error: queryError } = await supabase
        .from('solicitacoes') // Na tabela 'solicitacoes'
        .select(`
          protocolo,
          created_at,
          status,
          descricao,
          resposta_admin,
          anexos ( caminho_arquivo, nome_original )
        `) // Pega estes campos E os dados da tabela 'anexos' relacionada
        .eq('protocolo', protocoloDigitado.trim()) // Onde a coluna 'protocolo' seja igual ao valor digitado
        .single(); // Esperamos apenas um único resultado

      if (queryError && queryError.code !== 'PGRST116') {
        // Ignora o erro 'PGRST116' que apenas significa "não encontrou nenhuma linha"
        // mas lança qualquer outro erro (ex: de conexão)
        throw queryError;
      }

      // 3. Processa o resultado
      if (data) {
        setResultado(data); // Se encontrou, guarda os dados
      } else {
        setResultado('not-found'); // Se não encontrou, marca como 'not-found'
      }

    } catch (err) {
      console.error("Erro na busca da manifestação:", err);
      setError("Ocorreu um erro ao realizar a consulta. Verifique sua conexão e tente novamente.");
    } finally {
      // 4. Finaliza o "carregando"
      setIsLoading(false);
    }
  }, [protocoloDigitado]); // <-- CORREÇÃO APLICADA AQUI
  
 

  // Função para lidar com a tecla Enter no input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarManifestacao();
    }
  };

  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-xl text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Consulta de Manifestação</h2>
        <p className="text-gray-600 mb-6">Digite o número do seu protocolo para ver o andamento.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl">
        <input
          type="text"
          placeholder="Digite o número do protocolo"
          value={protocoloDigitado}
          onChange={(e) => setProtocoloDigitado(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full sm:w-auto flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={buscarManifestacao}
          disabled={isLoading}
          className="bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-800 transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      {/* Área de Exibição de Resultados */}
      <div className="mt-8 w-full max-w-xl">
        {error && (
            <p className="text-red-600 text-center font-semibold">{error}</p>
        )}
        
        {resultado === 'not-found' && (
          <p className="text-yellow-700 bg-yellow-100 p-4 rounded-md text-center">
            Nenhuma manifestação encontrada com este número de protocolo.
          </p>
        )}

        {resultado && resultado !== 'not-found' && (
          <div className="bg-white p-6 rounded-lg shadow-md border w-full max-w-xl space-y-4 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-800">Detalhes da Manifestação</h3>
            
            <div><strong>Protocolo:</strong> <span className="font-mono">{resultado.protocolo}</span></div>
            <div><strong>Registrado em:</strong> {new Date(resultado.created_at).toLocaleString('pt-BR')}</div>
            <div><strong>Status:</strong> <span className="font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">{resultado.status}</span></div>
            
            <div className="pt-2">
              <p><strong>Sua Mensagem:</strong></p>
              <p className="bg-gray-50 p-3 rounded-md border text-gray-700 whitespace-pre-wrap">{resultado.descricao}</p>
            </div>

            <div className="pt-2">
              <p><strong>Resposta da Ouvidoria:</strong></p>
              <p className="bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-900">
                {resultado.resposta_admin || 'Sua manifestação ainda não foi respondida.'}
              </p>
            </div>

            <div>
              <strong>Anexo:</strong>
              {resultado.anexos && resultado.anexos.length > 0 ? (
                <a
                  href={supabase.storage.from('anexos-ouvidoria').getPublicUrl(resultado.anexos[0].caminho_arquivo).data.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 ml-2"
                >
                  {resultado.anexos[0].nome_original}
                </a>
              ) : (
                <span className="text-gray-600 ml-2">Nenhum anexo enviado.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultaProtocolo;