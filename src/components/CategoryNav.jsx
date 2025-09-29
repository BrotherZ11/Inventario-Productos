import React from "react";

export default function CategoryNav({ categories, selected, onSelect }) {
  return (
    <nav aria-label="Categorías" className="flex gap-2 overflow-auto py-3">
      {categories.map(cat => (
        <button
          key={cat}
          className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap ${cat===selected ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => onSelect(cat)}
          aria-pressed={cat === selected}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
}
