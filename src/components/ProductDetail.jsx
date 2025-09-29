import React, { useEffect, useRef } from "react";

export default function ProductDetail({
  product,
  onClose,
  onToggleFav,
  isFav,
}) {
  const overlayRef = useRef();

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.activeElement;
    overlayRef.current?.focus();
    return () => prev?.focus();
  }, []);

  const whatsappUrl = (() => {
    const text = encodeURIComponent(
      product.contact_msg || `Hola, me interesa: ${product.title}`
    );
    return `https://wa.me/?text=${text}`;
  })();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha ${product.title}`}
      tabIndex={-1}
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto shadow-lg">
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{product.title}</h2>
          <button onClick={onClose} className="text-xl">
            ✕
          </button>
        </header>
        <div className="p-4">
          {product.image && (
            <img
              src={product.image}
              alt={product.title}
              className="w-full max-h-[60vh] object-contain rounded-md mb-4"
            />
          )}
          <p className="text-gray-700 mb-2">{product.description}</p>
          {product.price && (
            <p className="font-semibold mb-2 text-2xl">{product.price}€</p>
          )}
        </div>

        <footer className="p-4 flex gap-2 border-t">
          <a
            className="px-3 py-2 bg-teal-500 text-white rounded"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            Contactar por WhatsApp
          </a>
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
        </footer>
      </div>
    </div>
  );
}
