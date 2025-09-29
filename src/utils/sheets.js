export async function fetchSheetAsObjects(sheetId, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, { cache: "no-cache" });
  const text = await res.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No se pudo parsear la respuesta de Google Sheets.");
  const data = JSON.parse(jsonMatch[0]);
  const cols = data.table.cols.map(c => c.label || c.id || "");
  const rows = data.table.rows.map(r => {
    const obj = {};
    r.c.forEach((cell, i) => {
      obj[cols[i]] = cell ? cell.v : "";
    });
    return obj;
  });
  return rows;
}
