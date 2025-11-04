// src/components/Paginacao.js
const Paginacao = ({ limite, total, offset, setOffset }) => {
  const totalPaginas = Math.ceil(total / limite) || 1;
  const paginaAtual = Math.floor(offset / limite) + 1;

  const mudarPagina = (novaPagina) => {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    setOffset((novaPagina - 1) * limite);
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-4">
      <button
        onClick={() => mudarPagina(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Anterior
      </button>

      <span className="text-gray-700 font-medium">
        Página {paginaAtual} de {totalPaginas}
      </span>

      <button
        onClick={() => mudarPagina(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas || totalPaginas === 0}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Próxima
      </button>
    </div>
  );
};

export default Paginacao;