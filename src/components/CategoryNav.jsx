import React, { useEffect, useRef, useState } from "react";

export default function CategoryNav({
  categories = [],
  selected,
  onSelect = () => {},
}) {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const [showNavArrows, setShowNavArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // measure overflow and update arrow visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function update() {
      const { scrollWidth, clientWidth, scrollLeft } = el;
      setShowNavArrows(scrollWidth > clientWidth + 2);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });

    // also recompute on window resize (some layouts change)
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [categories]);

  // scroll by amount (smooth)
  const scrollBy = (delta) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  // scroll one item into center (used by keyboard nav)
  const scrollItemIntoView = (idx) => {
    const el = itemsRef.current[idx];
    if (!el || !containerRef.current) return;
    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  // keyboard navigation between chips: ArrowLeft/Right, Home, End
  const onKeyDown = (e, idx) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(idx + 1, categories.length - 1);
      itemsRef.current[next]?.focus();
      scrollItemIntoView(next);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = Math.max(idx - 1, 0);
      itemsRef.current[prev]?.focus();
      scrollItemIntoView(prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      itemsRef.current[0]?.focus();
      scrollItemIntoView(0);
    } else if (e.key === "End") {
      e.preventDefault();
      itemsRef.current[categories.length - 1]?.focus();
      scrollItemIntoView(categories.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      // let button handle click (space/enter on button will trigger)
    }
  };

  // helper para calcular delta de scroll según viewport
  const scrollDelta = () => {
    if (!containerRef.current) return 200;
    const w = containerRef.current.clientWidth;
    // scroll by ~70% of visible area for desktop, 50% for narrow screens
    return Math.max(160, Math.floor(w * 0.6));
  };

  return (
    <div className="relative">
      {/* left fade (visible en sm+) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 hidden sm:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0))",
        }}
      />

      {/* right fade (visible en sm+) */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 hidden sm:block"
        style={{
          background:
            "linear-gradient(270deg, rgba(255,255,255,1), rgba(255,255,255,0))",
        }}
      />

      <div className="flex items-center gap-2">
        {/* Scroll left button: visible si hay overflow */}
        {showNavArrows && (
          <button
            aria-label="Desplazar categorías a la izquierda"
            title="Desplazar a la izquierda"
            onClick={() => scrollBy(-scrollDelta())}
            disabled={!canScrollLeft}
            aria-disabled={!canScrollLeft}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-md border bg-white text-gray-600 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 transition
              ${
                !canScrollLeft
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }
            `}
          >
            <span aria-hidden className="text-lg">
              ‹
            </span>
          </button>
        )}

        {/* Scrollable nav - toma el espacio restante */}
        <nav
          aria-label="Categorías"
          ref={containerRef}
          className="flex-1 flex gap-2 py-3 px-2 overflow-x-auto no-scrollbar scroll-smooth"
          tabIndex={0}
        >
          {categories.map((cat, idx) => {
            const active = cat === selected;
            return (
              <button
                key={cat}
                ref={(el) => (itemsRef.current[idx] = el)}
                onClick={() => onSelect(cat)}
                onKeyDown={(e) => onKeyDown(e, idx)}
                aria-pressed={active}
                aria-current={active ? "true" : undefined}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold whitespace-nowrap text-sm sm:text-base transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500
                  ${
                    active
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
                title={cat}
                style={{ touchAction: "pan-x" }}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        {/* Scroll right button */}
        {showNavArrows && (
          <button
            aria-label="Desplazar categorías a la derecha"
            title="Desplazar a la derecha"
            onClick={() => scrollBy(scrollDelta())}
            disabled={!canScrollRight}
            aria-disabled={!canScrollRight}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-md border bg-white text-gray-600 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 transition
              ${
                !canScrollRight
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }
            `}
          >
            <span aria-hidden className="text-lg">
              ›
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
