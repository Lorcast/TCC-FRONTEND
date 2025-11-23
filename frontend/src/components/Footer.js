import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Footer = () => {
  const [info, setInfo] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    denuncia: 0,
    elogio: 0,
    sugestao: 0,
    reclamacao: 0,
    outros: 0
  });

  useEffect(() => {
    const fetchInfo = async () => {
      const { data } = await supabase
        .from("ouvidor")
        .select("*")
        .eq("id", 1)
        .single();

      setInfo(data);
    };

    const fetchStats = async () => {
      const { data } = await supabase
        .from("solicitacoes")
        .select("tipo");

      if (!data) return;

      setStats({
        total: data.length,
        denuncia: data.filter((i) => i.tipo === "denuncia").length,
        elogio: data.filter((i) => i.tipo === "elogio").length,
        sugestao: data.filter((i) => i.tipo === "sugestao").length,
        reclamacao: data.filter((i) => i.tipo === "reclamacao").length,
        outros: data.filter((i) => i.tipo === "outros").length,
      });
    };

    fetchInfo();
    fetchStats();
  }, []);

  if (!info) return null;

  return (
    <footer className="w-full bg-gray-900 text-gray-200 py-12 border-t border-gray-700">
      <div className="max-w-6xl mx-auto px-6">

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

         
          <div className="bg-gray-800 p-5 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Informações do Ouvidor
            </h3>
            <ul className="text-sm space-y-2">
              <li><b>Responsável:</b> {info.nome_responsavel}</li>
              <li><b>Setor:</b> {info.setor}</li>
              <li><b>Localização:</b> {info.localizacao}</li>
            </ul>
          </div>

          
          <div className="bg-gray-800 p-5 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              manifestações da Ouvidoria
            </h3>
            <ul className="text-sm space-y-2">
              <li><b>Total:</b> {stats.total}</li>
              <li><b>Denúncias:</b> {stats.denuncia}</li>
              <li><b>Elogios:</b> {stats.elogio}</li>
              <li><b>Sugestões:</b> {stats.sugestao}</li>
              <li><b>Reclamações:</b> {stats.reclamacao}</li>
              <li><b>Outros:</b> {stats.outros}</li>
            </ul>
          </div>

        </div>

         <div className="mt-12 flex justify-center">
          <img
            src="/logoOuvir.png"    
            alt="Logo"
            className="w-40 opacity-90 hover:opacity-100 transition"
          />
        </div>


      </div>
    </footer>
  );
};

export default Footer;