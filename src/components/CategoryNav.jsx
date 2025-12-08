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
    <div className="relative group">
      {/* left fade (visible en sm+) */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background:
            "linear-gradient(90deg, rgba(248,250,252,1) 0%, rgba(248,250,252,0) 100%)",
        }}
      />

      {/* right fade (visible en sm+) */}
      <div
        aria-hidden
        className={`pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background:
            "linear-gradient(270deg, rgba(248,250,252,1) 0%, rgba(248,250,252,0) 100%)",
        }}
      />

      <div className="flex items-center gap-2">
        {/* Scroll left button */}
        {showNavArrows && (
          <button
            aria-label="Desplazar categorías a la izquierda"
            title="Desplazar a la izquierda"
            onClick={() => scrollBy(-scrollDelta())}
            disabled={!canScrollLeft}
            aria-disabled={!canScrollLeft}
            className={`hidden md:inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-all absolute left-0 z-20 -translate-x-1/2 top-1/2 -translate-y-1/2
              ${
                !canScrollLeft
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100 hover:bg-slate-50 hover:scale-110"
              }
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}

        {/* Scrollable nav */}
        <nav
          aria-label="Categorías"
          ref={containerRef}
          className="flex-1 flex gap-3 py-4 px-1 overflow-x-auto no-scrollbar scroll-smooth mask-linear"
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
                className={`flex-shrink-0 px-5 py-2.5 rounded-full font-medium whitespace-nowrap text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500
                  ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
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
            className={`hidden md:inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-all absolute right-0 z-20 translate-x-1/2 top-1/2 -translate-y-1/2
              ${
                !canScrollRight
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100 hover:bg-slate-50 hover:scale-110"
              }
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}
