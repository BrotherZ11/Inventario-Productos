import React, { useEffect, useRef, useState } from "react";

export default function SearchBox({
  products = [],
  query,
  onQueryChange,
  onSearchResults = () => {},
  placeholder = "Buscar producto",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      onSearchResults([]);
      return;
    }

    const q = query.trim().toLowerCase();
    const timer = setTimeout(() => {
      const results = products.filter((p) =>
        String(p.name || p.title || "")
          .toLowerCase()
          .includes(q)
      );
      setSuggestions(results.slice(0, 8));
      setShowSuggestions(true);
      setActiveIndex(-1);
      onSearchResults(results);
    }, 180);

    return () => clearTimeout(timer);
  }, [query, products, onSearchResults]);

  useEffect(() => {
    function onDocClick(e) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  function onKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex])
        selectSuggestion(suggestions[activeIndex]);
      else
        onSearchResults(
          products.filter((p) =>
            String(p.name || "")
              .toLowerCase()
              .includes(query.trim().toLowerCase())
          )
        );
    }
  }
  function selectSuggestion(item) {
    onQueryChange(item.name);
    setShowSuggestions(false);
    setActiveIndex(-1);
    onSearchResults([item]);
  }

  function clearSearch() {
    onQueryChange("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
    onSearchResults([]);
    inputRef.current?.focus();
  }
  return (
    <div className="relative w-full" ref={suggestionsRef}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label="Buscar productos"
        aria-autocomplete="list"
        aria-controls="search-suggestions"
        aria-expanded={showSuggestions}
        role="combobox"
        className="w-full rounded-md border border-gray-200 px-3 py-2 pr-10 text-base placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
      />
      {/* Botón limpiar (aparece solo si hay query) */}
      {query && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
          onClick={clearSearch}
          className="absolute right-10 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
        >
          {/* Icono X */}
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <button
        type="button"
        aria-label="Buscar"
        className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
        onClick={() => {
          const q = query.trim().toLowerCase();
          const results = products.filter((p) =>
            String(p.name || p.title || "")
              .toLowerCase()
              .includes(q)
          );
          setSuggestions(results.slice(0, 8));
          setShowSuggestions(true);
          onSearchResults(results);
        }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 21l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="11"
            cy="11"
            r="6"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </button>

      {/* {showSuggestions && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-label={`Sugerencias para ${query}`}
          className="absolute z-40 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto py-1"
        >
          {suggestions.map((s, idx) => {
            const isActive = idx === activeIndex;
            const name = String(s.name || "");
            const q = query.trim();
            const i = name.toLowerCase().indexOf(q.toLowerCase());
            return (
              <li
                key={s.id ?? `${s.name}-${idx}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s);
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                  isActive ? "bg-gray-100" : ""
                }`}
              >
                {i >= 0 ? (
                  <>
                    {name.slice(0, i)}
                    <strong className="font-semibold">
                      {name.slice(i, i + q.length)}
                    </strong>
                    {name.slice(i + q.length)}
                  </>
                ) : (
                  name
                )}
              </li>
            );
          })}
        </ul>
      )} */}
    </div>
  );
}
