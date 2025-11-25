import jsPDF from "jspdf";

export const gerarComprovantePDF = (dados, numProtocolo, listaVereadores) => {
  try {
    const doc = new jsPDF();
    let yPos = 20;
    const margemEsquerda = 15;
    const margemDireita = 195;
    const larguraUtil = margemDireita - margemEsquerda;

    // Cabeçalho
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Comprovante de Registro - Ouvidoria", margemEsquerda, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, margemEsquerda, yPos);

    yPos += 15;
    
    // Protocolo em destaque
    doc.setFillColor(230, 230, 230); // Cinza claro
    doc.rect(margemEsquerda, yPos - 5, 180, 15, "F"); // Fundo do protocolo
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Protocolo: ${numProtocolo}`, margemEsquerda + 5, yPos + 5);
    
    yPos += 25;

    // Dados da Manifestação
    doc.setFontSize(12);
    doc.text("Detalhes da Manifestação:", margemEsquerda, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    // Busca o nome do vereador na lista passada
    const vereadorSelecionado = listaVereadores.find(v => String(v.id) === String(dados.vereador));
    const nomeVereador = vereadorSelecionado ? vereadorSelecionado.nome_completo : "Não informado";

    const linhas = [
      `Vereador Destino: ${nomeVereador}`,
      `Tipo: ${dados.tipoManifestacao}`,
      `Assunto: ${dados.assunto}`,
    ];

    doc.setFont("helvetica", "normal");
    linhas.forEach(linha => {
      doc.text(linha, margemEsquerda, yPos);
      yPos += 7;
    });

    // Descrição
    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Mensagem:", margemEsquerda, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    
    const linhasMensagem = doc.splitTextToSize(dados.mensagem, larguraUtil);
    doc.text(linhasMensagem, margemEsquerda, yPos);
    yPos += (linhasMensagem.length * 5) + 10;

    // Identificação
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Dados do Solicitante:", margemEsquerda, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    if (dados.identificacao === 'anonimo') {
      doc.text("Identificação: Anônima", margemEsquerda, yPos);
    } else {
      doc.text(`Nome: ${dados.nome}`, margemEsquerda, yPos);
      yPos += 7;
      doc.text(`CPF: ${dados.cpf}`, margemEsquerda, yPos);
      yPos += 7;
      doc.text(`Telefone: ${dados.telefone}`, margemEsquerda, yPos);
    }

    yPos += 20;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Este documento comprova o envio da sua manifestação. Guarde o número de protocolo.", margemEsquerda, yPos);

    // Salvar e Baixar
    doc.save(`comprovante_ouvidoria_${numProtocolo}.pdf`);

  } catch (err) {
    console.error("Erro ao gerar comprovante PDF:", err);
  }
};