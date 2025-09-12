// DenunciaForm.js
import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient"; // Importe o cliente Supabase!

const DenunciaForm = () => {
  // 3 -  Estado para o formulário
  const [formManifestacao, setFormManifestacao] = useState({
    vereador: "", // Agora vai guardar o ID do vereador
    tipoManifestacao: "",
    identificacao: "anonimo",
    mensagem: "",
    anexos: null, // Vai guardar o objeto do arquivo
    nome: "",
    telefone: "",
  });

  // Estados para controlar o fluxo da página
  const [erros, setErros] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [protocolo, setProtocolo] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [vereadores, setVereadores] = useState([]);

  const navigate = useNavigate();

  // 4 --- EFEITO PARA BUSCAR VEREADORES DO SUPABASE ---
  useEffect(() => {
    const fetchVereadores = async () => {
      // Busca na tabela 'vereadores', selecionando o id e o nome_completo
      const { data, error } = await supabase
        .from('vereadores')
        .select('id, nome_completo')
        .order('nome_completo', { ascending: true }); // Ordena por nome

      if (error) {
        console.error('Erro ao buscar vereadores:', error);
        setSubmitError("Não foi possível carregar a lista de vereadores. Tente recarregar a página.");
      } else {
        setVereadores(data);
      }
    };

    fetchVereadores();
  }, []); // O array vazio [] faz isso rodar apenas uma vez quando o componente carrega

  //5 -  Funções de controle do formulário (iguais às que você já tinha)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormManifestacao((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormManifestacao((prev) => ({ ...prev, anexos: file || null }));
  };

  const resetForm = useCallback(() => {
    setFormManifestacao({
      vereador: "",
      tipoManifestacao: "",
      identificacao: "anonimo",
      mensagem: "",
      anexos: null,
      nome: "",
      telefone: "",
    });
    // Limpa também o campo de arquivo no DOM
    document.getElementById('anexo-input').value = "";
  }, []);

  // 6 --- FUNÇÃO DE ENVIO PARA O SUPABASE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validação do formulário (sua lógica original, que é ótima!)
    const novosErros = {};
    if (!formManifestacao.vereador) {
        novosErros.vereador = "Por favor, selecione um vereador.";
    }
    if (!formManifestacao.tipoManifestacao) {
        novosErros.tipoManifestacao = "Por favor, selecione um tipo de manifestação.";
    }
    if (!formManifestacao.mensagem.trim()) {
        novosErros.mensagem = "Você precisa escrever algo para enviar.";
    } else if (formManifestacao.mensagem.trim().length < 10) {
        novosErros.mensagem = "Sua mensagem está muito curta (mínimo 10 caracteres).";
    }
    if (formManifestacao.identificacao === "identificado") {
        if (!formManifestacao.nome.trim()) {
            novosErros.nome = "Informe seu nome.";
        }
        if (!formManifestacao.telefone.trim()) {
            novosErros.telefone = "Informe um telefone.";
        }
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    // Limpa os erros e inicia o estado de envio
    setErros({});
    setSubmitError(null);
    setProtocolo(null);
    setIsSubmitting(true);

    try {
      // 2. Upload do anexo (se existir)
      let caminhoAnexo = null;
      if (formManifestacao.anexos) {
        // A CORREÇÃO:
const file = formManifestacao.anexos;

// "Limpa" o nome do arquivo para remover caracteres especiais e acentos
const safeFileName = file.name
  .normalize("NFD") // Separa os acentos das letras (ex: 'ç' vira 'c' e '¸')
  .replace(/[\u0300-\u036f]/g, "") // Remove os acentos que foram separados
  .toLowerCase() // Converte para minúsculas
  .replace(/\s+/g, '-') // Substitui espaços por hífens
  .replace(/[^\w-.]/g, ''); // Remove qualquer outro caractere que não seja letra, número, hífen, underscore ou ponto

const filePath = `public/${Date.now()}-${safeFileName}`;

const { error: uploadError } = await supabase.storage
  .from('anexos-ouvidoria')
  .upload(filePath, file); // Agora usa o caminho com o nome do arquivo limpo

        if (uploadError) throw uploadError; // Se der erro no upload, para tudo
        caminhoAnexo = filePath;
      }

      // 3. Preparar os dados para salvar na tabela 'solicitacoes'
      const dadosParaSalvar = {
        id_vereador_destino: formManifestacao.vereador,
        tipo: formManifestacao.tipoManifestacao,
        descricao: formManifestacao.mensagem,
        is_anonimo: formManifestacao.identificacao === 'anonimo',
        solicitante_nome: formManifestacao.identificacao === 'identificado' ? formManifestacao.nome : null,
        solicitante_contato: formManifestacao.identificacao === 'identificado' ? formManifestacao.telefone : null,
        status: 'Pendente'
      };

      // 4. Inserir a manifestação e pegar o ID dela de volta
      const { data: solicitacao, error: insertError } = await supabase
        .from('solicitacoes')
        .insert(dadosParaSalvar)
        .select('id')
        .single();

      if (insertError) throw insertError;
      const novoId = solicitacao.id;

      // 5. Gerar e salvar o número de protocolo (NOVA VERSÃO)
const hoje = new Date();
const dia = String(hoje.getDate()).padStart(2, '0');
const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Mês começa em 0, por isso +1
const ano = String(hoje.getFullYear()).slice(-2); // Pega os 2 últimos dígitos do ano

const numeroProtocoloGerado = `${dia}${mes}${ano}${String(novoId).padStart(6, '0')}`;

const { error: updateError } = await supabase
  .from('solicitacoes')
        .update({ protocolo: numeroProtocoloGerado })
        .eq('id', novoId);

      if (updateError) throw updateError;
      
      // 6. Salvar a referência do anexo na tabela 'anexos' (se houver)
      if (caminhoAnexo) {
        await supabase.from('anexos').insert({
          id_solicitacao: novoId,
          caminho_arquivo: caminhoAnexo,
          nome_original: formManifestacao.anexos.name
        });
      }

      // 7. Sucesso! Exibir protocolo e limpar o formulário
      setProtocolo(numeroProtocoloGerado);
      resetForm();

    } catch (err) {
      console.error("Erro ao enviar manifestação:", err);
      setSubmitError("Ocorreu um erro ao enviar sua manifestação. Por favor, tente novamente. Detalhe: " + err.message);
    } finally {
      setIsSubmitting(false); // Garante que o botão seja reativado no fim
    }
  };

  // 7 ---- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg space-y-6"
        noValidate
      >

        {/* Seta de Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-blue-700 cursor-pointer text-2xl w-fit"
        >
          ←
        </button>

        <h2 className="text-xl font-bold text-center text-gray-700">
          Registrar Manifestação
        </h2>
        
        {/* Vereador (agora populado pelo Supabase) */}
        <div>
          <label className="block font-medium mb-1">Vereador <span className="text-red-600">*</span></label>
          <select
            name="vereador"
            value={formManifestacao.vereador}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Selecione...</option>
            {vereadores.map((v) => (
              <option key={v.id} value={v.id}>{v.nome_completo}</option>
            ))}
          </select>
          {erros.vereador && <p className="text-red-500 text-sm mt-1">{erros.vereador}</p>}
        </div>

        {/* ... O resto do seu JSX (Tipo, Identificação, Nome, Telefone, Mensagem) continua o mesmo ... */}
        {/* Você só precisa garantir que os `name` dos inputs correspondem às chaves do estado `formManifestacao` */}
        
        {/* Tipo de manifestação */}
        <div>
          <label className="block font-medium mb-1">Tipo de Manifestação <span className="text-red-600">*</span></label>
          <select name="tipoManifestacao" value={formManifestacao.tipoManifestacao} onChange={handleChange} className="w-full p-2 border rounded-md">
            <option value="">Selecione...</option>
            <option value="denuncia">Denúncia</option>
            <option value="sugestao">Sugestão</option>
            <option value="elogio">Elogio</option>
            <option value="reclamacao">Reclamação</option>
            <option value="outros">Outros</option>
          </select>
          {erros.tipoManifestacao && <p className="text-red-500 text-sm mt-1">{erros.tipoManifestacao}</p>}
        </div>

        {/* Identificação */}
        <div>
            <label className="block font-medium mb-1">Identificação <span className="text-red-600">*</span></label>
            <div className="flex gap-4">
                {["anonimo", "identificado"].map((tipo) => (
                    <label key={tipo} className="flex items-center gap-2">
                        <input type="radio" name="identificacao" value={tipo} checked={formManifestacao.identificacao === tipo} onChange={handleChange} />
                        {tipo === "anonimo" ? "Anônimo" : "Quero me identificar"}
                    </label>
                ))}
            </div>
        </div>

        {/* Campos se identificado */}
        {formManifestacao.identificacao === "identificado" && (
            <>
                <div>
                    <label className="block font-medium mb-1">Nome <span className="text-red-600">*</span></label>
                    <input type="text" name="nome" value={formManifestacao.nome} onChange={handleChange} className="w-full p-2 border rounded-md"/>
                    {erros.nome && <p className="text-red-500 text-sm mt-1">{erros.nome}</p>}
                </div>
                <div>
                    <label className="block font-medium mb-1">Telefone <span className="text-red-600">*</span></label>
                    <input type="tel" name="telefone" value={formManifestacao.telefone} onChange={handleChange} className="w-full p-2 border rounded-md"/>
                    {erros.telefone && <p className="text-red-500 text-sm mt-1">{erros.telefone}</p>}
                </div>
            </>
        )}

        {/* Mensagem */}
        <div>
          <label className="block font-medium mb-1">Mensagem <span className="text-red-600">*</span></label>
          <textarea name="mensagem" rows="4" value={formManifestacao.mensagem} onChange={handleChange} className="w-full p-2 border rounded-md" />
          {erros.mensagem && <p className="text-red-500 text-sm mt-1">{erros.mensagem}</p>}
        </div>

        {/* Anexo */}
        <div>
          <label className="block font-medium mb-1">Anexo (opcional)</label>
          <input
            id="anexo-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileChange}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Botão de Envio */}
        <div className="flex justify-center">

          
            <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
            {isSubmitting ? "Enviando..." : "Enviar Manifestação"}
            </button>
        </div>

        {/* Mensagem de Sucesso (Protocolo) */}
        {protocolo && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md text-center">
            <p className="font-bold">Manifestação enviada com sucesso!</p>
            <p>Guarde seu número de protocolo para consulta: <strong>{protocolo}</strong></p>
          </div>
        )}

        {/* Mensagem de Erro */}
        {submitError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-center">
            <p className="font-bold">Erro no Envio</p>
            <p>{submitError}</p>
          </div>
        )}

      </form>
    </div>
  );
};

export default DenunciaForm;