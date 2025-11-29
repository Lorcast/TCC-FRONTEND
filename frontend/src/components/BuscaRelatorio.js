import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf, FaGlobeAmericas, FaSearch } from "react-icons/fa";

const BuscaRelatorio = ({ filtrar }) => {
  // Estados dos filtros
  const [protocolo, setProtocolo] = useState("");
  const [vereador, setVereador] = useState("");
  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [assunto, setAssunto] = useState("");
  
  // Estados para controle do PDF e Feedback
  const [isGerandoPDF, setIsGerandoPDF] = useState(false); 
  const [mensagemFeedback, setMensagemFeedback] = useState(""); 
  const [nomeOuvidor, setNomeOuvidor] = useState(""); 

  // Estados das opções dos selects
  const [vereadoresOpcoes, setVereadoresOpcoes] = useState([]);
  const [tiposManifestacao, setTiposManifestacao] = useState([]);

  useEffect(() => {
    const fetchDadosIniciais = async () => {
      // Busca vereadores
      const { data: vereadoresData } = await supabase
        .from("vereadores")
        .select("id, nome_completo")
        .eq("situacao", "Ativo")
        .order("nome_completo");
      setVereadoresOpcoes(vereadoresData || []);

      // Busca tipos de manifestação
      const { data: tiposData } = await supabase
        .from("solicitacoes")
        .select("tipo");

      if (tiposData) {
        const unicos = [...new Set(tiposData.map((t) => t.tipo))];
        setTiposManifestacao(unicos);
      }

      // Busca o nome do Ouvidor (Tabela 'ouvidor')
      try {
        const { data: ouvidorData, error } = await supabase
          .from("ouvidor") 
          .select("nome_responsavel")
          .single();
        
        if (error) {
            // Tratamento de erro na busca do ouvidor ou erros de conexão/inesperados
            console.warn("Aviso ao buscar ouvidor:", error.message);
            setNomeOuvidor("Responsável pela Ouvidoria");
        } else if (ouvidorData) {
            setNomeOuvidor(ouvidorData.nome_responsavel);
        } else {
            setNomeOuvidor("Responsável pela Ouvidoria");
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar ouvidor:", error);
        setNomeOuvidor("Responsável pela Ouvidoria");
      }
    };

    fetchDadosIniciais();
  }, []);

  const aplicarFiltros = () => {
    setMensagemFeedback(""); 
    filtrar({ protocolo, vereador, tipo, status, dataInicial, dataFinal, assunto});
  };

  // FUNÇAO PARA GERAR PDF 
  const gerarPDF = async (tipoRelatorio) => {
    setIsGerandoPDF(true);
    setMensagemFeedback(`Gerando relatório ${tipoRelatorio === 'publico' ? 'Público' : 'Geral'}... Aguarde.`);

    try {
      const tabela = "solicitacoes"; 
      let query = supabase
        .from(tabela) 
        .select(`
          id,
          protocolo,
          solicitante_nome,
          is_anonimo,
          tipo,
          created_at,
          status,
          assunto,
          descricao, 
          vereadores ( nome_completo )
        `);

      // Aplicar filtros
      if (protocolo) query = query.ilike("protocolo", `%${protocolo}%`);
      if (vereador) query = query.eq("id_vereador_destino", vereador);
      if (tipo) query = query.eq("tipo", tipo);
      if (status) query = query.eq("status", status);
      if (dataInicial && dataFinal) {
        // Ajuste para pegar o dia final completo
        const dataFinalAjustada = new Date(dataFinal);
        dataFinalAjustada.setDate(dataFinalAjustada.getDate() + 1);
        query = query.gte("created_at", dataInicial);
        query = query.lt("created_at", dataFinalAjustada.toISOString());
      } else if (dataInicial) {
         query = query.gte("created_at", dataInicial);
      } else if (dataFinal) {
         const dataFinalAjustada = new Date(dataFinal);
         dataFinalAjustada.setDate(dataFinalAjustada.getDate() + 1);
         query = query.lt("created_at", dataFinalAjustada.toISOString());
      }

      if (assunto) query = query.ilike("assunto", `%${assunto}%`);

      // Ordenar por data
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw new Error(error.message);

      if (!data || data.length === 0) {
        setMensagemFeedback("Nenhum dado encontrado para os filtros selecionados.");
        setIsGerandoPDF(false);
        return;
      }

      // Configuração do PDF
      const isPublico = tipoRelatorio === "publico";
      
      // Público = Retrato | Geral = Paisagem
      const doc = new jsPDF({ orientation: isPublico ? "portrait" : "landscape" });

      // Título e Cabeçalho
      const tituloRelatorio = isPublico ? "Relatório Público de Transparência" : "Relatório Geral Administrativo";
      const corCabecalho = isPublico ? [46, 204, 113] : [13, 109, 253]; 
      doc.setFontSize(16);
      doc.text(tituloRelatorio, 14, 22);
      
      doc.setFontSize(10);
      // Exibe informações buscado no banco
      doc.text(`Ouvidor Responsável: ${nomeOuvidor}`, 14, 28);
      doc.text(`Total de registros: ${data.length}`, 14, 34);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 40);
      
      let startY = 45;

      if (isPublico) {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("* Este relatório não contém dados pessoais sensíveis, conforme LGPD.", 14, 46);
        startY = 50;
      } else {
         doc.setTextColor(0);
      }

      // Definição de Colunas e Dados
      let colunas = [];
      let dadosFormatados = [];

      if (isPublico) {
        // RELATÓRIO PÚBLICO (Dados limitados)
        colunas = [
          { header: "Data", dataKey: "data_formatada" },
          { header: "Tipo", dataKey: "tipo" },
          { header: "Status", dataKey: "status" },
          { header: "Vereador Destino", dataKey: "vereador_formatado" },
        ];

        dadosFormatados = data.map(item => ({
          data_formatada: new Date(item.created_at).toLocaleDateString("pt-BR"),
          tipo: item.tipo,
          status: item.status,
          vereador_formatado: item.vereadores?.nome_completo || "N/D",
        }));

      } else {
        // RELATÓRIO GERAL (Completo)
        colunas = [
          { header: "Protocolo", dataKey: "protocolo" },
          { header: "Data", dataKey: "data_formatada" },
          { header: "Nome", dataKey: "nome_formatado" },
          { header: "Tipo", dataKey: "tipo" },
          { header: "Vereador", dataKey: "vereador_formatado" },
          { header: "Status", dataKey: "status" },
          { header: "Assunto", dataKey: "assunto" },
        ];

        dadosFormatados = data.map(item => ({
          protocolo: item.protocolo,
          data_formatada: new Date(item.created_at).toLocaleString("pt-BR"),
          nome_formatado: item.is_anonimo ? "Anônimo" : item.solicitante_nome || "Anônimo",
          tipo: item.tipo,
          vereador_formatado: item.vereadores?.nome_completo || "N/D",
          status: item.status,
          assunto: item.assunto || "Sem assunto",
        }));
      }

      // Função Gerar Tabela 
      autoTable(doc, {
        columns: colunas,
        body: dadosFormatados,
        startY: startY,
        theme: 'striped',
        headStyles: { fillColor: corCabecalho },
        styles: { fontSize: isPublico ? 10 : 9 },
      });

      // Função Salvar Relatório
      const nomeArquivo = isPublico ? "relatorio_publico.pdf" : "relatorio_geral_admin.pdf";
      doc.save(nomeArquivo);
      
      setMensagemFeedback(`Relatório ${isPublico ? 'Público' : 'Geral'} gerado com sucesso!`);

    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      setMensagemFeedback(`Erro: ${err.message}`);
    } finally {
      setIsGerandoPDF(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 mt-10">
      <h2 className="text-xl font-semibold mb-4">Busca e Relatórios</h2>

      {mensagemFeedback && (
        <div 
          className={`p-3 mb-4 rounded-md text-sm font-medium ${
            mensagemFeedback.startsWith("Erro") 
              ? "bg-red-100 text-red-700 border border-red-200" 
              : "bg-blue-100 text-blue-700 border border-blue-200"
          }`}
        >
          {mensagemFeedback}
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <input type="text" placeholder="Protocolo" value={protocolo} onChange={(e) => setProtocolo(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        
        <select value={vereador} onChange={(e) => setVereador(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Todos os vereadores</option>
          {vereadoresOpcoes.map((v) => <option key={v.id} value={v.id}>{v.nome_completo}</option>)}
        </select>

        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Todos os tipos</option>
          {tiposManifestacao.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Todos os status</option>
          <option value="Pendente">Pendente</option>
          <option value="Em análise">Em análise</option>
          <option value="Finalizado">Finalizado</option>
        </select>

        <input 
        type="text" 
        placeholder="Assunto" 
        value={assunto} onChange={(e) => setAssunto(e.target.value)} 
        className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1 ml-1">De:</span>
            <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none w-full" />
        </div>

        <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1 ml-1">Até:</span>
            <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none w-full" />
        </div>

      </div>

      {/* Botões de Ação */}
      <div className="flex flex-wrap justify-end mt-6 gap-3  pt-4">
        
        {/* Botão Buscar (Principal) */}
        <button
          onClick={aplicarFiltros}
          disabled={isGerandoPDF}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50"
        >
          <FaSearch /> Buscar
        </button>

        {/* Botão Relatório GERAL */}
        <button 
          onClick={() => gerarPDF("geral")}
          disabled={isGerandoPDF}
          className="flex items-center gap-2 bg-gray-700 text-white font-semibold px-4 py-2 rounded-md shadow hover:bg-gray-800 transition disabled:opacity-50"
        >
          <FaFilePdf /> {isGerandoPDF ? "Gerando..." : "Relatório Geral"}
        </button>

        {/* Botão Relatório PÚBLICO */}
        <button 
          onClick={() => gerarPDF("publico")}
          disabled={isGerandoPDF}
          className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-md shadow hover:bg-green-700 transition disabled:opacity-50"
        >
          <FaGlobeAmericas /> {isGerandoPDF ? "Gerando..." : "Relatório Público"}
        </button>
      </div>
    </div>
  );
};

export default BuscaRelatorio;