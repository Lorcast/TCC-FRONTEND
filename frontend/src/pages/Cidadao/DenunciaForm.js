import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import { supabase } from "../../supabaseClient";

const DenunciaForm = () => {
  const [formManifestacao, setFormManifestacao] = useState({
    vereador: "",
    tipoManifestacao: "",
    identificacao: "anonimo",
    assunto: "",
    mensagem: "",
    anexos: null,
    nome: "",
    telefone: "",
    cpf: "",
  });

  const [erros, setErros] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [protocolo, setProtocolo] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [vereadores, setVereadores] = useState([]);

  const navigate = useNavigate();

  // --- Buscar vereadores ativos ---
  useEffect(() => {
    const fetchVereadores = async () => {
      const { data, error } = await supabase
        .from("vereadores")
        .select("id, nome_completo")
        .eq("situacao", "Ativo")
        .order("nome_completo", { ascending: true });

      if (error) {
        console.error("Erro ao buscar vereadores:", error);
        setSubmitError(
          "Não foi possível carregar a lista de vereadores. Tente recarregar a página."
        );
      } else {
        setVereadores(data);
      }
    };

    fetchVereadores();
  }, []);

  
// Máscara de telefone
  const aplicarMascaraTelefone = (valor) => {
  return valor
    .replace(/\D/g, "")                     // remove tudo que não é número
    .replace(/(\d{2})(\d)/, "($1) $2")      // (00) 0
    .replace(/(\d{5})(\d)/, "$1-$2")        // (00) 00000-000
    .substring(0, 15);                      // limite tamanho
};

// Máscara de CPF
const aplicarMascaraCPF = (valor) => {
  return valor
    .replace(/\D/g, "") // remove tudo que não for número
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .substring(0, 14); // garante 000.000.000-00
};

// Validação de CPF
const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, "");

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  return resto === parseInt(cpf.charAt(10));
};
    
  // --- Controle de inputs ---
  const handleChange = (e) => {
    const { name, value } = e.target;

     if (name === "telefone") {
    const telMascarado = aplicarMascaraTelefone(value);
    setFormManifestacao((prev) => ({ ...prev, telefone: telMascarado }));
    return;
  }

    if (name === "cpf") {
    const cpfMascarado = aplicarMascaraCPF(value);
    setFormManifestacao((prev) => ({ ...prev, cpf: cpfMascarado }));
    return;
  }

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
      assunto: "",
      mensagem: "",
      anexos: null,
      nome: "",
      telefone: "",
      cpf: "",
      
    });
    document.getElementById("anexo-input").value = "";
  }, []);

  // --- Envio para Supabase ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const novosErros = {};

    if (!formManifestacao.vereador)
      novosErros.vereador = "Por favor, selecione um vereador.";
    if (!formManifestacao.tipoManifestacao)
      novosErros.tipoManifestacao =
        "Por favor, selecione um tipo de manifestação.";
    if (!formManifestacao.assunto.trim())
      novosErros.assunto = "Por favor, informe o assunto.";
    if (!formManifestacao.mensagem.trim())
      novosErros.mensagem = "Você precisa escrever algo para enviar.";
    else if (formManifestacao.mensagem.trim().length < 10)
      novosErros.mensagem =
        "Sua mensagem está muito curta (mínimo 10 caracteres).";

    if (formManifestacao.identificacao === "identificado") {
      if (!formManifestacao.cpf.trim())
    novosErros.cpf = "Informe seu CPF.";
  else if (!validarCPF(formManifestacao.cpf))
    novosErros.cpf = "CPF inválido.";
      if (!formManifestacao.nome.trim())
        novosErros.nome = "Informe seu nome.";
      if (!formManifestacao.telefone.trim())
        novosErros.telefone = "Informe um telefone.";
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});
    setSubmitError(null);
    setProtocolo(null);
    setIsSubmitting(true);

    try {
      // Upload do anexo 
      let caminhoAnexo = null;
      if (formManifestacao.anexos) {
        const file = formManifestacao.anexos;
        const safeFileName = file.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-.]/g, "");
        const filePath = `public/${Date.now()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("anexos-ouvidoria")
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        caminhoAnexo = filePath;
      }

      // Inserção da manifestação
      const dadosParaSalvar = {
        id_vereador_destino: formManifestacao.vereador,
        tipo: formManifestacao.tipoManifestacao,
        assunto: formManifestacao.assunto,
        descricao: formManifestacao.mensagem,
        is_anonimo: formManifestacao.identificacao === "anonimo",
        solicitante_nome:
          formManifestacao.identificacao === "identificado"
            ? formManifestacao.nome
            : null,
        solicitante_contato:
          formManifestacao.identificacao === "identificado"
            ? formManifestacao.telefone
            : null,
            solicitante_cpf:
    formManifestacao.identificacao === "identificado"
      ? formManifestacao.cpf
      : null,
        status: "Pendente",
      };

      const { data: solicitacao, error: insertError } = await supabase
        .from("solicitacoes")
        .insert(dadosParaSalvar)
        .select("id")
        .single();

      if (insertError) throw insertError;

      const novoId = solicitacao.id;

      // Geração de protocolo
      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, "0");
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const ano = String(hoje.getFullYear()).slice(-2);
      const numeroProtocoloGerado = `${dia}${mes}${ano}${String(
        novoId
      ).padStart(6, "0")}`;

      const { error: updateError } = await supabase
        .from("solicitacoes")
        .update({ protocolo: numeroProtocoloGerado })
        .eq("id", novoId);

      if (updateError) throw updateError;

      if (caminhoAnexo) {
        await supabase.from("anexos").insert({
          id_solicitacao: novoId,
          caminho_arquivo: caminhoAnexo,
          nome_original: formManifestacao.anexos.name,
        });
      }

      setProtocolo(numeroProtocoloGerado);
      resetForm();
    } catch (err) {
      console.error("Erro ao enviar manifestação:", err);
      setSubmitError(
        "Ocorreu um erro ao enviar sua manifestação. Detalhe: " + err.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- JSX ---
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg space-y-6"
        noValidate
      >
        {/* 🔹 Corrigido: botão agora é type="button" */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-blue-700 cursor-pointer text-2xl w-fit"
        >
          <GoArrowLeft />
        </button>

        <h2 className="text-xl font-bold text-center text-gray-700">
          Registrar Manifestação
        </h2>

        {/* Vereador */}
        <div>
          <label className="block font-medium mb-1">
            Vereador <span className="text-red-600">*</span>
          </label>
          <select
            name="vereador"
            value={formManifestacao.vereador}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Selecione...</option>
            {vereadores.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome_completo}
              </option>
            ))}
          </select>
          {erros.vereador && (
            <p className="text-red-500 text-sm mt-1">{erros.vereador}</p>
          )}
        </div>

        {/* Tipo de manifestação */}
        <div>
          <label className="block font-medium mb-1">
            Tipo de Manifestação <span className="text-red-600">*</span>
          </label>
          <select
            name="tipoManifestacao"
            value={formManifestacao.tipoManifestacao}
            onChange={handleChange}
            maxLength="14"
            className="w-full p-2 border rounded-md"
          >
            <option value="">Selecione...</option>
            <option value="denuncia">Denúncia</option>
            <option value="sugestao">Sugestão</option>
            <option value="elogio">Elogio</option>
            <option value="reclamacao">Reclamação</option>
            <option value="outros">Outros</option>
          </select>
          {erros.tipoManifestacao && (
            <p className="text-red-500 text-sm mt-1">
              {erros.tipoManifestacao}
            </p>
          )}
        </div>

        {/* Identificação */}
        <div>
          <label className="block font-medium mb-1">
            Identificação <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-4">
            {["anonimo", "identificado"].map((tipo) => (
              <label key={tipo} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="identificacao"
                  value={tipo}
                  checked={formManifestacao.identificacao === tipo}
                  onChange={handleChange}
                />
                {tipo === "anonimo" ? "Anônimo" : "Quero me identificar"}
              </label>
            ))}
          </div>
        </div>

        {formManifestacao.identificacao === "identificado" && (
          <>

           <div>
              <label className="block font-medium mb-1">
                CPF <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="cpf"
                placeholder="000.000.000-00"
                value={formManifestacao.cpf}                
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {erros.cpf && (
    <p className="text-red-500 text-sm mt-1">{erros.cpf}</p>
  )}
              
            </div>
            <div>
              <label className="block font-medium mb-1">
                Nome <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="nome"
                value={formManifestacao.nome}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {erros.nome && (
                <p className="text-red-500 text-sm mt-1">{erros.nome}</p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-1">
                Telefone <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                name="telefone"
                 placeholder="(00) 00000-0000"
                value={formManifestacao.telefone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {erros.telefone && (
                <p className="text-red-500 text-sm mt-1">{erros.telefone}</p>
              )}
            </div>
          </>
        )}

        {/* Assunto */}
        <div>
          <label className="block font-medium mb-1">
            Assunto <span className="text-red-600">*</span>
          </label>
          <textarea
            name="assunto"
            rows="1"
            value={formManifestacao.assunto}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
          {erros.assunto && (
            <p className="text-red-500 text-sm mt-1">{erros.assunto}</p>
          )}
        </div>

        {/* Mensagem */}
        <div>
          <label className="block font-medium mb-1">
            Mensagem <span className="text-red-600">*</span>
          </label>
          <textarea
            name="mensagem"
            rows="4"
            value={formManifestacao.mensagem}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
          {erros.mensagem && (
            <p className="text-red-500 text-sm mt-1">{erros.mensagem}</p>
          )}
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

        {/* Botão de envio */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-800 transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-wait"
          >
            {isSubmitting ? "Enviando..." : "Enviar Manifestação"}
          </button>
        </div>

        {/* Mensagens de feedback */}
        {protocolo && (
          <div className="text-green-700 p-4 rounded-md text-center">
            <p className="font-bold">Manifestação enviada com sucesso!</p>
            <p>
              Guarde seu número de protocolo:{" "}
              <strong>{protocolo}</strong>
            </p>
          </div>
        )}

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