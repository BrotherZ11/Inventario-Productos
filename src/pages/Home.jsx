import React, { useMemo, useState } from "react";
import useProducts from "../hooks/useProducts";
import Header from "../components/Header";
import CategoryNav from "../components/CategoryNav";
import ProductList from "../components/ProductList";
import ProductDetail from "../components/ProductDetail";
import { GOOGLE_CLIENT_ID } from "../config";

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
            onSelect={(p) => setSelected(p)}
            favorites={favorites}
            onToggleFav={toggleFavorite}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
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
