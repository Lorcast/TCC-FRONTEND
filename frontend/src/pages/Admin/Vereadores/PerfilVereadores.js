import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { GoArrowLeft } from "react-icons/go";
import ProtecaoAdmin from "../../../components/ProtecaoAdmin";
import Paginacao from "../../../components/Paginacao";
import NavBar from "../../../components/NavBar";

const PerfilVereadores = () => { 
  const [nome, setNome] = useState("");
  const [legislatura, setLegislatura] = useState("");
  const [situacao, setSituacao] = useState(""); 
   
  const [filtrosAtivos, setFiltrosAtivos] = useState({
    nome: "",
    legislatura: "",
    situacao: ""
  });

  const [vereadores, setVereadores] = useState([]);
  const [legislaturas, setLegislaturas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limite = 10;

  const navigate = useNavigate();

  const fetchVereadores = useCallback(
    async (filtros, offsetAtual) => {
      setCarregando(true);
      setErro(null);

      try {
        let query = supabase
          .from("vereadores")
          .select(
            "id, nome_completo, partido, email_contato, legislatura, situacao",
            { count: "exact" }
          );

        if (filtros.nome.trim() !== "") {
          query = query.ilike("nome_completo", `%${filtros.nome.trim()}%`);
        }

        if (filtros.legislatura !== "") {
          query = query.eq("legislatura", filtros.legislatura);
        }

        if (filtros.situacao !== "") {
          query = query.eq("situacao", filtros.situacao);
        }

        query = query.order("nome_completo", { ascending: true })
                     .range(offsetAtual, offsetAtual + limite - 1);

        const { data, count, error: queryError } = await query;

        if (queryError) throw queryError;

        setVereadores(data || []);
        setTotal(count || 0);
      } catch (err) {
        console.error("Erro ao buscar vereadores:", err);
        setErro("Não foi possível carregar os vereadores. Tente novamente.");
        setVereadores([]);
        setTotal(0);
      } finally {
        setCarregando(false);
      }
    },
    [limite]
  );

  const fetchLegislaturas = async () => {
    try {
      const { data, error } = await supabase
        .from("vereadores")
        .select("legislatura");

      if (error) throw error;

      const legislaturasUnicas = Array.from(new Set(data.map(v => v.legislatura))).sort();
      setLegislaturas(legislaturasUnicas);
    } catch (err) {
      console.error("Erro ao buscar legislaturas:", err);
      setLegislaturas([]);
    }
  };

  useEffect(() => {
    fetchLegislaturas();
  }, []);

  useEffect(() => {
    fetchVereadores(filtrosAtivos, offset);
  }, [offset, filtrosAtivos, fetchVereadores]); 
  
  const aplicarFiltros = () => {
    setOffset(0); 
    setFiltrosAtivos({
        nome, 
        legislatura, 
        situacao
    });
  };

  return (
    <ProtecaoAdmin>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <NavBar />
        <main className="flex-1 p-6 pt-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-blue-700 cursor-pointer text-2xl w-fit mb-4"
            >
            <GoArrowLeft />
          </button>

          
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Gerenciar Vereadores</h2>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="md:col-span-2">
               <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do vereador"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  
                />
              </div>

             
              <div className="md:col-span-2">
                <select
                  value={legislatura}
                  onChange={(e) => setLegislatura(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Todas legislaturas</option>
                  {legislaturas.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              
              <div className="md:col-span-2">
                <select
                  value={situacao}
                  onChange={(e) => setSituacao(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Todas situações</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              
              <div className="md:col-span-6 mt-2 md:mt-0 flex gap-2">
                <button
                  onClick={aplicarFiltros}
                  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
                >
                  Buscar
                </button>
                
                <button
                  onClick={() => navigate("/admin/vereadores/cadastro")}
                  className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-green-700 transition ml-auto"
                >
                  Novo Vereador
                </button>
              </div>
            </div>
          </div>

          {carregando && <p className="text-center mt-4 text-gray-600">Carregando...</p>}
          {erro && <p className="text-center mt-4 text-red-600">{erro}</p>}

          {!carregando && !erro && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr className="bg-gray-200">
                      <th className="px-4 py-2 border-b">Nome</th>
                      <th className="px-4 py-2 border-b">Partido</th>
                      <th className="px-4 py-2 border-b">E-mail</th>
                      <th className="px-4 py-2 border-b">Legislatura</th>
                      <th className="px-4 py-2 border-b">Situação</th>
                      <th className="px-4 py-2 border-b text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vereadores.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-500 border-b">
                          Nenhum vereador encontrado com os filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      vereadores.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-100 transition border-b">
                          <td className="px-4 py-2">{v.nome_completo}</td>
                          <td className="px-4 py-2">{v.partido}</td>
                          <td className="px-4 py-2">{v.email_contato}</td>
                          <td className="px-4 py-2">{v.legislatura ?? "—"}</td>
                          <td className="px-4 py-2">{v.situacao ? v.situacao.replace(/'/g, "") : "—"}</td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => navigate(`/admin/vereadores/cadastro/${v.id}`)}
                              className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
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

              {vereadores.length > 0 && (
                <Paginacao
                  limite={limite}
                  total={total}
                  offset={offset}
                  setOffset={setOffset}
                />
              )}
            </>
          )}
        </main>
      </div>
    </ProtecaoAdmin>
  );
};

export default PerfilVereadores;