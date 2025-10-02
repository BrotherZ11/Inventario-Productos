export function mapRowToProduct(row, mapping) {
  const prod = {};
  for (const [key, colName] of Object.entries(mapping)) {
    if (!colName) {
      prod[key] = "";
      continue;
    }
    prod[key] = row[colName] !== undefined ? row[colName] : "";
  }
  const norm = {};
  Object.keys(prod).forEach(k => { norm[k.toLowerCase()] = prod[k]; });
  return norm;
}

export const detectedMapping = {
  "id": "ASIN",
  "title": "Name",
  "category": "Categoria",
  "price": "Precio Venta",
  "image": "Foto",
  "original_price": "Consideration Amount",
  "contact_msg": null,
  "available": "Disponible",
};
