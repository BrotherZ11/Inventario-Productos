import React from "react";

export default function ProductCard({ product, onSelect, isFav, onToggleFav }) {
  const img = product.image || "";
  return (
    <article className="bg-gray-50 rounded-lg overflow-hidden flex flex-col h-full shadow-sm">
      <button onClick={onSelect} className="block">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="w-full h-40 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </button>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-medium">{product.title}</h3>
        <p className="text-xs text-gray-500">{product.category}</p>
        {product.price && (
          <p className="mt-auto font-semibold">{product.price}€</p>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onSelect}
            className="px-2 py-1 border rounded text-sm"
          >
            Ver
          </button>
          <button
            onClick={onToggleFav}
            aria-pressed={isFav}
            className="p-1 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-6 h-6 transition-colors ${
                isFav ? "fill-red-400" : "fill-gray-400"
              }`}
              viewBox="0 0 24 24"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
      4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 
      16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 
      11.54L12 21.35z"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
