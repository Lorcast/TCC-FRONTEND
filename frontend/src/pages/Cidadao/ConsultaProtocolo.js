import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import { supabase } from '../../supabaseClient';

const ConsultaProtocolo = () => {
  const [protocoloDigitado, setProtocoloDigitado] = useState('');
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formatarDataHoraResposta = (dataISO) => {
    if (!dataISO) return null;
    try {
      const data = new Date(dataISO);
      if (isNaN(data.getTime())) {
        return null;
      }
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const hora = String(data.getHours()).padStart(2, '0');
      const minuto = String(data.getMinutes()).padStart(2, '0');
      return `Respondido em ${dia}/${mes}/${ano} às ${hora}:${minuto}`;
    } catch (e) {
      console.error("Erro ao formatar data_resposta:", dataISO, e);
      return null;
    }
  };

  const buscarManifestacao = async () => {
    setResultado(null);
    setError(null);
    if (!protocoloDigitado.trim()) {
      setError("Por favor, digite um número de protocolo.");
      return;
    }
    setCarregando(true);

    try {
      const { data, error: queryError } = await supabase
        .from('solicitacoes')
        .select(`
          protocolo,
          created_at,
          status,
          descricao,
          resposta_admin,
          data_resposta,
          vereadores (nome_completo),
          tipo,
          anexos ( caminho_arquivo, nome_original, arquivo_resposta )
        `)
        .eq('protocolo', protocoloDigitado.trim())
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

      if (data) {
        setResultado(data);
      } else {
        setResultado('not-found');
      }

    } catch (err) {
      console.error("Erro na busca da manifestação:", err);
      setError("Ocorreu um erro ao realizar a consulta. Verifique sua conexão e tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  
  // Filtrar os anexos para separar o que é do cidadão e o que é resposta
  const anexosCidadao = resultado?.anexos?.filter(a => !a.arquivo_resposta) || [];
  const anexosResposta = resultado?.anexos?.filter(a => a.arquivo_resposta) || [];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-xl text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Consulta de Manifestação</h2>
        <p className="text-gray-600 mb-6">Digite o número do seu protocolo para ver o andamento.</p>
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 text-gray-600 hover:text-blue-700 cursor-pointer text-2xl"
      >
       <GoArrowLeft />
      </button>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl">
        <input
          type="text"
          placeholder="Digite o número do protocolo"
          value={protocoloDigitado}
          onChange={(e) => setProtocoloDigitado(e.target.value)}
          className="w-full sm:w-auto flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Número do Protocolo"
        />
        <button
          onClick={buscarManifestacao}
          disabled={carregando}
          className="bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-800 transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-wait"
        >
          {carregando ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

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
            <h3 className="text-xl font-bold text-blue-800 border-b pb-2 mb-4">Detalhes da Manifestação</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <div><strong>Protocolo:</strong> <span className="font-mono bg-gray-100 px-1 rounded">{resultado.protocolo}</span></div>
                <div><strong>Registrado em:</strong> {new Date(resultado.created_at).toLocaleString('pt-BR')}</div>
                <div><strong>Vereador:</strong> <span className="font-mono bg-gray-100 px-1 rounded">{resultado.vereadores.nome_completo}</span></div>
                <div><strong>Tipo:</strong> <span className="font-mono bg-gray-100 px-1 rounded">{resultado.tipo}</span></div>
                <div className="sm:col-span-2">
                    <strong>Status:</strong> <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                        resultado.status === 'Pendente' ? 'bg-yellow-200 text-yellow-800' : 
                        resultado.status === 'Em análise' ? 'bg-blue-200 text-blue-800' :                      'bg-green-200 text-green-800'
                    }`}>{resultado.status}</span>
                </div>
            </div>
            
            <div className="pt-2">
              <p className="font-semibold text-gray-800">Sua Mensagem:</p>
              <p className="mt-1 bg-gray-50 p-3 rounded-md border text-gray-700 whitespace-pre-wrap">{resultado.descricao}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-800">Anexo:</span>
              {anexosCidadao.length > 0 ? (
                 <ul className="list-disc list-inside mt-1 ml-2">
                    {anexosCidadao.map((anexo, index) => (
                        <li key={index}>
                            <a
                            href={supabase.storage.from('anexos-ouvidoria').getPublicUrl(anexo.caminho_arquivo).data.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                            >
                            {anexo.nome_original}
                            </a>
                        </li>
                    ))}
                 </ul>
              ) : (
                <span className="text-gray-500 ml-2">Nenhum anexo enviado.</span>
              )}
            </div>

            <div className="pt-2">
              <p className="font-semibold text-gray-800">Resposta da Ouvidoria:</p>
              <div className="mt-1 bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-900">
                <p className="whitespace-pre-wrap">{resultado.resposta_admin || 'Sua manifestação ainda não foi respondida.'}</p>
                
                
                {anexosResposta.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="font-bold text-xs uppercase mb-1 text-blue-800">Anexos da Resposta:</p>
                        <ul className="list-disc list-inside text-sm">
                            {anexosResposta.map((anexo, index) => (
                                <li key={index}>
                                    <a 
                                        href={supabase.storage.from('anexos-ouvidoria').getPublicUrl(anexo.caminho_arquivo).data.publicUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-blue-700 underline font-medium hover:text-blue-900"
                                    >
                                        {anexo.nome_original}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {resultado.data_resposta && (
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      {formatarDataHoraResposta(resultado.data_resposta)}
                    </p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultaProtocolo;