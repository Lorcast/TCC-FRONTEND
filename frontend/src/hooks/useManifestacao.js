import { useState, useEffect } from "react";

export const useManifestacao = (url) => {
  const [manifestacao, setManifestacao] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!url) return; 

    const carregarManifestacao = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Erro ao buscar dados");

        const data = await res.json();
        setManifestacao(data);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    carregarManifestacao();
  }, [url]);

  return { manifestacao, carregando, erro };
};
