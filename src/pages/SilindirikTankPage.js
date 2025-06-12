import React, { useState, useEffect } from "react";
import "./SilindirikTankPage.css";

// Standartlar ve yardımcı fonksiyonlar
const standartCaplar = [1000, 1250, 1500, 1800, 2000, 2250, 2500, 2800, 3000, 3200, 3500];
const birimler = [
  { birim: "m³", factor: 1 },
  { birim: "Litre", factor: 0.001 },
];

// Proje kodu oluşturucu
function generateProjectCode(tarih, malzeme, tabanTipi, hacim, birim, sirano = 1) {
  if (!tarih) return "";
  const date = new Date(tarih);
  const year = String(date.getFullYear()).slice(-1);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const hafta = String(Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)).padStart(2, "0");
  const gun = String(date.getDay() || 7).padStart(2, "0");
  let kod = `${malzeme === "HDPE" ? "HDPE" : "PP"}-${tabanTipi === "konik" ? "SK" : "S"}-${parseFloat(hacim)}${birim === "m³" ? "" : "L"}-${year}${hafta}${gun}-${String(sirano).padStart(2, "0")}`;
  return kod;
}

// Pratik üretim mantığına uygun plaka sayısı ve fire hesabı:
function plakaParcaHesapla(cap, yuk, plakaW, plakaL, ustKapali, tabanTipi) {
  const yanSacUzunluk = Math.round(Math.PI * cap);
  const yanSacBoy = yuk;
  let yanSacPlakaSayisi;
  if (yanSacBoy <= plakaL && yanSacUzunluk <= plakaW) {
    yanSacPlakaSayisi = 1;
  } else if (yanSacBoy <= plakaL) {
    yanSacPlakaSayisi = Math.ceil(yanSacUzunluk / plakaW);
  } else if (yanSacUzunluk <= plakaW) {
    yanSacPlakaSayisi = Math.ceil(yanSacBoy / plakaL);
  } else {
    yanSacPlakaSayisi = Math.ceil(yanSacUzunluk / plakaW) * Math.ceil(yanSacBoy / plakaL);
  }
  const tabanKatsayi = ustKapali === "evet" ? 2 : 1;
  let tabanKapakPlaka = 0;
  for (let i = 0; i < tabanKatsayi; i++) {
    if (cap <= plakaW && cap <= plakaL) {
      tabanKapakPlaka += 1;
    } else {
      const daireAlan = Math.PI * Math.pow(cap / 2, 2);
      const plakaAlan = plakaW * plakaL;
      tabanKapakPlaka += Math.ceil(daireAlan / plakaAlan);
    }
  }
  const yanSacAlan = yanSacUzunluk * yanSacBoy;
  const tabanAlan = Math.PI * Math.pow(cap / 2, 2) * tabanKatsayi;
  const toplamKullanilanAlan = yanSacAlan + tabanAlan;
  const toplamPlakaAlan = (yanSacPlakaSayisi + tabanKapakPlaka) * plakaW * plakaL;
  const fireOran = Math.max(0, (toplamPlakaAlan - toplamKullanilanAlan) / toplamPlakaAlan);

  return {
    yanSacPlakaSayisi,
    tabanKapakPlaka,
    toplamPlakaSayisi: yanSacPlakaSayisi + tabanKapakPlaka,
    fireOran: fireOran,
    yanSacAlan,
    tabanAlan,
    toplamKullanilanAlan,
    toplamPlakaAlan,
  };
}

export default function SilindirikTankPage() {
  const [mode, setMode] = useState("hacim");
  const [hacim, setHacim] = useState(10);
  const [hacimBirim, setHacimBirim] = useState("m³");
  const [cap, setCap] = useState(2000);
  const [yukseklik, setYukseklik] = useState(3200);
  const [kalinlik, setKalinlik] = useState(10);
  const [malzeme, setMalzeme] = useState("HDPE");
  const [tabanTipi, setTabanTipi] = useState("duz");
  const [ustuKapali, setUstuKapali] = useState("evet");
  const [sonuc, setSonuc] = useState("");
  const [firma, setFirma] = useState("");
  const [proje, setProje] = useState("");
  const [tarih, setTarih] = useState(() => new Date().toISOString().slice(0, 10));
  const [simonaPrice, setSimonaPrice] = useState(3.5);
  const [firatPrice, setFiratPrice] = useState(2.9);
  const [eurtl, setEurTl] = useState(35.5);
  const [isKurLoading, setIsKurLoading] = useState(false);
  const [sellFactor, setSellFactor] = useState(2);
  const [plakaW, setPlakaW] = useState(1500);
  const [plakaL, setPlakaL] = useState(3000);

  const projeKodu = generateProjectCode(tarih, malzeme, tabanTipi, hacim, hacimBirim);

  // GÜNCEL EURO/TL KURU ÇEKEN KOD
  async function fetchEuroKur() {
    setIsKurLoading(true);
    try {
      const res = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml");
      const text = await res.text();
      const parser = new window.DOMParser();
      const xml = parser.parseFromString(text, "application/xml");
      const euroNode = xml.querySelector('Currency[CurrencyCode="EUR"]');
      const forexSelling = euroNode.querySelector("ForexSelling").textContent;
      setEurTl(Number(parseFloat(forexSelling).toFixed(4)));
    } catch (err) {
      // Hata olursa eski kur kalsın, istersen alert verebilirsin
    }
    setIsKurLoading(false);
  }

  // Sayfa ilk açıldığında otomatik olarak kur çek
  useEffect(() => {
    fetchEuroKur();
  }, []);

  function oneriHesapla() {
    let hacim_m3 = hacim * birimler.find(b => b.birim === hacimBirim).factor;
    let enYakinCap = standartCaplar.reduce((prev, curr) =>
      Math.abs(curr - Math.cbrt((hacim_m3 * 4) / Math.PI)) < Math.abs(prev - Math.cbrt((hacim_m3 * 4) / Math.PI))
        ? curr : prev
    );
    let minKonikYuk = tabanTipi === "konik" ? Math.round(enYakinCap * 0.2) : 0;
    let minKonikHacim = tabanTipi === "konik"
      ? (1 / 3) * Math.PI * Math.pow((enYakinCap / 2 / 1000), 2) * (minKonikYuk / 1000)
      : 0;
    let h = (Math.max(hacim_m3 - minKonikHacim, 0)) / (Math.PI * Math.pow((enYakinCap / 2 / 1000), 2)) * 1000 + minKonikYuk;
    let oran = h / enYakinCap;
    let uygun = oran >= 0.8 && oran <= 1.1;
    setCap(enYakinCap);
    setYukseklik(Math.round(h));
    setSonuc(
      `<b>Otomatik Ölçü:</b><br/>
      Çap: <b>${enYakinCap} mm</b>, Yükseklik: <b>${Math.round(h)} mm</b> (h/d: ${oran.toFixed(2)})` +
      (uygun
        ? "<br><span style='color:#059d32'>DVS2205 aralığında.</span>"
        : "<br><span style='color:#e57b01'>DVS aralığında değil, en yakın çap ve yükseklik otomatik seçildi.</span>")
    );
  }

  function hesapla() {
    const c = +cap;
    const h = +yukseklik;
    const t = +kalinlik / 1000;
    const rho = malzeme === "HDPE" ? 0.96 * 1000 : 0.92 * 1000;
    const tabanKatsayi = ustuKapali === "evet" ? 2 : 1;
    let konikYuk = tabanTipi === "konik" ? Math.round(c * 0.2) : 0;
    let konikHacim = tabanTipi === "konik"
      ? (1 / 3) * Math.PI * Math.pow((c / 2 / 1000), 2) * (konikYuk / 1000)
      : 0;
    let silindirHacim = Math.PI * Math.pow(c / 2 / 1000, 2) * ((h - konikYuk) / 1000);
    let v = silindirHacim + konikHacim;

    const plakalar = plakaParcaHesapla(c, h, plakaW, plakaL, ustuKapali, tabanTipi);

    let toplamAlan = Math.PI * c * h + c * c * tabanKatsayi;
    let agirlik = (toplamAlan / 1e6) * t * rho;

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
      <b>Yan Alan:</b> ${(Math.PI * c * h / 1e6).toFixed(2)} m²<br>
      <b>Taban/Kapak Alanı:</b> ${(c * c * tabanKatsayi / 1e6).toFixed(2)} m²<br>
      <b>Toplam Yüzey Alanı:</b> ${(toplamAlan / 1e6).toFixed(2)} m²<br>
      <b>Malzeme Ağırlığı:</b> ${agirlik.toFixed(2)} kg<br>
      <b>Plaka Sayısı (üretime uygun):</b> <b>${plakalar.toplamPlakaSayisi}</b><br>
      <b>Yan Sac Plaka:</b> ${plakalar.yanSacPlakaSayisi}<br>
      <b>Taban/Kapak Plaka:</b> ${plakalar.tabanKapakPlaka}<br>
      <b>Kaba Fire Oranı:</b> %${(plakalar.fireOran*100).toFixed(1)}<br>
      <table style="border-collapse:collapse;margin:7px 0">
        <tr><th></th><th>Maliyet (€)</th><th>Maliyet (TL)</th><th>Satış (TL)</th></tr>
        <tr><td>Simona</td><td>€${simona_eur}</td><td>₺${simona_tl}</td><td>₺${simona_satis}</td></tr>
        <tr><td>Fırat</td><td>€${firat_eur}</td><td>₺${firat_tl}</td><td>₺${firat_satis}</td></tr>
      </table>
      <b>Kullanılan Kalınlık:</b> ${kalinlik} mm<br>
      <b>Malzeme:</b> ${malzeme} 
      <br><b>Üstü Kapalı mı?:</b> ${ustuKapali === "evet" ? "Kapalı (taban+kapak)" : "Açık (sadece taban)"}
    `);
  }

  return (
    <div className="tank-form-container">
      <h2>Silindirik Tank Hesaplama</h2>
      <form onSubmit={e => { e.preventDefault(); hesapla(); }}>
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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="number"
            value={eurtl}
            step="0.01"
            onChange={e => setEurTl(e.target.value)}
            style={{ flex: 2 }}
          />
          <button
            type="button"
            onClick={fetchEuroKur}
            disabled={isKurLoading}
            style={{
              flex: 1,
              padding: "5px 7px",
              background: "#199cdf",
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            {isKurLoading ? "Yükleniyor..." : "Güncelle"}
          </button>
        </div>

        <label>Satış Çarpanı</label>
        <input type="number" value={sellFactor} step="0.1" onChange={e => setSellFactor(e.target.value)} />

        <label>Plaka Genişliği (mm)</label>
        <input type="number" value={plakaW} onChange={e => setPlakaW(+e.target.value)} />

        <label>Plaka Boyu (mm)</label>
        <input type="number" value={plakaL} onChange={e => setPlakaL(+e.target.value)} />

        <label>İstenen Hacim</label>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="number"
            value={hacim}
            min={0.1}
            onChange={e => setHacim(e.target.value)}
            style={{ flex: 2 }}
          />
          <select
            value={hacimBirim}
            onChange={e => setHacimBirim(e.target.value)}
            style={{ flex: 1 }}
          >
            {birimler.map((b, i) => (
              <option key={i} value={b.birim}>{b.birim}</option>
            ))}
          </select>
          <button type="button" className="dvs-btn" style={{ flex: 2 }} onClick={oneriHesapla}>
            DVS'ye Göre Öner
          </button>
        </div>

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

        <label>Üstü Kapalı mı?</label>
        <select value={ustuKapali} onChange={e => setUstuKapali(e.target.value)}>
          <option value="evet">Evet</option>
          <option value="hayir">Hayır</option>
        </select>

        <div className="btn-row">
          <button type="submit" className="hesapla-btn">Hesapla</button>
          <button type="button" className="kaydet-btn">Projeye Kaydet</button>
        </div>
      </form>
      <div style={{ background: "#f3fbff", padding: 15, borderRadius: 8, marginTop: 20, fontSize: 17 }} dangerouslySetInnerHTML={{ __html: sonuc }} />
    </div>
  );
}
