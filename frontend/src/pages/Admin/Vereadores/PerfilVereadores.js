import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { GoArrowLeft } from "react-icons/go";
import ProtecaoAdmin from "../../../components/ProtecaoAdmin";
import Paginacao from "../../../components/Paginacao";

const PerfilVereadores = () => {
  const [nome, setNome] = useState("");
  const [vereadores, setVereadores] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limite = 10;

  const navigate = useNavigate();

  const fetchVereadores = async (filtroNome = "", offsetAtual = 0) => {
    setCarregando(true);
    setErro(null);

    try {
      let query = supabase
        .from("vereadores")
        .select("id, nome_completo, partido, email_contato, legislatura, situacao", { count: "exact" });

      if (filtroNome.trim() !== "") {
        query = query.ilike("nome_completo", `%${filtroNome}%`);
      }

      query = query
        .order("nome_completo", { ascending: true })
        .range(offsetAtual, offsetAtual + limite - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      setVereadores(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error("Erro ao buscar vereadores:", err);
      setErro("Não foi possível carregar os vereadores. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    fetchVereadores(nome, offset);
  }, [offset]);

  const aplicarFiltros = () => {
    setOffset(0);
    fetchVereadores(nome, 0);
  };

  if (carregando)
    return <p className="text-center mt-10 text-gray-600">Carregando...</p>;

  if (erro)
    return <p className="text-center mt-10 text-red-600">{erro}</p>;

  return (
    <ProtecaoAdmin>
      <main className="flex-2 p-3 bg-gray-100">

        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1 text-gray-600 hover:text-blue-700 cursor-pointer text-2xl"
        >
          <GoArrowLeft />
        </button>

        {/* Filtros */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-2 mt-7 relative">
          <h2 className="text-xl font-semibold mb-4">Perfil Vereadores</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Digite o nome do vereador"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end mt-3 gap-2">
            <button
              onClick={aplicarFiltros}
              className="bg-green-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-green-800 transition w-full sm:w-auto"
            >
              Buscar
            </button>

            <button
              onClick={() => navigate("/admin/vereadores/cadastro")}
              className="bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-800 transition w-full sm:w-auto"
            >
              Novo
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-50">
              <tr className="bg-gray-200">
                <th className="px-2 py-1 border">Nome</th>
                <th className="px-2 py-1 border">Partido</th>
                <th className="px-2 py-1 border">E-mail</th>
                <th className="px-2 py-1 border">Legislatura</th>
                <th className="px-2 py-1 border">Situação</th>
                <th className="px-2 py-1 border">Ações</th>
              </tr>
            </thead>

            <tbody>
              {vereadores.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    Nenhum vereador encontrado.
                  </td>
                </tr>
              ) : (
                vereadores.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 border">{v.nome_completo}</td>
                    <td className="px-4 py-2 border">{v.partido}</td>
                    <td className="px-4 py-2 border">{v.email_contato}</td>
                    <td className="px-4 py-2 border">{v.legislatura ?? "—"}</td>
                    <td className="px-4 py-2 border">{v.situacao.replace(/'/g, "")}</td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => navigate(`/admin/vereadores/cadastro/${v.id}`)}
                        className="text-blue-600 underline text-sm"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <Paginacao
          limite={limite}
          total={total}
          offset={offset}
          setOffset={setOffset}
        />
      </main>
    </ProtecaoAdmin>
  );
};

export default PerfilVereadores;