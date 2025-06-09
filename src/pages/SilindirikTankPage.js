import React, { useState } from "react";

// Standart çaplar ve birimler
const standartCaplar = [1000, 1250, 1500, 1800, 2000, 2250, 2500, 2800, 3000, 3200, 3500];
const birimler = [
  { birim: "m³", factor: 1 },
  { birim: "Litre", factor: 0.001 },
];

// Proje kodu oluşturucu
function generateProjectCode(tarih, malzeme, tabanTipi, hacim, birim, sirano = 1) {
  if (!tarih) return "";
  const date = new Date(tarih);
  const year = String(date.getFullYear()).slice(-1); // 2025 -> "5"
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const hafta = String(Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)).padStart(2, "0");
  const gun = String(date.getDay() || 7).padStart(2, "0");
  let kod = `${malzeme === "HDPE" ? "HDPE" : "PP"}-${tabanTipi === "konik" ? "SK" : "S"}-${parseFloat(hacim)}${birim === "m³" ? "" : "L"}-${year}${hafta}${gun}-${String(sirano).padStart(2, "0")}`;
  return kod;
}

export default function SilindirikTankPage() {
  // State
  const [mode, setMode] = useState("hacim");
  const [hacim, setHacim] = useState(10);
  const [hacimBirim, setHacimBirim] = useState("m³");
  const [cap, setCap] = useState(2000);
  const [yukseklik, setYukseklik] = useState(3200);
  const [kalinlik, setKalinlik] = useState(10);
  const [malzeme, setMalzeme] = useState("HDPE");
  const [tabanTipi, setTabanTipi] = useState("duz");
  const [sonuc, setSonuc] = useState("");
  const [firma, setFirma] = useState("");
  const [proje, setProje] = useState("");
  const [tarih, setTarih] = useState(() => new Date().toISOString().slice(0, 10));
  const [simonaPrice, setSimonaPrice] = useState(3.5);
  const [firatPrice, setFiratPrice] = useState(2.9);
  const [eurtl, setEurTl] = useState(35.5);
  const [sellFactor, setSellFactor] = useState(2);
  const [plakaW, setPlakaW] = useState(1500);
  const [plakaL, setPlakaL] = useState(3000);

  // Proje kodu üret
  const projeKodu = generateProjectCode(tarih, malzeme, tabanTipi, hacim, hacimBirim);

  // Hacme göre DVS öneri: EN YAKIN standart çap ile, hiç hata vermeden formu otomatik doldurur.
  function oneriHesapla() {
    let hacim_m3 = hacim * birimler.find(b => b.birim === hacimBirim).factor;
    let enYakin = null;
    let enKucukFark = Infinity;
    let uygunSecenek = null;
    let secenekler = [];
    // Standart DVS aralığı: oran 0.8-1.1
    for (let c of standartCaplar) {
      // Konik taban hacmini de dikkate al
      let minKonikYuk = tabanTipi === "konik" ? Math.round(c * 0.2) : 0;
      let minKonikHacim = tabanTipi === "konik"
        ? (1 / 3) * Math.PI * Math.pow((c / 2 / 1000), 2) * (minKonikYuk / 1000)
        : 0;
      // Yüksekliği çözelim (y = bilinmeyen, silindir+konik hacmi = hacim_m3)
      let silindirHacim = (v) => Math.max(v - minKonikHacim, 0);
      let h = (silindirHacim(hacim_m3)) / (Math.PI * Math.pow((c / 2 / 1000), 2)) * 1000 + minKonikYuk;
      let oran = h / c;
      let fark = Math.abs(
        ((Math.PI * Math.pow((c / 2 / 1000), 2)) * ((h - minKonikYuk) / 1000) + minKonikHacim) - hacim_m3
      );
      secenekler.push({ cap: c, yukseklik: Math.round(h), oran: oran.toFixed(2) });
      if (fark < enKucukFark) {
        enKucukFark = fark;
        enYakin = { cap: c, yukseklik: Math.round(h), oran: oran.toFixed(2) };
      }
      if (!uygunSecenek && oran >= 0.8 && oran <= 1.1) {
        uygunSecenek = { cap: c, yukseklik: Math.round(h), oran: oran.toFixed(2) };
      }
    }
    // Seçimi uygula (önce DVS uygunluğu, yoksa en yakın)
    const sec = uygunSecenek || enYakin;
    setCap(sec.cap);
    setYukseklik(sec.yukseklik);
    setSonuc(
      `<b>Otomatik Ölçü:</b><br/>
      Çap: <b>${sec.cap} mm</b>, Yükseklik: <b>${sec.yukseklik} mm</b> (h/d: ${sec.oran})` +
      (uygunSecenek ? "<br><span style='color:#059d32'>DVS2205 aralığında.</span>" : "<br><span style='color:#e57b01'>DVS aralığında değil, en yakın boyut otomatik seçildi.</span>")
    );
  }

  // Hesaplama
  function hesapla() {
    const c = +cap;
    const h = +yukseklik;
    const t = +kalinlik / 1000;
    const rho = malzeme === "HDPE" ? 0.96 * 1000 : 0.92 * 1000;
    // Konik taban
    let konikYuk = tabanTipi === "konik" ? Math.round(c * 0.2) : 0;
    let konikHacim = tabanTipi === "konik"
      ? (1 / 3) * Math.PI * Math.pow((c / 2 / 1000), 2) * (konikYuk / 1000)
      : 0;
    let silindirHacim = Math.PI * Math.pow(c / 2 / 1000, 2) * ((h - konikYuk) / 1000);
    let v = silindirHacim + konikHacim;
    // Alan
    let taban_alan = Math.PI * ((c / 2) ** 2);
    let yan_alan = Math.PI * c * h;
    let konikEkAlan = 0;
    let tabanMetin = "";
    if (tabanTipi === "konik") {
      const r = c / 2;
      const l = Math.sqrt(r ** 2 + konikYuk ** 2);
      konikEkAlan = Math.PI * r * l - taban_alan;
      tabanMetin = `(Konik ek alan: ${konikEkAlan.toFixed(0)} mm²)`;
    }
    const toplam_alan = yan_alan + taban_alan + konikEkAlan;
    const agirlik = (toplam_alan / 1e6) * t * rho;

    // Plaka ve fire
    const plakaAlan = plakaW * plakaL;
    const plakaSayisi = Math.ceil(toplam_alan / plakaAlan);
    const fireOran = ((1 - (toplam_alan / (plakaSayisi * plakaAlan))) * 100).toFixed(2);

    // Fiyatlar
    const simona_eur = (agirlik * simonaPrice).toFixed(2);
    const firat_eur = (agirlik * firatPrice).toFixed(2);
    const simona_tl = (simona_eur * eurtl).toFixed(2);
    const firat_tl = (firat_eur * eurtl).toFixed(2);
    const simona_satis = (simona_tl * sellFactor).toFixed(2);
    const firat_satis = (firat_tl * sellFactor).toFixed(2);

    setSonuc(`
      <b>Proje:</b> ${firma ? firma + " – " : ""}${proje || ""} <br>
      <b>Proje Tarihi:</b> ${tarih} <br>
      <b>Proje Kodu:</b> ${projeKodu}<br>
      <b>Tank Hacmi:</b> ${v.toFixed(2)} m³<br>
      <b>Yan Alan:</b> ${(yan_alan / 1e6).toFixed(2)} m²<br>
      <b>Taban Alan:</b> ${(taban_alan / 1e6).toFixed(2)} m² ${tabanMetin}<br>
      <b>Toplam Yüzey Alanı:</b> ${(toplam_alan / 1e6).toFixed(2)} m²<br>
      <b>Malzeme Ağırlığı:</b> ${agirlik.toFixed(2)} kg<br>
      <b>Plaka Sayısı:</b> ${plakaSayisi}<br>
      <b>Fire Oranı:</b> %${fireOran}<br>
      <table style="border-collapse:collapse;margin:7px 0">
        <tr><th></th><th>Maliyet (€)</th><th>Maliyet (TL)</th><th>Satış (TL)</th></tr>
        <tr><td>Simona</td><td>€${simona_eur}</td><td>₺${simona_tl}</td><td>₺${simona_satis}</td></tr>
        <tr><td>Fırat</td><td>€${firat_eur}</td><td>₺${firat_tl}</td><td>₺${firat_satis}</td></tr>
      </table>
      <b>Kullanılan Kalınlık:</b> ${kalinlik} mm<br>
      <b>Malzeme:</b> ${malzeme} 
    `);
  }

  // Projeye kaydet
  function projeyeKaydet() {
    if (!sonuc) {
      alert("Lütfen önce hesapla!");
      return;
    }
    const yeniProje = {
      firma,
      proje,
      tarih,
      projeKodu,
      cap,
      yukseklik,
      kalinlik,
      malzeme,
      tabanTipi,
      simonaPrice,
      firatPrice,
      eurtl,
      sellFactor,
      plakaW,
      plakaL,
      hesapSonuclari: sonuc,
      kayitTarihi: new Date().toISOString(),
    };
    let projeler = [];
    try { projeler = JSON.parse(localStorage.getItem("projeler")) || []; } catch { projeler = []; }
    projeler.push(yeniProje);
    localStorage.setItem("projeler", JSON.stringify(projeler));
    alert(`"${proje || "Proje"}" başarıyla projeler listene eklendi!`);
  }

  return (
    <div className="silindirik-container" style={{ maxWidth: 700, margin: "auto", background: "#fff", padding: 28, borderRadius: 13 }}>
      <h2>Silindirik Tank Hesaplama</h2>
      <form className="silindirik-form" onSubmit={e => { e.preventDefault(); hesapla(); }}>
        <label>Firma Adı</label>
        <input value={firma} onChange={e => setFirma(e.target.value)} />

        <label>Proje Adı</label>
        <input value={proje} onChange={e => setProje(e.target.value)} />

        <label>Proje Tarihi</label>
        <input type="date" value={tarih} onChange={e => setTarih(e.target.value)} />

        <label>Proje Kodu</label>
        <input value={projeKodu} readOnly style={{ background: "#f8f8f8" }} />

        <label>Simona Fiyatı (€/kg)</label>
        <input type="number" value={simonaPrice} onChange={e => setSimonaPrice(e.target.value)} />

        <label>Fırat Fiyatı (€/kg)</label>
        <input type="number" value={firatPrice} onChange={e => setFiratPrice(e.target.value)} />

        <label>Euro/TL Kuru</label>
        <input type="number" value={eurtl} step="0.01" onChange={e => setEurTl(e.target.value)} />

        <label>Satış Çarpanı</label>
        <input type="number" value={sellFactor} step="0.1" onChange={e => setSellFactor(e.target.value)} />

        <label>Plaka Genişliği (mm)</label>
        <input type="number" value={plakaW} onChange={e => setPlakaW(+e.target.value)} />

        <label>Plaka Boyu (mm)</label>
        <input type="number" value={plakaL} onChange={e => setPlakaL(+e.target.value)} />

        <div className="button-group" style={{ display: "flex", gap: 8, margin: "15px 0" }}>
          <button type="button" style={{ background: mode === "hacim" ? "#ff9800" : "#eee", color: "#222" }} onClick={() => setMode("hacim")}>Hacme Göre DVS Ölçü Öner</button>
          <button type="button" style={{ background: mode === "olcu" ? "#ff9800" : "#eee", color: "#222" }} onClick={() => setMode("olcu")}>Ölçüye Göre Hesapla</button>
        </div>

        {mode === "hacim" && (
          <>
            <label>İstenilen Hacim</label>
            <div style={{ display: "flex", gap: 10 }}>
              <input type="number" value={hacim} min={0.1} onChange={e => setHacim(e.target.value)} />
              <select value={hacimBirim} onChange={e => setHacimBirim(e.target.value)}>
                {birimler.map(b => (<option key={b.birim}>{b.birim}</option>))}
              </select>
              <button type="button" style={{ minWidth: 120 }} onClick={oneriHesapla}>DVS'ye Göre Öner</button>
            </div>
          </>
        )}

        <label>Çap (mm)</label>
        <input type="number" value={cap} onChange={e => setCap(e.target.value)} />

        <label>Yükseklik (mm)</label>
        <input type="number" value={yukseklik} onChange={e => setYukseklik(e.target.value)} />

        <label>Taban Tipi</label>
        <select value={tabanTipi} onChange={e => setTabanTipi(e.target.value)}>
          <option value="duz">Düz</option>
          <option value="konik">Konik</option>
        </select>

        <label>Kalınlık (mm)</label>
        <input type="number" value={kalinlik} min={3} max={50} onChange={e => setKalinlik(e.target.value)} />

        <label>Malzeme</label>
        <select value={malzeme} onChange={e => setMalzeme(e.target.value)}>
          <option value="HDPE">HDPE</option>
          <option value="PP">PP</option>
        </select>

        <div className="button-group" style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button type="submit" style={{ background: "#199cdf", color: "#fff", fontWeight: 600, padding: "9px 20px", borderRadius: 7 }}>Hesapla</button>
          <button type="button" style={{ background: "#2ba743", color: "#fff", fontWeight: 600, padding: "9px 20px", borderRadius: 7 }} onClick={projeyeKaydet}>Projeye Kaydet</button>
        </div>
      </form>
      <div style={{ background: "#f3fbff", padding: 15, borderRadius: 8, marginTop: 20, fontSize: 17 }}
        dangerouslySetInnerHTML={{ __html: sonuc }} />
    </div>
  );
}
