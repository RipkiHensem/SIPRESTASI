import { useState, useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AdminContext } from '../../data/admin'
import logoSiprestasi from '../../assets/branding/logo-siprestasi.png'
import logoSiprestasiWhite from '../../assets/branding/logo-siprestasi-white.png'

import './Navbar.css'

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
      aria-hidden="true"
    >
      <path d="M3 10 12 5l9 5-9 5-9-5Z" />
      <path d="M7 12.5V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-3.5" />
      <path d="M21 10v5" />
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
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  )
}

function Navbar({ variant = 'default' }) {
  const navigate = useNavigate()
  const adminCtx = useContext(AdminContext)
  const user = adminCtx?.user
  const displayName = user?.name || user?.nama || user?.username || 'Administrator'
  const displayRole = 'Admin'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || 'A'

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
      className={`admin-navbar ${
        variant === 'light' ? 'admin-navbar-light' : ''
      }`}
    >

      {/* BRAND */}
      <div className="admin-brand">

        <img
          src={variant === 'light' ? logoSiprestasi : logoSiprestasiWhite}
          alt="SIPRESTASI"
          className="admin-brand-logo"
          style={{ height: '54px', width: 'auto', objectFit: 'contain' }}
        />

      </div>

      {/* NAVIGATION */}
      <nav className="admin-nav-menu">

        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            isActive
              ? 'admin-nav-link active'
              : 'admin-nav-link'
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/daftar-mapres"
          className={({ isActive }) =>
            isActive
              ? 'admin-nav-link active'
              : 'admin-nav-link'
          }
        >
          Daftar Mapres
        </NavLink>

        <NavLink
          to="/admin/pradita-value"
          className={({ isActive }) =>
            isActive
              ? 'admin-nav-link active'
              : 'admin-nav-link'
          }
        >
          Pradita Value
        </NavLink>

        <NavLink
          to="/admin/hasil-seleksi"
          className={({ isActive }) =>
            isActive
              ? 'admin-nav-link active'
              : 'admin-nav-link'
          }
        >
          Hasil Seleksi
        </NavLink>

      </nav>

      {/* RIGHT */}
      <div className="admin-nav-right">

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
                          markAsRead(
                            notification.id
                          )
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

        <div className="admin-user-divider" />

        <div
          className="admin-profile-trigger"
          onClick={() => navigate('/admin/profile')}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              navigate('/admin/profile')
            }
          }}
        >
          <div className="admin-avatar">
            {initials}
          </div>

          <div className="admin-user-info">
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

export default Navbar