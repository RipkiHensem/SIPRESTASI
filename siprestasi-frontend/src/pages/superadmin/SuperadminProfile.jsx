import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useSuperadmin } from '../../data/superadmin'

import SuperadminNavbar from '../../components/superadmin/SuperadminNavbar'

import './SuperadminProfile.css'


function SuperadminProfile() {
  const navigate = useNavigate()
  const superadminCtx = useSuperadmin()
  const user = superadminCtx?.user || {
    name: '',
    email: '',
    role: 'superadmin',
  }
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const initials = user.name
    ? user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : ''

  const handleLogout = async () => {
    try {
      await api('auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    localStorage.removeItem(
        'siprestasi_superadmin_auth'
    )

    setShowLogoutModal(false)

    navigate(
        '/superadmin/login',
        { replace: true }
    )
  }


  return (
    <div className="superadmin-profile-page">

      <SuperadminNavbar variant="light" />


      <main className="superadmin-profile-content">

        <div className="superadmin-profile-heading">

          <span>
            PORTAL SUPERADMIN
          </span>

          <h1>
            Profil Saya
          </h1>

          <p>
            Informasi akun dan keamanan Super Administrator.
          </p>

        </div>


        <div className="superadmin-profile-layout">

          {/* PROFILE CARD */}

          <section className="superadmin-profile-card">

            <div className="superadmin-profile-card-header">

              <div className="superadmin-profile-large-avatar">
                {initials}
              </div>


              <div>

                <h2>
                  {user.name}
                </h2>

                <p>
                  Superadmin SIPRESTASI
                </p>

              </div>

            </div>


            <div className="superadmin-profile-divider" />


            <div className="superadmin-profile-information">

              <ProfileRow
                label="Nama Lengkap"
                value={user.name}
              />

              <ProfileRow
                label="Email"
                value={user.email}
              />

              <ProfileRow
                label="Role"
                value="Superadmin"
              />

              <ProfileRow
                label="Status Akun"
                value={
                  <span className="superadmin-profile-status">
                    <span />
                    Aktif
                  </span>
                }
              />

            </div>

          </section>


          {/* ACCOUNT */}

          <div className="superadmin-profile-side">

            <section className="superadmin-profile-side-card danger">

              <div className="superadmin-profile-side-icon">
                <LogoutIcon />
              </div>


              <div>

                <h3>
                  Keluar dari Akun
                </h3>

                <p>
                  Akhiri sesi Superadmin pada perangkat ini.
                </p>

              </div>


              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
              >
                Keluar
              </button>

            </section>

          </div>

        </div>

      </main>


      {/* LOGOUT MODAL */}

      {showLogoutModal && (
        <div className="superadmin-logout-overlay">

          <div className="superadmin-logout-modal">

            <div className="superadmin-logout-icon">
              <LogoutIcon />
            </div>


            <h2>
              Keluar dari Akun?
            </h2>

            <p>
              Apakah Anda yakin ingin keluar dari akun SIPRESTASI?
            </p>


            <div className="superadmin-logout-actions">

              <button
                type="button"
                className="superadmin-logout-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Batal
              </button>


              <button
                type="button"
                className="superadmin-logout-confirm"
                onClick={handleLogout}
              >
                Ya, Keluar
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}


function ProfileRow({
  label,
  value,
}) {
  return (
    <div className="superadmin-profile-row">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  )
}


function SecurityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}


function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M14 4h6v16h-6" />
    </svg>
  )
}


export default SuperadminProfile
