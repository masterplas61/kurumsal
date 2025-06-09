import React from "react";

export default function SheetView({ sheet, sheetWidth, sheetHeight, sheetIndex }) {
  const scale = 600 / sheetWidth;

  return (
    <div style={{ marginBottom: 32 }}>
      <h4>
        Plaka {sheetIndex + 1} &mdash; Fire: {typeof sheet.waste === "number" ? sheet.waste.toFixed(2) : "0.00"}%
      </h4>
      <svg
        width={sheetWidth * scale}
        height={sheetHeight * scale}
        style={{ border: "2px solid #444", background: "#f9f9f9" }}
      >
        {/* Plaka sınırı */}
        <rect
          x={0}
          y={0}
          width={sheetWidth * scale}
          height={sheetHeight * scale}
          fill="#fff"
          stroke="#444"
          strokeWidth={2}
        />
        {/* Parçalar */}
        {(sheet.placed || []).map((part, i) => (
          <g key={"p" + i}>
            <rect
              x={part.x * scale}
              y={part.y * scale}
              width={(part.rotated ? part.height : part.width) * scale}
              height={(part.rotated ? part.width : part.height) * scale}
              fill="#4caf50"
              stroke="#222"
              strokeWidth={1}
            />
            <text
              x={(part.x + (part.rotated ? part.height : part.width) / 2) * scale}
              y={(part.y + (part.rotated ? part.width : part.height) / 2) * scale}
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={14}
              fill="#000"
            >
              {part.width}x{part.height}{part.rotated ? "↺" : ""}
            </text>
          </g>
        ))}
        {/* Fire alanları */}
        {(sheet.freeRects || []).map((rect, i) => (
          <g key={"f" + i}>
            <rect
              x={rect.x * scale}
              y={rect.y * scale}
              width={rect.width * scale}
              height={rect.height * scale}
              fill="none"
              stroke="#e53935"
              strokeDasharray="4"
              strokeWidth={2}
            />
            <text
              x={(rect.x + rect.width / 2) * scale}
              y={(rect.y + rect.height / 2) * scale}
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={12}
              fill="#e53935"
            >
              {rect.width}x{rect.height}
            </text>
          </g>
        ))}
      </svg>
      <div style={{marginTop: 8}}>
        <b>Kalan Fire Alanları:</b>
        <ul>
          {(sheet.freeRects || []).map((rect, i) =>
            <li key={i}>
              {rect.width} x {rect.height} mm&nbsp;
              ({(rect.width * rect.height / 1e6).toFixed(3)} m²)
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}