import React from "react";

const OPTIONS = [
  { key: "", label: "Sin ordenar", desc: "No aplicar orden" },
  { key: "newest", label: "Recientes", desc: "Más recientes → Antiguos" },
  { key: "oldest", label: "Antiguos", desc: "Más antiguos → Recientes" },
  { key: "price-desc", label: "Precio ↑", desc: "Mayor → Menor" },
  { key: "price-asc", label: "Precio ↓", desc: "Menor → Mayor" },
];

export default function SortControls({ value = "", onChange = () => {} }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-2 sm:px-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">Ordenar</span>
        </div>
      </div>

      {/* MOBILE: horizontally scrollable segmented control */}
      <div
        role="radiogroup"
        aria-label="Ordenar productos"
        className="sm:hidden -mx-4 px-4 overflow-x-auto no-scrollbar"
      >
        <div className="inline-flex gap-2 items-center snap-x snap-mandatory">
          {OPTIONS.map((opt) => {
            const active = opt.key === value;
            return (
              <button
                key={opt.key}
                role="radio"
                aria-checked={active}
                aria-label={`${opt.label} — ${opt.desc}`}
                onClick={() => onChange(opt.key)}
                // flex-none so buttons don't grow; min-w ensures a comfortable tap target but not too wide
                className={`flex-none snap-center inline-flex items-center gap-2 min-w-[84px] max-w-[180px] px-3 py-2 rounded-lg text-sm font-medium transition
                  ${
                    active
                      ? "bg-teal-600 text-white shadow"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500
                `}
              >
                {/* simple icon placeholder (dot) */}
                <span
                  className={`inline-block w-3 h-3 rounded-full flex-shrink-0 ${
                    active ? "bg-white/90" : "bg-gray-300"
                  }`}
                  aria-hidden
                />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP/TABLET: compact select */}
      <div className="hidden sm:flex items-center gap-3">
        <select
          aria-label="Ordenar productos"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
        >
          {OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label} — {opt.desc}
            </option>
          ))}
        </select>

        <div className="text-sm text-gray-500">
          Orden:{" "}
          <span className="font-medium text-gray-700">
            {OPTIONS.find((o) => o.key === value)?.label}
          </span>
        </div>
      </div>

      {/* small helper text for mobile */}
      <div className="sm:hidden mt-2 px-2 text-xs text-gray-500">
        Desliza para ver más opciones
      </div>
    </div>
  );
}
