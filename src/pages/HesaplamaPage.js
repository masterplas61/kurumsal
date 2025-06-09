import React, { useEffect, useRef, useState } from "react";

// Proje kodu üretici (D harfiyle, istenen yapıda)
function generateProjectCode(tarih, malzeme, hacim, birim = "m³", sirano = 1) {
  if (!tarih) return "";
  const date = new Date(tarih);
  const year = String(date.getFullYear()).slice(-1);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const hafta = String(Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)).padStart(2, "0");
  const gun = String(date.getDay() || 7).padStart(2, "0");
  let kod = `${malzeme === "0.96" ? "HDPE" : "PP"}-D-${parseFloat(hacim)}${birim === "m³" ? "" : "L"}-${year}${hafta}${gun}-${String(sirano).padStart(2, "0")}`;
  return kod;
}

// DVS önerisi: Prizmatik, kare taban ve uygun yükseklik oranı (0.7–1.1)
function uygunPrizmatikOlcu(hacim_m3) {
  let enIyi = null, enKucukFark = Infinity;
  for (let taban = 500; taban <= 3000; taban += 100) {
    for (let h = Math.round(taban * 0.7); h <= Math.round(taban * 1.1); h += 100) {
      let v = (taban / 1000) * (taban / 1000) * (h / 1000);
      let fark = Math.abs(v - hacim_m3);
      if (fark < enKucukFark) {
        enKucukFark = fark;
        enIyi = { w: taban, l: taban, h: h, hacim: v, oran: (h / taban).toFixed(2) };
      }
    }
  }
  return enIyi;
}

export default function HomePage() {
  const thicknessRef = useRef(null);

  // Eklenen state'ler:
  const [tarih, setTarih] = useState(() => new Date().toISOString().slice(0, 10));
  const [hacim, setHacim] = useState(5);
  const [hacimBirim, setHacimBirim] = useState("m³");
  const [malzeme, setMalzeme] = useState("0.96");
  const [projeKod, setProjeKod] = useState("");

  // Proje kodu otomatik güncelle
  useEffect(() => {
    setProjeKod(generateProjectCode(tarih, malzeme, hacim, hacimBirim));
  }, [tarih, hacim, hacimBirim, malzeme]);

  // Diğer initializationlar:
  useEffect(() => {
    const sel = thicknessRef.current;
    if (sel && sel.options.length === 0) {
      for (let i = 1; i <= 50; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.text = i;
        sel.appendChild(opt);
      }
      sel.value = 10;
    }
    document.body.style.background = "#f0f0f0";
    return () => { document.body.style.background = ""; };
  }, []);

  useEffect(() => {
    if (!window.html2pdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // DVS'ye göre otomatik ölçü doldurma
  function dvseGoreOlcuOner() {
    let hacim_m3 = hacim * (hacimBirim === "m³" ? 1 : 0.001);
    const enIyi = uygunPrizmatikOlcu(hacim_m3);
    if (enIyi) {
      document.getElementById("width").value = enIyi.w;
      document.getElementById("length").value = enIyi.l;
      document.getElementById("height").value = enIyi.h;
      alert(
        `DVS2205'e Göre Önerilen:\nGenişlik: ${enIyi.w} mm\nBoy: ${enIyi.l} mm\nYükseklik: ${enIyi.h} mm\nOran (h/d): ${enIyi.oran}\nHacim: ${enIyi.hacim.toFixed(2)} m³`
      );
    }
  }

  // HESAPLAMA, PDF, ÇİZİM, PROJEYE KAYDETME... (Senin mevcut fonksiyonların tamamen korundu!)
  function hesapla() {
    const firma = document.getElementById("firma").value.trim();
    const proje = document.getElementById("proje").value.trim();
    const w = +document.getElementById("width").value;
    const l = +document.getElementById("length").value;
    const h = +document.getElementById("height").value;
    const t = +document.getElementById("thickness").value / 1000;
    const rho = +document.getElementById("material").value * 1000;
    const simona = +document.getElementById("simona_price").value;
    const firat = +document.getElementById("firat_price").value;
    const pw = +document.getElementById("plaka_w").value;
    const pl = +document.getElementById("plaka_l").value;
    const cover = document.getElementById("cover").value;
    const eurtl = +document.getElementById("eurtl").value;
    const sell_factor = +document.getElementById("sell_factor").value;

    const volume_m3 = (w * l * h / 1e9).toFixed(2);
    const cap_area = cover === "kapali" ? (w * l) : 0;
    const surface_m2 = (2 * (w * h + l * h) + w * l + cap_area) / 1e6;
    const weight = (surface_m2 * t * rho).toFixed(2);
    const simona_total_eur = (weight * simona).toFixed(2);
    const firat_total_eur = (weight * firat).toFixed(2);
    const simona_total_tl = (simona_total_eur * eurtl).toFixed(2);
    const firat_total_tl = (firat_total_eur * eurtl).toFixed(2);
    const simona_sell_tl = (simona_total_tl * sell_factor).toFixed(2);
    const firat_sell_tl = (firat_total_tl * sell_factor).toFixed(2);

    let bilgiSatiri = "";
    if (firma || proje) {
      bilgiSatiri = `<div class="bilgiSatiri">
        ${firma ? "Firma: <b>"+firma+"</b>&nbsp;&nbsp;" : ""} 
        ${proje ? "Proje: <b>"+proje+"</b>" : ""}
      </div>`;
    }

    // Proje kodu ve tarih de eklendi:
    document.getElementById("sonuclar").innerHTML = `
      ${bilgiSatiri}
      <div><strong>Tarih:</strong> ${tarih || ""} &nbsp;&nbsp; <strong>Proje Kodu:</strong> ${projeKod}</div>
      <strong>Tank Hacmi:</strong> ${volume_m3} m³<br>
      <strong>Yüzey Alanı:</strong> ${surface_m2.toFixed(2)} m²<br>
      <strong>Malzeme Ağırlığı:</strong> ${weight} kg<br>
      <table class="fiyatTablo">
        <tr>
          <th></th>
          <th>Maliyet (€)</th>
          <th>Maliyet (TL)</th>
          <th>Satış (TL, x${sell_factor})</th>
        </tr>
        <tr>
          <th>Simona</th>
          <td>€${simona_total_eur}</td>
          <td>₺${simona_total_tl}</td>
          <td>₺${simona_sell_tl}</td>
        </tr>
        <tr>
          <th>Fırat</th>
          <td>€${firat_total_eur}</td>
          <td>₺${firat_total_tl}</td>
          <td>₺${firat_sell_tl}</td>
        </tr>
      </table>
    `;

    // Parça bölme ve çizim bölümü...
    let orj_parts = [
      ["Yan", w, h], ["Yan", w, h],
      ["Yan", l, h], ["Yan", l, h],
      ["Taban", w, l]
    ];
    if (cover === "kapali") orj_parts.push(["Kapak", w, l]);

    function bolParca(parca, plakaW, plakaL) {
      let [isim, gen, yuk] = parca;
      let bolunmuslar = [];
      if (gen > plakaW) {
        let bolum = Math.ceil(gen / plakaW);
        let parcaW = Math.floor(gen / bolum);
        let kalan = gen - parcaW * (bolum - 1);
        for (let i = 0; i < bolum; i++) {
          bolunmuslar.push([isim + ` [${i+1}/${bolum}]`, i === bolum - 1 ? kalan : parcaW, yuk, true]);
        }
        return bolunmuslar;
      }
      if (yuk > plakaL) {
        let bolum = Math.ceil(yuk / plakaL);
        let parcaH = Math.floor(yuk / bolum);
        let kalan = yuk - parcaH * (bolum - 1);
        for (let i = 0; i < bolum; i++) {
          bolunmuslar.push([isim + ` [${i+1}/${bolum}]`, gen, i === bolum - 1 ? kalan : parcaH, true]);
        }
        return bolunmuslar;
      }
      bolunmuslar.push([isim, gen, yuk, false]);
      return bolunmuslar;
    }

    let parts = [];
    let bolum_bilgi = [];
    for (let p of orj_parts) {
      let bolunmuslar = bolParca(p, pw, pl);
      parts = parts.concat(bolunmuslar);
      if (bolunmuslar.length > 1) {
        bolum_bilgi.push(`<div class="bolunmus">${p[0]} (${p[1]}x${p[2]} mm) → ${bolunmuslar.length} parçaya bölündü</div>`);
      }
    }

    const cizimler = document.getElementById("cizimler");
    cizimler.innerHTML = bolum_bilgi.join("");

    let used_area = 0;
    let plaka_count = 0;
    let remaining = [...parts];

    let maxPlaka = 100;
    while (remaining.length > 0 && plaka_count < maxPlaka) {
      let layout = [];
      let bin_w = pl;
      let bin_h = pw;
      remaining.sort((a, b) => (b[1] * b[2]) - (a[1] * a[2]));
      let space = [{ x: 0, y: 0, w: bin_w, h: bin_h }];
      let new_remaining = [];

      for (let part of remaining) {
        let bestScore = Infinity;
        let bestNode = null;
        let bestIndex = -1;
        for (let i = 0; i < space.length; i++) {
          const s = space[i];
          const fits = [
            { w: part[1], h: part[2], rot: false },
            { w: part[2], h: part[1], rot: true }
          ];
          for (let f of fits) {
            if ((f.w <= s.w && f.h <= s.h) || (f.h <= s.w && f.w <= s.h)) {
              const score = s.w * s.h - f.w * f.h;
              if (score < bestScore) {
                bestScore = score;
                bestNode = { x: s.x, y: s.y, w: f.w, h: f.h, name: part[0], rotated: f.rot };
                bestIndex = i;
              }
            }
          }
        }
        if (bestNode) {
          layout.push(bestNode);
          const s = space[bestIndex];
          space.splice(bestIndex, 1);
          space.push({ x: s.x + bestNode.w, y: s.y, w: s.w - bestNode.w, h: bestNode.h });
          space.push({ x: s.x, y: s.y + bestNode.h, w: s.w, h: s.h - bestNode.h });
        } else {
          new_remaining.push(part);
        }
      }

      if (layout.length > 0) {
        const drawBox = document.createElement("div");
        drawBox.className = "drawBox";
        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");
        const scaleX = canvas.width / pl;
        const scaleY = canvas.height / pw;

        ctx.strokeStyle = "red";
        ctx.strokeRect(0, 0, pl * scaleX, pw * scaleY);
        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(`Plaka ${plaka_count + 1} (${pl}x${pw} mm)`, 10, canvas.height - 10);

        layout.forEach(p => {
          ctx.fillStyle = "#aee2ff";
          ctx.fillRect(p.x * scaleX, p.y * scaleY, p.w * scaleX, p.h * scaleY);
          ctx.strokeStyle = "#333";
          ctx.strokeRect(p.x * scaleX, p.y * scaleY, p.w * scaleX, p.h * scaleY);
          ctx.fillStyle = "#222";
          ctx.fillText(`${p.name} ${p.w}x${p.h}${p.rotated ? " (90°)" : ""}`, p.x * scaleX + 4, p.y * scaleY + 18);
          used_area += p.w * p.h;
        });

        const formatSelect = document.createElement("select");
        formatSelect.className = "save-format-select";
        ["png", "jpeg", "webp"].forEach(fmt => {
          const opt = document.createElement("option");
          opt.value = fmt;
          opt.text = fmt.toUpperCase();
          formatSelect.appendChild(opt);
        });

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Farklı Kaydet";
        saveBtn.className = "save-canvas-btn";
        saveBtn.onclick = function () {
          const format = formatSelect.value;
          let mime = "image/png";
          if (format === "jpeg") mime = "image/jpeg";
          if (format === "webp") mime = "image/webp";
          const link = document.createElement('a');
          link.href = canvas.toDataURL(mime);
          link.download = `plaka_cizimi_${plaka_count + 1}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        drawBox.appendChild(canvas);
        drawBox.appendChild(formatSelect);
        drawBox.appendChild(saveBtn);
        cizimler.appendChild(drawBox);

        let fireList = "";
        let fireCount = 0;
        if (space.length > 0) {
          let hasFire = false;
          fireList += `<div class="fire-list"><b>Fire Alanları:</b><ul>`;
          space.forEach((s, idx) => {
            if (s.w > 0 && s.h > 0) {
              fireCount++;
              fireList += `<li>${s.w} x ${s.h} mm</li>`;
              hasFire = true;
            }
          });
          fireList += hasFire ? `</ul></div>` : `YOK</div>`;
        }
        if (fireCount > 0) {
          const fireDiv = document.createElement("div");
          fireDiv.innerHTML = fireList;
          cizimler.appendChild(fireDiv);
        }

        plaka_count++;
      }

      if (new_remaining.length === remaining.length) break;
      remaining = new_remaining;
    }

    const total_area = pl * pw * plaka_count;
    const fire = ((1 - used_area / total_area) * 100).toFixed(2);
    document.getElementById("sonuclar").innerHTML += `<strong>Plaka Sayısı:</strong> ${plaka_count}<br><strong>Fire Oranı:</strong> %${fire}`;
  }

  // PDF Aktar
  function pdfAktar() {
    if (!document.getElementById('sonuclar').innerHTML.trim()) {
      alert("Önce Hesapla ve Yerleştir'e tıklayın!");
      return;
    }
    var pdfContent = document.createElement('div');
    pdfContent.innerHTML = document.getElementById('sonuclar').innerHTML;
    var cizimlerDiv = document.getElementById('cizimler');
    Array.from(cizimlerDiv.getElementsByTagName('canvas')).forEach(function (canvas) {
      var img = document.createElement('img');
      img.src = canvas.toDataURL("image/png");
      img.style.display = "block";
      img.style.margin = "24px 0";
      img.style.maxWidth = "100%";
      pdfContent.appendChild(img);
    });
    Array.from(cizimlerDiv.getElementsByClassName('fire-list')).forEach(function (div) {
      let clone = div.cloneNode(true);
      clone.style.marginBottom = "20px";
      pdfContent.appendChild(clone);
    });
    if (window.html2pdf) {
      var opt = {
        margin: 10,
        filename: 'tank_kesim_plani.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(pdfContent).save();
    } else {
      alert("PDF için gerekli kütüphane yüklenemedi!");
    }
  }

  // Çizimleri topluca kaydet
  function cizimleriKaydet() {
    var cizimlerDiv = document.getElementById('cizimler');
    var canvases = cizimlerDiv.getElementsByTagName('canvas');
    if (canvases.length === 0) {
      alert("Kaydedilecek çizim yok. Önce Hesapla ve Yerleştir'e tıklayın!");
      return;
    }
    for (let i = 0; i < canvases.length; i++) {
      let canvas = canvases[i];
      let link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = `plaka_cizimi_${i + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Projeye Kaydet
  function projeyeKaydet() {
    if (!document.getElementById('sonuclar').innerHTML.trim()) {
      alert("Önce Hesapla ve Yerleştir'e tıklayın!");
      return;
    }
    const firma = document.getElementById("firma").value.trim();
    const proje = document.getElementById("proje").value.trim();
    const width = document.getElementById("width").value;
    const length = document.getElementById("length").value;
    const height = document.getElementById("height").value;
    const thickness = document.getElementById("thickness").value;
    const material = document.getElementById("material").options[document.getElementById("material").selectedIndex].text;
    const simona_price = document.getElementById("simona_price").value;
    const firat_price = document.getElementById("firat_price").value;
    const plaka_w = document.getElementById("plaka_w").value;
    const plaka_l = document.getElementById("plaka_l").value;
    const cover = document.getElementById("cover").options[document.getElementById("cover").selectedIndex].text;
    const eurtl = document.getElementById("eurtl").value;
    const sell_factor = document.getElementById("sell_factor").value;
    const hesapSonuclari = document.getElementById('sonuclar').innerHTML;

    const yeniProje = {
      firma,
      proje,
      width,
      length,
      height,
      thickness,
      material,
      simona_price,
      firat_price,
      plaka_w,
      plaka_l,
      cover,
      eurtl,
      sell_factor,
      tarih,
      projeKod,
      hesapSonuclari
    };
    let projeler = [];
    try { projeler = JSON.parse(localStorage.getItem("projeler")) || []; } catch { projeler = []; }
    projeler.push(yeniProje);
    localStorage.setItem("projeler", JSON.stringify(projeler));
    alert(`"${proje || "Proje"}" başarıyla kaydedildi!`);
  }

  // Stiller
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .container { background: white; max-width: 1000px; margin: auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
      input, select, button, label { width: 100%; padding: 10px; margin: 5px 0; font-size: 1em; }
      canvas { border: 1px solid #ccc; margin: 20px 0 5px 0; }
      h2 { text-align: center; }
      #sonuclar { font-size: 1.1em; }
      .fiyatTablo { border-collapse: collapse; margin-top:10px; }
      .fiyatTablo td, .fiyatTablo th { border: 1px solid #bbb; padding: 5px 10px; }
      .fiyatTablo th { background: #f3fafb; }
      .bilgiSatiri { background: #e4f4ff; font-weight:bold; padding:6px 0 4px 0; }
      #pdfBtn { margin-bottom: 20px; }
      #pdf-icerik { margin-top: 32px; padding: 16px; background: #fff; }
      #saveDrawingsBtn { background: #47b7ff; color: #fff; border: none; border-radius: 5px; }
      #saveDrawingsBtn:hover { background: #3a95ca; }
      .fire-list { margin: 0 0 15px 0; color: #333; font-size: 0.98em; }
      .fire-list ul { margin: 5px 0 5px 18px; padding: 0; }
      .fire-list li { margin-bottom: 2px; }
      .save-canvas-btn {
        display: inline-block;
        width: 160px;
        margin: 5px 0 15px 5px;
        background: #54d37d;
        color: #fff;
        padding: 7px 0;
        border: none;
        border-radius: 5px;
        font-size: 1em;
        cursor: pointer;
        transition: background 0.2s;
        vertical-align: middle;
      }
      .save-canvas-btn:hover {
        background: #36b85e;
      }
      .save-format-select {
        width: auto;
        display: inline-block;
        margin-left: 0;
        margin-right: 7px;
        vertical-align: middle;
        padding: 7px 15px;
        font-size: 1em;
      }
      .drawBox { margin-bottom: 12px; display: inline-block; }
      .bolunmus { color: #b70; font-size: 0.95em; margin-bottom: 6px;}
      #projeKaydetBtn {
        background: #169c56;
        color: #fff;
        font-weight: bold;
        border: none;
        border-radius: 5px;
        margin-top: 7px;
        margin-bottom: 10px;
        font-size: 1.08em;
        padding: 11px 0;
        cursor: pointer;
        transition: background 0.15s;
      }
      #projeKaydetBtn:hover {
        background: #117841;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); }
  }, []);

  // === KULLANICIYA GÖRÜNECEK KISIM ===
  return (
    <div className="container">
      <h2>Tank Kesim Planı – 1500x3000 Plakaya Otomatik Bölme</h2>

      {/* --- YENİ ALANLAR --- */}
      <label>Tarih</label>
      <input type="date" id="tarih" value={tarih} onChange={e => setTarih(e.target.value)} />
      <label>Proje Kodu</label>
      <input value={projeKod} readOnly style={{ background: "#f9f9f9", fontWeight: "bold" }} />
      <label>Hacim</label>
     <div style={{
  display: "flex",
  gap: 14,
  alignItems: "center",
  marginBottom: 10,
  maxWidth: 460
}}>
  <input
    type="number"
    value={hacim}
    min={0.1}
    onChange={e => setHacim(e.target.value)}
    style={{
      flex: "0 0 160px",
      fontSize: "1.18em",
      padding: "12px 14px",
      fontWeight: "bold"
    }}
    placeholder="Örn: 10"
  />
  <select
    value={hacimBirim}
    onChange={e => setHacimBirim(e.target.value)}
    style={{
      flex: "0 0 85px",
      fontSize: "1.09em",
      height: 45,
      fontWeight: 600
    }}
  >
    <option value="m³">m³</option>
    <option value="Litre">Litre</option>
  </select>
  <button
    type="button"
    onClick={dvseGoreOlcuOner}
    style={{
      flex: "1 1 130px",
      background: "#ffa600",
      color: "#222",
      fontWeight: 600,
      border: "none",
      borderRadius: 5,
      padding: "13px 14px",
      marginLeft: 8,
      cursor: "pointer",
      fontSize: "1.07em"
    }}
  >
    DVS'ye Göre Ölçü Öner
  </button>
</div>
      {/* --- BURADAN İTİBAREN VAR OLAN KLASİK FORM --- */}
      <label>Firma Adı</label>
      <input type="text" id="firma" placeholder="Firma adını yazınız" />
      <label>Proje Adı</label>
      <input type="text" id="proje" placeholder="Proje adını yazınız" />
      <label>Tank Genişliği (mm)</label>
      <input type="number" id="width" defaultValue="2000" />
      <label>Tank Boyu (mm)</label>
      <input type="number" id="length" defaultValue="2500" />
      <label>Tank Yüksekliği (mm)</label>
      <input type="number" id="height" defaultValue="2000" />
      <label>Üst Kapağı</label>
      <select id="cover">
        <option value="acik">Üstü Açık</option>
        <option value="kapali">Üstü Kapalı</option>
      </select>
      <label>Malzeme Kalınlığı (mm)</label>
      <select id="thickness" ref={thicknessRef}></select>
      <label>Malzeme Türü</label>
      <select id="material" value={malzeme} onChange={e => setMalzeme(e.target.value)}>
        <option value="0.96">HDPE (0.96 g/cm³)</option>
        <option value="0.92">PP (0.92 g/cm³)</option>
      </select>
      <label>Simona Fiyatı (€/kg)</label>
      <input type="number" id="simona_price" defaultValue="3.5" />
      <label>Fırat Fiyatı (€/kg)</label>
      <input type="number" id="firat_price" defaultValue="2.9" />
      <label>Plaka Genişliği (mm)</label>
      <input type="number" id="plaka_w" defaultValue="1500" readOnly />
      <label>Plaka Boyu (mm)</label>
      <input type="number" id="plaka_l" defaultValue="3000" readOnly />
      <label>Euro/TL Kuru</label>
      <input type="number" id="eurtl" defaultValue="35.5" step="0.01" />
      <label>Satış Fiyatı Çarpanı (ör: 2, 2.5, 3)</label>
      <input type="number" id="sell_factor" defaultValue="2" step="0.1" />
      <button onClick={hesapla}>Hesapla ve Yerleştir</button>
      <button id="pdfBtn" onClick={pdfAktar}>PDF Olarak Kaydet</button>
      <button id="saveDrawingsBtn" onClick={cizimleriKaydet}>Tüm Çizimleri Kaydet</button>
      <button id="projeKaydetBtn" onClick={projeyeKaydet}>Projeye Kaydet</button>
      <div id="pdf-icerik">
        <p id="sonuclar"></p>
        <div id="cizimler"></div>
      </div>
    </div>
  );
}
