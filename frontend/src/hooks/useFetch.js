// src/hooks/useFetch.js
import { useState } from 'react';

export const useFetch = (url) => {
  const [enviando, setEnviando] = useState(false);
  const [numeroProtocolo, setNumeroProtocolo] = useState(null);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const enviar = async (formManifestação, resetForm) => {
    setErro(null);
    setMensagem(null);
    setNumeroProtocolo(null);
    setEnviando(true);

    const novoProtocolo = Math.floor(100000 + Math.random() * 900000);
    const dataHoraAtual = new Date().toLocaleString("pt-BR");

    const dadosEnviar = {
      ...formManifestação,
      protocolo: novoProtocolo,
      dataHora: dataHoraAtual,
      situacao: "Em análise",
      resposta: "",
      anexo: formManifestação.anexos ? formManifestação.anexos.name : null,
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosEnviar),
      });

       if (!res.ok) {
      throw new Error(`Erro ao salvar manifestação: ${res.statusText}`);
    }

    console.log("Manifestação salva com sucesso.");

    setNumeroProtocolo(novoProtocolo);
    resetForm();
  } catch (error) {
    const mensagemErro = `Erro ao enviar. Tente novamente mais tarde.`;

    console.error("Erro no envio:", mensagemErro);
    setErro(mensagemErro);
  } finally {
    
    setEnviando(false);
  }
};
  return { enviando, numeroProtocolo, erro, mensagem, enviar };
};
