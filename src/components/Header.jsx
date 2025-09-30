import React, { useState, useRef, useEffect } from "react";
import GoogleSignIn from "./GoogleSignIn";
import SearchBox from "./SearchBox";

export default function Header({
  showFavorites,
  onToggleFavorites,
  user,
  onLogout,
  onLogin,
  clientId,
  products = [],
  onSearchResults = () => {},
  searchQuery = "",
  onSearchQueryChange = () => {},
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const avatarButtonRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        e.target !== avatarButtonRef.current
      ) {
        setUserMenuOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <header
      className="w-full bg-white shadow-md px-4 py-3 md:px-6 md:py-4"
      role="banner"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand + logo */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="#"
            aria-label="Ir al inicio"
            className="inline-flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 rounded"
          >
            {/* Logo SVG simple, alto contraste */}
            <img
              src="/logo-productos.svg"
              alt="Logo"
              className="w-9 h-9 object-contain"
            />

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900 tracking-tight">
                Productos
              </h1>
            </div>
          </a>
        </div>

        {/* Center controls: búsqueda (útil en inventario) */}
        <div className="flex-1 w-full mt-3 sm:mt-0 sm:max-w-lg">
          <SearchBox
            products={products}
            query={searchQuery}
            onQueryChange={onSearchQueryChange}
            onSearchResults={onSearchResults}
            placeholder="Buscar producto..."
          />
        </div>

        {/* Right-side actions */}
        <nav
          aria-label="Acciones de usuario"
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          {/* Favoritos */}
          <button
            onClick={onToggleFavorites}
            aria-pressed={!!showFavorites}
            aria-label={
              showFavorites ? "Ocultar favoritos" : "Mostrar favoritos"
            }
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600
              ${
                showFavorites
                  ? "bg-red-600 text-white shadow"
                  : "bg-gray-100 text-gray-800 hover:bg-red-50"
              }`}
          >
            <span aria-hidden>❤️</span>
            <span>Mis favoritos</span>
          </button>

          {/* User area: login o menú de usuario */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                ref={avatarButtonRef}
                onClick={() => setUserMenuOpen((s) => !s)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className="inline-flex items-center gap-2 px-2 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
              >
                <img
                  src={user.picture}
                  alt={`Foto de ${user.name}`}
                  className="w-9 h-9 rounded-full border"
                />
                <span className="hidden sm:inline text-sm font-medium text-gray-700 truncate max-w-[140px]">
                  {user.name}
                </span>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  aria-label="Menú de usuario"
                  className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-30 py-1"
                >
                  <button
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full sm:w-auto">
              <GoogleSignIn
                clientId={clientId}
                onLogin={onLogin}
                onLogout={onLogout}
              />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
