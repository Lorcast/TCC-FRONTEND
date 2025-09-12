// src/pages/Admin/Dashboard/Dashboard.js
import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import Navbar from "../../../components/NavBar";
import ProtecaoAdmin from "../../../components/ProtecaoAdmin";

const Dashboard = () => {
  const [manifestacoes, setManifestacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManifestacoes = async () => {
      const { data, error } = await supabase
        .from("solicitacoes")
        .select(`
          id,
          protocolo,
          created_at,
          status,
          descricao,
          resposta_admin,
          vereadores (nome_completo)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar manifestações:", error);
      } else {
        setManifestacoes(data);
      }
      setLoading(false);
    };

    fetchManifestacoes();
  }, []);

  return (
    <ProtecaoAdmin>
      <div className="min-h-screen flex flex-col bg-gray-100">
        {/* Navbar */}
        <Navbar />

        {/* Conteúdo */}
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">Painel do Administrador</h1>

          {loading ? (
            <p className="text-center mt-4">Carregando manifestações...</p>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Protocolo</th>
                    <th className="p-2 border">Vereador</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Mensagem</th>
                    <th className="p-2 border">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {manifestacoes.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="p-2 border font-mono">{m.protocolo}</td>
                      <td className="p-2 border">{m.vereadores?.nome_completo || "N/D"}</td>
                      <td className="p-2 border">{m.status}</td>
                      <td className="p-2 border truncate max-w-xs">{m.descricao}</td>
                      <td className="p-2 border text-center">
                        <button className="text-blue-600 hover:underline">
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </ProtecaoAdmin>
  );
};

export default Dashboard;
