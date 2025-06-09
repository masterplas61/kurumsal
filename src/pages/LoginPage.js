import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import logo from "../masterplast-logo.png";

export default function LoginPage({ isAuthenticated, userRole, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [username, password]);

  // Yönlendirme
  if (isAuthenticated && userRole === "admin") {
    return <Navigate to="/admin-paneli" />;
  }
  if (isAuthenticated && userRole === "kullanici") {
    return <Navigate to="/gelir-gider" />;
  }
  if (isAuthenticated && userRole === "izleyici") {
    return <Navigate to="/stok-takip" />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const role = onLogin(username, password);
    if (!role) {
      setError("Kullanıcı adı veya şifre hatalı!");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 80% 30%, #ffead2 0%, #fff8f3 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.14)",
          padding: 42,
          minWidth: 340,
          width: "95%",
          maxWidth: 370,
          margin: "24px 0",
        }}
      >
        <img
          src={logo}
          alt="Masterplast Logo"
          style={{
            width: 150,
            marginBottom: 28,
            borderRadius: 11,
            border: "1px solid #f5c085",
            background: "#fffbe6",
            boxShadow: "0 2px 14px 0 #f7c98d30",
          }}
        />
        <h2
          style={{
            margin: "12px 0 8px 0",
            color: "#ff6600",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "0.5px",
            fontFamily: "inherit",
          }}
        >
          Masterplast Industrial
        </h2>
        <div
          style={{
            color: "#474747",
            fontSize: 15,
            marginBottom: 12,
            opacity: 0.85,
          }}
        >
          <span style={{ color: "#2471A3", fontWeight: 600 }}>Kurumsal Portal Giriş</span>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              margin: "11px 0 7px 0",
              borderRadius: 7,
              border: "1.2px solid #ececec",
              fontSize: 16,
              background: "#f8f8f8",
              transition: "border 0.2s",
              outline: "none",
            }}
            autoFocus
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                margin: "7px 0 7px 0",
                borderRadius: 7,
                border: "1.2px solid #ececec",
                fontSize: 16,
                background: "#f8f8f8",
                outline: "none",
              }}
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPass ? "Şifreyi Gizle" : "Şifreyi Göster"}
              onClick={() => setShowPass((p) => !p)}
              style={{
                position: "absolute",
                right: 8,
                top: 9,
                border: "none",
                background: "none",
                color: "#aaa",
                fontSize: 18,
                cursor: "pointer",
                outline: "none",
                padding: 0,
              }}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              background: "linear-gradient(90deg, #ff6600 45%, #ffb97a 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              fontWeight: 700,
              fontSize: 17,
              marginTop: 12,
              boxShadow: "0 2px 16px 0 #f7c98d22",
              transition: "background 0.18s",
              cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >
            Giriş Yap
          </button>
        </form>
        {error && (
          <div style={{ color: "#e53935", marginTop: 15, fontWeight: 600, fontSize: 15 }}>
            {error}
          </div>
        )}
        <div
          style={{
            fontSize: 13,
            color: "#9a9a9a",
            marginTop: 16,
            opacity: 0.85,
            textAlign: "center",
          }}
        >
          <span style={{ color: "#ff9800", fontWeight: 500 }}>
            © {new Date().getFullYear()} Masterplast Industrial
          </span>
          <br />
          Tüm hakları saklıdır.
        </div>
      </div>
      <div style={{ color: "#c5c5c5", fontSize: 13, marginTop: 16 }}>
        <span>
          <b>Gizli Bilgi:</b> Masterplast portalına özel, dışarıya açık değildir.
        </span>
      </div>
    </div>
  );
}
