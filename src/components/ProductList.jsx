import React, { useEffect, useRef } from "react";
import ProductCard from "./ProductCard";

const PRODUCTS_PER_PAGE = 20;

export default function ProductList({
  products,
  onSelect,
  favorites,
  onToggleFav,
  currentPage,
  onPageChange,
}) {
  const listRef = useRef(null);

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  // Scroll al inicio cuando se cambia de página
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentPage]);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const renderPagination = () => {
    const pages = [];

    // Botón Anterior (si no estamos en la primera página)
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2 py-1 mx-1 border rounded ${
          currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Anterior
      </button>
    );

    // Primera página
    pages.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`px-2 py-1 mx-1 border rounded ${
          currentPage === 1 ? "bg-blue-500 text-white" : ""
        }`}
      >
        1
      </button>
    );

    // Elipsis inicial
    if (currentPage > 3) {
      pages.push(
        <span key="start-ellipsis" className="mx-1 select-none">
          ...
        </span>
      );
    }

    // Páginas alrededor de la actual
    const pageRange = [currentPage - 1, currentPage, currentPage + 1].filter(
      (p) => p > 1 && p < totalPages
    );

    pageRange.forEach((p) => {
      pages.push(
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`px-2 py-1 mx-1 border rounded ${
            p === currentPage ? "bg-blue-500 text-white" : ""
          }`}
        >
          {p}
        </button>
      );
    });

    // Elipsis final
    if (currentPage < totalPages - 2) {
      pages.push(
        <span key="end-ellipsis" className="mx-1 select-none">
          ...
        </span>
      );
    }

    // Última página (solo si no es la primera)
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-2 py-1 mx-1 border rounded ${
            currentPage === totalPages ? "bg-blue-500 text-white" : ""
          }`}
        >
          {totalPages}
        </button>
      );
    }

    // Botón Siguiente (si no estamos en la última página)
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-2 py-1 mx-1 border rounded ${
          currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Siguiente
      </button>
    );

    return <div className="flex flex-wrap justify-center mt-6">{pages}</div>;
  };

  if (!products.length) {
    return (
      <div className="text-gray-500">No hay productos en esta categoría.</div>
    );
  }

  return (
    <div ref={listRef}>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentProducts.map((p) => (
          <li key={p.id || p.title}>
            <ProductCard
              product={p}
              onSelect={() => onSelect(p)}
              isFav={favorites.includes(p.id)}
              onToggleFav={() => onToggleFav(p.id)}
            />
          </li>
        ))}
      </ul>
      {renderPagination()}
    </div>
  );
}
