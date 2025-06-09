import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";

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
  const [yeniFirma, setYeniFirma] = useState("");
  const [yeniIsim, setYeniIsim] = useState("");
  const [yeniAciklama, setYeniAciklama] = useState("");
  const [yeniTarih, setYeniTarih] = useState("");
  const [filtre, setFiltre] = useState("");
  const [malzemeForm, setMalzemeForm] = useState({});
  const [duzenleIndex, setDuzenleIndex] = useState(null);
  const [duzenleForm, setDuzenleForm] = useState({ firma: "", isim: "", aciklama: "", tarih: "" });

  // Her proje için ref
  const pdfRefs = useRef({});

  useEffect(() => {
    const kayitliProjeler = JSON.parse(localStorage.getItem("projeler") || "[]");
    if (kayitliProjeler.length > 0) {
      const duzgunProjeler = kayitliProjeler.map(p => ({
        firma: p.firma || "-",
        isim: p.proje || p.isim || "-",
        aciklama: p.aciklama || "",
        tarih: p.tarih || "",
        malzemeler: p.malzemeler || [],
        hesapSonuclari: p.hesapSonuclari || p.hesapOzeti || "",
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

  // PDF indir
  const handlePdf = (index) => {
    const element = pdfRefs.current[index];
    if (element) {
      html2pdf().from(element).set({
        margin: 10,
        filename: `${projeler[index].isim || "proje"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save();
    }
  };

  // Proje ekleme
  const projeEkle = (e) => {
    e.preventDefault();
    if (!yeniFirma || !yeniIsim || !yeniTarih) return;
    const yeniProjeler = [
      ...projeler,
      {
        firma: yeniFirma,
        isim: yeniIsim,
        aciklama: yeniAciklama,
        tarih: yeniTarih,
        malzemeler: [],
      },
    ];
    setProjeler(yeniProjeler);
    setYeniFirma("");
    setYeniIsim("");
    setYeniAciklama("");
    setYeniTarih("");
    localStorage.setItem("projeler", JSON.stringify(yeniProjeler));
  };

  // Malzeme ekleme
  const malzemeEkle = (projeIndex) => {
    const { isim, adet, aciklama } = malzemeForm[projeIndex] || {};
    if (!isim || !adet) return;
    const yeniProjeler = [...projeler];
    yeniProjeler[projeIndex].malzemeler.push({
      isim,
      adet: Number(adet),
      aciklama,
    });
    setProjeler(yeniProjeler);
    setMalzemeForm({ ...malzemeForm, [projeIndex]: { isim: "", adet: "", aciklama: "" } });
    localStorage.setItem("projeler", JSON.stringify(yeniProjeler));
  };

  // Proje silme fonksiyonu
  const projeSil = (index) => {
    if (!window.confirm("Bu projeyi silmek istediğinizden emin misiniz?")) return;
    const yeniProjeler = [...projeler];
    yeniProjeler.splice(index, 1);
    setProjeler(yeniProjeler);
    localStorage.setItem("projeler", JSON.stringify(yeniProjeler));
  };

  // Düzenlemeyi başlat
  const baslatDuzenle = (index) => {
    setDuzenleIndex(index);
    setDuzenleForm({
      firma: projeler[index].firma,
      isim: projeler[index].isim,
      aciklama: projeler[index].aciklama,
      tarih: projeler[index].tarih,
    });
  };

  // Düzenlemeyi kaydet
  const duzenlemeyiKaydet = (e) => {
    e.preventDefault();
    if (!duzenleForm.firma || !duzenleForm.isim || !duzenleForm.tarih) return;
    const yeniProjeler = [...projeler];
    yeniProjeler[duzenleIndex] = {
      ...yeniProjeler[duzenleIndex],
      firma: duzenleForm.firma,
      isim: duzenleForm.isim,
      aciklama: duzenleForm.aciklama,
      tarih: duzenleForm.tarih,
    };
    setProjeler(yeniProjeler);
    setDuzenleIndex(null);
    setDuzenleForm({ firma: "", isim: "", aciklama: "", tarih: "" });
    localStorage.setItem("projeler", JSON.stringify(yeniProjeler));
  };

  // Düzenlemeyi iptal et
  const duzenlemeyiIptalEt = () => {
    setDuzenleIndex(null);
    setDuzenleForm({ firma: "", isim: "", aciklama: "", tarih: "" });
  };

  // Filtreli projeler
  const filtrelenmisProjeler = projeler.filter(
    (p) =>
      (p.firma && p.firma.toLowerCase().includes(filtre.toLowerCase())) ||
      (p.isim && p.isim.toLowerCase().includes(filtre.toLowerCase())) ||
      (p.aciklama && p.aciklama.toLowerCase().includes(filtre.toLowerCase()))
  );

  return (
    <div>
      <h2 style={{ color: "#2471A3", textAlign: "center", margin: "28px 0 24px" }}>Geçmiş Projeler</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Firma/proje ara..."
          value={filtre}
          onChange={e => setFiltre(e.target.value)}
          style={{ padding: 8, width: 250, marginRight: 12, fontSize: 16 }}
        />
      </div>
      {/* Proje ekleme formu */}
      <form onSubmit={projeEkle} style={{ marginBottom: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Firma Adı"
          value={yeniFirma}
          onChange={e => setYeniFirma(e.target.value)}
          style={{ flex: 2, minWidth: 140, fontSize: 16, padding: 8 }}
          required
        />
        <input
          type="text"
          placeholder="Proje İsmi"
          value={yeniIsim}
          onChange={e => setYeniIsim(e.target.value)}
          style={{ flex: 2, minWidth: 140, fontSize: 16, padding: 8 }}
          required
        />
        <input
          type="text"
          placeholder="Açıklama"
          value={yeniAciklama}
          onChange={e => setYeniAciklama(e.target.value)}
          style={{ flex: 4, minWidth: 200, fontSize: 16, padding: 8 }}
        />
        <input
          type="date"
          placeholder="Tarih"
          value={yeniTarih}
          onChange={e => setYeniTarih(e.target.value)}
          style={{ flex: 1, minWidth: 120, fontSize: 16, padding: 8 }}
          required
        />
        <button type="submit" style={{ fontSize: 16, padding: "8px 20px" }}>Proje Ekle</button>
      </form>
      {/* Proje listesi */}
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
              <th style={{ width: "27%" }}>Kullanılan Malzemeler/Sonuç</th>
              <th style={{ width: "8%" }}></th>
            </tr>
          </thead>
          <tbody>
            {filtrelenmisProjeler.length === 0 && (
              <tr>
                <td colSpan={6}>Kriterlere uygun proje bulunamadı.</td>
              </tr>
            )}
            {filtrelenmisProjeler.map((p, i) => (
              <tr key={i}>
                {/* Proje düzenleme formu aktifse */}
                {duzenleIndex === projeler.indexOf(p) ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={duzenleForm.firma}
                        onChange={e => setDuzenleForm({ ...duzenleForm, firma: e.target.value })}
                        style={{ width: "95%", fontSize: 16, padding: 4 }}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={duzenleForm.isim}
                        onChange={e => setDuzenleForm({ ...duzenleForm, isim: e.target.value })}
                        style={{ width: "95%", fontSize: 16, padding: 4 }}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={duzenleForm.aciklama}
                        onChange={e => setDuzenleForm({ ...duzenleForm, aciklama: e.target.value })}
                        style={{ width: "95%", fontSize: 16, padding: 4 }}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={duzenleForm.tarih}
                        onChange={e => setDuzenleForm({ ...duzenleForm, tarih: e.target.value })}
                        style={{ width: "95%", fontSize: 16, padding: 4 }}
                        required
                      />
                    </td>
                    <td colSpan={2}>
                      <button onClick={duzenlemeyiKaydet} style={{ fontSize: 16, marginRight: 10 }}>Kaydet</button>
                      <button onClick={duzenlemeyiIptalEt} style={{ fontSize: 16 }}>İptal</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{p.firma || "-"}</td>
                    <td>{p.isim}</td>
                    <td>{p.aciklama || "-"}</td>
                    <td>{p.tarih}</td>
                    <td>
                      <div
                        ref={el => pdfRefs.current[i] = el}
                        style={{ background: "#fff", color: "#111", padding: 4, minWidth: 300 }}
                      >
                        <b>Firma:</b> {p.firma}<br />
                        <b>Proje:</b> {p.isim}<br />
                        <b>Açıklama:</b> {p.aciklama}<br />
                        <b>Tarih:</b> {p.tarih}<br />
                        <div>
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
                        </div>
                      </div>
                      {/* Malzeme ekleme formu (sadece klasik projeler için) */}
                      {!p.hesapSonuclari && (
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            malzemeEkle(projeler.indexOf(p));
                          }}
                          style={{ marginTop: 8, display: "flex", gap: 5, flexWrap: "wrap" }}
                        >
                          <input
                            type="text"
                            placeholder="Malzeme İsmi"
                            value={(malzemeForm[projeler.indexOf(p)]?.isim) || ""}
                            onChange={e =>
                              setMalzemeForm({
                                ...malzemeForm,
                                [projeler.indexOf(p)]: {
                                  ...malzemeForm[projeler.indexOf(p)],
                                  isim: e.target.value,
                                },
                              })
                            }
                            style={{ width: 100, fontSize: 15, padding: 4 }}
                            required
                          />
                          <input
                            type="number"
                            placeholder="Adet"
                            value={(malzemeForm[projeler.indexOf(p)]?.adet) || ""}
                            onChange={e =>
                              setMalzemeForm({
                                ...malzemeForm,
                                [projeler.indexOf(p)]: {
                                  ...malzemeForm[projeler.indexOf(p)],
                                  adet: e.target.value,
                                },
                              })
                            }
                            style={{ width: 60, fontSize: 15, padding: 4 }}
                            min={1}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Açıklama"
                            value={(malzemeForm[projeler.indexOf(p)]?.aciklama) || ""}
                            onChange={e =>
                              setMalzemeForm({
                                ...malzemeForm,
                                [projeler.indexOf(p)]: {
                                  ...malzemeForm[projeler.indexOf(p)],
                                  aciklama: e.target.value,
                                },
                              })
                            }
                            style={{ width: 160, fontSize: 15, padding: 4 }}
                          />
                          <button type="submit" style={{ fontSize: 15, padding: "4px 14px" }}>
                            Malzeme Ekle
                          </button>
                        </form>
                      )}
                    </td>
                    <td>
                      <button
                        style={{ padding: "7px 16px", marginBottom: 6, background: "#17a2b8", color: "#fff", border: 0, borderRadius: 6, cursor: "pointer" }}
                        onClick={() => handlePdf(i)}
                      >
                        PDF Olarak Kaydet
                      </button>
                      <button onClick={() => baslatDuzenle(projeler.indexOf(p))} style={{ fontSize: 15, marginRight: 8 }}>
                        Düzenle
                      </button>
                      <button
                        onClick={() => projeSil(projeler.indexOf(p))}
                        style={{
                          background: "#e74c3c",
                          color: "#fff",
                          border: "none",
                          borderRadius: 5,
                          padding: "6px 13px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: 15,
                          marginTop: 5
                        }}
                      >
                        Sil
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
