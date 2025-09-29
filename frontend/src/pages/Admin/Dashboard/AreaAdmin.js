import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import Navbar from "../../../components/NavBar";
import ProtecaoAdmin from "../../../components/ProtecaoAdmin";
import BuscaRelatorio from "../../../components/BuscaRelatorio";

const Dashboard = () => {
  const [manifestacoes, setManifestacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [filtrosAtuais, setFiltrosAtuais] = useState({});
  const registrosPorPagina = 10;
  const navigate = useNavigate();

  const fetchManifestacoes = async (filtros = {}, paginaAtual = pagina) => {
    setCarregando(true);
    setFiltrosAtuais(filtros);

    const temFiltros =
      filtros.protocolo || filtros.vereador || filtros.tipo || filtros.status || filtros.data;
    setFiltroAtivo(!!temFiltros);

    let query = supabase
      .from("solicitacoes")
      .select(
        `
        id, protocolo, solicitante_nome, tipo, created_at, status, descricao,
        resposta_admin, vereadores (nome_completo)
      `,
        { count: "exact" }
      );

    if (filtros.protocolo) query = query.eq("protocolo", filtros.protocolo);
    if (filtros.vereador) query = query.eq("id_vereador_destino", filtros.vereador);
    if (filtros.tipo) query = query.eq("tipo", filtros.tipo);
    if (filtros.status) query = query.eq("status", filtros.status);
    if (filtros.data) query = query.eq("created_at", filtros.data);

    // Paginação
    const inicio = (paginaAtual - 1) * registrosPorPagina;
    const fim = inicio + registrosPorPagina - 1;
    query = query.range(inicio, fim).order("created_at", { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      console.error("Erro ao carregar manifestações:", error);
      setManifestacoes([]);
      setTotalRegistros(0);
    } else {
      setManifestacoes(data || []);
      setTotalRegistros(count || 0);
    }

    setCarregando(false);
  };

  useEffect(() => {
    fetchManifestacoes({}, pagina);
  }, [pagina]);

  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

  const irParaProxima = () => {
    if (pagina < totalPaginas) setPagina(pagina + 1);
  };

  const irParaAnterior = () => {
    if (pagina > 1) setPagina(pagina - 1);
  };

  return (
    <ProtecaoAdmin>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-4">Painel do Administrador</h1>

          <BuscaRelatorio
            onFiltrar={(filtros) => {
              setPagina(1);
              fetchManifestacoes(filtros, 1);
            }}
          />

          {carregando ? (
            <p className="text-center mt-4 text-gray-700">Carregando manifestações...</p>
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
                          m.status === "em Análise"
                            ? "bg-gray-200"
                            : m.status === "Finalizado"
                            ? "bg-blue-100"
                            : m.status === "Pendente"
                            ? "bg-green-200"
                            : ""
                        }`}
                      >
                        <td className="px-2 py-1 border font-mono">{m.protocolo}</td>
                        <td className="px-2 py-1 border">{m.is_anonimo ? "Anônimo" : m.solicitante_nome}</td>
                        <td className="px-2 py-1 border">{m.tipo}</td>
                        <td className="px-2 py-1 border">{m.vereadores?.nome_completo || "N/D"}</td>
                        <td className="px-2 py-1 border">{m.status}</td>
                        <td className="px-2 py-1 border truncate max-w-xs">{m.descricao}</td>
                        <td className="px-2 py-1 border">
                          {new Date(m.created_at).toLocaleDateString("pt-BR")}{" "}
                          {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </td>
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

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={irParaAnterior}
                  disabled={pagina === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <span>
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  onClick={irParaProxima}
                  disabled={pagina === totalPaginas}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtecaoAdmin>
  );
};

export default Dashboard;
