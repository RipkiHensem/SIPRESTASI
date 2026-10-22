import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import LandingPage from './pages/student/LandingPage'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyKrs from './pages/auth/VerifyKrs'
import PortalGate from './components/PortalGate'
import RegisterSuccess from './pages/auth/RegisterSuccess'

import Dashboard from './pages/student/Dashboard'
import DashboardRanking from './pages/student/DashboardRanking'
import DashboardFinalis from './pages/student/DashboardFinalis'

import PendaftaranTahap1 from './pages/student/PendaftaranTahap1'
import ReviewTahap1 from './pages/student/ReviewTahap1'
import StatusVerifikasiTahap1 from './pages/student/StatusVerifikasiTahap1'

import PraditaValuePeers from './pages/student/PraditaValuePeers'
import PraditaValueStatus from './pages/student/PraditaValueStatus'

/* =========================
   ADMIN IMPORTS
========================= */
import AdminGate from './components/AdminGate'
import AdminLogin from './pages/admin/Login'
import AdminForgotPassword from './pages/admin/ForgotPassword'
import AdminDashboard from './pages/admin/Admin_dashboard'
import AdminDaftarMapres from './pages/admin/DaftarMapres'
import AdminVerifikasiPengajuan from './pages/admin/VerifikasiPengajuan'
import AdminLihatDetail from './pages/admin/LihatDetail'
import AdminTinjauRevisi from './pages/admin/TinjauRevisi'
import AdminPeringkatTahap1 from './pages/admin/PeringkatTahap1'
import AdminPraditaValue from './pages/admin/PraditaValue'
import AdminDetailPraditaValue from './pages/admin/DetailPraditaValue'
import AdminHasilSeleksi from './pages/admin/HasilSeleksi'
import AdminProfile from './pages/admin/Profile'

/* =========================
   SUPERADMIN IMPORTS
========================= */
import SuperadminGate from './components/SuperadminGate'
import SuperadminLogin from './pages/superadmin/SuperadminLogin'
import SuperadminDashboard from './pages/superadmin/SuperadminDashboard'
import SuperadminKelolaPengguna from './pages/superadmin/KelolaPengguna'
import SuperadminKelolaMahasiswa from './pages/superadmin/KelolaMahasiswa'
import SuperadminKelolaKonten from './pages/superadmin/KelolaKonten'
import SuperadminProfile from './pages/superadmin/SuperadminProfile'
import SuperadminDaftarMapres from './pages/superadmin/DaftarMapres'
import SuperadminPeringkatTahap1 from './pages/superadmin/PeringkatTahap1'
import SuperadminVerifikasiPengajuan from './pages/superadmin/VerifikasiPengajuan'
import SuperadminLihatDetail from './pages/superadmin/LihatDetail'
import SuperadminTinjauRevisi from './pages/superadmin/TinjauRevisi'
import SuperadminPraditaValue from './pages/superadmin/PraditaValue'
import SuperadminDetailPraditaValue from './pages/superadmin/DetailPraditaValue'
import SuperadminHasilSeleksi from './pages/superadmin/HasilSeleksi'

function App() {
  return (
    <Routes>

      {/* =========================
          LANDING PAGE
      ========================== */}

      <Route
        path="/"
        element={<LandingPage />}
      />


      {/* =========================
          STUDENT AUTH
      ========================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/register/krs"
        element={<VerifyKrs />}
      />

      <Route
        path="/register/verify-email"
        element={<Navigate to="/register" replace />}
      />

      <Route
        path="/register/success"
        element={<RegisterSuccess />}
      />


      {/* =========================
          COMMON / AUTH
      ========================== */}

      <Route
        path="/forgot-password"
        element={<AdminForgotPassword />}
      />

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      <Route
        path="/superadmin/login"
        element={<SuperadminLogin />}
      />

      <Route
        path="/superadmin"
        element={<Navigate to="/superadmin/dashboard" replace />}
      />


      {/* =========================
          PORTAL MAHASISWA
      ========================== */}

      <Route element={<PortalGate />}>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard/ranking"
          element={<DashboardRanking />}
        />

        <Route
          path="/dashboard/finalis"
          element={<DashboardFinalis />}
        />

        <Route
          path="/pendaftaran-mapres"
          element={<PendaftaranTahap1 />}
        />

        <Route
          path="/pendaftaran-mapres/review"
          element={<ReviewTahap1 />}
        />

        <Route
          path="/pendaftaran-mapres/status"
          element={<StatusVerifikasiTahap1 />}
        />

        <Route
          path="/pradita-value/rekan-sejawat"
          element={<PraditaValuePeers />}
        />

        <Route
          path="/pradita-value/status"
          element={<PraditaValueStatus />}
        />
      </Route>


      {/* =========================
          PORTAL ADMINISTRATOR
      ========================== */}

      <Route element={<AdminGate />}>
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/daftar-mapres"
          element={<AdminDaftarMapres />}
        />

        <Route
          path="/admin/daftar-mapres/ranking"
          element={<AdminPeringkatTahap1 />}
        />

        <Route
          path="/admin/daftar-mapres/:nim/verifikasi"
          element={<AdminVerifikasiPengajuan />}
        />

        <Route
          path="/admin/daftar-mapres/:nim/detail"
          element={<AdminLihatDetail />}
        />

        <Route
          path="/admin/daftar-mapres/:nim/revisi"
          element={<AdminTinjauRevisi />}
        />

        <Route
          path="/admin/pradita-value"
          element={<AdminPraditaValue />}
        />

        <Route
          path="/admin/pradita-value/:nim"
          element={<AdminDetailPraditaValue />}
        />

        <Route
          path="/admin/hasil-seleksi"
          element={<AdminHasilSeleksi />}
        />

        <Route
          path="/admin/profile"
          element={<AdminProfile />}
        />
      </Route>


      {/* =========================
          PORTAL SUPERADMIN
      ========================== */}

      <Route element={<SuperadminGate />}>
        <Route
          path="/superadmin/dashboard"
          element={<SuperadminDashboard />}
        />

        <Route
          path="/superadmin/kelola-pengguna"
          element={<SuperadminKelolaPengguna />}
        />

        <Route
          path="/superadmin/kelola-mahasiswa"
          element={<SuperadminKelolaMahasiswa />}
        />

        <Route
          path="/superadmin/kelola-konten"
          element={<SuperadminKelolaKonten />}
        />

        <Route
          path="/superadmin/profile"
          element={<SuperadminProfile />}
        />

        <Route
          path="/superadmin/daftar-mapres"
          element={<SuperadminDaftarMapres />}
        />

        <Route
          path="/superadmin/daftar-mapres/ranking"
          element={<SuperadminPeringkatTahap1 />}
        />

        <Route
          path="/superadmin/daftar-mapres/:nim/verifikasi"
          element={<SuperadminVerifikasiPengajuan />}
        />

        <Route
          path="/superadmin/daftar-mapres/:nim/detail"
          element={<SuperadminLihatDetail />}
        />

        <Route
          path="/superadmin/daftar-mapres/:nim/revisi"
          element={<SuperadminTinjauRevisi />}
        />

        <Route
          path="/superadmin/pradita-value"
          element={<SuperadminPraditaValue />}
        />

        <Route
          path="/superadmin/pradita-value/:nim"
          element={<SuperadminDetailPraditaValue />}
        />

        <Route
          path="/superadmin/hasil-seleksi"
          element={<SuperadminHasilSeleksi />}
        />
      </Route>

    </Routes>
  )
}

export default App
