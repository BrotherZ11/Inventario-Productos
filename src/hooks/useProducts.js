import { useEffect, useState } from "react";
import { fetchSheetAsObjects } from "../utils/sheets";
import { SHEET_ID, SHEET_NAME } from "../config";
import { mapRowToProduct, detectedMapping } from "../utils/columnMapper";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("current_user") || "null");
    } catch {
      return null;
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const curr = JSON.parse(localStorage.getItem("current_user") || "null");
      const key = curr ? `favorites_${curr.sub}` : "favorites_anon";
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setLoading(true);
    fetchSheetAsObjects(SHEET_ID, SHEET_NAME)
      .then((rows) => {
        const mapped = rows.map((r) => mapRowToProduct(r, detectedMapping));
        const filtered = mapped.filter((p) => {
          if ("visible" in p && p.visible !== "") {
            const v = String(p.visible).toLowerCase();
            return v === "" || v === "yes" || v === "true" || v === "1";
          }
          return true;
        });
        setProducts(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setFetchError("Error al cargar la hoja. Revisa SHEET_ID y permisos.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const key = user ? `favorites_${user.sub}` : "favorites_anon";
    localStorage.setItem(key, JSON.stringify(favorites));
  }, [favorites, user]);

  useEffect(() => {
    if (user) localStorage.setItem("current_user", JSON.stringify(user));
    else localStorage.removeItem("current_user");
  }, [user]);

  return {
    products,
    loading,
    favorites,
    setFavorites,
    user,
    setUser,
    fetchError,
  };
}
