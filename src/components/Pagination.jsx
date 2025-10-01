import React from "react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}) {
  if (totalPages <= 1) return null;

  const handle = (p) => {
    if (p >= 1 && p <= totalPages && p !== currentPage) onPageChange(p);
  };

  const pages = [];
  pages.push(1);

  // si la página actual está lejos de la primera, muestra elipsis
  if (currentPage > 3) pages.push("start-ellipsis");

  // rango de 3 páginas centradas en la actual
  const from = Math.max(2, currentPage - 1);
  const to = Math.min(totalPages - 1, currentPage + 1);
  for (let p = from; p <= to; p++) {
    pages.push(p);
  }

  // si la página actual está lejos de la última, muestra elipsis
  if (currentPage < totalPages - 2) pages.push("end-ellipsis");

  if (totalPages > 1) pages.push(totalPages);

  return (
    <nav
      role="navigation"
      aria-label="Paginación de productos"
      className="mt-6 flex flex-col items-center gap-2 sm:gap-3"
    >
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        {/* Botón Anterior */}
        <button
          onClick={() => handle(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border text-sm transition ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-100"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
          }`}
        >
          ←<span className="hidden sm:inline ml-1">Anterior</span>
        </button>

        {/* Páginas */}
        <div
          className="flex items-center"
          aria-live="polite"
          aria-atomic="true"
        >
          {pages.map((p, i) =>
            p === "start-ellipsis" || p === "end-ellipsis" ? (
              <span
                key={p + i}
                className="mx-1 sm:mx-2 text-gray-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => handle(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 mx-0.5 rounded-md border text-sm transition ${
                  p === currentPage
                    ? "bg-teal-500 text-white border-teal-500"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={() => handle(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border text-sm transition ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-100"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
          }`}
        >
          <span className="hidden sm:inline mr-1">Siguiente</span> →
        </button>
      </div>

      {/* Texto informativo */}
      <div className="text-xs text-gray-500 select-none">
        Página {currentPage} de {totalPages}
      </div>
    </nav>
  );
}
