return (
  <div className="stok-wrapper">
    <h2 className="stok-title">Stok Takibi</h2>
    {/* Dashboard kısmı */}
    <div style={{display:"flex", gap:20, marginBottom:18}}>
      <input
        type="text"
        placeholder="Malzeme ara..."
        value={filtre}
        onChange={e => setFiltre(e.target.value)}
        style={{flex:1}}
      />
      <span>Çeşit: <b>{stoklar.length}</b></span>
      <span>Toplam Stok: <b>{toplamStok}</b></span>
    </div>
    {/* Form */}
    <form onSubmit={kaydet} className="stok-form" style={{display:'flex',gap:8,marginBottom:24,flexWrap:"wrap"}}>
      {/* ...input ve buttonlar */}
    </form>
    {/* Tablo */}
    <table className="stok-table">
      <thead>...</thead>
      <tbody>...</tbody>
    </table>
    {/* İşlem geçmişi */}
    <div className="log-box">
      <h3>İşlem Geçmişi</h3>
      <ul>
        {log.length === 0 && <li>Henüz işlem yapılmadı.</li>}
        {log.slice().reverse().map((item, idx) => (
          <li key={idx}>
            <span style={{ color: "#888" }}>{item.zaman} - </span>
            {item.mesaj}
          </li>
        ))}
      </ul>
    </div>
  </div>
)
