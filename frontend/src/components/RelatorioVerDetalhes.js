import React, { useState } from "react";
import jsPDF from "jspdf";

const RelatorioVerDetalhes = ({ manifestacao, vereadorNome, ouvidorNome }) => {
  const [isGerandoPDF, setIsGerandoPDF] = useState(false);

  const formatarDataHoraResposta = (dataISO) => {
    if (!dataISO) return null;
    try {
      const data = new Date(dataISO);
      if (isNaN(data.getTime())) return null;
      const dia = String(data.getDate()).padStart(2, "0");
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const ano = data.getFullYear();
      const hora = String(data.getHours()).padStart(2, "0");
      const minuto = String(data.getMinutes()).padStart(2, "0");
      return `Respondido em ${dia}/${mes}/${ano} às ${hora}:${minuto}`;
    } catch (e) {
      console.error("Erro ao formatar data_resposta:", dataISO, e);
      return null;
    }
  };

  const gerarPDF = () => {
    if (!manifestacao) return;
    setIsGerandoPDF(true);

    try {
      const doc = new jsPDF();
      let yPos = 20;
      const margemEsquerda = 15;
      const larguraMaximaTexto = 180;

      // --- Título ---
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Detalhes da Manifestação", margemEsquerda, yPos);
      yPos += 10;

      // --- Campos principais (Protocolo, Status, etc.) ---
      const adicionarCampo = (rotulo, valor) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(rotulo, margemEsquerda, yPos);

        doc.setFont("helvetica", "normal");
        const linhas = doc.splitTextToSize(valor, larguraMaximaTexto - 60);
        doc.text(linhas, margemEsquerda + 60, yPos);
        yPos += linhas.length * 5 + 3;
      };

      adicionarCampo("Protocolo:", manifestacao.protocolo);
      adicionarCampo(
        "Registrado em:",
        new Date(manifestacao.created_at).toLocaleString("pt-BR")
      );
      adicionarCampo("Status:", manifestacao.status);
      adicionarCampo("Tipo:", manifestacao.tipo);
      adicionarCampo("Solicitante:", manifestacao.solicitante_nome || "Anônimo");
      adicionarCampo("Vereador Destino:", vereadorNome);

      if (ouvidorNome && ouvidorNome !== "Não informado") {
        adicionarCampo("Ouvidor Responsável:", ouvidorNome);
      }

      yPos += 5;

      // --- Bloco de texto: Descrição ---
      const adicionarBlocoTexto = (rotulo, texto) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(rotulo, margemEsquerda, yPos);
        yPos += 6;

        doc.setFont("helvetica", "normal");
        const linhas = doc.splitTextToSize(texto || "[Não preenchido]", larguraMaximaTexto);
        doc.text(linhas, margemEsquerda, yPos);
        yPos += linhas.length * 5 + 5;
      };

      adicionarBlocoTexto("Descrição da Manifestação:", manifestacao.descricao);

      // --- Bloco de texto: Resposta da Ouvidoria ---
      adicionarBlocoTexto(
        "Resposta da Ouvidoria:",
        manifestacao.resposta_admin || "[Não respondido]"
      );

      // --- Data da resposta (se houver) ---
      if (manifestacao.data_resposta) {
        const dataFormatada = formatarDataHoraResposta(manifestacao.data_resposta);
        if (dataFormatada) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          yPos -= 3; // ajuste para ficar logo abaixo da resposta
          doc.text(dataFormatada, margemEsquerda, yPos);
          yPos += 10;
        }
      }

      // --- Salvar PDF ---
      doc.save(`manifestacao_${manifestacao.protocolo}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setIsGerandoPDF(false);
    }
  };

  return (
    <button
      type="button"
      onClick={gerarPDF}
      disabled={isGerandoPDF}
      className="bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-800 transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-wait"
    >
      {isGerandoPDF ? "Gerando PDF..." : "Gerar Relatório PDF"}
    </button>
  );
};

export default RelatorioVerDetalhes;