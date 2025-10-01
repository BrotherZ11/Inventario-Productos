import React, { useEffect, useRef, useCallback } from "react";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";

const DEFAULT_PRODUCTS_PER_PAGE = 20;

export default function ProductList({
  products = [],
  onSelect = () => {},
  favorites = [],
  onToggleFav = () => {},
  currentPage = 1,
  onPageChange = () => {},
  productsPerPage = DEFAULT_PRODUCTS_PER_PAGE,
}) {
  const listRef = useRef(null);
  const firstItemRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage));
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  // scroll + focus first item on page change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // focus first card for keyboard users
    setTimeout(() => {
      try {
        firstItemRef.current?.focus?.();
      } catch {}
    }, 220);
  }, [currentPage]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage)
        onPageChange(page);
    },
    [currentPage, onPageChange, totalPages]
  );

  if (!products || products.length === 0) {
    return (
      <div
        ref={listRef}
        className="py-12 text-center text-gray-600"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-medium">
          No hay productos en esta categoría.
        </p>
        <p className="mt-2 text-sm">Prueba otra categoría o quita filtros.</p>
      </div>
    );
  }

  return (
    <section
      ref={listRef}
      aria-labelledby="product-list-heading"
      className="w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          id="product-list-heading"
          className="text-lg font-semibold text-gray-900"
        >
          Productos
        </h2>

        <div className="text-sm text-gray-600 hidden sm:block">
          Mostrando {currentProducts.length} de {products.length} resultados
        </div>
      </div>

      <ul
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        role="list"
      >
        {currentProducts.map((p, idx) => (
          <li key={p.id ?? p.title ?? idx} role="listitem">
            <div
              ref={idx === 0 ? firstItemRef : undefined}
              tabIndex={-1}
              className="h-full"
            >
              <ProductCard
                product={p}
                onSelect={() => onSelect(p)}
                isFav={
                  Array.isArray(favorites) ? favorites.includes(p.id) : false
                }
                onToggleFav={() => onToggleFav(p.id)}
              />
            </div>
          </li>
        ))}
      </ul>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
}
