import React, { useState } from "react";

export default function PartInputForm({ onAddPart }) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [count, setCount] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!width || !height || count < 1) return;
    const partArray = Array.from({ length: Number(count) }, () => ({
      width: Number(width),
      height: Number(height)
    }));
    onAddPart(partArray); // Artık dizi olarak gönderiyoruz
    setWidth("");
    setHeight("");
    setCount(1);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <input
        type="number"
        min="1"
        placeholder="Genişlik (mm)"
        value={width}
        onChange={e => setWidth(e.target.value)}
        required
        style={{ marginRight: 8 }}
      />
      <input
        type="number"
        min="1"
        placeholder="Yükseklik (mm)"
        value={height}
        onChange={e => setHeight(e.target.value)}
        required
        style={{ marginRight: 8 }}
      />
      <input
        type="number"
        min="1"
        placeholder="Adet"
        value={count}
        onChange={e => setCount(e.target.value)}
        required
        style={{ marginRight: 8, width: 60 }}
      />
      <button type="submit">Parça Ekle</button>
    </form>
  );
}