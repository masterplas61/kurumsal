// Maximal Rectangles temel nesting algoritması, fire oranı düşük ve döndürmeli
export function maximalRectanglesNest(parts, sheetWidth, sheetHeight, allowRotate = true) {
  function rectFits(rect, w, h) {
    return rect.width >= w && rect.height >= h;
  }
  let sheets = [];
  let warnings = [];
  let partsSorted = [...parts].sort((a, b) => (b.width * b.height) - (a.width * a.height));
  for (let idx = 0; idx < partsSorted.length; idx++) {
    const part = partsSorted[idx];
    let placed = false;
    for (let sheet of sheets) {
      for (let i = 0; i < sheet.freeRects.length; i++) {
        let fr = sheet.freeRects[i];
        if (rectFits(fr, part.width, part.height)) {
          sheet.placed.push({ ...part, x: fr.x, y: fr.y, rotated: false });
          splitFreeRects(sheet.freeRects, i, part.width, part.height);
          placed = true;
          break;
        }
        if (allowRotate && rectFits(fr, part.height, part.width)) {
          sheet.placed.push({ ...part, x: fr.x, y: fr.y, rotated: true });
          splitFreeRects(sheet.freeRects, i, part.height, part.width);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    if (!placed) {
      if (
        (part.width > sheetWidth || part.height > sheetHeight) &&
        (!allowRotate || part.height > sheetWidth || part.width > sheetHeight)
      ) {
        warnings.push(
          `Parça ${idx + 1} (${part.width}x${part.height} mm): Plakaya sığmıyor!`
        );
        continue;
      }
      let rotated = false;
      let w = part.width, h = part.height;
      if (allowRotate && part.height <= sheetWidth && part.width <= sheetHeight && part.height > part.width) {
        w = part.height; h = part.width; rotated = true;
      }
      sheets.push({
        placed: [{ ...part, x: 0, y: 0, rotated }],
        freeRects: [
          ...(w < sheetWidth
            ? [{ x: w, y: 0, width: sheetWidth - w, height: h }]
            : []),
          ...(h < sheetHeight
            ? [{ x: 0, y: h, width: sheetWidth, height: sheetHeight - h }]
            : [])
        ]
      });
    }
  }
  sheets = sheets.map(sheet => {
    const usedArea = sheet.placed.reduce(
      (sum, p) => sum + (p.rotated ? p.height * p.width : p.width * p.height),
      0
    );
    const sheetArea = sheetWidth * sheetHeight;
    const waste = ((sheetArea - usedArea) / sheetArea) * 100;
    return {
      ...sheet,
      waste,
    };
  });
  sheets.forEach(sheet => {
    sheet.freeRects = (sheet.freeRects || []).filter(r => r.width > 10 && r.height > 10);
  });
  return { sheets, warnings };
  function splitFreeRects(freeRects, idx, w, h) {
    const fr = freeRects.splice(idx, 1)[0];
    if (fr.width > w) {
      freeRects.push({ x: fr.x + w, y: fr.y, width: fr.width - w, height: h });
    }
    if (fr.height > h) {
      freeRects.push({ x: fr.x, y: fr.y + h, width: fr.width, height: fr.height - h });
    }
    if (fr.width > w && fr.height > h) {
      freeRects.push({ x: fr.x + w, y: fr.y + h, width: fr.width - w, height: fr.height - h });
    }
  }
}