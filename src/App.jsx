import React, { useEffect, useState, useMemo } from "react";
import { fetchSheetAsObjects } from "./utils/sheets";
import { SHEET_ID, SHEET_NAME, GOOGLE_CLIENT_ID } from "./config";
import CategoryNav from "./components/CategoryNav";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import GoogleSignIn from "./components/GoogleSignIn";
import { mapRowToProduct, detectedMapping } from "./utils/columnMapper";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavorites, setShowFavorites] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("current_user") || "null");
    } catch {
      return null;
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const curr = JSON.parse(localStorage.getItem("current_user") || "null");
      const key = curr ? `favorites_${curr.sub}` : "favorites_anon";
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setLoading(true);
    fetchSheetAsObjects(SHEET_ID, SHEET_NAME)
      .then((rows) => {
        const mapped = rows.map((r) => mapRowToProduct(r, detectedMapping));
        const visibleFiltered = mapped.filter((p) => {
          if ("visible" in p && p.visible !== "") {
            const v = String(p.visible).toLowerCase();
            return v === "" || v === "yes" || v === "true" || v === "1";
          }
          return true;
        });
        setProducts(visibleFiltered);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar la hoja. Revisa SHEET_ID y permisos.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const key = user ? `favorites_${user.sub}` : "favorites_anon";
    localStorage.setItem(key, JSON.stringify(favorites));
  }, [favorites, user]);

  useEffect(() => {
    if (user) localStorage.setItem("current_user", JSON.stringify(user));
    else localStorage.removeItem("current_user");
  }, [user]);

  const categories = useMemo(() => {
    // Productos filtrados según si mostramos favoritos o no (sin categoría aún)
    const baseProducts = showFavorites
      ? products.filter((p) => favorites.includes(p.id))
      : products;

    const set = new Set();
    baseProducts.forEach((p) => set.add(p.category || "Uncategorized"));
    return ["All", ...Array.from(set).sort()];
  }, [products, favorites, showFavorites]);

  // 2. Ajustar shown para filtrar por favoritos y por categoría al mismo tiempo

  const shown = useMemo(() => {
    // Filtra productos base según si mostramos favoritos o no
    const baseProducts = showFavorites
      ? products.filter((p) => favorites.includes(p.id))
      : products;

    // Luego filtra por categoría seleccionada si no es "All"
    if (category === "All") {
      return baseProducts;
    }
    return baseProducts.filter(
      (p) => (p.category || "Uncategorized") === category
    );
  }, [products, favorites, category, showFavorites]);

  // 3. Modificar handleCategorySelect para no salir del modo favoritos

  const handleCategorySelect = (c) => {
    setCategory(c);
    setCurrentPage(1);
    // No cambiamos showFavorites aquí, para poder navegar categorías dentro de favoritos
  };
  function handleLogin(userInfo) {
    setUser(userInfo);
    try {
      const key = `favorites_${userInfo.sub}`;
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      setFavorites(arr);
    } catch {
      setFavorites([]);
    }
  }

  function handleLogout() {
    setUser(null);
    try {
      setFavorites(JSON.parse(localStorage.getItem("favorites_anon") || "[]"));
    } catch {
      setFavorites([]);
    }
  }

  function toggleFavorite(id) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // Alterna el modo favoritos y resetea página y categoría
  const handleShowFavorites = () => {
    setShowFavorites((prev) => {
      if (prev) {
        // Si estamos en favoritos y desactivamos, volvemos a categoría All
        setCategory("All");
        setCurrentPage(1);
        return false;
      } else {
        setCurrentPage(1);
        return true;
      }
    });
  };
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Botón Mis Favoritos */}
          <button
            onClick={handleShowFavorites}
            aria-pressed={showFavorites}
            className={`flex items-center gap-1 px-3 py-1 border rounded-md text-sm font-semibold
              ${
                showFavorites
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }
              hover:bg-red-600 hover:text-white transition`}
          >
            Mis favoritos
          </button>

          {/* Login / User info */}
          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.picture}
                alt={user.name}
                className="w-9 h-9 rounded-full"
              />
              <span className="font-medium">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 border rounded-md text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <GoogleSignIn
              clientId={GOOGLE_CLIENT_ID}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          )}
        </div>
      </header>

      <main id="main" className="max-w-6xl mx-auto p-4">
        {error && (
          <div role="alert" className="bg-red-50 text-red-700 p-3 rounded-md">
            {error}
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
