import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin Pages & Layout
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Books from './pages/Books';
import AddBook from './pages/AddBook';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Ratings from './pages/Ratings';
import History from './pages/History';
import Settings from './pages/Settings';
import Activity from './pages/Activity';
import Curations from './pages/Curations';
import Reports from './pages/Reports';
import Circulation from './pages/Circulation';

// Siswa Pages & Layout
import SiswaLayout from './layouts/SiswaLayout';
import LoginSiswa from './pages/siswa/LoginSiswa';
import RegisterSiswa from './pages/siswa/RegisterSiswa';
import DashboardSiswa from './pages/siswa/DashboardSiswa';
import KatalogSiswa from './pages/siswa/KatalogSiswa';
import FavoritSiswa from './pages/siswa/FavoritSiswa';
import DetailBukuSiswa from './pages/siswa/DetailBukuSiswa';
import BacaBukuSiswa from './pages/siswa/BacaBukuSiswa';
import ProfilSiswa from './pages/siswa/ProfilSiswa';
import RiwayatSiswa from './pages/siswa/RiwayatSiswa';

import { initLocalStorage } from './lib/mockData';

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return (
        sessionStorage.getItem('bacayuk_admin_auth') === 'true' ||
        localStorage.getItem('bacayuk_admin_auth') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [isSiswaAuthenticated, setIsSiswaAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('bacayuk_siswa_auth') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    initLocalStorage();

    const handleAuthChange = () => {
      try {
        setIsAdminAuthenticated(
          sessionStorage.getItem('bacayuk_admin_auth') === 'true' ||
          localStorage.getItem('bacayuk_admin_auth') === 'true'
        );
      } catch {
        setIsAdminAuthenticated(false);
      }

      try {
        setIsSiswaAuthenticated(localStorage.getItem('bacayuk_siswa_auth') === 'true');
      } catch {
        setIsSiswaAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth_changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth_changed', handleAuthChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* =========================================
            1. RUTE SISWA / PERPUSTAKAAN DIGITAL (/)
           ========================================= */}
        <Route
          path="/siswa/login"
          element={!isSiswaAuthenticated ? <LoginSiswa /> : <Navigate to="/" replace />}
        />
        <Route
          path="/siswa/register"
          element={!isSiswaAuthenticated ? <RegisterSiswa /> : <Navigate to="/" replace />}
        />

        {/* Portal Siswa di root '/' */}
        <Route path="/" element={<SiswaLayout />}>
          <Route index element={<DashboardSiswa />} />
          <Route path="katalog" element={<KatalogSiswa />} />
          <Route path="favorit" element={<FavoritSiswa />} />
          <Route path="riwayat" element={<RiwayatSiswa />} />
          <Route path="buku/:id" element={<DetailBukuSiswa />} />
          <Route path="baca/:id" element={<BacaBukuSiswa />} />
          <Route path="profil" element={<ProfilSiswa />} />
        </Route>

        {/* Alias rute prefix '/siswa/*' agar link lama tetap bekerja */}
        <Route path="/siswa" element={<SiswaLayout />}>
          <Route index element={<DashboardSiswa />} />
          <Route path="katalog" element={<KatalogSiswa />} />
          <Route path="favorit" element={<FavoritSiswa />} />
          <Route path="riwayat" element={<RiwayatSiswa />} />
          <Route path="buku/:id" element={<DetailBukuSiswa />} />
          <Route path="baca/:id" element={<BacaBukuSiswa />} />
          <Route path="profil" element={<ProfilSiswa />} />
        </Route>

        {/* =========================================
            2. RUTE PORTAL ADMIN (/admin)
           ========================================= */}
        <Route
          path="/admin/login"
          element={!isAdminAuthenticated ? <Login /> : <Navigate to="/admin" replace />}
        />
        <Route
          path="/admin/register"
          element={!isAdminAuthenticated ? <Register /> : <Navigate to="/admin" replace />}
        />
        <Route
          path="/login"
          element={!isAdminAuthenticated ? <Login /> : <Navigate to="/admin" replace />}
        />
        <Route
          path="/register"
          element={!isAdminAuthenticated ? <Register /> : <Navigate to="/admin" replace />}
        />

        <Route
          path="/admin"
          element={isAdminAuthenticated ? <AdminLayout /> : <Navigate to="/admin/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="books/add" element={<AddBook />} />
          <Route path="books/edit/:id" element={<AddBook />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
          <Route path="curations" element={<Curations />} />
          <Route path="circulation" element={<Circulation />} />
          <Route path="reports" element={<Reports />} />
          <Route path="ratings" element={<Ratings />} />
          <Route path="history" element={<History />} />
          <Route path="activity" element={<Activity />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Alias rute admin legacy tanpa prefix /admin */}
        <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="/books" element={<Navigate to="/admin/books" replace />} />
        <Route path="/books/*" element={<Navigate to="/admin/books" replace />} />
        <Route path="/categories" element={<Navigate to="/admin/categories" replace />} />
        <Route path="/users" element={<Navigate to="/admin/users" replace />} />
        <Route path="/curations" element={<Navigate to="/admin/curations" replace />} />
        <Route path="/circulation" element={<Navigate to="/admin/circulation" replace />} />
        <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
        <Route path="/ratings" element={<Navigate to="/admin/ratings" replace />} />
        <Route path="/history" element={<Navigate to="/admin/history" replace />} />
        <Route path="/activity" element={<Navigate to="/admin/activity" replace />} />
        <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />

        {/* Fallback ke beranda siswa */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
