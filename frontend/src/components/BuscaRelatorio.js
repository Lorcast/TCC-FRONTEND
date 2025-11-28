import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BuscaRelatorio = ({ filtrar }) => {
  // Estados dos filtros
  const [protocolo, setProtocolo] = useState("");
  const [vereador, setVereador] = useState("");
  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [assunto, setAssunto] = useState("");
  const [ouvidor, setOuvidor] = useState(null);
  
  // Novos estados para controle do PDF
  const [isGerandoPDF, setIsGerandoPDF] = useState(false); //evita cliques repetidos e mostra estado "gerando".
  const [mensagemFeedback, setMensagemFeedback] = useState(""); 

  // Estados das opções dos selects
  const [vereadoresOpcoes, setVereadoresOpcoes] = useState([]);
  const [tiposManifestacao, setTiposManifestacao] = useState([]);

  useEffect(() => {
       const fetchOpcoes = async () => {
      //Busca ouvidor
      const {data:ouvidorData, error:ouvidorError} = await supabase 
      .from("ouvidor")
      .select("*")
      .limit(1)
      .single();
      if(!ouvidorError) {
        setOuvidor(ouvidorData);
        }

      
      
      const { data: vereadoresData } = await supabase
        .from("vereadores")
        .select("id, nome_completo, situacao")
        .eq("situacao", "Ativo")
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
    setMensagemFeedback(""); 
    filtrar({ protocolo, vereador, tipo, status, dataInicial, dataFinal, assunto});
  };


  
  //Função principal para gerar o PDF
  const gerarPDF = async () => {
    setIsGerandoPDF(true);
    setMensagemFeedback("Gerando relatório... Isso pode levar alguns segundos.");

    try {
     
      let query = supabase
        .from("solicitacoes")
        .select(`
          id,
          protocolo,
          solicitante_nome,
          is_anonimo,
          tipo,
          created_at,
          status,
          assunto,
          vereadores ( nome_completo )
        `);

      // Aplicar os mesmos filtros da busca
      if (protocolo) query = query.ilike("protocolo", `%${protocolo}%`);
      if (vereador) query = query.eq("id_vereador_destino", vereador);
      if (tipo) query = query.eq("tipo", tipo);
      if (status) query = query.eq("status", status);
      if (dataInicial && dataFinal) {
        query = query.gte("created_at", dataInicial);
        query = query.lte("created_at", dataFinal);
      }
     if (assunto) query = query.ilike("assunto", `%${assunto}%`);

      // Ordenar, mas SEM paginar (.range())
      query = query.order("created_at", { ascending: false });

      // Executar a query para o PDF
      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        setMensagemFeedback("Nenhum dado encontrado para os filtros selecionados.");
        setIsGerandoPDF(false);
        return;
      }

      
      setMensagemFeedback(`Encontrados ${data.length} registros. Compilando PDF...`);

      const doc = new jsPDF({ orientation: "landscape" }); // 'landscape' (paisagem) é melhor para tabelas largas

      // Título
      doc.setFontSize(16);
      doc.text("Relatório de Manifestações", 14, 22);
      doc.setFontSize(10);
      doc.text(`Total de registros: ${data.length}`, 14, 28);
      doc.text(`Ouvidor responsável: ${ouvidor?.nome_responsavel || "Não informado"}`, 14, 39);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 34);

      // Definir colunas
      const colunas = [
        { header: "Protocolo", dataKey: "protocolo" },
        { header: "Data", dataKey: "data_formatada" },
        { header: "Nome", dataKey: "nome_formatado" },
        { header: "Tipo", dataKey: "tipo" },
        { header: "Vereador", dataKey: "vereador_formatado" },
        { header: "Status", dataKey: "status" },
        { header: "assunto", dataKey: "assunto" },
      ];

      // Formatar os dados para a tabela
      const dadosFormatados = data.map(item => ({
        ...item,
        data_formatada: new Date(item.created_at).toLocaleString("pt-BR"),
        nome_formatado: item.is_anonimo ? "Anônimo" : item.solicitante_nome || "Anônimo",
        vereador_formatado: item.vereadores?.nome_completo || "N/D",
      }));

      // Criar a tabela 
      autoTable(doc, {
        columns: colunas,
        body: dadosFormatados,
        startY: 40, // Posição inicial (abaixo dos títulos)
        theme: 'striped',
        headStyles: { fillColor: [13, 109, 253] }, // Um azul (R, G, B)
        columnStyles: {
          assunto: { cellWidth: 80 } // Quebra de linha para a coluna de mensagem
        }
      });

      // Salvar o arquivo
      doc.save("relatorio_manifestacoes.pdf");
      setMensagemFeedback(""); // Limpa a mensagem

    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      setMensagemFeedback(`Erro ao gerar PDF: ${err.message}`);
    } finally {
      setIsGerandoPDF(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 mt-10">
      <h2 className="text-xl font-semibold mb-4">Busca e Relatórios</h2>

     
      {mensagemFeedback && (
        <div 
          className={`p-4 mb-4 rounded-md ${
            mensagemFeedback.startsWith("Erro") 
              ? "bg-red-100 border border-red-400 text-red-700" 
              : "bg-blue-100 border border-blue-400 text-blue-700"
          }`}
        >
          {mensagemFeedback}
        </div>
      )}

     
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Protocolo"
          value={protocolo}
          onChange={(e) => setProtocolo(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Assunto"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
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
          value={dataInicial}
          onChange={(e) => setDataInicial(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="date"
          value={dataFinal}
          onChange={(e) => setDataFinal(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
       
      </div>

      <div className="flex justify-end mt-3 gap-2">
        <button
          onClick={aplicarFiltros}
          className="bg-green-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-green-800 transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-wait"
          disabled={isGerandoPDF}
        >
          Buscar
        </button>

       
        <button 
          onClick={gerarPDF}
          disabled={isGerandoPDF}
          className="bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-800 transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-wait"
        >
          {isGerandoPDF ? "Gerando..." : "Relatório"}
        </button>
      </div>
    </div>
  );
};

export default BuscaRelatorio;

