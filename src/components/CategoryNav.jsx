import React, { useEffect, useRef, useState } from "react";

/**
 * CategoryNav
 *
 * Props:
 *  - categories: string[]
 *  - selected: string
 *  - onSelect: (category: string) => void
 *
 * UX:
 *  - Horizontal scrollable list of category chips
 *  - Left/right scroll buttons shown when overflow
 *  - Keyboard: Tab to focus the list, ArrowLeft/ArrowRight to move between items, Enter/Space to activate
 *  - Accessibility: aria-pressed + aria-current, clear focus ring
 */
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
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [categories]);

  // scroll by amount (smooth)
  const scrollBy = (delta) => {
    containerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  // keyboard navigation between chips: ArrowLeft/Right
  const onKeyDown = (e, idx) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(idx + 1, categories.length - 1);
      itemsRef.current[next]?.focus();
      // scroll into view nicely
      itemsRef.current[next]?.scrollIntoView?.({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = Math.max(idx - 1, 0);
      itemsRef.current[prev]?.focus();
      itemsRef.current[prev]?.scrollIntoView?.({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    } else if (e.key === "Home") {
      e.preventDefault();
      itemsRef.current[0]?.focus();
      itemsRef.current[0]?.scrollIntoView?.({
        behavior: "smooth",
        inline: "center",
      });
    } else if (e.key === "End") {
      e.preventDefault();
      itemsRef.current[categories.length - 1]?.focus();
      itemsRef.current[categories.length - 1]?.scrollIntoView?.({
        behavior: "smooth",
        inline: "center",
      });
    }
  };

  return (
    <div className="relative">
      {/* left fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 hidden sm:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0))",
        }}
      />

      {/* right fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 hidden sm:block"
        style={{
          background:
            "linear-gradient(270deg, rgba(255,255,255,1), rgba(255,255,255,0))",
        }}
      />

      <div className="flex items-center gap-2">
        {/* Scroll left button (mobile/when overflow) */}
        {showNavArrows && (
          <button
            aria-label="Desplazar categorías a la izquierda"
            onClick={() => scrollBy(-160)}
            disabled={!canScrollLeft}
            className={`sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border bg-white text-gray-600 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 ${
              !canScrollLeft ? "opacity-40" : "hover:bg-gray-50"
            }`}
          >
            ‹
          </button>
        )}

        <nav
          aria-label="Categorías"
          ref={containerRef}
          className="flex gap-2 py-3 px-2 overflow-x-auto no-scrollbar scroll-smooth"
          // allow container itself to receive focus for screen readers
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
                  }`}
                title={cat}
                // make hit area slightly larger on touch
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
            onClick={() => scrollBy(160)}
            disabled={!canScrollRight}
            className={`sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border bg-white text-gray-600 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 ${
              !canScrollRight ? "opacity-40" : "hover:bg-gray-50"
            }`}
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
