const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const number = value => Number(String(value ?? '').replace(/[^\d.-]/g, '')) || 0;

function getBrand(model) {
  const value = model.toUpperCase();
  if (value.includes('HP') || value.includes('ELITEBOOK') || value.includes('PROBOOK')) return 'HP';
  if (value.includes('LATITUDE') || value.includes('PRECISION') || value.includes('DELL')) return 'Dell';
  if (value.includes('THINKPAD') || value.includes('LENOVO')) return 'Lenovo';
  return 'غير محدد';
}

function cleanModel(value) {
  return text(value)
    .replace(/FALCON\s+LAPTOP\s+NEW\s+SHIPMENT/gi, '')
    .replace(/^HP\s+/i, '')
    .trim();
}

export function parseLaptopSheet(sheet, XLSX) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
  if (!rows.length) return [];

  const capacity = rows.slice(0, 10).flat().map(text).join(' ').match(/PRICE\s*(\d+)\s*G?\s*[-–]\s*(\d+)/i);
  const ram = capacity ? `${capacity[1]} GB` : '';
  const storage = capacity ? `${capacity[2]} GB` : '';
  let currentModel = '';
  const result = [];

  rows.forEach((row, index) => {
    const firstCell = text(row[0]);
    const price = number(row[1]);
    const quantity = number(row[2]);
    if (!firstCell) return;

    // A priced row is always an inventory record under the latest model heading.
    if (price > 0) {
      result.push({
        id: Date.now() + index,
        brand: getBrand(currentModel),
        model: currentModel || 'موديل غير محدد',
        processor: firstCell,
        ram,
        storage,
        listName: text(row[4]),
        cost: number(row[3]),
        price,
        quantity,
      });
    } else {
      // A row without a price starts a new model group, such as "LATITUDE 3510".
      currentModel = cleanModel(firstCell);
    }
  });

  return result;
}
