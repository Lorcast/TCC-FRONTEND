import React, { useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";

const url = "http://localhost:3000/manifestacoes";

const DenunciaForm = () => {
  const [formManifestacao, setFormManifestacao] = useState({
    vereador: "",
    tipoManifestacao: "",
    identificacao: "anonimo",
    mensagem: "",
    anexos: null,
    nome: "",
    telefone: "",
  });

  const [erros, setErros] = useState({});
  const { enviando, enviar, numeroProtocolo, erro, mensagem } = useFetch(url);
  const vereadores = ["Antonio", "José", "Alex", "Maria"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormManifestacao((prev) => ({ ...prev, [name]: value }));
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const novosErros = {};

    if (!formManifestacao.vereador) {
      novosErros.vereador = "Por favor, selecione um vereador.";
    }

    if (!formManifestacao.tipoManifestacao) {
      novosErros.tipoManifestacao = "Por favor, selecione um tipo"
    }

  if (!formManifestacao.mensagem.trim()) {
  novosErros.mensagem = "Você precisa escrever algo para enviar.";
} else if (formManifestacao.mensagem.trim().length < 10) {
  novosErros.mensagem = "Sua mensagem está muito curta.";
} else if (formManifestacao.mensagem.trim().length > 1000) {
  novosErros.mensagem = "A mensagem está muito longa.";
}

    if (formManifestacao.identificacao === "identificado") {
      const nome = formManifestacao.nome.trim();
      const telefone = formManifestacao.telefone.trim();
      const numeros = telefone.replace(/\D/g, "");

      if (!nome) {
        novosErros.nome = "Informe seu nome.";
      } else if (nome.length < 3) {
        novosErros.nome = "Nome deve ter pelo menos 3 letras.";
      } else if (nome.length > 50) {
        novosErros.nome = "Nome muito longo.";
      }

      if (!telefone) {
        novosErros.telefone = "Informe um telefone.";
      } else if (numeros.length < 10 || numeros.length > 11) {
        novosErros.telefone = "Telefone inválido.";
      }
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});
    await enviar(formManifestacao, resetForm);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6"
      >
        <h2 className="text-1xl font-bold text-center text-black-700">
  Campos obrigatórios estão marcados com <span className="text-red-600">*</span>
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
            {vereadores.map((v, i) => (
              <option key={i} value={v}>{v}</option>
            ))}
          </select>
          {erros.vereador && <p className="text-red-500 text-sm mt-1">{erros.vereador}</p>}
        </div>

        {/* Tipo de manifestação */}
        <div>
          <label className="block font-medium mb-1">Tipo de Manifestação <span className="text-red-600">*</span></label>
          <select
            name="tipoManifestacao"
            value={formManifestacao.tipoManifestacao}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Selecione...</option>
            <option value="denuncia">Denúncia</option>
            <option value="sugestao">Sugestão</option>
            <option value="elogio">Elogio</option>
            <option value="outros">Outros</option>
          </select>
          {erros.tipoManifestacao && (
              <p className="text-red-500 text-sm mt-1">{erros.tipoManifestacao}</p>
          )}
        </div>

        {/* Identificação */}
        <div>
          <label className="block font-medium mb-1">Identificação <span className="text-red-600">*</span></label>
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
                {tipo === "anonimo" ? "Anônimo" : "Identificado"}
              </label>
            ))}
          </div>
        </div>

        {/* Campos se identificado */}
        {formManifestacao.identificacao === "identificado" && (
          <>
            <div>
              <label className="block font-medium mb-1">
  Nome <span className="text-red-600">*</span>
</label>
              <input
                type="text"
                name="nome"
                maxLength={50}
                value={formManifestacao.nome}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {erros.nome && <p className="text-red-500 text-sm mt-1">{erros.nome}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1">
  Telefone <span className="text-red-600">*</span>
</label>
              <input
                type="tel"
                name="telefone"
                maxLength={15}
                value={formManifestacao.telefone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {erros.telefone && <p className="text-red-500 text-sm mt-1">{erros.telefone}</p>}
            </div>
          </>
        )}

        {/* Mensagem */}
        <div>
          <label className="block font-medium mb-1">
  Mensagem <span className="text-red-600">*</span>
</label>
          <textarea
            name="mensagem"
            rows="4"
            maxLength={1000}
            value={formManifestacao.mensagem}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
          {erros.mensagem && <p className="text-red-500 text-sm mt-1">{erros.mensagem}</p>}
        </div>

        {/* Anexo */}
       <div>
  <label className="block font-medium mb-1">Anexo (opcional)</label>
  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
    onChange={(e) => {
      const file = e.target.files[0];
      setFormManifestacao({
        ...formManifestacao,
        anexos: file || null,
      });
    }}
    className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  />

  {formManifestacao.anexos && (
    <div className="mt-2 text-sm text-gray-700">
      Arquivo selecionado: <strong>{formManifestacao.anexos.name}</strong>
      {["application/pdf", "image/jpeg", "image/png"].includes(formManifestacao.anexos.type) && (
        <div className="mt-1">
          <a
            href={URL.createObjectURL(formManifestacao.anexos)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Visualizar arquivo
          </a>
        </div>
      )}
    </div>
  )}
</div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            type="submit"
            disabled={enviando}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md w-full sm:w-auto disabled:opacity-50 text-center"
          >
            {enviando ? "Enviando..." : "Enviar Manifestação"}
          </button>

          <NavLink
            to="/consulta"
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md w-full sm:w-auto text-center"
          >
            Consultar Protocolo
          </NavLink>
        </div>

        {/* Protocolo */}
        {numeroProtocolo && (
          <div className="bg-green-100 text-green-700 font-semibold p-3 rounded-md text-center mt-4">
            Sua manifestação foi enviada com sucesso!<br />
            Protocolo nº {numeroProtocolo}
          </div>
          
        )}

        {erro && (
  <div className="bg-red-100 text-red-700 font-semibold p-3 rounded-md text-center mt-4">
    {erro}
  </div>
)}


      </form>
    </div>
  );
};

export default DenunciaForm;
