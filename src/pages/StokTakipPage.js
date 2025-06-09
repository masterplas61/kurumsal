import React, { useState, useEffect } from "react";

const birimler = ["Adet", "Kg", "Metre", "Litre"];

// CSV dışa aktarım fonksiyonu
function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;
  const columns = ["Malzeme", "Stok", "Birim", "Kritik", "Fiyat", "Açıklama"];
  const csv =
    columns.join(",") +
    "\r\n" +
    data
      .map(
        (row) =>
          [row.isim, row.adet, row.birim, row.min, row.fiyat, row.aciklama]
            .map((cell) => `"${(cell || "").toString().replace(/"/g, '""')}"`)
            .join(",")
      )
      .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function StokTakipPage() {
  const [stoklar, setStoklar] = useState([]);
  const [log, setLog] = useState([]);
  const [yeni, setYeni] = useState({
    isim: "",
    adet: "",
    birim: birimler[0],
    min: "",
    fiyat: "",
    aciklama: "",
  });
  const [filtre, setFiltre] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // Bellekten yükle
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("stoklar") || "[]");
    setStoklar(s);
    const l = JSON.parse(localStorage.getItem("stoklog") || "[]");
    setLog(l);
  }, []);

  // Belleğe kaydet
  useEffect(() => {
    localStorage.setItem("stoklar", JSON.stringify(stoklar));
  }, [stoklar]);
  useEffect(() => {
    localStorage.setItem("stoklog", JSON.stringify(log));
  }, [log]);

  // Tüm stok isimleri (malzeme hafızası için)
  const malzemeIsimleri = [
    ...new Set([...stoklar.map((x) => x.isim), ...(yeni.isim ? [yeni.isim] : [])]),
  ].filter(Boolean);

  // Ekle/güncelle (Entegre edilen: aynı isim+birimse birleştir)
  const kaydet = (e) => {
    e.preventDefault();
    if (!yeni.isim || !yeni.adet || isNaN(Number(yeni.adet)) || Number(yeni.adet) < 0) {
      alert("Malzeme adı ve pozitif adet zorunlu!");
      return;
    }
    let yeniStoklar = [...stoklar];
    let mesaj;
    if (editIndex !== null) {
      mesaj = `Güncelleme - "${yeni.isim}" güncellendi.`;
      yeniStoklar[editIndex] = { ...yeni, adet: Number(yeni.adet), min: Number(yeni.min || 0) };
    } else {
      // Aynı isim ve birimle kayıt varsa eklemesin, adetini arttırsın
      const index = yeniStoklar.findIndex(
        s => s.isim.trim().toLowerCase() === yeni.isim.trim().toLowerCase() && s.birim === yeni.birim
      );
      if (index > -1) {
        yeniStoklar[index].adet += Number(yeni.adet);
        mesaj = `Ekleme - "${yeni.isim}" mevcut satıra eklendi.`;
      } else {
        yeniStoklar.push({ ...yeni, adet: Number(yeni.adet), min: Number(yeni.min || 0) });
        mesaj = `Ekleme - "${yeni.isim}" stoğa eklendi.`;
      }
    }
    setStoklar(yeniStoklar);
    setLog([
      ...log,
      { zaman: new Date().toLocaleString(), mesaj }
    ]);
    setYeni({ isim: "", adet: "", birim: birimler[0], min: "", fiyat: "", aciklama: "" });
    setEditIndex(null);
  };

  // Tüket
  const tuket = (i) => {
    let miktar = prompt("Kaç birim tüketeceksiniz?");
    let miktarNum = Number(miktar);
    if (!miktar || isNaN(miktarNum) || miktarNum <= 0 || miktarNum > stoklar[i].adet) {
      alert("Geçersiz miktar!");
      return;
    }
    const sebep = prompt("Tüketim sebebi/gerekçesi?");
    if (!sebep) { alert("Sebep girilmeden tüketim yapılamaz!"); return; }
    let yeniStoklar = [...stoklar];
    yeniStoklar[i].adet -= miktarNum;
    setStoklar(yeniStoklar);
    setLog([
      ...log,
      {
        zaman: new Date().toLocaleString(),
        mesaj: `Tüketim - "${yeniStoklar[i].isim}" adlı malzemeden ${miktarNum} ${yeniStoklar[i].birim} "${sebep}" için tüketildi.`,
      },
    ]);
  };

  // Sil
  const sil = (i) => {
    if (!window.confirm("Malzeme silinsin mi?")) return;
    const silinen = stoklar[i];
    setStoklar(stoklar.filter((_, j) => i !== j));
    setLog([
      ...log,
      { zaman: new Date().toLocaleString(), mesaj: `"${silinen.isim}" stoğu silindi.` }
    ]);
  };

  // Düzenle
  const duzenle = (i) => {
    setEditIndex(i);
    setYeni({ ...stoklar[i] });
  };

  // Filtrele
  const filtrelenmisStoklar = stoklar.filter((row) =>
    row.isim.toLowerCase().includes(filtre.toLowerCase())
  );
  const toplamStok = stoklar.reduce((a, b) => a + (Number(b.adet) || 0), 0);

  return (
    <div className="stok-container" style={{ maxWidth: 1100, margin: "auto", background: "#fff", padding: 24, borderRadius: 12 }}>
      <div className="stok-title" style={{ fontSize: 26, marginBottom: 16 }}>Stok Takibi</div>
      {/* Dashboard */}
      <div className="stok-dashboard" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 24 }}>
        <input
          type="text"
          placeholder="Malzeme ara..."
          value={filtre}
          onChange={e => setFiltre(e.target.value)}
          style={{ fontSize: 16, padding: "7px 12px", borderRadius: 8, border: "1px solid #ccc" }}
        />
        <span>Çeşit: <b>{stoklar.length}</b></span>
        <span>Toplam Stok: <b>{toplamStok}</b></span>
        <button
          style={{ marginLeft: "auto", background: "#0076ff", color: "#fff", fontWeight: 600, border: "none", borderRadius: 8, padding: "8px 22px", fontSize: 16, cursor: "pointer" }}
          onClick={() => exportToCSV(stoklar, "stok_listesi.csv")}
        >Excel'e Aktar</button>
      </div>
      {/* Form */}
      <form onSubmit={kaydet} className="stok-form" style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {/* Otomatik tamamlama inputu */}
        <input
          type="text"
          placeholder="Malzeme İsmi"
          value={yeni.isim}
          onChange={e => setYeni({ ...yeni, isim: e.target.value })}
          required
          list="malzeme-list"
          style={{ fontSize: 16, padding: 7, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <datalist id="malzeme-list">
          {malzemeIsimleri.map((isim, i) => <option key={i} value={isim} />)}
        </datalist>
        <input
          type="number"
          placeholder="Adet"
          value={yeni.adet}
          onChange={e => setYeni({ ...yeni, adet: e.target.value })}
          min={0}
          required
          style={{ fontSize: 16, padding: 7, borderRadius: 6, border: "1px solid #ccc", width: 90 }}
        />
        <select
          value={yeni.birim}
          onChange={e => setYeni({ ...yeni, birim: e.target.value })}
          style={{ fontSize: 16, padding: 7, borderRadius: 6, border: "1px solid #ccc" }}
        >
          {birimler.map((b) => <option key={b}>{b}</option>)}
        </select>
        <input
          type="number"
          placeholder="Min. Stok (kritik seviye)"
          value={yeni.min}
          onChange={e => setYeni({ ...yeni, min: e.target.value })}
          min={0}
          style={{ fontSize: 16, padding: 7, borderRadius: 6, border: "1px solid #ccc", width: 110 }}
        />
        <input
          type="number"
          placeholder="Birim Fiyat (₺)"
          value={yeni.fiyat}
          onChange={e => setYeni({ ...yeni, fiyat: e.target.value })}
          style={{ fontSize: 16, padding: 7, borderRadius: 6, border: "1px solid #ccc", width: 120 }}
        />
        <input
          type="text"
          placeholder="Açıklama"
          value={yeni.aciklama}
          onChange={e => setYeni({ ...yeni, aciklama: e.target.value })}
          style={{ fontSize: 16, padding: 7, borderRadius: 6, border: "1px solid #ccc", minWidth: 130 }}
        />
        <button type="submit" style={{ fontSize: 16, background: "#1bc04d", color: "#fff", border: "none", borderRadius: 7, padding: "7px 22px", fontWeight: 600 }}>
          {editIndex !== null ? "Güncelle" : "Ekle"}
        </button>
        {editIndex !== null && (
          <button
            type="button"
            onClick={() => { setEditIndex(null); setYeni({ isim: "", adet: "", birim: birimler[0], min: "", fiyat: "", aciklama: "" }); }}
            style={{ background: "#ddd", color: "#222", marginLeft: 8, borderRadius: 7, padding: "7px 14px", fontSize: 16 }}
          >
            Vazgeç
          </button>
        )}
      </form>
      {/* Tablo */}
      <table className="stok-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 16, background: "#fafcff", borderRadius: 8 }}>
        <thead>
          <tr style={{ background: "#e0f7fa" }}>
            <th>Malzeme</th>
            <th>Stok</th>
            <th>Birim</th>
            <th>Kritik</th>
            <th>Fiyat (₺)</th>
            <th>Açıklama</th>
            <th colSpan={3}></th>
          </tr>
        </thead>
        <tbody>
          {filtrelenmisStoklar.length === 0 && (
            <tr>
              <td colSpan={9} style={{ textAlign: "center" }}>Kriterlere uygun stok bulunamadı.</td>
            </tr>
          )}
          {filtrelenmisStoklar.map((row, i) => (
            <tr key={i} className={row.adet <= (row.min || 0) ? "critical" : ""} style={row.adet <= (row.min || 0) ? { background: "#ffe8e8" } : {}}>
              <td>{row.isim}</td>
              <td>{row.adet}</td>
              <td>{row.birim}</td>
              <td>
                {row.min ? row.min : "-"}
                {row.adet <= (row.min || 0) && <b> ⚠️</b>}
              </td>
              <td>{row.fiyat || "-"}</td>
              <td>{row.aciklama || "-"}</td>
              <td>
                <button onClick={() => tuket(stoklar.indexOf(row))}
                  disabled={row.adet === 0}
                  className="stok-btn"
                  style={{ background: "#1976d2", color: "#fff", borderRadius: 5, border: "none", padding: "4px 13px", fontWeight: 600 }}
                >
                  Tüket
                </button>
              </td>
              <td>
                <button onClick={() => duzenle(stoklar.indexOf(row))}
                  className="stok-btn edit"
                  style={{ background: "#e67e22", color: "#fff", borderRadius: 5, border: "none", padding: "4px 13px", fontWeight: 600 }}
                >
                  Düzenle
                </button>
              </td>
              <td>
                <button onClick={() => sil(stoklar.indexOf(row))}
                  className="stok-btn delete"
                  style={{ background: "#e74c3c", color: "#fff", borderRadius: 5, border: "none", padding: "4px 13px", fontWeight: 600 }}
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* İşlem geçmişi */}
      <div className="log-box" style={{ marginTop: 30, background: "#f9f9ff", borderRadius: 8, padding: "18px 18px 9px 18px" }}>
        <h3>İşlem Geçmişi</h3>
        <ul>
          {log.length === 0 && <li>Henüz işlem yapılmadı.</li>}
          {log.slice().reverse().map((item, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>
              <span style={{ color: "#888" }}>{item.zaman} - </span>
              {item.mesaj}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
