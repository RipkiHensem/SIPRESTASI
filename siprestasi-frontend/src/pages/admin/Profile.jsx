import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useAdmin } from '../../data/admin'

import Navbar from '../../components/admin/Navbar'

import './Profile.css'


function Profile() {
  const navigate = useNavigate()
  const adminCtx = useAdmin()
  const user = adminCtx?.user || {
    name: '',
    email: '',
    role: 'admin',
  }
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const initials = user.name
    ? user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : ''

  const handleLogout = async () => {
    try {
      await api('auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    navigate('/admin/login')
  }

  return (
    <div className="profile-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <Navbar variant="light" />


      {/* =========================
          CONTENT
      ========================= */}

      <main className="profile-content">

        {/* BACK */}
        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate(-1)}
        >
          <span>←</span>
          Kembali
        </button>


        {/* PAGE HEADING */}
        <div className="profile-page-heading">

          <h1>
            Profil Administrator
          </h1>

          <p>
            Lihat informasi akun administrator SIPRESTASI.
          </p>

        </div>


        {/* =========================
            PROFILE SUMMARY
        ========================= */}

        <section className="profile-summary-card">

          <div className="profile-summary-left">

            <div className="profile-main-avatar">
              {initials}
            </div>

            <div className="profile-summary-info">

              <h2>
                {user.name}
              </h2>

              <span className="profile-role-badge">
                {user.role === 'superadmin' ? 'Super Administrator' : 'Administrator'} SIPRESTASI
              </span>

            </div>

          </div>

        </section>


        {/* =========================
            ACCOUNT INFORMATION
        ========================= */}

        <section className="profile-section">

          <div className="profile-section-heading">

            <div>
              <h2>
                Informasi Akun
              </h2>

              <p>
                Informasi identitas akun yang digunakan pada sistem.
              </p>
            </div>

          </div>


          <div className="profile-info-grid">

            <div className="profile-info-item">
                <span className="profile-info-label">
                Nama Lengkap
                </span>

                <strong>
                {user.name}
                </strong>
            </div>


            <div className="profile-info-item">
                <span className="profile-info-label">
                Email
                </span>

                <strong>
                {user.email}
                </strong>
            </div>


            <div className="profile-info-item">
                <span className="profile-info-label">
                Role
                </span>

                <strong>
                {user.role === 'superadmin' ? 'Super Administrator' : 'Administrator'}
                </strong>
            </div>


            <div className="profile-info-item">
                <span className="profile-info-label">
                Status Akun
                </span>

                <div className="profile-account-status">
                <span className="profile-status-dot" />
                Aktif
                </div>
            </div>

            </div>
        </section>


        {/* =========================
            SECURITY
        ========================= */}

        <section className="profile-section profile-logout-section">

  <div className="profile-security-row">

    <div className="profile-security-copy">

      <div className="profile-logout-icon">
        <LogoutIcon />
      </div>

      <div>
        <h3>
          Keluar dari Akun
        </h3>

        <p>
          Akhiri sesi administrator dan kembali ke halaman login.
        </p>
      </div>

    </div>

    <button
      type="button"
      className="profile-logout-button"
      onClick={() => setShowLogoutConfirm(true)}
    >
      Keluar
    </button>

  </div>

</section>

{showLogoutConfirm && (
  <div className="logout-modal-overlay">

    <div className="logout-modal">

      <div className="logout-modal-icon">
        <LogoutIcon />
      </div>

      <h2>Keluar dari Akun?</h2>

      <p>
        Apakah Anda yakin ingin keluar dari akun SIPRESTASI?
      </p>

      <div className="logout-modal-actions">

        <button
          type="button"
          className="logout-modal-cancel"
          onClick={() => setShowLogoutConfirm(false)}
        >
          Batal
        </button>

        <button
          type="button"
          className="logout-modal-confirm"
          onClick={handleLogout}
        >
          Ya, Keluar
        </button>

      </div>

    </div>

  </div>
)}

      </main>

    </div>
  )
}


/* =========================
   ICON
========================= */

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
      <path d="M14 8l4 4-4 4" />
      <path d="M8 12h10" />
    </svg>
  )
}

export default Profile
