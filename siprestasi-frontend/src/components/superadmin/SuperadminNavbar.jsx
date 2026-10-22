import { useState, useContext } from 'react'
import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { SuperadminContext } from '../../data/superadmin'
import logoSiprestasi from '../../assets/branding/logo-siprestasi.png'
import logoSiprestasiWhite from '../../assets/branding/logo-siprestasi-white.png'

import './SuperadminNavbar.css'


function SuperadminNavbar({ variant = 'default' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const superadminCtx = useContext(SuperadminContext)
  const user = superadminCtx?.user
  const displayName = user?.name || user?.nama || user?.username || 'Administrator'
  const displayRole = user?.role === 'superadmin' ? 'Superadmin' : (user?.role || 'Superadmin')
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || 'SA'

  const isManageActive =
    location.pathname.startsWith('/superadmin/kelola-')

  const isSelectionActive =
    location.pathname.startsWith('/superadmin/daftar-mapres') ||
    location.pathname.startsWith('/superadmin/pradita-value') ||
    location.pathname.startsWith('/superadmin/hasil-seleksi')

  const [showManageMenu, setShowManageMenu] = useState(false)

  const [showSelectionMenu, setShowSelectionMenu] =
  useState(false)

  const [showNotifications, setShowNotifications] =
  useState(false)

const [notifications, setNotifications] = useState([])

const unreadCount = notifications.filter(
  (notification) => !notification.read
).length

const markAsRead = (id) => {
  setNotifications((current) =>
    current.map((notification) =>
      notification.id === id
        ? {
            ...notification,
            read: true,
          }
        : notification
    )
  )
}

const markAllAsRead = () => {
  setNotifications((current) =>
    current.map((notification) => ({
      ...notification,
      read: true,
    }))
  )
}


  return (
    <header
        className={`superadmin-navbar ${
            variant === 'light'
            ? 'superadmin-navbar-light'
            : ''
        }`}
    >

      {/* BRAND */}

      <div className="superadmin-brand">

        <img
          src={variant === 'light' ? logoSiprestasi : logoSiprestasiWhite}
          alt="SIPRESTASI"
          className="superadmin-brand-logo"
          style={{ height: '54px', width: 'auto', objectFit: 'contain' }}
        />

      </div>


      {/* NAVIGATION */}

      <nav className="superadmin-nav-menu">

  <NavLink
    to="/superadmin/dashboard"
    className={({ isActive }) =>
      isActive
        ? 'superadmin-nav-link active'
        : 'superadmin-nav-link'
    }
  >
    Dashboard
  </NavLink>


  {/* SELEKSI */}

  <div className="superadmin-nav-dropdown-wrapper">

    <button
      type="button"
      className={`superadmin-nav-link superadmin-manage-trigger ${
        isSelectionActive ? 'active' : ''
      }`}
      onClick={() => {
        setShowSelectionMenu((value) => !value)
        setShowManageMenu(false)
      }}
    >
      Seleksi

      <ChevronDownIcon />
    </button>


    {showSelectionMenu && (
  <div className="superadmin-manage-dropdown">

    <button
      type="button"
      className="superadmin-manage-item"
      onClick={() => {
        setShowSelectionMenu(false)
        navigate('/superadmin/daftar-mapres')
      }}
    >
      <StudentIcon />

      <div>
        <strong>Daftar Mapres</strong>
        <span>Verifikasi dan seleksi Tahap 1</span>
      </div>
    </button>


    <button
      type="button"
      className="superadmin-manage-item"
      onClick={() => {
        setShowSelectionMenu(false)
        navigate('/superadmin/daftar-mapres/ranking')
      }}
    >
      <ContentIcon />

      <div>
        <strong>Peringkat Tahap 1</strong>
        <span>Lihat peringkat mahasiswa</span>
      </div>
    </button>


    <button
      type="button"
      className="superadmin-manage-item"
      onClick={() => {
        setShowSelectionMenu(false)
        navigate('/superadmin/pradita-value')
      }}
    >
      <UsersIcon />

      <div>
        <strong>Pradita Value</strong>
        <span>Penilaian finalis Tahap 2</span>
      </div>
    </button>


    <button
      type="button"
      className="superadmin-manage-item"
      onClick={() => {
        setShowSelectionMenu(false)
        navigate('/superadmin/hasil-seleksi')
      }}
    >
      <ContentIcon />

      <div>
        <strong>Hasil Seleksi</strong>
        <span>Peringkat dan hasil akhir</span>
      </div>
    </button>

  </div>
)}

  </div>


  {/* KELOLA */}

  <div className="superadmin-nav-dropdown-wrapper">

    <button
      type="button"
      className={`superadmin-nav-link superadmin-manage-trigger ${
        isManageActive ? 'active' : ''
      }`}
      onClick={() => {
        setShowManageMenu((value) => !value)
        setShowSelectionMenu(false)
      }}
    >
      Kelola

      <ChevronDownIcon />
    </button>


    {showManageMenu && (
      <div className="superadmin-manage-dropdown">

        <NavLink
          to="/superadmin/kelola-pengguna"
          className="superadmin-manage-item"
          onClick={() => setShowManageMenu(false)}
        >
          <UsersIcon />

          <div>
            <strong>
              Kelola Pengguna
            </strong>

            <span>
              Admin dan akun pengguna
            </span>
          </div>
        </NavLink>


        <NavLink
          to="/superadmin/kelola-mahasiswa"
          className="superadmin-manage-item"
          onClick={() => setShowManageMenu(false)}
        >
          <StudentIcon />

          <div>
            <strong>
              Kelola Mahasiswa
            </strong>

            <span>
              Data mahasiswa SIPRESTASI
            </span>
          </div>
        </NavLink>


        <NavLink
          to="/superadmin/kelola-konten"
          className="superadmin-manage-item"
          onClick={() => setShowManageMenu(false)}
        >
          <ContentIcon />

          <div>
            <strong>
              Kelola Konten
            </strong>

            <span>
              Informasi dan konten sistem
            </span>
          </div>
        </NavLink>

      </div>
    )}

  </div>

</nav>


      {/* RIGHT */}

      <div className="superadmin-nav-right">

        <div className="notification-wrapper">

  <button
    type="button"
    className="notification-button"
    aria-label="Notifikasi"
    onClick={() =>
      setShowNotifications(
        (current) => !current
      )
    }
  >
    <BellIcon />

    {unreadCount > 0 && (
      <span className="notification-badge">
        {unreadCount}
      </span>
    )}
  </button>


  {showNotifications && (
    <div className="notification-dropdown">

      <div className="notification-header">

        <div>
          <strong>
            Notifikasi
          </strong>

          <span>
            {unreadCount} belum dibaca
          </span>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
          >
            Tandai semua dibaca
          </button>
        )}

      </div>


      <div className="notification-list">

        {notifications.length === 0 ? (
          <p style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
            Belum ada notifikasi baru.
          </p>
        ) : (
          notifications.map(
            (notification) => (
              <button
                type="button"
                key={notification.id}
                className={
                  notification.read
                    ? 'notification-item read'
                    : 'notification-item'
                }
                onClick={() =>
                  markAsRead(notification.id)
                }
              >

                <span className="notification-dot" />

                <div>
                  <strong>
                    {notification.title}
                  </strong>

                  <p>
                    {notification.message}
                  </p>
                </div>

              </button>
            )
          )
        )}

      </div>

    </div>
  )}

</div>


        <div className="superadmin-user-divider" />


        <div
            className="superadmin-profile"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/superadmin/profile')}
            onKeyDown={(event) => {
                if (
                event.key === 'Enter' ||
                event.key === ' '
                ) {
                navigate('/superadmin/profile')
                }
            }}
        >

          <div className="superadmin-avatar">
            {initials}
          </div>

          <div className="superadmin-user-info">

            <strong>
              {displayName}
            </strong>

            <span>
              {displayRole}
            </span>

          </div>

        </div>

      </div>

    </header>
  )
}


/* =========================
   ICONS
========================= */

function GraduationCapIcon() {
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
      <path d="m3 9 9-5 9 5-9 5-9-5Z" />
      <path d="M7 11.5V16c3 2 7 2 10 0v-4.5" />
    </svg>
  )
}


function BellIcon() {
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
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  )
}


function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 10 5 5 5-5" />
    </svg>
  )
}


function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.5-3 2.5-5 5.5-5s5 2 5.5 5" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M15.5 14.5c2.8-.8 5 .8 5.5 3.5" />
    </svg>
  )
}


function StudentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 8 9-5 9 5-9 5-9-5Z" />
      <path d="M7 11v4c3 2 7 2 10 0v-4" />
      <path d="M21 8v6" />
    </svg>
  )
}


function ContentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 3h14v18H5z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  )
}


export default SuperadminNavbar