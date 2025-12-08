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
      className="mt-8 flex flex-col items-center gap-4 animate-fade-in"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Botón Anterior */}
        <button
          onClick={() => handle(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className={`group flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm border border-slate-200 hover:border-indigo-200"
          }`}
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Páginas */}
        <div
          className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-full"
          aria-live="polite"
          aria-atomic="true"
        >
          {pages.map((p, i) =>
            p === "start-ellipsis" || p === "end-ellipsis" ? (
              <span
                key={p + i}
                className="w-8 h-8 flex items-center justify-center text-slate-400 select-none text-xs"
              >
                •••
              </span>
            ) : (
              <button
                key={p}
                onClick={() => handle(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 ${
                  p === currentPage
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                    : "text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                }`}
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
          className={`group flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm border border-slate-200 hover:border-indigo-200"
          }`}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Texto informativo */}
      <div className="text-xs font-medium text-slate-400 select-none">
        Página <span className="text-slate-700">{currentPage}</span> de{" "}
        <span className="text-slate-700">{totalPages}</span>
      </div>
    </nav>
  );
}
