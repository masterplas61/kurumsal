import React, { useEffect, useState } from "react";

// CSV dışa aktarım
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

function getAyYil(tarih) {
  if (!tarih) return "";
  const [yil, ay] = tarih.split("-");
  return `${yil}-${ay}`;
}

export default function AylikOzetPage() {
  const [ayliklar, setAyliklar] = useState([]);

  useEffect(() => {
    const gelirler = JSON.parse(localStorage.getItem("gelirler") || "[]");
    const giderler = JSON.parse(localStorage.getItem("giderler") || "[]");

    // Aylık bazda topla
    const ozet = {};

    // Gelirler
    for (const g of gelirler) {
      const ay = getAyYil(g.tarih);
      if (!ozet[ay]) {
        ozet[ay] = {
          ay,
          toplamGelir: 0,
          toplamBrut: 0,
          toplamMasraf: 0,
          toplamGider: 0,
          toplamNet: 0
        };
      }
      ozet[ay].toplamGelir += Number(g.tutar || 0);
      ozet[ay].toplamBrut += Number(g.brutKar || 0);
      ozet[ay].toplamMasraf += Number(g.masraflar || 0);
      ozet[ay].toplamNet += Number(g.netKar || (g.brutKar || 0) - (g.masraflar || 0));
    }
    // Giderler
    for (const g of giderler) {
      const ay = getAyYil(g.tarih);
      if (!ozet[ay]) {
        ozet[ay] = {
          ay,
          toplamGelir: 0,
          toplamBrut: 0,
          toplamMasraf: 0,
          toplamGider: 0,
          toplamNet: 0
        };
      }
      ozet[ay].toplamGider += Number(g.tutar || 0);
      ozet[ay].toplamNet -= Number(g.tutar || 0);
    }
    // Objeyi diziye çevir, yeniye göre sırala
    const ayliklar = Object.values(ozet)
      .sort((a, b) => a.ay < b.ay ? 1 : -1);

    setAyliklar(ayliklar);
  }, []);

  function ayAd(ayYil) {
    if (!ayYil) return "-";
    const [yil, ay] = ayYil.split("-");
    const aylar = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    return `${aylar[(Number(ay)-1)]} ${yil}`;
  }

  // Toplamlar (aydan bağımsız)
  const toplam = ayliklar.reduce((acc, a) => {
    acc.gelir += a.toplamGelir;
    acc.gider += a.toplamGider;
    acc.brut += a.toplamBrut;
    acc.masraf += a.toplamMasraf;
    acc.net += a.toplamNet;
    return acc;
  }, { gelir:0, gider:0, brut:0, masraf:0, net:0 });

  // En yüksek gelir/gider ayı
  const enYuksekGelirAy = ayliklar.reduce((max, a) => (a.toplamGelir > (max?.toplamGelir || 0) ? a : max), null);
  const enYuksekGiderAy = ayliklar.reduce((max, a) => (a.toplamGider > (max?.toplamGider || 0) ? a : max), null);

  // Tabloyu excel için kolon ismiyle çıkar
  const excelKolonlar = [
    "Ay", "Toplam Gelir", "Toplam Gider", "Toplam Brüt Kar", "Toplam Masraf", "Toplam Net Kar"
  ];
  const excelData = ayliklar.map(a => ({
    "Ay": ayAd(a.ay),
    "Toplam Gelir": a.toplamGelir,
    "Toplam Gider": a.toplamGider,
    "Toplam Brüt Kar": a.toplamBrut,
    "Toplam Masraf": a.toplamMasraf,
    "Toplam Net Kar": a.toplamNet
  }));

  // Modern kutu stili
  const cardStyle = (color) => ({
    background: color,
    color: "#fff",
    padding: 16,
    borderRadius: 14,
    minWidth: 160,
    marginRight: 18,
    fontSize: 17,
    fontWeight: 600,
    boxShadow: "0 4px 18px rgba(0,0,0,0.09)",
    display: "inline-block",
    textAlign: "center"
  });

  return (
    <div style={{ maxWidth: 950, margin: "auto", background: "#fff", padding: 28, borderRadius: 14 }}>
      <h2>Aylık Gelir/Gider Özeti</h2>
      {/* Hızlı bakış kutuları */}
      <div style={{ display: "flex", gap: 18, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={cardStyle("#2ecc71")}>Toplam Gelir<br />₺{toplam.gelir.toLocaleString("tr-TR")}</div>
        <div style={cardStyle("#e67e22")}>Toplam Gider<br />₺{toplam.gider.toLocaleString("tr-TR")}</div>
        <div style={cardStyle("#0099ff")}>Toplam Brüt Kar<br />₺{toplam.brut.toLocaleString("tr-TR")}</div>
        <div style={cardStyle("#f51d44")}>Toplam Masraf<br />₺{toplam.masraf.toLocaleString("tr-TR")}</div>
        <div style={cardStyle(toplam.net >= 0 ? "#197d19" : "#bb2c2c")}>
          Toplam Net Kar<br />₺{toplam.net.toLocaleString("tr-TR")}
        </div>
      </div>
      <div style={{ marginBottom: 16, fontSize: 16 }}>
        {enYuksekGelirAy &&
          <span>
            En yüksek gelir: <b>{ayAd(enYuksekGelirAy.ay)}</b> <span style={{color:"#197d19"}}>₺{enYuksekGelirAy.toplamGelir.toLocaleString("tr-TR")}</span> &nbsp;|&nbsp;
          </span>
        }
        {enYuksekGiderAy &&
          <span>
            En yüksek gider: <b>{ayAd(enYuksekGiderAy.ay)}</b> <span style={{color:"crimson"}}>₺{enYuksekGiderAy.toplamGider.toLocaleString("tr-TR")}</span>
          </span>
        }
      </div>
      <button
        style={{
          marginBottom: 16, background: "#0079e9", color: "#fff", border: "none", borderRadius: 7,
          fontSize: 16, fontWeight: 600, padding: "9px 26px", cursor: "pointer"
        }}
        onClick={() => exportToCSV(excelData, excelKolonlar, "aylik_ozet.csv")}
      >Excel’e Aktar</button>
      <div style={{ overflowX: "auto" }}>
        <table border={1} cellPadding={8} style={{ minWidth: 800, borderCollapse: "collapse", fontSize: 16, background: "#fafcff" }}>
          <thead style={{ background: "#f0f6ff" }}>
            <tr>
              <th>Ay</th>
              <th>Toplam Gelir (₺)</th>
              <th>Toplam Gider (₺)</th>
              <th>Toplam Brüt Kar (₺)</th>
              <th>Toplam Masraf (₺)</th>
              <th>Toplam Net Kar (₺)</th>
            </tr>
          </thead>
          <tbody>
            {ayliklar.length === 0 && (
              <tr>
                <td colSpan={6}>Kayıt yok.</td>
              </tr>
            )}
            {ayliklar.map(a => (
              <tr key={a.ay}>
                <td>{ayAd(a.ay)}</td>
                <td>{a.toplamGelir.toLocaleString("tr-TR")}</td>
                <td>{a.toplamGider.toLocaleString("tr-TR")}</td>
                <td>{a.toplamBrut.toLocaleString("tr-TR")}</td>
                <td>{a.toplamMasraf.toLocaleString("tr-TR")}</td>
                <td style={{ fontWeight: "bold", color: a.toplamNet >= 0 ? "#197d19" : "crimson" }}>
                  {a.toplamNet.toLocaleString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{ background: "#e7f6e7" }}>
            <tr>
              <th>Genel Toplam</th>
              <th>{toplam.gelir.toLocaleString("tr-TR")}</th>
              <th>{toplam.gider.toLocaleString("tr-TR")}</th>
              <th>{toplam.brut.toLocaleString("tr-TR")}</th>
              <th>{toplam.masraf.toLocaleString("tr-TR")}</th>
              <th style={{ fontWeight: "bold", color: toplam.net >= 0 ? "#197d19" : "crimson" }}>
                {toplam.net.toLocaleString("tr-TR")}
              </th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
