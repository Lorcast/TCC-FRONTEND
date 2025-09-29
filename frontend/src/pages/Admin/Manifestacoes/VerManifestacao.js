import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../supabaseClient";


const VerManifestacao = () => {
    const [carregando, setCarregando] = useState(false);
    const [error, setError] = useState(); 
    const [manifestacao, setManifestacao] = useState(null);
    const { protocolo } = useParams();

    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchManifestacao = async () => {
            setCarregando(true);
            try{
                const { data, error } = await supabase
                .from('solicitacoes')
                .select(`
                    tipo,
                    solicitante_nome,
                    protocolo,
                    created_at,
                    status,
                    descricao,
                    resposta_admin,
                    anexos ( caminho_arquivo, nome_original )
                `)
                .eq('protocolo', protocolo)
                .single();

                 if (error) throw error;
        setManifestacao(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchManifestacao();
  }, [protocolo]);

    return (
    <div className="min-h-screen bg-gray-100 p-6">
      {carregando ? (
        <p className="text-center mt-4 text-gray-700">Carregando manifestação...</p>
      ) : error ? (
        <p className="text-center mt-4 text-red-600">Erro: {error}</p>
      ) : !manifestacao ? (
        <p className="text-center mt-4 text-gray-700">Manifestação não encontrada.</p>
      ) : (
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Detalhes da Manifestação</h2>

          <div className="space-y-2">
            <p>
              <span className="font-semibold">Protocolo:</span> {manifestacao.protocolo}
            </p>
            <p>
              <span className="font-semibold">Data:</span>{" "}
              {new Date(manifestacao.created_at).toLocaleString("pt-BR")}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {manifestacao.status}
            </p>
            
            <p>
              <span className="font-semibold">Tipo:</span> {manifestacao.tipo}
            </p>
             <p>
              <span className="font-semibold">Identificação:</span>{" "}
              {manifestacao.solicitante_nome 
                ? manifestacao.solicitante_nome 
                : "Anônimo"}
            </p>
            <p>
              <span className="font-semibold">Descrição:</span> {manifestacao.descricao}
            </p>
            
          </div>

          <h3 className="mt-6 text-xl font-semibold text-gray-700">Anexos</h3>
          {manifestacao.anexos?.length > 0 ? (
            <ul className="list-disc list-inside mt-2 space-y-1">
              {manifestacao.anexos.map((anexo, index) => (
                <li key={index}>
                  <a
                    href={anexo.caminho_arquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 transition-colors"
                  >
                    {anexo.nome_original}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-gray-500">Sem anexos.</p>
          )}

          

          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Voltar
            </button>

             <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

    export default VerManifestacao;