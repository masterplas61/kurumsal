import React, { useEffect, useRef, useState } from "react";

export default function HomePage() {
  // --- PDF kütüphanesi otomatik yüklenir ---
  useEffect(() => {
    if (!window.html2pdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Stil (formun içinde çıkış yok, üstte menüde olacak)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .container { background: white; max-width: 650px; margin: 32px auto; padding: 24px 22px 28px 22px; border-radius: 13px; box-shadow: 0 2px 13px #0001; position:relative; }
      input, select, button, label { width: 100%; padding: 10px; margin: 4px 0; font-size: 1em; }
      button { font-weight: 600; border-radius: 7px; border: none; }
      h2 { text-align: center; }
      .tablo { width:100%; border-collapse:collapse; margin-top:8px; }
      .tablo th, .tablo td { border: 1px solid #bbb; padding: 6px 9px; font-size: 1em;}
      .tablo th { background: #f3f3f3;}
      .eur-btn {width:auto;padding:8px 16px; font-size:1em;margin-left:10px; background:#277ae7; color:#fff; border-radius:6px;}
      .eur-btn:hover {background:#1c529e;}
      .sonucbox {background:#f3fbff; padding:14px 14px 7px 14px; border-radius:8px; margin:18px 0 0 0;}
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); }
  }, []);

  // STATE'LER
  const [tarih, setTarih] = useState(() => new Date().toISOString().slice(0, 10));
  const [firma, setFirma] = useState("");
  const [proje, setProje] = useState("");
  const [hacim, setHacim] = useState(10);
  const [hacimBirim, setHacimBirim] = useState("m³");
  const [width, setWidth] = useState(2000);
  const [length, setLength] = useState(2500);
  const [height, setHeight] = useState(2000);
  const [thickness, setThickness] = useState(10);
  const [material, setMaterial] = useState("0.96");
  const [simonaPrice, setSimonaPrice] = useState(3.5);
  const [firatPrice, setFiratPrice] = useState(2.9);
  const [plakaW] = useState(1500);
  const [plakaL] = useState(3000);
  const [eurtl, setEurTl] = useState(35.5);
  const [sellFactor, setSellFactor] = useState(2);
  const [cover, setCover] = useState("acik");
  const [sonuc, setSonuc] = useState("");
  const [plakaParcalar, setPlakaParcalar] = useState([]);
  const parcaTabloRef = useRef(null);

  // Proje kodu üret
  function generateProjectCode() {
    const date = new Date(tarih);
    const year = String(date.getFullYear()).slice(-1);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const hafta = String(Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)).padStart(2, "0");
    const gun = String(date.getDay() || 7).padStart(2, "0");
    let kod = `${material === "0.96" ? "HDPE" : "PP"}-D-${parseFloat(hacim)}${hacimBirim === "m³" ? "" : "L"}-${year}${hafta}${gun}-01`;
    return kod;
  }
  const projeKod = generateProjectCode();

  // Güncel Euro/TL
  async function guncelleKur() {
    setEurTl("...");
    try {
      // Burada web api ile Euro alış kurunu çekiyoruz (TCMB, Mynet, exchangerate.host...)
      const resp = await fetch("https://api.exchangerate.host/latest?base=EUR&symbols=TRY");
      const js = await resp.json();
      if (js && js.rates && js.rates.TRY) {
        setEurTl(js.rates.TRY.toFixed(2));
      } else throw new Error();
    } catch {
      setEurTl("HATA");
      setTimeout(() => setEurTl(35.5), 2500);
      alert("Kur alınamadı. Tekrar deneyin veya manuel girin.");
    }
  }

  // Hesapla ve tablo oluştur
  function hesapla() {
    let orj_parts = [
      ["Yan", width, height], ["Yan", width, height],
      ["Yan", length, height], ["Yan", length, height],
      ["Taban", width, length]
    ];
    if (cover === "kapali") orj_parts.push(["Kapak", width, length]);

    // Parçaları plakaya sığdırmak (bölüp atama) - en basit sistem!
    let plakaNo = 1, plakalar = [], kalan = [], tablo = [];
    let pw = plakaL, ph = plakaW;
    let _parts = [];
    for (let p of orj_parts) {
      // Parçayı plaka genişliği/boyuna böl
      if (p[1] > pw || p[2] > ph) {
        let yatay = Math.ceil(p[1] / pw);
        let dikey = Math.ceil(p[2] / ph);
        for (let i = 0; i < yatay; i++) {
          for (let j = 0; j < dikey; j++) {
            _parts.push([
              p[0] + ` [${i + 1 + yatay*j}/${yatay*dikey}]`,
              i < yatay - 1 ? pw : (p[1] - pw * (yatay - 1)),
              j < dikey - 1 ? ph : (p[2] - ph * (dikey - 1))
            ]);
          }
        }
      } else {
        _parts.push([p[0], p[1], p[2]]);
      }
    }
    // Şimdi parçaları plakaya sırayla at
    let _plaka = [];
    let alan = 0;
    _parts.forEach((p, idx) => {
      if (alan + (p[1] * p[2]) > pw * ph) {
        plakalar.push(_plaka);
        _plaka = [];
        alan = 0;
        plakaNo++;
      }
      _plaka.push(p);
      alan += p[1] * p[2];
      tablo.push({ plaka: plakaNo, isim: p[0], olcu: `${p[1]}x${p[2]}` });
    });
    if (_plaka.length > 0) plakalar.push(_plaka);

    setPlakaParcalar(tablo);

    // Fire yoksa, fire % yazmayız (çok basit yerleşim)
    const t = thickness / 1000;
    const rho = parseFloat(material) * 1000;
    const tabanKatsayi = cover === "kapali" ? 2 : 1;
    const toplamAlan = 2 * (width * height + length * height) + width * length * tabanKatsayi;
    const agirlik = (toplamAlan / 1e6) * t * rho;
    const simona_eur = (agirlik * simonaPrice).toFixed(2);
    const firat_eur = (agirlik * firatPrice).toFixed(2);
    const simona_tl = (simona_eur * eurtl).toFixed(2);
    const firat_tl = (firat_eur * eurtl).toFixed(2);
    const simona_satis = (simona_tl * sellFactor).toFixed(2);
    const firat_satis = (firat_tl * sellFactor).toFixed(2);

    setSonuc(`
      <div style="font-size:16.5px;font-weight:bold">${firma ? firma + " – " : ""}${proje || ""}</div>
      <b>Proje Tarihi:</b> ${tarih}<br>
      <b>Proje Kodu:</b> ${projeKod}<br>
      <b>Tank Hacmi:</b> ${(width*length*height/1e9).toFixed(2)} m³<br>
      <b>Malzeme Ağırlığı:</b> ${agirlik.toFixed(2)} kg<br>
      <b>Plaka Sayısı:</b> ${plakalar.length}<br>
      <table class="tablo">
        <tr><th></th><th>Maliyet (€)</th><th>Maliyet (TL)</th><th>Satış (TL)</th></tr>
        <tr><td>Simona</td><td>€${simona_eur}</td><td>₺${simona_tl}</td><td>₺${simona_satis}</td></tr>
        <tr><td>Fırat</td><td>€${firat_eur}</td><td>₺${firat_tl}</td><td>₺${firat_satis}</td></tr>
      </table>
      <b>Kullanılan Kalınlık:</b> ${thickness} mm<br>
      <b>Malzeme:</b> ${material === "0.96" ? "HDPE" : "PP"}<br>
      <b>Üstü Kapalı mı?:</b> ${cover === "kapali" ? "Kapalı (taban+kapak)" : "Açık (sadece taban)"}
    `);
  }

  // PDF çıktısı: sade, teknik tablo
  function pdfAktar() {
    if (!sonuc || plakaParcalar.length === 0) {
      alert("Önce Hesapla ve Yerleştir'e tıklayın!");
      return;
    }
    var pdfContent = document.createElement('div');
    pdfContent.innerHTML = `
      <div style="font-size:21px;font-weight:bold;margin-bottom:18px;">
        TANK KESİM PLANI – ÜRETİM BASKI
      </div>
      ${sonuc}
      <div>
        <h3 style="margin:12px 0 4px 0;">Plaka Yerleşim Tablosu</h3>
        <table border="1" style="border-collapse:collapse;width:100%;margin-bottom:18px;">
          <thead>
            <tr style="background:#f3f3f3;">
              <th>Plaka</th><th>Parça</th><th>Ölçü (mm)</th>
            </tr>
          </thead>
          <tbody>
            ${plakaParcalar.map(x =>
              `<tr>
                <td style="text-align:center;">${x.plaka}</td>
                <td>${x.isim}</td>
                <td style="text-align:center;">${x.olcu}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
    if (window.html2pdf) {
      var opt = {
        margin: [12, 10, 13, 10],
        filename: 'tank_kesim_plani.pdf',
        image: { type: 'jpeg', quality: 0.97 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(pdfContent).save();
    } else {
      alert("PDF için gerekli kütüphane yüklenemedi!");
    }
  }

  // SAYFA
  return (
    <div className="container">
      <h2 style={{color:"#003d81"}}>Silindirik/Prizmatik Tank Üretim Plaka Yerleşimi</h2>
      <label>Firma Adı</label>
      <input value={firma} onChange={e => setFirma(e.target.value)} />
      <label>Proje Adı</label>
      <input value={proje} onChange={e => setProje(e.target.value)} />
      <label>Proje Tarihi</label>
      <input type="date" value={tarih} onChange={e => setTarih(e.target.value)} />
      <label>Proje Kodu</label>
      <input value={projeKod} readOnly style={{ background: "#f8f8f8", fontWeight: 600 }} />
      <label>İstenen Hacim</label>
      <div style={{display:"flex",gap:7,marginBottom:8}}>
        <input type="number" value={hacim} onChange={e => setHacim(e.target.value)} min={0.1} style={{flex:1}} />
        <select value={hacimBirim} onChange={e => setHacimBirim(e.target.value)} style={{flex:1}}>
          <option value="m³">m³</option>
          <option value="Litre">Litre</option>
        </select>
      </div>
      <label>Tank Genişliği (mm)</label>
      <input type="number" value={width} onChange={e => setWidth(+e.target.value)} />
      <label>Tank Boyu (mm)</label>
      <input type="number" value={length} onChange={e => setLength(+e.target.value)} />
      <label>Tank Yüksekliği (mm)</label>
      <input type="number" value={height} onChange={e => setHeight(+e.target.value)} />
      <label>Üst Kapağı</label>
      <select value={cover} onChange={e => setCover(e.target.value)}>
        <option value="acik">Üstü Açık</option>
        <option value="kapali">Üstü Kapalı</option>
      </select>
      <label>Malzeme Kalınlığı (mm)</label>
      <input type="number" value={thickness} min={3} max={50} onChange={e => setThickness(+e.target.value)} />
      <label>Malzeme Türü</label>
      <select value={material} onChange={e => setMaterial(e.target.value)}>
        <option value="0.96">HDPE (0.96 g/cm³)</option>
        <option value="0.92">PP (0.92 g/cm³)</option>
      </select>
      <label>Simona Fiyatı (€/kg)</label>
      <input type="number" value={simonaPrice} onChange={e => setSimonaPrice(+e.target.value)} />
      <label>Fırat Fiyatı (€/kg)</label>
      <input type="number" value={firatPrice} onChange={e => setFiratPrice(+e.target.value)} />
      <label>Euro/TL Kuru
        <button className="eur-btn" type="button" onClick={guncelleKur}>Güncel Euro Kuru</button>
      </label>
      <input type="number" value={eurtl} step="0.01" onChange={e => setEurTl(+e.target.value)} />
      <label>Satış Fiyatı Çarpanı</label>
      <input type="number" value={sellFactor} step="0.1" onChange={e => setSellFactor(+e.target.value)} />
      <div style={{display:"flex",gap:10,margin:"17px 0"}}>
        <button style={{background:"#199cdf",color:"#fff",fontWeight:600,padding:"10px 20px"}} type="button" onClick={hesapla}>
          Hesapla ve Yerleştir
        </button>
        <button style={{background:"#1c882c",color:"#fff",fontWeight:600,padding:"10px 20px"}} type="button" onClick={pdfAktar}>
          PDF olarak Kaydet
        </button>
      </div>
      {sonuc &&
        <div className="sonucbox">
          <div dangerouslySetInnerHTML={{ __html: sonuc }} />
          <h3 style={{margin:"18px 0 4px 0"}}>Plaka Yerleşim Tablosu</h3>
          <table className="tablo">
            <thead>
              <tr>
                <th>Plaka</th>
                <th>Parça</th>
                <th>Ölçü (mm)</th>
              </tr>
            </thead>
            <tbody>
              {plakaParcalar.map((x, i) =>
                <tr key={i}>
                  <td style={{textAlign:"center"}}>{x.plaka}</td>
                  <td>{x.isim}</td>
                  <td style={{textAlign:"center"}}>{x.olcu}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
}
