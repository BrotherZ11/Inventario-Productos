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
      className="group bg-white rounded-xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
    >
      {/* Imagen responsive */}
      <div className="w-full h-44 sm:h-52 md:h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="text-gray-400 text-sm px-3">Sin imagen</div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Título: permite hasta 2 líneas (multiline clamp sin plugin) */}
            <h3
              id={`product-title-${id}`}
              className="text-base sm:text-lg font-semibold text-gray-900"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 5,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              <span className="block">{title}</span>
            </h3>

            {category && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                {category}
              </p>
            )}
          </div>

          {/* Botón favorito separado (detener propagación para que no abra el detalle) */}
          <div className="flex flex-col items-end gap-2">
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
              className={`inline-flex items-center justify-center w-10 h-10 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 ${
                isFav
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Precio y Boton Detalles: separados con espacio y botón más pequeño en móvil */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            {formattedOriginal &&
              priceNumber !== null &&
              originalNumber > priceNumber && (
                <span className="text-sm text-gray-400 line-through">
                  {formattedOriginal}
                </span>
              )}
            {formattedPrice ? (
              <span className="text-lg sm:text-xl font-semibold text-gray-900 whitespace-nowrap">
                {formattedPrice}
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                Precio no disponible
              </span>
            )}
          </div>

          {/* Botón Detalles */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(product);
            }}
            className="inline-flex items-center gap-2 px-1.5 py-1 sm:px-2 sm:py-1 bg-teal-600 text-white rounded-md text-sm sm:text-base font-medium hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600"
            aria-label={`Ver detalles de ${title}`}
          >
            Detalles
            {/* <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg> */}
          </button>
        </div>
      </div>
    </article>
  );
}
