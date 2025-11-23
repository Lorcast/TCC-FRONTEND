import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import Navbar from "../../../components/NavBar";
import ProtecaoAdmin from "../../../components/ProtecaoAdmin";
import BuscaRelatorio from "../../../components/BuscaRelatorio";
import Paginacao from "../../../components/Paginacao";

const AreaAdmin = () => {
  const [manifestacoes, setManifestacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState(false);

  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limite = 10;

  const [filtrosAtuais, setFiltrosAtuais] = useState({});
  const navigate = useNavigate();

  const fetchManifestacoes = async (filtros = {}, offsetAtual = 0) => {
    setCarregando(true);

    const temFiltros =
      filtros.protocolo ||
      filtros.vereador ||
      filtros.tipo ||
      filtros.status ||
      filtros.dataInicial ||
      filtros.dataFinal ||
      filtros.assunto;

    setFiltroAtivo(!!temFiltros);

    let query = supabase
      .from("solicitacoes")
      .select(
        `
        id,
        protocolo,
        solicitante_nome,
        is_anonimo,
        tipo,
        created_at,
        status,
        assunto,
        resposta_admin,
        id_vereador_destino,
        vereadores ( nome_completo )
      `,
        { count: "exact" }
      );

    if (filtros.protocolo) query = query.ilike("protocolo", `%${filtros.protocolo}%`);
    if (filtros.vereador) query = query.eq("id_vereador_destino", filtros.vereador);
    if (filtros.tipo) query = query.eq("tipo", filtros.tipo);
    if (filtros.status) query = query.eq("status", filtros.status);

    if (filtros.dataInicial && filtros.dataFinal) {
      query = query.gte("created_at", filtros.dataInicial);
      query = query.lte("created_at", filtros.dataFinal);
    }

    if (filtros.assunto) query = query.ilike("assunto", `%${filtros.assunto}%`);

    query = query.order("created_at", { ascending: false }).range(offsetAtual, offsetAtual + limite - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error(error);
      setManifestacoes([]);
      setTotal(0);
    } else {
      setManifestacoes(data);
      setTotal(count);
    }

    setCarregando(false);
  };

  useEffect(() => {
    fetchManifestacoes(filtrosAtuais, offset);
  }, [offset, filtrosAtuais]);

  return (
    <ProtecaoAdmin>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />

        <main className="flex-1 p-6">
          <BuscaRelatorio
            filtrar={(filtros) => {
              setFiltrosAtuais(filtros);
              setOffset(0); // reseta a paginação ao filtrar
            }}
          />

          {carregando ? (
            <p className="text-center mt-4 text-gray-700">Carregando manifestações...</p>
          ) : manifestacoes.length === 0 ? (
            <p className="text-center mt-4 text-gray-700">
              {filtroAtivo ? "Nenhum resultado encontrado." : "Ainda não tem manifestação cadastrada."}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr className="bg-gray-200">
                      <th className="px-2 py-1 border">Protocolo</th>
                      <th className="px-2 py-1 border">Nome</th>
                      <th className="px-2 py-1 border">Tipo</th>
                      <th className="px-2 py-1 border">Vereador</th>
                      <th className="px-2 py-1 border">Status</th>
                      <th className="px-2 py-1 border">Assunto</th>
                      <th className="px-2 py-1 border">Data</th>
                      <th className="px-2 py-1 border text-center">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {manifestacoes.map((m) => (
                      <tr
                        key={m.id}
                        className={`hover:bg-gray-50 ${
                          m.status === "Pendente"
                            ? "bg-green-300"
                            : m.status === "Em análise"
                            ? "bg-orange-100"
                            : "bg-gray-200"
                        }`}
                      >
                        <td className="px-2 py-1 border font-mono">{m.protocolo}</td>

                        <td className="px-2 py-1 border">
                          {m.is_anonimo ? "Anônimo" : m.solicitante_nome || "Anônimo"}
                        </td>

                        <td className="px-2 py-1 border">{m.tipo}</td>

                        <td className="px-2 py-1 border">{m.vereadores?.nome_completo || "N/D"}</td>

                        <td className="px-2 py-1 border">{m.status}</td>

                        <td className="px-2 py-1 border truncate max-w-xs">{m.assunto}</td>

                        <td className="px-2 py-1 border">{new Date(m.created_at).toLocaleString("pt-BR")}</td>

                        <td className="px-2 py-1 border text-center">
                          <button
                            className="text-blue-600 underline text-sm"
                            onClick={() => navigate(`/admin/manifestacao/${m.protocolo}`)}
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Paginacao limite={limite} total={total} offset={offset} setOffset={setOffset} />
            </>
          )}
        </main>
      </div>
    </ProtecaoAdmin>
  );
};

export default AreaAdmin;