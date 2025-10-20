import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import { supabase } from "../../../supabaseClient";

const VerDetalhes = () => {
  const [carregando, setCarregando] = useState(false);
  const [error, setError] = useState();
  const [manifestacao, setManifestacao] = useState(null);
  const [respostaAdmin, setRespostaAdmin] = useState("");
  const [vereadorNome, setVereadorNome] = useState("Não informado");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [respostaVazia, setRespostaVazia] = useState(false);

  const { protocolo } = useParams();
  const respostaRef = useRef(null);
  const navigate = useNavigate();

  const fetchManifestacao = async () => {
    setCarregando(true);
    try {
      const { data, error } = await supabase
        .from("solicitacoes")
        .select(`tipo, solicitante_nome, protocolo, created_at, status,descricao, resposta_admin, id_vereador_destino, anexos ( caminho_arquivo, nome_original )
        `
        )
        .eq("protocolo", protocolo)
        .single();

      if (error) throw error;

      if (data.status === "Pendente") {
        await supabase
          .from("solicitacoes")
          .update({ status: "Em análise" })
          .eq("protocolo", protocolo);

        data.status = "Em análise";
      }

      setManifestacao(data);
      setRespostaAdmin(data.resposta_admin || "");

      if (data.id_vereador_destino) {
        const { data: vereadorData } = await supabase
          .from("vereadores")
          .select("nome_completo")
          .eq("id", data.id_vereador_destino)
          .single();
        setVereadorNome(vereadorData?.nome_completo ?? "Não informado");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    fetchManifestacao();
  }, [protocolo]);

  const enviarResposta = async () => {
    if (!respostaAdmin.trim()) {
      setMensagem("Escreva uma resposta.");
      setRespostaVazia(true);
      respostaRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setMensagem("");
    setRespostaVazia(false);
    setEnviando(true);

    try {
      const { error } = await supabase
        .from("solicitacoes")
        .update({ resposta_admin: respostaAdmin, status: "Finalizado" })
        .eq("protocolo", protocolo);

      if (error) throw error;

      setManifestacao((prev) => ({
        ...prev,
        resposta_admin: respostaAdmin,
        status: "Finalizado",
      }));

      setMensagem("Resposta enviada!");
    } catch (err) {
      setMensagem("Erro ao enviar: " + err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-blue-700 cursor-pointer text-2xl w-fit"
      >
        <GoArrowLeft />
      </button>
      {carregando ? (
        <p className="text-center mt-4 text-gray-700">
          Carregando...
        </p>
      ) : error ? (
        <p className="text-center mt-4 text-red-600">Erro: {error}</p>
      ) : !manifestacao ? (
        <p className="text-center mt-4 text-gray-700">
          Manifestação não encontrada.
        </p>
      ) : (
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Detalhes da Manifestação
          </h2>

          <div className="space-y-2">
            <p>
              <strong>Protocolo:</strong> {manifestacao.protocolo}
            </p>
            <p>
              <strong>Registrado em:</strong>{" "}
              {new Date(manifestacao.created_at).toLocaleString("pt-BR")}
            </p>
            <p>
              <strong>Status:</strong> {manifestacao.status}
            </p>
            <p>
              <strong>Tipo:</strong> {manifestacao.tipo}
            </p>
            <p>
              <strong>Vereador:</strong> {vereadorNome}
            </p>
            <p>
              <strong>Descrição:</strong> {manifestacao.descricao}
            </p>
          </div>

          <div>
            <h3 className="mt-6 text-xl font-semibold text-gray-700">Anexos</h3>
            {manifestacao.anexos?.length > 0 ? (
              <ul className="list-disc list-inside mt-2 space-y-1">
                {manifestacao.anexos.map((anexo, index) => (
                  <li key={index}>
                    <a
                      href={`https://lnktsgglrgheqtqtdkma.supabase.co/storage/v1/object/public/anexos-ouvidoria/${anexo.caminho_arquivo}`}
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
          </div>

          <div className="mt-6">
            <label className="block font-semibold mb-2 text-gray-700">
              Resposta do Admin
            </label>
            <textarea
              ref={respostaRef}
              className={`w-full border rounded p-2 ${
                respostaVazia ? "border-red-500" : "border-gray-300"
              }`}
              rows={5}
              value={respostaAdmin}
              onChange={(e) => setRespostaAdmin(e.target.value)}
              disabled={!!manifestacao?.resposta_admin}
            />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={enviarResposta}
              disabled={
                enviando ||
                !!manifestacao?.resposta_admin ||
                !respostaAdmin.trim()
              }
              className={`bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md shadow transition w-full sm:w-auto ${
      enviando ? "cursor-wait" : !!manifestacao?.resposta_admin ? "cursor-not-allowed" : ""
    }`}
            >
              {enviando ? "Enviando..." : "Enviar"}
            </button>


            
            <button className="bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-800 transition w-full sm:w-auto">
              Relatório
            </button>
          </div>

          {mensagem && (
            <p
              className={`mt-4 text-center font-semibold ${
                mensagem === "Resposta enviada!"
                  ? "text-green-600"
                  : "text-red-600"
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
