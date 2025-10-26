import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import { supabase } from "../../../supabaseClient"; //

const VerDetalhes = () => {
  const [carregando, setCarregando] = useState(false);
  const [error, setError] = useState();
  const [manifestacao, setManifestacao] = useState(null);
  // Estado para o que o admin está digitando no textarea
  const [respostaAdminInput, setRespostaAdminInput] = useState("");
  const [vereadorNome, setVereadorNome] = useState("Não informado");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [respostaVazia, setRespostaVazia] = useState(false);

  const { protocolo } = useParams();
  const respostaRef = useRef(null);
  const navigate = useNavigate();

  // Função para buscar a manifestação - **CORRIGIDO O SELECT NOVAMENTE**
  const fetchManifestacao = useCallback(async () => {
    if (!protocolo) {
      setError("Protocolo não fornecido.");
      return;
    }

    setCarregando(true);
    setError(null);
    try {
      // ***** CORREÇÃO APLICADA AQUI (Comentário Removido) *****
      const { data, error: fetchError } = await supabase
        .from("solicitacoes")
        .select(`
          tipo,
          solicitante_nome,
          protocolo,
          created_at,
          status,
          descricao,
          resposta_admin,
          data_resposta,
          id_vereador_destino,
          anexos ( caminho_arquivo, nome_original )
        `) // O comentário que estava aqui foi removido
        .eq("protocolo", protocolo)
        .single();
      // ***** FIM DA CORREÇÃO *****

      if (fetchError) {
        if (fetchError.code === 'PGRST116') { // Erro específico para "não encontrado"
             setError("Manifestação não encontrada.");
             setManifestacao(null);
        } else {
            throw fetchError; // Outros erros são lançados
        }
      } else if (data) {
          // Atualiza status se pendente
          if (data.status === "Pendente") {
            const { error: updateError } = await supabase
              .from("solicitacoes")
              .update({ status: "Em análise" })
              .eq("protocolo", protocolo);
             if (updateError) {
                console.error("Erro ao atualizar status:", updateError);
             } else {
                data.status = "Em análise"; // Atualiza localmente para UI
             }
          }

          setManifestacao(data);
          // Preenche o input apenas com o texto da resposta
          setRespostaAdminInput(data.resposta_admin || "");

          // Busca nome do vereador
          if (data.id_vereador_destino) {
             const { data: vereadorData, error: vereadorError } = await supabase
              .from("vereadores")
              .select("nome_completo")
              .eq("id", data.id_vereador_destino)
              .single();
            if (vereadorError) {
                 console.error("Erro ao buscar vereador:", vereadorError);
                 setVereadorNome("Erro ao buscar");
            } else {
                setVereadorNome(vereadorData?.nome_completo ?? "Não informado");
            }
          } else {
              setVereadorNome("Não direcionado");
          }
      } else {
          // Caso raro onde não há erro mas data é null
          setError("Manifestação não encontrada.");
          setManifestacao(null);
      }

    } catch (err) {
      console.error("Erro detalhado ao buscar manifestação:", err);
       // Verifica se o erro é o de parsing para dar uma mensagem mais específica
      if (err.message && err.message.includes('failed to parse select parameter')) {
         setError("Erro interno ao definir colunas da busca. Verifique a função fetchManifestacao."); // Mensagem específica
      } else {
         setError(err.message || "Ocorreu um erro ao carregar a manifestação.");
      }
      setManifestacao(null);
    } finally {
      setCarregando(false);
    }
  }, [protocolo]); // Depende do protocolo da URL

  useEffect(() => {
    fetchManifestacao();
  }, [fetchManifestacao]); // Roda quando a função fetchManifestacao (ou suas deps) mudam

  // Função para formatar a data da resposta vinda do banco (coluna data_resposta)
  const formatarDataHoraResposta = (dataISO) => {
    if (!dataISO) return null;
    try {
        const data = new Date(dataISO);
        if (isNaN(data.getTime())) { // Verifica se a data é válida
            console.error("Data de resposta inválida recebida:", dataISO);
            return null; // ou retorna uma string indicando erro
        }
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
        const ano = data.getFullYear();
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        return `Respondido em ${dia}/${mes}/${ano} às ${hora}:${minuto}`;
    } catch (e) {
        console.error("Erro ao formatar data_resposta:", dataISO, e);
        return null; // Retorna null se houver erro na formatação
    }
  };

  // Função para enviar a resposta para o Supabase
  const enviarResposta = async () => {
    const respostaDigitada = respostaAdminInput.trim(); // Usa o estado do input

    if (!respostaDigitada) { // Validação
      setMensagem("Escreva uma resposta.");
      setRespostaVazia(true);
      respostaRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setMensagem("");
    setRespostaVazia(false);
    setEnviando(true);

    try {
      const agora = new Date(); // Data/hora atual

      // Atualiza o Supabase
      const { data: updatedData, error: updateError } = await supabase
        .from("solicitacoes")
        .update({
          resposta_admin: respostaDigitada,        // Salva SÓ o texto da resposta na coluna resposta_admin
          data_resposta: agora.toISOString(),     // Salva a data/hora atual na coluna data_resposta
          status: "Finalizado"                    // Atualiza o status
        })
        .eq("protocolo", protocolo)
        .select() // Pede ao Supabase para retornar os dados atualizados
        .single(); // Espera apenas um registro

      if (updateError) throw updateError; // Lança erro se a atualização falhar

      // Atualiza o estado local com os dados que acabaram de ser salvos no banco
      setManifestacao(updatedData);
      // Atualiza o estado do input (embora ele agora fique desabilitado/oculto)
      setRespostaAdminInput(updatedData.resposta_admin || "");

      setMensagem("Resposta enviada com sucesso!"); // Mensagem de sucesso

    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
      setMensagem("Erro ao enviar resposta: " + err.message); // Mensagem de erro
    } finally {
      setEnviando(false); // Termina o estado de envio
    }
  };

  // Renderização do componente
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Botão Voltar */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-blue-700 cursor-pointer text-2xl w-fit mb-4"
        aria-label="Voltar"
      >
        <GoArrowLeft />
      </button>

      {/* Estados de Carregamento e Erro */}
      {carregando ? (
        <p className="text-center mt-4 text-gray-700">Carregando...</p>
      ) : error ? (
        <p className="text-center mt-4 text-red-600">Erro: {error}</p>
      ) : !manifestacao ? (
         <p className="text-center mt-4 text-gray-700">Carregando detalhes ou manifestação não encontrada.</p>
      ) : (
        // Conteúdo Principal quando a manifestação é carregada
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
          {/* Cabeçalho */}
           <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Detalhes da Manifestação
          </h2>

          {/* Informações da Manifestação */}
          <div className="space-y-3 mb-4 border-b pb-4">
             <p><strong>Protocolo:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{manifestacao.protocolo}</span></p>
            <p><strong>Registrado em:</strong> {new Date(manifestacao.created_at).toLocaleString("pt-BR")}</p>
            <p><strong>Status:</strong> <span className={`font-semibold px-2 py-1 rounded ${manifestacao.status === 'Pendente' ? 'bg-yellow-200 text-yellow-800' : manifestacao.status === 'Em análise' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>{manifestacao.status}</span></p>
            <p><strong>Tipo:</strong> {manifestacao.tipo}</p>
            <p><strong>Solicitante:</strong> {manifestacao.solicitante_nome || 'Anônimo'}</p>
            <p><strong>Vereador Destino:</strong> {vereadorNome}</p>
          </div>

          {/* Descrição */}
           <div className="mb-4">
                <p className="font-semibold text-gray-700">Descrição da Manifestação:</p>
                <p className="mt-1 bg-gray-50 p-3 rounded border whitespace-pre-wrap">{manifestacao.descricao}</p>
           </div>

          {/* Anexos */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Anexos</h3>
            {manifestacao.anexos?.length > 0 ? (
              <ul className="list-disc list-inside mt-2 space-y-1">
                {manifestacao.anexos.map((anexo, index) => (
                  <li key={index}>
                    <a
                      href={`${supabase.storage.url}/object/public/anexos-ouvidoria/${anexo.caminho_arquivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 transition-colors"
                    >
                      {anexo.nome_original || 'Ver anexo'}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-gray-500">Sem anexos.</p>
            )}
          </div>

          {/* SEÇÃO DA RESPOSTA */}
          <div className="mt-6">
            <label htmlFor="resposta-admin-textarea" className="block font-semibold mb-2 text-gray-700">
              Resposta da Ouvidoria
            </label>
            {/* Mostra TEXTAREA se o status NÃO for 'Finalizado' */}
            {manifestacao.status !== 'Finalizado' ? (
               <textarea
                 id="resposta-admin-textarea"
                 ref={respostaRef}
                 className={`w-full border rounded p-2 whitespace-pre-wrap ${
                   respostaVazia ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                 } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                 rows={5}
                 value={respostaAdminInput} // Ligado ao estado de input
                 onChange={(e) => {
                     setRespostaAdminInput(e.target.value);
                     if (e.target.value.trim()) setRespostaVazia(false);
                 }}
                 disabled={enviando}
                 aria-invalid={respostaVazia}
                 aria-describedby={respostaVazia ? "resposta-error" : undefined}
                 placeholder="Digite a resposta aqui..."
               />
            ) : (
              // Mostra DIV formatada se o status FOR 'Finalizado'
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-900 min-h-[100px]">
                  {/* Mostra o texto da resposta */}
                  <p className="whitespace-pre-wrap">
                      {manifestacao.resposta_admin || '[Nenhuma resposta registrada]'}
                  </p>
                  {/* Mostra a data formatada da coluna 'data_resposta' */}
                  {manifestacao.data_resposta && (
                    <p className="text-xs text-gray-500 mt-2">
                      {formatarDataHoraResposta(manifestacao.data_resposta)}
                    </p>
                  )}
              </div>
            )}
             {/* Mensagem de erro para campo vazio */}
             {respostaVazia && <p id="resposta-error" className="text-red-500 text-sm mt-1">{mensagem}</p>}
          </div>

          {/* Botões */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
             {/* Botão 'Enviar Resposta' só aparece se não estiver finalizado */}
            {manifestacao?.status !== 'Finalizado' && (
              <button
                type="button"
                onClick={enviarResposta}
                disabled={enviando || !respostaAdminInput.trim()} // Desabilita se enviando ou input vazio
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md shadow transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? "Enviando..." : "Enviar Resposta e Finalizar"}
              </button>
            )}
            {/* Botão 'Gerar Relatório' sempre aparece */}
            <button
               type="button"
               // onClick={gerarRelatorio} // Futura funcionalidade
               className="bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-800 transition w-full sm:w-auto"
            >
              Gerar Relatório PDF
            </button>
          </div>

          {/* Mensagem de sucesso/erro após envio */}
          {mensagem && !respostaVazia && (
            <p
              className={`mt-4 text-center font-semibold ${
                mensagem.startsWith("Erro") ? "text-red-600" : "text-green-600"
              }`}
            >
              {mensagem}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VerDetalhes;