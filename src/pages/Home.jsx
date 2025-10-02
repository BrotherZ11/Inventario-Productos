import React, { useEffect, useMemo, useState } from "react";
import useProducts from "../hooks/useProducts";
import Header from "../components/Header";
import CategoryNav from "../components/CategoryNav";
import ProductList from "../components/ProductList";
import ProductDetail from "../components/ProductDetail";
import { GOOGLE_CLIENT_ID } from "../config";

const PRODUCTS_PER_PAGE = 20;

export default function Home() {
  const {
    products,
    loading,
    error,
    favorites,
    setFavorites,
    user,
    setUser,
    fetchError,
  } = useProducts();

  const [category, setCategory] = useState("Todos");
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavorites, setShowFavorites] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const categories = useMemo(() => {
    const base = showFavorites
      ? products.filter((p) => favorites.includes(p.id))
      : products;

    const set = new Set();
    base.forEach((p) => set.add(p.category || "Sin categoria"));
    return ["Todos", ...Array.from(set).sort()];
  }, [products, favorites, showFavorites]);

  const shownByCategory = useMemo(() => {
    const base = showFavorites
      ? products.filter((p) => favorites.includes(p.id))
      : products;
    return category === "Todos"
      ? base
      : base.filter((p) => (p.category || "Sin categoria") === category);
  }, [products, favorites, category, showFavorites]);

  // Combina categoría + búsqueda: si hay búsqueda activa, mostrar searchResults intersectados con category/favorites
  const shown = useMemo(() => {
    if (searchResults && searchResults.length > 0) {
      // respetar showFavorites y category sobre los resultados
      return searchResults.filter((p) => {
        if (showFavorites && !favorites.includes(p.id)) return false;
        if (
          category !== "Todos" &&
          (p.category || "Sin categoria") !== category
        )
          return false;
        return true;
      });
    }
    return shownByCategory;
  }, [searchResults, shownByCategory, category, showFavorites, favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCategorySelect = (c) => {
    setCategory(c);
    setCurrentPage(1);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleShowFavorites = () => {
    setShowFavorites((prev) => {
      setSearchResults([]);
      setSearchQuery("");
      if (prev) {
        setCategory("Todos");
        setCurrentPage(1);
        return false;
      } else {
        setCurrentPage(1);
        return true;
      }
    });
  };

  const handleLogin = (userInfo) => {
    setUser(userInfo);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Abre producto desde la UI. Actualiza URL con ?shared=<id> (replaceState).
  const openProduct = (p) => {
    if (!p) return;
    setSelected(p);

    // calcular la página con respecto al listado completo (products)
    try {
      const idx = products.findIndex((x) => String(x.id) === String(p.id));
      if (idx >= 0) {
        const page = Math.floor(idx / PRODUCTS_PER_PAGE) + 1;
        setCurrentPage(page);
      }
    } catch (err) {
      // noop
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("shared", String(p.id));
      window.history.replaceState(
        {},
        document.title,
        url.pathname + url.search + url.hash
      );
    } catch {}
  };

  // Cierra ficha y limpia shared param de la URL
  const closeProduct = () => {
    setSelected(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("shared");
      if (url.hash && url.hash.startsWith("#product-")) url.hash = "";
      window.history.replaceState(
        {},
        document.title,
        url.pathname + url.search + url.hash
      );
    } catch {}
  };

  // Si la URL contiene ?shared=<id> o #product-<id>, abrir ese producto automáticamente
  useEffect(() => {
    if (!products || products.length === 0) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedId =
        params.get("shared") ||
        (window.location.hash && window.location.hash.startsWith("#product-")
          ? window.location.hash.replace("#product-", "")
          : null);

      if (!sharedId) return;

      const foundIndex = products.findIndex(
        (p) => String(p.id) === String(sharedId)
      );
      if (foundIndex >= 0) {
        const found = products[foundIndex];
        // asegurar que el producto sea visible: llevar a la página correcta
        const page = Math.floor(foundIndex / PRODUCTS_PER_PAGE) + 1;
        setCurrentPage(page);
        setSelected(found);

        // limpiar la URL para evitar reapertura al recargar
        const url = new URL(window.location.href);
        url.searchParams.delete("shared");
        if (url.hash && url.hash.startsWith("#product-")) url.hash = "";
        window.history.replaceState(
          {},
          document.title,
          url.pathname + url.search + url.hash
        );
      }
    } catch (err) {
      console.error("Error procesando shared param:", err);
    }
  }, [products]);

  // Si la búsqueda o filtros cambian, volver a la primera página
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, category, showFavorites]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header
        showFavorites={showFavorites}
        onToggleFavorites={handleShowFavorites}
        user={user}
        onLogout={handleLogout}
        onLogin={handleLogin}
        clientId={GOOGLE_CLIENT_ID}
        products={products}
        onSearchResults={(results) => setSearchResults(results)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <main className="max-w-6xl mx-auto p-4">
        {fetchError && (
          <div role="alert" className="bg-red-50 text-red-700 p-3 rounded-md">
            {fetchError}
          </div>
        )}

        <CategoryNav
          categories={categories}
          selected={category}
          onSelect={handleCategorySelect}
        />

        {loading ? (
          <div className="py-6 text-gray-500">Cargando productos…</div>
        ) : (
          <ProductList
            products={shown}
            onSelect={(p) => openProduct(p)}
            favorites={favorites}
            onToggleFav={toggleFavorite}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            productsPerPage={PRODUCTS_PER_PAGE}
          />
        )}
      </main>

      {selected && (
        <ProductDetail
          product={selected}
          onClose={() => setSelected(null)}
          onToggleFav={() => toggleFavorite(selected.id)}
          isFav={favorites.includes(selected.id)}
        />
      )}
    </div>
  );
}
