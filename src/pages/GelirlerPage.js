import React, { useState, useEffect } from "react";

// Tanımlı türler
const gelirTurleri = [
  "Satış",
  "Hizmet",
  "Faiz Geliri",
  "Diğer"
];
const giderTurleri = [
  "İşçi Gideri",
  "Kira",
  "Elektrik",
  "Yakıt",
  "Malzeme",
  "Vergi",
  "Diğer"
];

// İlk state
const initialGelir = {
  gelirTuru: "",
  kimden: "",
  faturaNo: "",
  tutar: "",
  aciklama: "",
  tarih: "",
};
const initialGider = {
  giderTuru: "",
  kime: "",
  faturaNo: "",
  tutar: "",
  aciklama: "",
  tarih: "",
};

// CSV formatında tabloyu indir
function exportToCSV(data, kolonlar, dosyaAdi) {
  if (!data || data.length === 0) return;
  const csv = [
    kolonlar.join(","),
    ...data.map(row => kolonlar.map(k => `"${(row[k] || "").toString().replace(/"/g, '""')}"`).join(","))
  ].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = dosyaAdi;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function FinansPaneli() {
  const [aktifTab, setAktifTab] = useState(0);
  const [gelirler, setGelirler] = useState([]);
  const [giderler, setGiderler] = useState([]);
  const [gelirForm, setGelirForm] = useState(initialGelir);
  const [giderForm, setGiderForm] = useState(initialGider);
  const [filtre, setFiltre] = useState("");
  const [gelirDuzenleIndex, setGelirDuzenleIndex] = useState(null);
  const [giderDuzenleIndex, setGiderDuzenleIndex] = useState(null);

  // Tarihler arası filtre
  const [baslangicTarihi, setBaslangicTarihi] = useState("");
  const [bitisTarihi, setBitisTarihi] = useState("");

  // İlk yükleme
  useEffect(() => {
    setGelirler(JSON.parse(localStorage.getItem("gelirler") || "[]"));
    setGiderler(JSON.parse(localStorage.getItem("giderler") || "[]"));
  }, []);

  // GELİR KAYIT
  const gelirKaydet = (e) => {
    e.preventDefault();
    if (!gelirForm.tutar || !gelirForm.tarih || !gelirForm.kimden || !gelirForm.faturaNo || !gelirForm.gelirTuru)
      return;
    let yeniGelirler;
    if (gelirDuzenleIndex === null) {
      yeniGelirler = [
        ...gelirler,
        {
          ...gelirForm,
          tutar: Number(gelirForm.tutar),
          id: Date.now(),
        }
      ];
    } else {
      yeniGelirler = [...gelirler];
      yeniGelirler[gelirDuzenleIndex] = {
        ...gelirForm,
        tutar: Number(gelirForm.tutar),
        id: gelirler[gelirDuzenleIndex].id,
      };
    }
    setGelirler(yeniGelirler);
    localStorage.setItem("gelirler", JSON.stringify(yeniGelirler));
    setGelirForm(initialGelir);
    setGelirDuzenleIndex(null);
  };

  // GİDER KAYIT
  const giderKaydet = (e) => {
    e.preventDefault();
    if (!giderForm.tutar || !giderForm.tarih || !giderForm.kime || !giderForm.faturaNo || !giderForm.giderTuru)
      return;
    let yeniGiderler;
    if (giderDuzenleIndex === null) {
      yeniGiderler = [
        ...giderler,
        {
          ...giderForm,
          tutar: Number(giderForm.tutar),
          id: Date.now(),
        }
      ];
    } else {
      yeniGiderler = [...giderler];
      yeniGiderler[giderDuzenleIndex] = {
        ...giderForm,
        tutar: Number(giderForm.tutar),
        id: giderler[giderDuzenleIndex].id,
      };
    }
    setGiderler(yeniGiderler);
    localStorage.setItem("giderler", JSON.stringify(yeniGiderler));
    setGiderForm(initialGider);
    setGiderDuzenleIndex(null);
  };

  // Kayıt sil
  const kayitSil = (id, tip) => {
    if (!window.confirm("Kaydı silmek istediğinize emin misiniz?")) return;
    if (tip === "gelir") {
      const yeniGelirler = gelirler.filter(g => g.id !== id);
      setGelirler(yeniGelirler);
      localStorage.setItem("gelirler", JSON.stringify(yeniGelirler));
    } else {
      const yeniGiderler = giderler.filter(g => g.id !== id);
      setGiderler(yeniGiderler);
      localStorage.setItem("giderler", JSON.stringify(yeniGiderler));
    }
  };

  // Tarih aralığına göre filtrele
  const dateInRange = (tarih) => {
    if (!tarih) return false;
    if (baslangicTarihi && tarih < baslangicTarihi) return false;
    if (bitisTarihi && tarih > bitisTarihi) return false;
    return true;
  };

  // Filtreli
  const gelirFiltre = gelirler.filter(
    g => (!filtre ||
      (g.aciklama && g.aciklama.toLowerCase().includes(filtre.toLowerCase())) ||
      (g.kimden && g.kimden.toLowerCase().includes(filtre.toLowerCase())) ||
      (g.faturaNo && g.faturaNo.toLowerCase().includes(filtre.toLowerCase())) ||
      (g.gelirTuru && g.gelirTuru.toLowerCase().includes(filtre.toLowerCase())))
      && (!baslangicTarihi && !bitisTarihi ? true : dateInRange(g.tarih))
  );
  const giderFiltre = giderler.filter(
    g => (!filtre ||
      (g.aciklama && g.aciklama.toLowerCase().includes(filtre.toLowerCase())) ||
      (g.kime && g.kime.toLowerCase().includes(filtre.toLowerCase())) ||
      (g.faturaNo && g.faturaNo.toLowerCase().includes(filtre.toLowerCase())) ||
      (g.giderTuru && g.giderTuru.toLowerCase().includes(filtre.toLowerCase())))
      && (!baslangicTarihi && !bitisTarihi ? true : dateInRange(g.tarih))
  );

  // Özetler
  const toplamGelir = gelirFiltre.reduce((sum, g) => sum + Number(g.tutar || 0), 0);
  const toplamGider = giderFiltre.reduce((sum, g) => sum + Number(g.tutar || 0), 0);
  const netKar = toplamGelir - toplamGider;

  // Modern stil için inline CSS
  const cardStyle = (color) => ({
    background: color,
    color: "#fff",
    padding: 18,
    borderRadius: 16,
    minWidth: 220,
    marginRight: 16,
    fontSize: 18,
    fontWeight: 600,
    boxShadow: "0 4px 16px rgba(0,0,0,0.09)"
  });

  // Kolonlar ve CSV map
  const gelirKolonlar = ["gelirTuru", "kimden", "faturaNo", "tutar", "aciklama", "tarih"];
  const gelirKolonBaslik = ["Gelir Türü", "Kimden", "Fatura No", "Tutar", "Açıklama", "Tarih"];
  const giderKolonlar = ["giderTuru", "kime", "faturaNo", "tutar", "aciklama", "tarih"];
  const giderKolonBaslik = ["Gider Türü", "Kime", "Fatura No", "Tutar", "Açıklama", "Tarih"];

  return (
    <div style={{ maxWidth: 1300, margin: "auto", background: "#f5f7fa", padding: 32, borderRadius: 20 }}>
      <div style={{ display: "flex", gap: 18, marginBottom: 24 }}>
        <div style={cardStyle("#2ecc71")}>Toplam Gelir<br />₺{toplamGelir.toLocaleString("tr-TR")}</div>
        <div style={cardStyle("#e67e22")}>Toplam Gider<br />₺{toplamGider.toLocaleString("tr-TR")}</div>
        <div style={cardStyle("#0099ff")}>Net Kar<br />₺{netKar.toLocaleString("tr-TR")}</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button
          style={{
            fontSize: 18, fontWeight: 700,
            borderBottom: aktifTab === 0 ? "4px solid #2ecc71" : "none",
            color: aktifTab === 0 ? "#2ecc71" : "#444",
            background: "none", border: "none", cursor: "pointer", padding: "6px 24px"
          }}
          onClick={() => { setAktifTab(0); setFiltre(""); setGelirForm(initialGelir); setGelirDuzenleIndex(null); }}
        >Gelirler</button>
        <button
          style={{
            fontSize: 18, fontWeight: 700,
            borderBottom: aktifTab === 1 ? "4px solid #e67e22" : "none",
            color: aktifTab === 1 ? "#e67e22" : "#444",
            background: "none", border: "none", cursor: "pointer", padding: "6px 24px"
          }}
          onClick={() => { setAktifTab(1); setFiltre(""); setGiderForm(initialGider); setGiderDuzenleIndex(null); }}
        >Giderler</button>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Filtrele (isim, tür, açıklama, fatura no...)"
          value={filtre}
          onChange={e => setFiltre(e.target.value)}
          style={{
            padding: 10, width: 260, fontSize: 17, border: "1.5px solid #bbb",
            borderRadius: 9, background: "#fff"
          }}
        />
        <input
          type="date"
          value={baslangicTarihi}
          onChange={e => setBaslangicTarihi(e.target.value)}
          style={{ padding: 8, border: "1.5px solid #bbb", borderRadius: 8 }}
        />
        <span style={{ alignSelf: "center" }}>-</span>
        <input
          type="date"
          value={bitisTarihi}
          onChange={e => setBitisTarihi(e.target.value)}
          style={{ padding: 8, border: "1.5px solid #bbb", borderRadius: 8 }}
        />
        <button
          onClick={() => { setBaslangicTarihi(""); setBitisTarihi(""); }}
          style={{
            fontSize: 15, background: "#bbb", color: "#fff", border: "none",
            borderRadius: 7, padding: "6px 16px", marginLeft: 10, cursor: "pointer"
          }}
        >Temizle</button>
        <button
          style={{
            marginLeft: "auto", background: "#0099ff", color: "#fff", border: "none", borderRadius: 7,
            fontSize: 15, fontWeight: 600, padding: "6px 24px", cursor: "pointer"
          }}
          onClick={() => {
            if (aktifTab === 0)
              exportToCSV(gelirFiltre, gelirKolonBaslik, "gelirler.csv");
            else
              exportToCSV(giderFiltre, giderKolonBaslik, "giderler.csv");
          }}
        >Excel’e Aktar</button>
      </div>

      {aktifTab === 0 ? (
        <>
          {/* GELİR EKLEME FORMU */}
          <form onSubmit={gelirKaydet} style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
            <select
              value={gelirForm.gelirTuru}
              onChange={e => setGelirForm({ ...gelirForm, gelirTuru: e.target.value })}
              style={{ width: 130, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
              required
            >
              <option value="">Gelir Türü</option>
              {gelirTurleri.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="text"
              placeholder="Kimden"
              value={gelirForm.kimden}
              onChange={e => setGelirForm({ ...gelirForm, kimden: e.target.value })}
              style={{ width: 110, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
              required
            />
            <input
              type="text"
              placeholder="Fatura No"
              value={gelirForm.faturaNo}
              onChange={e => setGelirForm({ ...gelirForm, faturaNo: e.target.value })}
              style={{ width: 100, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
              required
            />
            <input
              type="number"
              placeholder="Tutar (₺)"
              value={gelirForm.tutar}
              onChange={e => setGelirForm({ ...gelirForm, tutar: e.target.value })}
              style={{ width: 100, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
              required
            />
            <input
              type="text"
              placeholder="Açıklama"
              value={gelirForm.aciklama}
              onChange={e => setGelirForm({ ...gelirForm, aciklama: e.target.value })}
              style={{ width: 150, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
            />
            <input
              type="date"
              value={gelirForm.tarih}
              onChange={e => setGelirForm({ ...gelirForm, tarih: e.target.value })}
              style={{ width: 120, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
              required
            />
            <button type="submit" style={{
              fontSize: 16, fontWeight: 700, background: "#2ecc71",
              color: "#fff", border: "none", borderRadius: 9, padding: "10px 22px", cursor: "pointer"
            }}>{gelirDuzenleIndex === null ? "Gelir Ekle" : "Kaydet"}</button>
            {gelirDuzenleIndex !== null && (
              <button type="button" onClick={() => { setGelirForm(initialGelir); setGelirDuzenleIndex(null); }}
                style={{
                  fontSize: 16, fontWeight: 700, background: "#bbb",
                  color: "#fff", border: "none", borderRadius: 9, padding: "10px 22px", cursor: "pointer"
                }}>İptal</button>
            )}
          </form>
          {/* GELİR TABLOSU */}
          <div style={{ overflowX: "auto", borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
            <table style={{ minWidth: 1000, borderCollapse: "collapse", fontSize: 16, background: "#fff", width: "100%" }}>
              <thead style={{ background: "#ecf0f1" }}>
                <tr>
                  <th>Gelir Türü</th>
                  <th>Kimden</th>
                  <th>Fatura No</th>
                  <th>Tutar (₺)</th>
                  <th>Açıklama</th>
                  <th>Tarih</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {gelirFiltre.length === 0 && (
                  <tr>
                    <td colSpan={7}>Kayıt yok.</td>
                  </tr>
                )}
                {gelirFiltre.map((g, i) => (
                  <tr key={g.id}>
                    <td>{g.gelirTuru}</td>
                    <td>{g.kimden}</td>
                    <td>{g.faturaNo}</td>
                    <td>{Number(g.tutar || 0).toLocaleString("tr-TR")}</td>
                    <td>{g.aciklama || "-"}</td>
                    <td>{g.tarih}</td>
                    <td>
                      <button onClick={() => { setGelirDuzenleIndex(i); setGelirForm(gelirFiltre[i]); }}
                        style={{ background: "#0079e9", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, padding: "7px 16px", cursor: "pointer", marginRight: 4 }}>
                        Düzenle
                      </button>
                      <button onClick={() => kayitSil(g.id, "gelir")}
                        style={{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, padding: "7px 16px", cursor: "pointer" }}>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* GİDER EKLEME FORMU */}
          <form onSubmit={giderKaydet} style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
            <select
              value={giderForm.giderTuru}
              onChange={e => setGiderForm({ ...giderForm, giderTuru: e.target.value })}
              style={{ width: 130, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
              required
            >
              <option value="">Gider Türü</option>
              {giderTurleri.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="text"
              placeholder="Kime"
              value={giderForm.kime}
              onChange={e => setGiderForm({ ...giderForm, kime: e.target.value })}
              style={{ width: 110, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
              required
            />
            <input
              type="text"
              placeholder="Fatura No"
              value={giderForm.faturaNo}
              onChange={e => setGiderForm({ ...giderForm, faturaNo: e.target.value })}
              style={{ width: 100, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
              required
            />
            <input
              type="number"
              placeholder="Tutar (₺)"
              value={giderForm.tutar}
              onChange={e => setGiderForm({ ...giderForm, tutar: e.target.value })}
              style={{ width: 100, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
              required
            />
            <input
              type="text"
              placeholder="Açıklama"
              value={giderForm.aciklama}
              onChange={e => setGiderForm({ ...giderForm, aciklama: e.target.value })}
              style={{ width: 150, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
            />
            <input
              type="date"
              value={giderForm.tarih}
              onChange={e => setGiderForm({ ...giderForm, tarih: e.target.value })}
              style={{ width: 120, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #bbb" }}
              required
            />
            <button type="submit" style={{
              fontSize: 16, fontWeight: 700, background: "#e67e22",
              color: "#fff", border: "none", borderRadius: 9, padding: "10px 22px", cursor: "pointer"
            }}>{giderDuzenleIndex === null ? "Gider Ekle" : "Kaydet"}</button>
            {giderDuzenleIndex !== null && (
              <button type="button" onClick={() => { setGiderForm(initialGider); setGiderDuzenleIndex(null); }}
                style={{
                  fontSize: 16, fontWeight: 700, background: "#bbb",
                  color: "#fff", border: "none", borderRadius: 9, padding: "10px 22px", cursor: "pointer"
                }}>İptal</button>
            )}
          </form>
          {/* GİDER TABLOSU */}
          <div style={{ overflowX: "auto", borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
            <table style={{ minWidth: 1000, borderCollapse: "collapse", fontSize: 16, background: "#fff", width: "100%" }}>
              <thead style={{ background: "#f9ece6" }}>
                <tr>
                  <th>Gider Türü</th>
                  <th>Kime</th>
                  <th>Fatura No</th>
                  <th>Tutar (₺)</th>
                  <th>Açıklama</th>
                  <th>Tarih</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {giderFiltre.length === 0 && (
                  <tr>
                    <td colSpan={7}>Kayıt yok.</td>
                  </tr>
                )}
                {giderFiltre.map((g, i) => (
                  <tr key={g.id}>
                    <td>{g.giderTuru}</td>
                    <td>{g.kime}</td>
                    <td>{g.faturaNo}</td>
                    <td>{Number(g.tutar || 0).toLocaleString("tr-TR")}</td>
                    <td>{g.aciklama || "-"}</td>
                    <td>{g.tarih}</td>
                    <td>
                      <button onClick={() => { setGiderDuzenleIndex(i); setGiderForm(giderFiltre[i]); }}
                        style={{ background: "#0079e9", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, padding: "7px 16px", cursor: "pointer", marginRight: 4 }}>
                        Düzenle
                      </button>
                      <button onClick={() => kayitSil(g.id, "gider")}
                        style={{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, padding: "7px 16px", cursor: "pointer" }}>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
