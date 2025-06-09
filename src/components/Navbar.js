import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ isAuthenticated, onLogout }) {
  const location = useLocation();
  const links = [
    { to: "/", label: "Ana Sayfa" },
    { to: "/hesaplama", label: "Prizmatik Tank Hesaplama" },
    { to: "/silindirik-tank", label: "Silindirik Tank Hesaplama" }, // YENİ
    { to: "/gelirler", label: "Gelir/Gider" },
    { to: "/projeler", label: "Projeler" },
    { to: "/stok-takip", label: "Stok Takip" },
    { to: "/aylik-ozet", label: "Finans Özeti" },
  ];

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <nav
      style={{
        background: "#f1f1f1",
        padding: 14,
        marginBottom: 26,
        display: "flex",
        alignItems: "center",
        borderRadius: 10,
        boxShadow: "0 3px 10px #eee",
      }}
    >
      {isAuthenticated ? (
        <>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                marginRight: 14,
                textDecoration: isActive(link.to) ? "underline" : "none",
                color: isActive(link.to) ? "#ff6600" : "#333",
                fontWeight: isActive(link.to) ? "bold" : "normal",
                fontSize: 17,
                background: isActive(link.to) ? "#fff7ee" : "transparent",
                borderRadius: 7,
                padding: "6px 15px",
                transition: "all 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
          <button
            style={{
              marginLeft: "auto",
              background: "#ff6600",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 16,
              boxShadow: "0 2px 6px #ffd1b3",
            }}
            onClick={onLogout}
          >
            Çıkış Yap
          </button>
        </>
      ) : (
        <Link
          to="/login"
          style={{ fontSize: 17, color: "#ff6600", fontWeight: 600 }}
        >
          Giriş
        </Link>
      )}
    </nav>
  );
}
