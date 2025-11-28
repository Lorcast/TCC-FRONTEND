import React from "react";

// Logica de validação
const FileInput = ({ onFileSelect }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const tamanhoMaximo = 50 * 1024 * 1024; // Limite do arquivo de 50MB

      if (file.size > tamanhoMaximo) {
        alert("O arquivo selecionado é muito grande. O limite é de 50MB.");
        e.target.value = ""; 
        onFileSelect(null); 
        return;
      }
      onFileSelect(file);
    } else {
      onFileSelect(null);
    }
  };

  return (
    <div>
      <label className="block font-medium mb-1">Anexo (opcional)</label>
      <input
        id="anexo-input"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.mp4,.avi,.mov,.mkv" // Formatos de arquivos aceitos
        onChange={handleFileChange}
        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <p className="text-xs text-gray-500 mt-1">
        Formatos aceitos: Imagens, PDF, Word e Vídeos (MP4, AVI, MOV). Máx: 50MB.
      </p>
    </div>
  );
};

export default FileInput;