import React, { useState, useEffect } from "react";

export default function ProjelerPage() {
  const [projeler, setProjeler] = useState([
    {
      firma: "Örnek Firma",
      isim: "Tank Kesim - 01",
      aciklama: "HDPE depo projesi",
      tarih: "2025-04-10",
      malzemeler: [
        { isim: "HDPE Levha", adet: 3, aciklama: "Taban ve yanlar için" },
      ],
    },
    {
      firma: "Başka Firma",
      isim: "PP Reaktör",
      aciklama: "Kimya tesisi reaktör projesi",
      tarih: "2025-03-12",
      malzemeler: [],
    },
  ]);
  const [filtre, setFiltre] = useState("");

  useEffect(() => {
    // localStorage'dan projeler (HomePage'den kaydedilenler)
    const kayitliProjeler = JSON.parse(localStorage.getItem("projeler") || "[]");
    if (kayitliProjeler.length > 0) {
      const duzgunProjeler = kayitliProjeler.map(p => ({
        firma: p.firma || "-",
        isim: p.proje || p.isim || "-",
        aciklama: p.aciklama || (p.hesapSonuclari ? "" : "-"),
        tarih: p.tarih || "",
        malzemeler: p.malzemeler || [],
        hesapSonuclari: p.hesapSonuclari || "",
      }));
      setProjeler(prev => {
        const tumProjeler = [...prev, ...duzgunProjeler];
        const benzersiz = [];
        tumProjeler.forEach(proje => {
          if (!benzersiz.some(p => p.isim === proje.isim && p.tarih === proje.tarih)) {
            benzersiz.push(proje);
          }
        });
        return benzersiz;
      });
    }
  }, []);

  const filtrelenmisProjeler = projeler.filter(
    (p) =>
      (p.firma && p.firma.toLowerCase().includes(filtre.toLowerCase())) ||
      (p.isim && p.isim.toLowerCase().includes(filtre.toLowerCase())) ||
      (p.aciklama && p.aciklama.toLowerCase().includes(filtre.toLowerCase()))
  );

  return (
    <div>
      <h2>Geçmiş Projeler</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Firma/proje ara..."
          value={filtre}
          onChange={e => setFiltre(e.target.value)}
          style={{ padding: 8, width: 250, marginRight: 12, fontSize: 16 }}
        />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table border={1} cellPadding={10} style={{
          minWidth: 1100, borderCollapse: "collapse", fontSize: 17, background: "#fff"
        }}>
          <thead style={{ background: "#e0f7fa" }}>
            <tr>
              <th style={{ width: "15%" }}>Firma</th>
              <th style={{ width: "15%" }}>Proje İsmi</th>
              <th style={{ width: "23%" }}>Açıklama</th>
              <th style={{ width: "12%" }}>Tarih</th>
              <th style={{ width: "27%" }}>Kullanılan Malzemeler / Sonuç</th>
            </tr>
          </thead>
          <tbody>
            {filtrelenmisProjeler.length === 0 && (
              <tr>
                <td colSpan={5}>Kriterlere uygun proje bulunamadı.</td>
              </tr>
            )}
            {filtrelenmisProjeler.map((p, i) => (
              <tr key={i}>
                <td>{p.firma || "-"}</td>
                <td>{p.isim}</td>
                <td>{p.aciklama || "-"}</td>
                <td>{p.tarih}</td>
                <td>
                  {/* Eğer hesapSonuclari (HTML çıktı) varsa onu göster */}
                  {p.hesapSonuclari ? (
                    <div dangerouslySetInnerHTML={{ __html: p.hesapSonuclari }} />
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {p.malzemeler.length === 0 && <li>Malzeme eklenmemiş</li>}
                      {p.malzemeler.map((m, j) => (
                        <li key={j}>
                          <b>{m.isim}</b> - {m.adet} adet
                          {m.aciklama && <> (<i>{m.aciklama}</i>)</>}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}