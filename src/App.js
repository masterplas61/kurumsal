import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import HesaplamaPage from "./pages/HesaplamaPage";
import SilindirikTankPage from "./pages/SilindirikTankPage";
import GelirlerPage from "./pages/GelirlerPage";
import ProjelerPage from "./pages/ProjelerPage";
import StokTakipPage from "./pages/StokTakipPage";
import AylikOzetPage from "./pages/AylikOzetPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import { users } from "./users";

// Yetki kontrollü route
function PrivateRoute({ isAuthenticated, allowedRoles, userRole, children }) {
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("isAuthenticated")
  );
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");

  const handleLogin = (username, password) => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      setIsAuthenticated(true);
      setUserRole(user.role);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", user.role);
      return user.role;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} userRole={userRole} />
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              onLogin={handleLogin}
            />
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["admin"]}>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hesaplama"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["admin"]}>
              <HesaplamaPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/silindirik-tank"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["admin", "ambar"]}>
              <SilindirikTankPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/gelirler"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["admin", "muhasebe"]}>
              <GelirlerPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/projeler"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["admin"]}>
              <ProjelerPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/stok-takip"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["admin", "ambar"]}>
              <StokTakipPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/aylik-ozet"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["admin", "muhasebe"]}>
              <AylikOzetPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
