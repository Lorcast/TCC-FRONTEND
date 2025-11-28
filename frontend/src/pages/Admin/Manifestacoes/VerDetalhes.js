import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import { supabase } from "../../../supabaseClient";
import jsPDF from "jspdf";

const VerDetalhes = () => {
  const [carregando, setCarregando] = useState(false);
  const [error, setError] = useState();
  const [manifestacao, setManifestacao] = useState(null);
  const [respostaAdminInput, setRespostaAdminInput] = useState("");
  const [vereadorNome, setVereadorNome] = useState("Não informado");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [respostaVazia, setRespostaVazia] = useState(false);
  const [isGerandoPDF, setIsGerandoPDF] = useState(false);

  // Arquivo de resposta
  const [arquivoResposta, setArquivoResposta] = useState(null);

  const { protocolo } = useParams();
  const respostaRef = useRef(null);
  const navigate = useNavigate();

  const formatarCPF = (cpf) => {
    if (!cpf) return "Não informado";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Função para lidar com a seleção do arquivo
  const handleArquivoRespostaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 50 * 1024 * 1024) {
            alert("Arquivo muito grande (Máx 50MB)");
            e.target.value = "";
            setArquivoResposta(null);
            return;
        }
        setArquivoResposta(file);
    }
  };

  const fetchManifestacao = useCallback(async () => {
    if (!protocolo) {
      setError("Protocolo não fornecido.");
      return;
    }

    setCarregando(true);
    setError(null);
    try {
      const { data: dadosManifestacao, error: fetchError } = await supabase
        .from("vw_solicitacoes_admin")
        .select(`
          id,
          tipo,
          solicitante_nome,
          solicitante_cpf,
          solicitante_contato,
          protocolo,
          created_at,
          status,
          assunto,
          descricao,
          resposta_admin,
          data_resposta,
          id_vereador_destino
        `)
        .eq("protocolo", protocolo)
        .single();

      if (fetchError) throw fetchError;

      const { data: dadosAnexos, error: errorAnexos } = await supabase
        .from('anexos')
        .select('caminho_arquivo, nome_original, arquivo_resposta')
        .eq('id_solicitacao', dadosManifestacao.id);

      if (errorAnexos) console.error("Erro anexos:", errorAnexos);

      const data = { ...dadosManifestacao, anexos: dadosAnexos || [] };

      if (data.status === "Pendente") {
        await supabase.from("solicitacoes").update({ status: "Em análise" }).eq("id", data.id);
        data.status = "Em análise";
      }

      setManifestacao(data);
      setRespostaAdminInput(data.resposta_admin || "");

      if (data.id_vereador_destino) {
          const { data: vData } = await supabase.from("vereadores").select("nome_completo").eq("id", data.id_vereador_destino).single();
          setVereadorNome(vData?.nome_completo || "Não informado");
      } else {
          setVereadorNome("Não direcionado");
      }

    } catch (err) {
      setError(err.message || "Erro ao carregar.");
    } finally {
      setCarregando(false);
    }
  }, [protocolo]);

  useEffect(() => {
    fetchManifestacao();
  }, [fetchManifestacao]);

  const formatarDataHoraResposta = (dataISO) => {
    if (!dataISO) return null;
    try {
        const d = new Date(dataISO);
        return `Respondido em ${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
    } catch (e) { return null; }
  };

  const enviarResposta = async () => {
    const respostaDigitada = respostaAdminInput.trim();

    if (!respostaDigitada) {
      setMensagem("Escreva uma resposta.");
      setRespostaVazia(true);
      respostaRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setMensagem("");
    setRespostaVazia(false);
    setEnviando(true);

    try {
      const agora = new Date();

      const { data: updatedData, error: updateError } = await supabase
        .from("solicitacoes")
        .update({
          resposta_admin: respostaDigitada,
          data_resposta: agora.toISOString(),
          status: "Finalizado"
        })
        .eq("protocolo", protocolo)
        .select()
        .single();

      if (updateError) throw updateError;

      if (arquivoResposta) {
          const file = arquivoResposta;
          const safeFileName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-');
          const filePath = `respostas/${protocolo}-${Date.now()}-${safeFileName}`;

          const { error: uploadError } = await supabase.storage
            .from('anexos-ouvidoria')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          await supabase.from('anexos').insert({
              id_solicitacao: updatedData.id,
              caminho_arquivo: filePath,
              nome_original: file.name,
              arquivo_resposta: true
          });
      }

      setManifestacao(prev => ({ ...prev, ...updatedData, solicitante_cpf: prev.solicitante_cpf }));
      setRespostaAdminInput(updatedData.resposta_admin || "");
      setMensagem("Resposta enviada com sucesso!");
      
      fetchManifestacao();

    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
      setMensagem("Erro ao enviar resposta: " + err.message);
    } finally {
      setEnviando(false);
      setArquivoResposta(null);
    }
  };

  const gerarPDF = () => {
      if (!manifestacao) return;
      setIsGerandoPDF(true);
      try {
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text("Detalhes da Manifestação - Ouvidoria", 10, 20);
        
        doc.setFontSize(12);
        let y = 30;
        
        doc.text(`Protocolo: ${manifestacao.protocolo}`, 10, y);
        y += 10;
        doc.text(`Status: ${manifestacao.status}`, 10, y);
        y += 10;
        doc.text(`Tipo: ${manifestacao.tipo}`, 10, y);
        y += 10;
        doc.text(`Assunto: ${manifestacao.assunto || 'N/A'}`, 10, y);
        y += 10;
        
        if (manifestacao.solicitante_nome) {
            doc.text(`Solicitante: ${manifestacao.solicitante_nome}`, 10, y);
            y += 10;
            doc.text(`CPF: ${formatarCPF(manifestacao.solicitante_cpf)}`, 10, y);
            y += 10;
        } else {
            doc.text("Solicitante: Anônimo", 10, y);
            y += 10;
        }
        
        doc.text(`Vereador Destino: ${vereadorNome}`, 10, y);
        y += 15;
        
        doc.setFontSize(14);
        doc.text("Mensagem:", 10, y);
        y += 10;
        doc.setFontSize(12);
        
        const splitDesc = doc.splitTextToSize(manifestacao.descricao, 180);
        doc.text(splitDesc, 10, y);
        y += (splitDesc.length * 7) + 10;
        
        if (manifestacao.resposta_admin) {
            doc.setFontSize(14);
            doc.text("Resposta da Ouvidoria:", 10, y);
            y += 10;
            doc.setFontSize(12);
            
            const splitResp = doc.splitTextToSize(manifestacao.resposta_admin, 180);
            doc.text(splitResp, 10, y);
        }
        
        doc.save(`manifestacao_${manifestacao.protocolo}.pdf`);
      } catch (e) { 
        console.error(e); 
        alert("Erro ao gerar PDF");
      } finally { 
        setIsGerandoPDF(false); 
      }
  };

  const anexosCidadao = manifestacao?.anexos?.filter(a => !a.arquivo_resposta) || [];
  const anexosResposta = manifestacao?.anexos?.filter(a => a.arquivo_resposta) || [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-blue-700 text-2xl mb-4"><GoArrowLeft /></button>

      {carregando ? <p className="text-center mt-4">Carregando...</p> : 
       error ? <p className="text-center text-red-600">{error}</p> : 
       !manifestacao ? <p className="text-center">Não encontrado.</p> : (
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
           <h2 className="text-2xl font-bold mb-4 text-gray-800">Detalhes da Manifestação</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-b pb-4 text-sm text-gray-700">
             <div><span className="font-bold">Protocolo:</span> {manifestacao.protocolo}</div>
             <div><span className="font-bold">Status:</span> {manifestacao.status}</div>
             <div><span className="font-bold">Vereador:</span> {vereadorNome}</div>
             <div className="md:col-span-2 mt-2 bg-gray-50 p-3 rounded border">
                <p className="font-bold text-blue-900">Dados do Solicitante:</p>
                {manifestacao.solicitante_nome ? (
                    <>
                        <p>Nome: {manifestacao.solicitante_nome}</p>
                        <p>CPF: {formatarCPF(manifestacao.solicitante_cpf)}</p>
                        <p>Contato: {manifestacao.solicitante_contato}</p>
                    </>
                ) : <p>Anônimo</p>}
             </div>
           </div>

           <div className="mb-4">
                <p className="font-semibold text-gray-700">Descrição:</p>
                <p className="mt-1 bg-gray-50 p-3 rounded border whitespace-pre-wrap">{manifestacao.descricao}</p>
           </div>

          {anexosCidadao.length > 0 && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700">Anexos do Cidadão</h3>
                <ul className="list-disc list-inside mt-1">
                    {anexosCidadao.map((anexo, index) => (
                    <li key={index}>
                        <a href={`${supabase.storage.url}/object/public/anexos-ouvidoria/${anexo.caminho_arquivo}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        {anexo.nome_original}
                        </a>
                    </li>
                    ))}
                </ul>
            </div>
          )}

          <div className="mt-6 border-t pt-4">
            <label className="block font-semibold mb-2 text-gray-700">Resposta da Ouvidoria</label>
            
            {manifestacao.status !== 'Finalizado' ? (
               <div className="space-y-3">
                   <textarea
                     ref={respostaRef}
                     className={`w-full border rounded p-2 ${respostaVazia ? "border-red-500" : "border-gray-300"}`}
                     rows={5}
                     value={respostaAdminInput}
                     onChange={(e) => setRespostaAdminInput(e.target.value)}
                     disabled={enviando}
                     placeholder="Digite a resposta aqui..."
                   />
                   
                   <div>
                       <label className="block text-sm font-medium mb-1">Anexar arquivo à resposta (opcional):</label>
                       <input 
                           type="file" 
                           onChange={handleArquivoRespostaChange}
                           className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                       />
                   </div>
               </div>
            ) : (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-900">
                  <p className="whitespace-pre-wrap">{manifestacao.resposta_admin || '[Sem texto]'}</p>
                  
                  {manifestacao.data_resposta && (
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      {formatarDataHoraResposta(manifestacao.data_resposta)}
                    </p>
                  )}

                  {anexosResposta.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="font-bold text-xs uppercase mb-1">Anexos da Resposta:</p>
                          <ul className="list-disc list-inside text-sm">
                              {anexosResposta.map((anexo, index) => (
                                  <li key={index}>
                                      <a href={`${supabase.storage.url}/object/public/anexos-ouvidoria/${anexo.caminho_arquivo}`} target="_blank" rel="noreferrer" className="text-blue-700 underline font-medium">
                                          {anexo.nome_original}
                                      </a>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}
              </div>
            )}
             {respostaVazia && <p className="text-red-500 text-sm mt-1">{mensagem}</p>}
          </div>

          <div className="mt-6 flex gap-4 justify-center">
            {manifestacao?.status !== 'Finalizado' && (
              <button
                onClick={enviarResposta}
                disabled={enviando || !respostaAdminInput.trim()}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow transition disabled:opacity-50"
              >
                {enviando ? "Enviando..." : "Enviar Resposta"}
              </button>
            )}
            <button 
                onClick={gerarPDF} 
                disabled={isGerandoPDF}
                className="bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow hover:bg-blue-800 transition disabled:opacity-50"
            >
              {isGerandoPDF ? "Gerando..." : "Gerar Relatório"}
            </button>
          </div>
           {mensagem && !respostaVazia && <p className="text-center mt-2 font-bold text-green-600">{mensagem}</p>}
        </div>
      )}
    </div>
  );
};

export default VerDetalhes;