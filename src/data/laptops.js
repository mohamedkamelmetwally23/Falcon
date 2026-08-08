export const seed = [
  { id: 1, brand: 'Dell', model: 'Latitude 5420', processor: 'Intel Core i5-1145G7', ram: '16 GB', storage: '512 GB SSD', condition: 'استيراد', price: 18500, quantity: 7 },
  { id: 2, brand: 'HP', model: 'EliteBook 840 G7', processor: 'Intel Core i7-10610U', ram: '16 GB', storage: '512 GB SSD', condition: 'استيراد', price: 22000, quantity: 4 },
  { id: 3, brand: 'Lenovo', model: 'ThinkPad T480', processor: 'Intel Core i5-8350U', ram: '8 GB', storage: '256 GB SSD', condition: 'استيراد', price: 12500, quantity: 9 },
  { id: 4, brand: 'Apple', model: 'MacBook Air M1', processor: 'Apple M1', ram: '8 GB', storage: '256 GB SSD', condition: 'كسر زيرو', price: 31500, quantity: 3 },
  { id: 5, brand: 'Asus', model: 'Vivobook 15', processor: 'Intel Core i3-1115G4', ram: '8 GB', storage: '256 GB SSD', condition: 'جديد', price: 14500, quantity: 6 },
  { id: 6, brand: 'Acer', model: 'Aspire 5', processor: 'Ryzen 5 5500U', ram: '8 GB', storage: '512 GB SSD', condition: 'جديد', price: 24500, quantity: 2 },
  { id: 7, brand: 'Dell', model: 'Precision 5540', processor: 'Intel Core i7-9850H', ram: '32 GB', storage: '1 TB SSD', condition: 'استيراد', price: 28500, quantity: 5 },
  { id: 8, brand: 'HP', model: 'ProBook 450 G5', processor: 'Intel Core i5-8250U', ram: '8 GB', storage: '256 GB SSD', condition: 'مستعمل', price: 9500, quantity: 1 },
];

export const bands = [
  { label: 'من 5 إلى 10 آلاف', min: 5000, max: 10000, color: '#8ca89b' },
  { label: 'من 10 إلى 15 ألف', min: 10000, max: 15000, color: '#b5a581' },
  { label: 'من 15 إلى 20 ألف', min: 15000, max: 20000, color: '#7897a2' },
  { label: 'من 20 إلى 25 ألف', min: 20000, max: 25000, color: '#9a8fa5' },
  { label: 'أكثر من 25 ألف', min: 25000, max: Infinity, color: '#637d72' },
];

export const emptyForm = { brand: '', model: '', processor: '', ram: '', storage: '', listName: '', cost: '', price: '', quantity: '' };
export const money = (n, language = 'ar') => new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
}).format(Number(n) || 0);
