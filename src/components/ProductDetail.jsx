import React, { useEffect, useRef, useState } from "react";

export default function ProductDetail({
  product = {},
  onClose,
  onToggleFav,
  isFav,
}) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
  const [expanded, setExpanded] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const {
    id,
    title = "Producto",
    image,
    price,
    original_price,
    stock,
    contact_msg,
  } = product;

  const parseNumber = (val) => {
    if (val === null || val === undefined || val === "") return null;
    const n = parseFloat(String(val).replace(",", "."));
    return Number.isNaN(n) ? null : n;
  };
  const priceNumber = parseNumber(price);
  const originalNumber = parseNumber(original_price);
  const fmt = (n) =>
    n !== null
      ? `${n.toLocaleString("es-ES", { minimumFractionDigits: 2 })}\u00A0€`
      : null;
  const formattedPrice = fmt(priceNumber);
  const formattedOriginal = fmt(originalNumber);

  const whatsappText = encodeURIComponent(
    contact_msg || `Hola, me interesa: ${title}`
  );
  const whatsappUrl = `https://wa.me/qr/CQ7L5SK7AQMOP1/?text=${whatsappText}`;

  const shareUrl =
    product.url && typeof product.url === "string"
      ? product.url
      : typeof window !== "undefined"
      ? window.location.href
      : "";

  // focus trap + prevent body scroll + restore focus on close
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus dialog once mounted
    setTimeout(() => dialogRef.current?.focus(), 0);

    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      } else if (e.key === "Tab") {
        // basic focus trap
        const nodes = dialogRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!nodes || nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      try {
        previouslyFocused.current?.focus?.();
      } catch {}
    };
  }, [onClose]);

  useEffect(() => {
    function onDocClick(e) {
      if (
        shareOpen &&
        shareRef.current &&
        !shareRef.current.contains(e.target)
      ) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [shareOpen]);

  // cerrar al clicar en el overlay (pero no si se clickea dentro del dialog)
  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  // handlers para acciones táctiles
  const handleToggleFav = (e) => {
    e.stopPropagation();
    onToggleFav && onToggleFav(product);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose && onClose();
  };

  async function handleShareNative() {
    // Try Web Share API first (mobile native)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url: shareUrl,
        });
        setShareOpen(false);
      } catch (err) {
        // user cancelled or failed -> keep popover closed
        setShareOpen(false);
      }
      return;
    }
    // fallback: open our popover
    setShareOpen((s) => !s);
  }

  function openInNew(url) {
    window.open(url, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  }

  async function copyLink() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // fallback
        const tmp = document.createElement("textarea");
        tmp.value = shareUrl;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShareOpen(false);
    } catch (err) {
      console.error("Copy failed", err);
      setCopied(false);
      setShareOpen(false);
    }
  }

  // accesible label IDs
  const titleId = id ? `pd-title-${id}` : undefined;
  const descId = id ? `pd-desc-${id}` : undefined;

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      aria-hidden={false}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className="w-full h-full sm:h-auto sm:max-h-[90vh] bg-white rounded-t-xl sm:rounded-xl shadow-2xl outline-none flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header sticky */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3 border-b">
          <div className="flex items-center gap-2  ml-auto">
            <button
              type="button"
              onClick={handleToggleFav}
              aria-pressed={!!isFav}
              aria-label={
                isFav
                  ? `Quitar ${title} de favoritos`
                  : `Añadir ${title} a favoritos`
              }
              className={`inline-flex items-center justify-center h-10 w-10 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 ${
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

            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar"
              className="inline-flex items-center justify-center h-10 w-10 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
            >
              <span aria-hidden className="text-xl">
                ✕
              </span>
            </button>
          </div>
        </header>

        {/* Main content - responsive: image arriba, detalles abajo */}
        <main className="overflow-auto flex-1">
          <div className="flex flex-col sm:flex-row gap-0 sm:gap-4">
            {/* Imagen area */}
            <div className="w-full sm:w-1/2 flex items-center justify-center bg-gray-50 p-4 sm:p-6">
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="max-h-[60vh] w-full object-contain rounded-md"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-44 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md">
                  <span className="text-sm">Sin imagen</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="w-full sm:w-1/2 p-4 sm:p-6 flex flex-col gap-4">
              {/* Price block */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  {formattedOriginal &&
                    priceNumber !== null &&
                    originalNumber > priceNumber && (
                      <span className="text-sm text-gray-400 line-through">
                        {formattedOriginal}
                      </span>
                    )}
                  {formattedPrice ? (
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 whitespace-nowrap">
                      {formattedPrice}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Precio no disponible
                    </div>
                  )}
                </div>

                <div className="ml-auto flex flex-col items-end gap-2">
                  {stock !== undefined && (
                    <div
                      className={`text-sm font-medium ${
                        Number(stock) <= 0 ? "text-red-600" : "text-gray-600"
                      }`}
                    >
                      {Number(stock) > 0 ? `Stock: ${stock}` : "Agotado"}
                    </div>
                  )}
                </div>
              </div>

              {/* titulo (collapsible on mobile) */}
              <div className="text-sm text-gray-700">
                <div
                  id={titleId}
                  className={`prose prose-sm max-w-none text-gray-700 ${
                    expanded ? "" : "line-clamp-4"
                  }`}
                  // using line-clamp-4 (if not using plugin, the class may not work; fallback is handled via CSS above)
                >
                  <p>{title}</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((s) => !s);
                  }}
                  className="mt-2 inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
                  aria-expanded={expanded}
                >
                  {expanded ? "Mostrar menos" : "Mostrar más"}
                </button>
              </div>
            </div>
            <div className="relative" ref={shareRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareNative();
                }}
                aria-haspopup="menu"
                aria-expanded={shareOpen}
                aria-controls={id ? `share-menu-${id}` : undefined}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
              >
                Compartir
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 3v13"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 7l4-4 4 4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {shareOpen && (
                <div
                  id={id ? `share-menu-${id}` : undefined}
                  role="menu"
                  aria-label="Opciones para compartir"
                  className="absolute left-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-40 py-2"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInNew(
                        `https://wa.me/?text=${encodeURIComponent(
                          `${title} - ${shareUrl}`
                        )}`
                      );
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInNew(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          `${title} ${shareUrl}`
                        )}`
                      );
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Twitter
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInNew(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          shareUrl
                        )}`
                      );
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Facebook
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyLink();
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                  >
                    Copiar enlace
                    {copied && (
                      <span className="ml-2 text-xs text-green-600">
                        ¡Enlace copiado!
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer sticky - mobile-first (big CTA, always visible on bottom) */}
        <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-sm border-t px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-md text-sm font-semibold hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600"
              aria-label={`Contactar por WhatsApp sobre ${title}`}
            >
              Contactar por WhatsApp
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M21 15.5C21 16.8807 19.8807 18 18.5 18H8L3 21V5.5C3 4.11929 4.11929 3 5.5 3H18.5C19.8807 3 21 4.11929 21 5.5V15.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <button
              type="button"
              onClick={() => onToggleFav && onToggleFav(product)}
              aria-pressed={!!isFav}
              className={`inline-flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 ${
                isFav
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isFav ? "En favoritos" : "Añadir a favoritos"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
