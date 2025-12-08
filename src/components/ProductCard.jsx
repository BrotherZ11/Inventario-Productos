import React from "react";

export default function ProductCard({
  product = {},
  onSelect,
  isFav,
  onToggleFav,
}) {
  const {
    id = "",
    title = "Producto",
    category = "",
    price,
    image,
    original_price,
  } = product;

  // parse numbers (acepta coma decimal)
  const parseNumber = (val) => {
    if (val === null || val === undefined || val === "") return null;
    const n = parseFloat(String(val).replace(",", "."));
    return Number.isNaN(n) ? null : n;
  };

  const priceNumber = parseNumber(price);
  const originalNumber = parseNumber(original_price);

  // formato simple en euros (no usar Intl currency para evitar errores)
  const formatPrice = (n) =>
    n !== null
      ? `${n.toLocaleString("es-ES", { minimumFractionDigits: 2 })}\u00A0€`
      : null; // NBSP before euro

  const formattedPrice = formatPrice(priceNumber);
  const formattedOriginal = formatPrice(originalNumber);

  const handleCardClick = (e) => {
    onSelect && onSelect(product);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect && onSelect(product);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-labelledby={id ? `product-title-${id}` : undefined}
      aria-describedby={id ? `product-desc-${id}` : undefined}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="group relative bg-white rounded-2xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 border border-slate-100"
    >
      {/* Imagen responsive */}
      <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            Sin imagen
          </div>
        )}

        {/* Botón favorito flotante */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav && onToggleFav(product);
          }}
          aria-pressed={!!isFav}
          aria-label={
            isFav
              ? `Quitar ${title} de favoritos`
              : `Añadir ${title} a favoritos`
          }
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 ${
            isFav
              ? "bg-white text-red-500 hover:scale-110"
              : "bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white hover:scale-110"
          }`}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isFav ? 'scale-100 fill-current' : 'scale-100'}`}
            viewBox="0 0 24 24"
            fill={isFav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex-1 min-w-0">
          {category && (
            <p className="text-xs font-medium text-indigo-600 mb-1 truncate uppercase tracking-wide">
              {category}
            </p>
          )}
          
          {/* Título */}
          <h3
            id={`product-title-${id}`}
            className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h3>
        </div>

        {/* Precio y acción */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            {formattedOriginal &&
              priceNumber !== null &&
              originalNumber > priceNumber && (
                <span className="text-xs text-slate-400 line-through mb-0.5">
                  {formattedOriginal}
                </span>
              )}
            {formattedPrice ? (
              <span className="text-lg font-bold text-slate-900">
                {formattedPrice}
              </span>
            ) : (
              <span className="text-sm text-slate-500">
                Consultar
              </span>
            )}
          </div>

          {/* Botón "Ver" implícito o explícito pequeño */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
             <span className="text-sm font-medium text-indigo-600 flex items-center gap-1">
               Ver
               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
             </span>
          </div>
        </div>
      </div>
    </article>
  );
}
