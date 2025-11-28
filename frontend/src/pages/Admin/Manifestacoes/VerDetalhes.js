import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import { supabase } from "../../../supabaseClient";
import RelatorioVerDetalhes from "../../../components/RelatorioVerDetalhes";

const VerDetalhes = () => {
  const [carregando, setCarregando] = useState(false);
  const [error, setError] = useState();
  const [manifestacao, setManifestacao] = useState(null);
  const [respostaAdminInput, setRespostaAdminInput] = useState("");
  const [vereadorNome, setVereadorNome] = useState("Não informado");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [respostaVazia, setRespostaVazia] = useState(false);
  const [ouvidor, setOuvidor] = useState(null);
  const { protocolo } = useParams();
  const respostaRef = useRef(null);
  const navigate = useNavigate();
  const [formManifestacao, setFormManifestacao] = useState({anexos: null});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormManifestacao((prev) => ({ ...prev, anexos: file || null }));
  };

  const fetchManifestacao = useCallback(async () => {
    if (!protocolo) {
      setError("Protocolo não fornecido.");
      return;
    }

    setCarregando(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("solicitacoes")
        .select(`
          tipo,
          solicitante_nome,
          protocolo,
          created_at,
          status,
          assunto,
          descricao,
          resposta_admin,
          data_resposta,
          id_vereador_destino,
          solicitante_contato,
          solicitante_cpf,
          anexos ( caminho_arquivo, nome_original )
        `)
        .eq("protocolo", protocolo)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError("Manifestação não encontrada.");
          setManifestacao(null);
        } else {
          throw fetchError;
        }
      } else if (data) {
        if (data.status === "Pendente") {
          const { error: updateError } = await supabase
            .from("solicitacoes")
            .update({ status: "Em análise" })
            .eq("protocolo", protocolo);
          if (updateError) console.error("Erro ao atualizar status:", updateError);
          else data.status = "Em análise";
        }

        setManifestacao(data);
        setRespostaAdminInput(data.resposta_admin || "");

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
        setError("Manifestação não encontrada.");
        setManifestacao(null);
      }
    } catch (err) {
      console.error("Erro detalhado ao buscar manifestação:", err);
      setError(err.message || "Ocorreu um erro ao carregar a manifestação.");
      setManifestacao(null);
    } finally {
      setCarregando(false);
    }
  }, [protocolo]);
 const fetchOuvidor = async () => {
    const { data } = await supabase
      .from("ouvidor")
      .select("*")
      .limit(1)
      .single();

    setOuvidor(data || null);
  };
  useEffect(() => {
    fetchOuvidor();
    fetchManifestacao();
  }, [fetchManifestacao]);

  const formatarDataHoraResposta = (dataISO) => {
    if (!dataISO) return null;
    try {
      const data = new Date(dataISO);
      if (isNaN(data.getTime())) return null;
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

  const enviarResposta = async () => {
    const respostaDigitada = respostaAdminInput.trim();

    if (!respostaDigitada) {
      setMensagem("Escreva uma resposta.");
      setRespostaVazia(true);
      respostaRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setMensagem("");
    setRespostaVazia(false);
    setEnviando(true);

    try {
      const agora = new Date();

      const { data: updatedData, error: updateError } = await supabase
        .from("solicitacoes")
        .update({
          resposta_admin: respostaDigitada,
          data_resposta: agora.toISOString(),
          status: "Finalizado"
        })
        .eq("protocolo", protocolo)
        .select()
        .single();

      if (updateError) throw updateError;

      setManifestacao(updatedData);
      setRespostaAdminInput(updatedData.resposta_admin || "");
      setMensagem("Resposta enviada com sucesso!");
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
      setMensagem("Erro ao enviar resposta: " + err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-blue-700 cursor-pointer text-2xl w-fit mb-4"
        aria-label="Voltar"
      >
        <GoArrowLeft />
      </button>

      {carregando ? (
        <p className="text-center mt-4 text-gray-700">Carregando...</p>
      ) : error ? (
        <p className="text-center mt-4 text-red-600">Erro: {error}</p>
      ) : !manifestacao ? (
        <p className="text-center mt-4 text-gray-700">Carregando detalhes ou manifestação não encontrada.</p>
      ) : (
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Detalhes da Manifestação
          </h2>

          <div className="space-y-3 mb-4 border-b pb-4">
            <p><strong>Protocolo:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{manifestacao.protocolo}</span></p>
            
            <p><strong>Registrado em:</strong> {new Date(manifestacao.created_at).toLocaleString("pt-BR")}</p>
            <p><strong>Status:</strong> <span className={`font-semibold px-2 py-1 rounded ${manifestacao.status === 'Pendente' ? 'bg-yellow-200 text-yellow-800' : manifestacao.status === 'Em análise' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>{manifestacao.status}</span></p>
            <p><strong>Tipo:</strong> {manifestacao.tipo}</p>
            <p><strong>Assunto:</strong> {manifestacao.assunto}</p>
            <p><strong>CPF:</strong> {manifestacao.solicitante_cpf  || "Não informado"}</p>
            <p><strong>Solicitante:</strong> {manifestacao.solicitante_nome || 'Anônimo'}</p>
            <p><strong>Telefone:</strong> {manifestacao.solicitante_contato || "Não informado"}</p>
            <p><strong>Vereador Destino:</strong> {vereadorNome}</p>
          </div>

          <div className="mb-4">
            <p className="font-semibold text-gray-700">Descrição da Manifestação:</p>
            <p className="mt-1 bg-gray-50 p-3 rounded border whitespace-pre-wrap">{manifestacao.descricao}</p>
          </div>

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
            <div>
          <label className="block font-medium mb-1">Anexo (Ouvidor)</label>
          <input
            id="anexo-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileChange}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
          <div className="mt-6">
            <label htmlFor="resposta-admin-textarea" className="block font-semibold mb-2 text-gray-700">
              Resposta da Ouvidoria
            </label>
            {manifestacao.status !== 'Finalizado' ? (
              <textarea
                id="resposta-admin-textarea"
                ref={respostaRef}
                className={`w-full border rounded p-2 whitespace-pre-wrap ${respostaVazia ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                rows={5}
                value={respostaAdminInput}
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
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-900 min-h-[100px]">
                <p className="whitespace-pre-wrap">
                  {manifestacao.resposta_admin || '[Nenhuma resposta registrada]'}
                </p>
                {manifestacao.data_resposta && (
                  <p className="text-xs text-gray-500 mt-2">
                    {formatarDataHoraResposta(manifestacao.data_resposta)}
                  </p>
                )}
              </div>
            )}
            {respostaVazia && <p id="resposta-error" className="text-red-500 text-sm mt-1">{mensagem}</p>}
          </div>

          {/* Botões */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            {manifestacao?.status !== 'Finalizado' && (
              <button
                type="button"
                onClick={enviarResposta}
                disabled={enviando || !respostaAdminInput.trim()}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md shadow transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? "Enviando..." : "Enviar Resposta e Finalizar"}
              </button>
            )}

            {/* Botão de PDF */}
            <RelatorioVerDetalhes
              manifestacao={manifestacao}
              vereadorNome={vereadorNome}
              ouvidorNome = {ouvidor?.nome_responsavel || "Não informado"}
            />
          </div>

          {mensagem && !respostaVazia && (
            <p
              className={`mt-4 text-center font-semibold ${mensagem.startsWith("Erro") ? "text-red-600" : "text-green-600"}`}
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
