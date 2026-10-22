import logoSIPradita from '../../assets/branding/logo-siprestasi-white.png'

function LoginSidebar() {
  return (
    <aside className="auth-sidebar login-sidebar">

      <div className="login-sidebar-brand">
        <div className="login-sidebar-logo-box">
          <img
              src={logoSIPradita}
            alt="Sistem Informasi Pradita University"
            className="login-sidebar-logo"
          />
        </div>
      </div>

      <div className="login-sidebar-content">
        <h1>
          Selamat Datang Kembali
        </h1>

        <p>
          Masuk untuk melanjutkan proses seleksi
          Mahasiswa Berprestasi Anda.
        </p>
      </div>

      <div
        className="login-sidebar-decoration"
        aria-hidden="true"
      >
        <span className="login-decoration-circle" />
        <span className="login-decoration-line" />
      </div>

    </aside>
  )
}

export default LoginSidebar
