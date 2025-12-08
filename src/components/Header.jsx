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
      className="sticky top-0 z-40 w-full glass shadow-sm transition-all duration-300"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between py-3 sm:py-0 gap-y-3 sm:gap-4 h-auto sm:h-20">
          {/* Brand + logo - Order 1 */}
          <div className="flex items-center gap-3 order-1">
            <a
              href="#"
              aria-label="Ir al inicio"
              className="inline-flex items-center gap-2 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 rounded-lg p-1"
            >
              <img
                src="/logo-productos.svg"
                alt="Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight text-slate-900 tracking-tight">
                  Productos
                </h1>
              </div>
            </a>
          </div>

          {/* Center controls: Search - Order 3 (Mobile) / Order 2 (Desktop) */}
          <div className="w-full sm:flex-1 sm:max-w-xl mx-auto order-3 sm:order-2">
            <SearchBox
              products={products}
              query={searchQuery}
              onQueryChange={onSearchQueryChange}
              onSearchResults={onSearchResults}
              placeholder="Buscar producto..."
            />
          </div>

          {/* Right-side actions - Order 2 (Mobile) / Order 3 (Desktop) */}
          <nav
            aria-label="Acciones de usuario"
            className="flex items-center gap-2 sm:gap-3 order-2 sm:order-3 ml-auto sm:ml-0"
          >
            {/* Favoritos */}
            <button
              onClick={onToggleFavorites}
              aria-pressed={!!showFavorites}
              aria-label={
                showFavorites ? "Ocultar favoritos" : "Mostrar favoritos"
              }
              className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600
                ${
                  showFavorites
                    ? "bg-red-50 text-red-600 shadow-inner"
                    : "text-slate-600 hover:bg-slate-100 hover:text-red-500"
                }`}
            >
              
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill={showFavorites ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-6 h-6"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span className="text-sm font-medium select-none">
    Mis favoritos
  </span>
              {showFavorites && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>

            {/* User area */}
            <div className="border-l border-slate-200 pl-2 sm:pl-3 ml-1">
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    ref={avatarButtonRef}
                    onClick={() => setUserMenuOpen((s) => !s)}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    className="inline-flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
                  >
                    <img
                      src={user.picture}
                      alt={`Foto de ${user.name}`}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 shadow-sm"
                    />
                    <span className="hidden md:inline text-sm font-medium text-slate-700 truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div
                      role="menu"
                      aria-label="Menú de usuario"
                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-fade-in"
                    >
                      <div className="px-4 py-2 border-b border-slate-50 md:hidden">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <button
                        role="menuitem"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-auto">
                  <GoogleSignIn
                    clientId={clientId}
                    onLogin={onLogin}
                    onLogout={onLogout}
                  />
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
