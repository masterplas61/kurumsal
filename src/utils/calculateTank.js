// Tankın yüzey alanı, hacmi ve plaka hesabı
export function calculateTank({width, length, height, isTopClosed, sheetWidth, sheetHeight, waterDensity}) {
  // Yüzey alanı (mm²): 2*(w*l + w*h + l*h) + üst (kapalıysa)
  // Toplam alanı m²'ye çeviriyoruz
  const side1 = width * length;
  const side2 = width * height;
  const side3 = length * height;
  const top = isTopClosed ? width * length : 0;
  const surface = (2 * side1 + 2 * side2 + 2 * side3 + top) / 1e6; // m²
  // Pratikte: 2 yan, 2 ön/arka, 1 alt, opsiyonel 1 üst
  // Parçalar: 2 adet (w*h), 2 adet (l*h), 1 adet (w*l) (taban), 1 adet (w*l) (kapak, opsiyonel)
  const parts = [
    {width, height}, {width, height}, // 2 yan
    {width: length, height}, {width: length, height}, // 2 ön/arka
    {width, height: length}, // taban (w*l)
  ];
  if (isTopClosed) parts.push({width, height: length}); // kapak

  // Kaç adet plaka gerekir? (Yüzey alanı / plaka alanı yukarı yuvarla)
  const sheetArea = sheetWidth * sheetHeight / 1e6; // m²
  const sheetCount = Math.ceil(surface / sheetArea);

  // Hacim (L)
  const volume = (width * length * height) / 1e6; // litre

  return {
    surface,
    sheetCount,
    volume,
    parts
  };
}