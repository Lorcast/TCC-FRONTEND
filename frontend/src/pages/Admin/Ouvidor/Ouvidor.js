import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { GoArrowLeft } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import ProtecaoAdmin from "../../../components/ProtecaoAdmin";

const Ouvidor = () => {
  const [info, setInfo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState(null);
  const navigate = useNavigate();

  // BUSCAR INFORMAÇÕES NO BANCO
  useEffect(() => {
    const fetchInfo = async () => {
      const { data, error } = await supabase
        .from("ouvidor")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        console.error(error);
        setMensagemErro("Não foi possível carregar as informações.");
      } else {
        setInfo(data);
      }

      setCarregando(false);
    };

    fetchInfo();
  }, []);

  return (
    <ProtecaoAdmin>
      <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-lg shadow-md relative">
        
        {/* Botão voltar */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 text-gray-600 hover:text-blue-700 cursor-pointer text-2xl"
        >
          <GoArrowLeft />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">
          Informações do Ouvidor
        </h2>

        {/* Carregando */}
        {carregando && <p className="text-center">Carregando...</p>}

        {/* Erro */}
        {mensagemErro && (
          <p className="text-red-600 text-center mb-4">{mensagemErro}</p>
        )}

        {/* CARD COM AS INFORMAÇÕES */}
        {!carregando && info && (
          <div className="space-y-4">

            <div>
              <label className="block text-gray-700 font-medium">Responsável</label>
              <p className="p-2 bg-gray-100 rounded border">
                {info.nome_responsavel || "Não informado"}
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Setor</label>
              <p className="p-2 bg-gray-100 rounded border">
                {info.setor || "Não informado"}
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Localização</label>
              <p className="p-2 bg-gray-100 rounded border">
                {info.localizacao || "Não informado"}
              </p>
            </div>

          </div>
        )}
      </div>
    </ProtecaoAdmin>
  );
};

export default Ouvidor;
