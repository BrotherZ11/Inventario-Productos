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

  const phone = "34633869448";
  const whatsappText = encodeURIComponent(
    contact_msg || `Hola, me interesa: ${title}`
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${whatsappText}`;

  function makeShareUrl() {
    try {
      // si product.url es absoluta, añadimos el param shared
      if (
        product.url &&
        typeof product.url === "string" &&
        product.url.startsWith("http")
      ) {
        const u = new URL(product.url);
        u.searchParams.set("shared", String(id));
        return u.toString();
      }

      // fallback: usar el origen + pathname actual
      if (typeof window !== "undefined") {
        const u = new URL(window.location.href);
        const base = `${u.origin}${u.pathname}`;
        const share = new URL(base);
        share.searchParams.set("shared", String(id));
        return share.toString();
      }
    } catch (err) {
      // very fallback
      try {
        return `${window.location.origin}${
          window.location.pathname
        }?shared=${encodeURIComponent(String(id))}`;
      } catch {
        return `?shared=${encodeURIComponent(String(id))}`;
      }
    }
  }

  const shareUrl = makeShareUrl();

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

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      aria-hidden={false}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className="w-full h-[90vh] sm:h-auto sm:max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl outline-none flex flex-col max-w-4xl animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header sticky */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 truncate pr-4 hidden sm:block">
            Detalles del producto
          </h2>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleToggleFav}
              aria-pressed={!!isFav}
              aria-label={
                isFav
                  ? `Quitar ${title} de favoritos`
                  : `Añadir ${title} a favoritos`
              }
              className={`inline-flex items-center justify-center h-9 w-9 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 ${
                isFav
                  ? "bg-red-50 text-red-500"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-red-500"
              }`}
            >
              <svg
                className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar"
              className="inline-flex items-center justify-center h-9 w-9 rounded-full text-slate-500 bg-slate-100 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </header>

        {/* Main content - responsive: image arriba, detalles abajo */}
        <main className="overflow-y-auto flex-1 overscroll-contain">
          <div className="flex flex-col md:flex-row">
            {/* Imagen area */}
            <div className="w-full md:w-1/2 bg-slate-50 p-6 md:p-8 flex items-center justify-center min-h-[300px]">
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="max-h-[400px] w-full object-contain drop-shadow-lg rounded-lg"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <svg className="w-16 h-16 mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span className="text-sm">Sin imagen disponible</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col gap-6">
              {/* Header info */}
              <div>
                <h2 
                  id={titleId}
                  className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2"
                >
                  {title}
                </h2>
                {/* Price block */}
                <div className="flex items-baseline gap-3 mt-4">
                  {formattedPrice ? (
                    <div className="text-3xl md:text-4xl font-bold text-indigo-600">
                      {formattedPrice}
                    </div>
                  ) : (
                    <div className="text-xl text-slate-500 font-medium">
                      Consultar precio
                    </div>
                  )}
                  
                  {formattedOriginal &&
                    priceNumber !== null &&
                    originalNumber > priceNumber && (
                      <span className="text-lg text-slate-400 line-through decoration-slate-400/50">
                        {formattedOriginal}
                      </span>
                    )}
                </div>
              </div>

              {/* Description / Extra info */}
              <div className="prose prose-slate text-slate-600">
                <p>
                  Contacta con nosotros para más información sobre este producto. 
                  Estamos disponibles para resolver tus dudas y gestionar tu pedido.
                </p>
              </div>

              {/* Share button */}
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Compartir producto
                </button>

                {shareOpen && (
                  <div
                    id={id ? `share-menu-${id}` : undefined}
                    role="menu"
                    aria-label="Opciones para compartir"
                    className="absolute left-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-40 py-1 animate-fade-in"
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
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
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
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
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
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Facebook
                    </button>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyLink();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      Copiar enlace
                      {copied && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          Copiado
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer sticky - mobile-first (big CTA, always visible on bottom) */}
        <footer className="sticky bottom-0 z-30 bg-white border-t border-slate-100 px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 text-white rounded-xl text-base font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 active:scale-[0.98]"
            aria-label={`Contactar por WhatsApp sobre ${title}`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contactar por WhatsApp
          </a>

          <button
            type="button"
            onClick={() => onToggleFav && onToggleFav(product)}
            aria-pressed={!!isFav}
            className={`inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 transition-colors ${
              isFav
                ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {isFav ? "En favoritos" : "Añadir a favoritos"}
          </button>
        </footer>
      </div>
    </div>
  );
}
