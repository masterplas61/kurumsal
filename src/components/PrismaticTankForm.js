import React, { useState } from "react";

export default function PartInputForm({ onAddPart }) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [count, setCount] = useState(1);

  const handleSubmit = e => {
    e.preventDefault();
    if (!width || !height || count < 1) return;
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({ width: Number(width), height: Number(height) });
    }
    onAddPart(arr);
    setWidth("");
    setHeight("");
    setCount(1);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <input
        type="number"
        placeholder="Genişlik (mm)"
        value={width}
        onChange={e => setWidth(e.target.value)}
        style={{ width: 120, marginRight: 12 }}
        required
      />
      <input
        type="number"
        placeholder="Yükseklik (mm)"
        value={height}
        onChange={e => setHeight(e.target.value)}
        style={{ width: 120, marginRight: 12 }}
        required
      />
      <input
        type="number"
        placeholder="Adet"
        value={count}
        onChange={e => setCount(Number(e.target.value))}
        min={1}
        style={{ width: 60, marginRight: 12 }}
        required
      />
      <button type="submit">Parça Ekle</button>
    </form>
  );
}