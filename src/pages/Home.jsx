import React, { useEffect, useMemo, useState } from "react";
import useProducts from "../hooks/useProducts";
import Header from "../components/Header";
import CategoryNav from "../components/CategoryNav";
import ProductList from "../components/ProductList";
import ProductDetail from "../components/ProductDetail";
import { GOOGLE_CLIENT_ID } from "../config";
import SortControls from "../components/SortControls";

const PRODUCTS_PER_PAGE = 20;
const NEW_ARRIVALS_COUNT = 20;

function parseProductDate(p) {
  if (!p || typeof p !== "object") return null;

  // Priorizar la columna mapeada "date"
  const candidates = [];

  if (p.date !== undefined && p.date !== null && String(p.date).trim() !== "") {
    candidates.push(p.date);
  }

  // también toleramos claves comunes por si acaso (por compatibilidad)
  const extraKeys = [
    "order date",
    "order_date",
    "fecha",
    "date",
    "created_at",
    "created",
    "added",
  ];
  for (const k of extraKeys) {
    if (
      k in p &&
      p[k] !== undefined &&
      p[k] !== null &&
      String(p[k]).trim() !== ""
    ) {
      // evitar duplicados si "date" ya fue añadido
      if (String(p[k]).trim() !== String(p.date).trim()) candidates.push(p[k]);
    }
  }

  for (const raw of candidates) {
    if (raw === undefined || raw === null) continue;
    // número (epoch)
    if (typeof raw === "number") {
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) return d;
      continue;
    }

    const s = String(raw).trim();
    if (!s) continue;

    // 1) dd/mm/yyyy o d/m/yy  -> convertir a yyyy-mm-dd
    const dm = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (dm) {
      let day = dm[1].padStart(2, "0");
      let month = dm[2].padStart(2, "0");
      let year = dm[3];
      if (year.length === 2) year = "20" + year;
      const iso = `${year}-${month}-${day}`; // yyyy-mm-dd
      const d = new Date(iso);
      if (!Number.isNaN(d.getTime())) return d;
    }

    // 2) intentar parse directo (ISO u otros)
    const tryDirect = new Date(s);
    if (!Number.isNaN(tryDirect.getTime())) return tryDirect;

    // 3) fallback: normalizar separadores y reintentar
    const normalized = s
      .replace(/\./g, "-")
      .replace(/\s+/g, " ")
      .replace(/,/g, "");
    const tryNorm = new Date(normalized);
    if (!Number.isNaN(tryNorm.getTime())) return tryNorm;
  }

  return null;
}

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

  const [category, setCategory] = useState("Novedades🔥");
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavorites, setShowFavorites] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [sortOption, setSortOption] = useState("");

  const categoriesFromProducts = useMemo(() => {
    const base = showFavorites
      ? products.filter((p) => favorites.includes(p.id))
      : products;
    const set = new Set();
    base.forEach((p) => set.add(p.category || "Sin categoria"));
    return Array.from(set).sort();
  }, [products, favorites, showFavorites]);

  // categories para CategoryNav: "Novedades" al principio, luego "Todos", luego las categorías reales
  const categories = useMemo(() => {
    return ["Novedades🔥", "Todos", ...categoriesFromProducts];
  }, [categoriesFromProducts]);

  const shownByCategory = useMemo(() => {
    const base = showFavorites
      ? products.filter((p) => favorites.includes(p.id))
      : products;
    if (category === "Todos") return base;
    // Si category es "Novedades" no usamos esta lista (se calcula aparte)
    return base.filter((p) => (p.category || "Sin categoria") === category);
  }, [products, favorites, category, showFavorites]);

  const latestProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // obtener sólo productos con fecha válida
    const withDates = products
      .map((p) => {
        const d = parseProductDate(p);
        return { product: p, date: d };
      })
      .filter((x) => x.date instanceof Date && !Number.isNaN(x.date.getTime()));

    // ordenar por fecha descendente
    withDates.sort((a, b) => b.date - a.date);

    // devolver solo los productos (sin duplicados) y limitar a N
    const list = withDates.slice(0, NEW_ARRIVALS_COUNT).map((x) => x.product);

    return list;
  }, [products]);

  // Combina categoría + búsqueda: si hay búsqueda activa, mostrar searchResults intersectados con category/favorites.
  // Si category === "Novedades" usamos latestProducts como base.
  const baseShown = useMemo(() => {
    const hasSearch = searchResults && searchResults.length > 0;
    let base = category === "Novedades🔥" ? latestProducts : shownByCategory;

    if (hasSearch) {
      const ids = new Set(searchResults.map((p) => String(p.id)));
      base = base.filter((p) => ids.has(String(p.id)));
    }
    if (showFavorites) base = base.filter((p) => favorites.includes(p.id));

    return base;
  }, [
    searchResults,
    shownByCategory,
    category,
    showFavorites,
    favorites,
    latestProducts,
  ]);

  // ---------- APLICAR ORDEN ----------
  const sortedShown = useMemo(() => {
    if (!baseShown || baseShown.length === 0) return baseShown;

    // copiar para no mutar
    const list = [...baseShown];

    // helpers para parse
    const parsePrice = (val) => {
      if (val === undefined || val === null) return NaN;
      const s = String(val)
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");
      const n = parseFloat(s);
      return Number.isNaN(n) ? NaN : n;
    };

    const getDateFor = (p) => {
      const d = parseProductDate ? parseProductDate(p) : null;
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
    };

    switch (sortOption) {
      case "newest":
        list.sort((a, b) => getDateFor(b) - getDateFor(a));
        break;
      case "oldest":
        list.sort((a, b) => getDateFor(a) - getDateFor(b));
        break;
      case "price-desc":
        list.sort((a, b) => {
          const na = parsePrice(a.price);
          const nb = parsePrice(b.price);
          if (Number.isNaN(na) && Number.isNaN(nb)) return 0;
          if (Number.isNaN(na)) return 1;
          if (Number.isNaN(nb)) return -1;
          return nb - na;
        });
        break;
      case "price-asc":
        list.sort((a, b) => {
          const na = parsePrice(a.price);
          const nb = parsePrice(b.price);
          if (Number.isNaN(na) && Number.isNaN(nb)) return 0;
          if (Number.isNaN(na)) return 1;
          if (Number.isNaN(nb)) return -1;
          return na - nb;
        });
        break;
      default:
        break;
    }

    return list;
  }, [baseShown, sortOption]);

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

    // calcular la página preferentemente respecto a la lista mostrada (sortedShown)
    try {
      // intenta encontrar en sortedShown (la lista filtrada/ordenada que se muestra)
      const idxShown = sortedShown.findIndex(
        (x) => String(x.id) === String(p.id)
      );
      if (idxShown >= 0) {
        const page = Math.floor(idxShown / PRODUCTS_PER_PAGE) + 1;
        setCurrentPage(page);
      } else {
        // fallback: buscar en la lista completa products
        const idxAll = products.findIndex((x) => String(x.id) === String(p.id));
        if (idxAll >= 0) {
          const page = Math.floor(idxAll / PRODUCTS_PER_PAGE) + 1;
          setCurrentPage(page);
        }
      }
    } catch (err) {}

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

  // Ajustar currentPage cuando la lista mostrada cambie (evita páginas vacías)
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((sortedShown?.length || 0) / PRODUCTS_PER_PAGE)
    );
    setCurrentPage((cur) => {
      if (!cur || cur < 1) return 1;
      if (cur > totalPages) return totalPages;
      return cur;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedShown]);

  // Si la búsqueda o filtros cambian, volver a la primera página
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, category, showFavorites, sortOption]);

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

        {/* barra de controles: orden + contador (responsive) */}
        <div className="mt-3 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Left: SortControls - ocupa todo el ancho en móvil para que no empuje el contador */}
          <div className="w-full sm:w-auto">
            <SortControls value={sortOption} onChange={setSortOption} />
          </div>

          {/* Right: contador de resultados */}
          {/* <div className="w-full sm:w-auto flex items-center sm:justify-end">
            <div className="bg-white/40 rounded-md px-3 py-2 text-sm text-gray-700 border border-gray-100 shadow-sm w-full sm:w-auto text-center sm:text-right">
              Resultados:{" "}
              <span className="font-semibold text-gray-900">
                {sortedShown.length}
              </span>
            </div>
          </div> */}
        </div>

        {loading ? (
          <div className="py-6 text-gray-500">Cargando productos…</div>
        ) : (
          <ProductList
            products={sortedShown}
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
          onClose={closeProduct}
          onToggleFav={() => toggleFavorite(selected.id)}
          isFav={favorites.includes(selected.id)}
        />
      )}
    </div>
  );
}
