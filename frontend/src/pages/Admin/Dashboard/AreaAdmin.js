import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import Navbar from "../../../components/NavBar";
import ProtecaoAdmin from "../../../components/ProtecaoAdmin";
import BuscaRelatorio from "../../../components/BuscaRelatorio";
import Paginacao from "../../../components/Paginacao";

const Dashboard = () => {
  const [manifestacoes, setManifestacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState(false);

  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limite = 10;

  const navigate = useNavigate();

  const fetchManifestacoes = async (filtros = {}, offsetAtual = 0) => {
    setCarregando(true);

    const temFiltros =
      filtros.protocolo ||
      filtros.vereador ||
      filtros.tipo ||
      filtros.status ||
      filtros.data;
    setFiltroAtivo(!!temFiltros);

    let query = supabase
      .from("solicitacoes")
      .select(
        `
        id,
        protocolo,
        solicitante_nome,
        tipo,
        created_at,
        status,
        descricao,
        resposta_admin,
        id_vereador_destino,
        vereadores ( nome_completo )
      `,
        { count: "exact" }
      );

    if (filtros.protocolo) {
      query = query.ilike("protocolo", `%${filtros.protocolo}%`);
    }
    if (filtros.vereador) {
      query = query.eq("id_vereador_destino", filtros.vereador);
    }
    if (filtros.tipo) {
      query = query.eq("tipo", filtros.tipo);
    }
    if (filtros.status) {
      query = query.eq("status", filtros.status);
    }

    if (filtros.data) {
      const dataLocalInicio = new Date(`${filtros.data}T00:00:00`);
      const dataLocalFim = new Date(`${filtros.data}T23:59:59.999`);

      query = query
        .gte("created_at", dataLocalInicio.toISOString())
        .lte("created_at", dataLocalFim.toISOString());
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offsetAtual, offsetAtual + limite - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Erro ao carregar manifestações:", error);
      setManifestacoes([]);
      setTotal(0);
    } else {
      setManifestacoes(data || []);
      setTotal(count || 0);
    }

    setCarregando(false);
  };

  useEffect(() => {
    fetchManifestacoes({}, offset);
  }, [offset]);

  return (
    <ProtecaoAdmin>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-4">Painel do Administrador</h1>

          <BuscaRelatorio
            filtrar={(filtros) => {
              setOffset(0);
              fetchManifestacoes(filtros, 0);
            }}
          />

          {carregando ? (
            <p className="text-center mt-4 text-gray-700">
              Carregando manifestações...
            </p>
          ) : manifestacoes.length === 0 ? (
            <p className="text-center mt-4 text-gray-700">
              {filtroAtivo
                ? "Nenhum resultado encontrado para os filtros selecionados."
                : "Nenhuma manifestação cadastrada no sistema."}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 border">Protocolo</th>
                      <th className="px-2 py-1 border">Nome</th>
                      <th className="px-2 py-1 border">Tipo</th>
                      <th className="px-2 py-1 border">Vereador</th>
                      <th className="px-2 py-1 border">Status</th>
                      <th className="px-2 py-1 border">Mensagem</th>
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
                        <td className="px-2 py-1 border font-mono">
                          {m.protocolo}
                        </td>
                        <td className="px-2 py-1 border">
                          {m.is_anonimo
                            ? "Anônimo"
                            : m.solicitante_nome || "Anônimo"}
                        </td>
                        <td className="px-2 py-1 border">{m.tipo}</td>
                        <td className="px-2 py-1 border">
                          {m.vereadores?.nome_completo || "N/D"}
                        </td>
                        <td className="px-2 py-1 border">{m.status}</td>
                        <td className="px-2 py-1 border truncate max-w-xs">
                          {m.descricao}
                        </td>
                        <td className="px-2 py-1 border">
                          {new Date(m.created_at).toLocaleString("pt-BR")}
                        </td>
                        <td className="px-2 py-1 border text-center">
                          <button
                            className="text-blue-600 underline text-sm"
                            onClick={() =>
                              navigate(`/admin/manifestacao/${m.protocolo}`)
                            }
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Paginacao
                limite={limite}
                total={total}
                offset={offset}
                setOffset={setOffset}
              />
            </>
          )}
        </main>
      </div>
    </ProtecaoAdmin>
  );
};

export default Dashboard;