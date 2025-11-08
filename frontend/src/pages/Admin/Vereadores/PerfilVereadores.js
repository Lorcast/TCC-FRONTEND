// src/pages/Admin/Vereadores/PerfilVereadores.js
import { useState, useEffect, useCallback } from "react"; // Adicionado useCallback
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { GoArrowLeft } from "react-icons/go";
import ProtecaoAdmin from "../../../components/ProtecaoAdmin";
import Paginacao from "../../../components/Paginacao";
import NavBar from "../../../components/NavBar"; // Importar NavBar


const PerfilVereadores = () => {
  const [nome, setNome] = useState("");
  const [vereadores, setVereadores] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limite = 10; // Definido como constante

  const navigate = useNavigate();

  // Envolvemos fetchVereadores com useCallback
  const fetchVereadores = useCallback(async (filtroNome = "", offsetAtual = 0) => {
    setCarregando(true);
    setErro(null);

    try {
      let query = supabase
        .from("vereadores")
        .select("id, nome_completo, partido, email_contato, legislatura, situacao", { count: "exact" });

      if (filtroNome.trim() !== "") {
        // Usar filtroNome que vem do parâmetro da função
        query = query.ilike("nome_completo", `%${filtroNome.trim()}%`);
      }

      query = query
        .order("nome_completo", { ascending: true })
        .range(offsetAtual, offsetAtual + limite - 1);

      const { data, count, error: queryError } = await query;

      if (queryError) throw queryError;

      setVereadores(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error("Erro ao buscar vereadores:", err);
      setErro("Não foi possível carregar os vereadores. Tente novamente.");
      setVereadores([]); // Limpa vereadores em caso de erro
      setTotal(0);     // Zera total em caso de erro
    } finally {
      setCarregando(false);
    }
  }, [limite]); // useCallback depende de 'limite' (se fosse variável)

  // useEffect agora busca baseado em 'offset' e 'nome', usando a função memorizada
  useEffect(() => {
    // Passa o estado 'nome' atual para a função fetchVereadores
    fetchVereadores(nome, offset);
  }, [offset, nome, fetchVereadores]); // Adicionado 'nome' e 'fetchVereadores'

  const aplicarFiltros = () => {
    // Ao aplicar filtros, resetamos o offset e chamamos fetchVereadores diretamente
    // Não precisamos mais do useEffect para reagir à mudança de 'nome' aqui,
    // pois ele já faz isso. Apenas resetamos a página.
    setOffset(0);
    // fetchVereadores(nome, 0); // O useEffect acima já vai disparar com o novo 'nome' (se mudar) e offset 0
  };

   const limparFiltros = () => {
    setNome("");
    setOffset(0);
    // fetchVereadores("", 0); // O useEffect vai cuidar disso quando 'nome' e 'offset' atualizarem
  };

  return (
    <ProtecaoAdmin>
       <div className="min-h-screen flex flex-col bg-gray-100">
        <NavBar /> {/* Adiciona o NavBar */}
        <main className="flex-1 p-6 pt-20"> {/* Adiciona padding-top para não ficar sob o NavBar */}

        <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-blue-700 cursor-pointer text-2xl w-fit mb-4"
        aria-label="Voltar"
      >
        <GoArrowLeft />
      </button>

        {/* Filtros */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6"> {/* Ajustado margin */}
          <h2 className="text-xl font-semibold mb-4">Gerenciar Vereadores</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"> {/* Ajustado gap e items-end */}
            <div className="md:col-span-4"> {/* Campo de nome ocupa mais espaço */}
              <label htmlFor="nome-vereador-input" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Vereador
              </label>
              <input
                id="nome-vereador-input"
                type="text"
                placeholder="Digite o nome para buscar..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                // Aplica filtro ao pressionar Enter
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
             {/* Botão Buscar movido para perto do input */}
             <button
              onClick={aplicarFiltros}
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow hover:bg-blue-700 transition w-full md:w-auto" // Ajustado estilo e cor
            >
              Buscar
            </button>
            

          </div>

          <div className="flex justify-end mt-4"> {/* Botão Novo separado */}
            <button
              onClick={() => navigate("/admin/vereadores/cadastro")}
              className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-green-700 transition" // Ajustado estilo e cor
            >
              Novo Vereador
            </button>
          </div>
        </div>

         {/* Feedback de Carregando e Erro */}
        {carregando && <p className="text-center mt-4 text-gray-600">Carregando...</p>}
        {erro && <p className="text-center mt-4 text-red-600">{erro}</p>}


        {/* Tabela de Vereadores (só mostra se não estiver carregando e não houver erro) */}
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
                          {/* Remove aspas da situação vinda do banco */}
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

              {/* Paginação (só mostra se houver vereadores) */}
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