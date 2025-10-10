import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const BuscaRelatorio = ({ filtrar }) => {
  const [protocolo, setProtocolo] = useState("");
  const [vereador, setVereador] = useState("");
  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState("");

  const [vereadoresOpcoes, setVereadoresOpcoes] = useState([]);
  const [tiposManifestacao, setTiposManifestacao] = useState([]);

  useEffect(() => {
    const fetchOpcoes = async () => {
      const { data: vereadoresData } = await supabase
        .from("vereadores")
        .select("id, nome_completo")
        .order("nome_completo");
      setVereadoresOpcoes(vereadoresData || []);

      const { data: tiposData } = await supabase
        .from("solicitacoes")
        .select("tipo");

      if (tiposData) {
        const unicos = [...new Set(tiposData.map((t) => t.tipo))];
        setTiposManifestacao(unicos);
      }
    };

    fetchOpcoes();
  }, []);

  const aplicarFiltros = () => {
    filtrar({ protocolo, vereador, tipo, status, data });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Busca e Relatórios</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Protocolo"
          value={protocolo}
          onChange={(e) => setProtocolo(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <select
          value={vereador}
          onChange={(e) => setVereador(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Todos os vereadores</option>
          {vereadoresOpcoes.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nome_completo}
            </option>
          ))}
        </select>

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Todos os tipos</option>
          {tiposManifestacao.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Todos os status</option>
          <option value="Pendente">Pendente</option>
          <option value="Em análise">Em análise</option>
          <option value="Finalizado">Finalizado</option>
        </select>

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-end mt-3 gap-2">
        <button
          onClick={aplicarFiltros}
          className="bg-green-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-green-800 transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-wait"
        >
          Buscar
        </button>

        <button className="bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-800 transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-wait">
          Relatório
        </button>
      </div>
    </div>
  );
};

export default BuscaRelatorio;