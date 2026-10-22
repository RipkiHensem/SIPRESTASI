import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import './Login.css'
import logoSiprestasiWhite from '../../assets/branding/logo-siprestasi-white.png'

function Login() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  /* =========================
     MODE
  ========================= */

  const [mode, setMode] = useState('login')


  /* =========================
     FORM DATA
  ========================= */

  const [email, setEmail] = useState('')
  const [accountCode, setAccountCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')


  /* =========================
     SHOW PASSWORD
  ========================= */

  const [showPassword, setShowPassword] = useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)


  /* =========================
     TOUCHED
  ========================= */

  const [emailTouched, setEmailTouched] = useState(false)
  const [accountCodeTouched, setAccountCodeTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const [
    confirmPasswordTouched,
    setConfirmPasswordTouched,
  ] = useState(false)


  /* =========================
     MESSAGE
  ========================= */

  const [loginError, setLoginError] = useState('')

  const [
    activationSuccess,
    setActivationSuccess,
  ] = useState('')


  /* =========================
     VALIDASI EMAIL
  ========================= */

  const emailIsValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())


  const emailError =
    emailTouched &&
    email.trim() !== '' &&
    !emailIsValid


  /* =========================
     VALIDASI KODE AKUN
  ========================= */

  const accountCodeIsValid =
    /^ADM-\d{6}$/i.test(accountCode.trim())


  const accountCodeError =
    mode === 'activate' &&
    accountCodeTouched &&
    !accountCodeIsValid


  /* =========================
     VALIDASI PASSWORD
  ========================= */

  const passwordIsValid =
    password.length >= 8 &&
    password.length <= 64


  const passwordError =
    passwordTouched &&
    !passwordIsValid


  /* =========================
     KONFIRMASI PASSWORD
  ========================= */

  const confirmPasswordError =
    mode === 'activate' &&
    confirmPasswordTouched &&
    (
      confirmPassword.trim() === '' ||
      confirmPassword !== password
    )


  /* =========================
     FORM VALID
  ========================= */

  const isFormValid =
    email.trim() !== '' &&
    emailIsValid &&
    passwordIsValid &&
    (
      mode === 'login' ||
      (
        accountCodeIsValid &&
        confirmPassword.trim() !== '' &&
        confirmPassword === password
      )
    )


  /* =========================
     SWITCH MODE
  ========================= */

  const switchToLogin = () => {
    setMode('login')

    setAccountCode('')
    setPassword('')
    setConfirmPassword('')

    setAccountCodeTouched(false)
    setPasswordTouched(false)
    setConfirmPasswordTouched(false)

    setShowPassword(false)
    setShowConfirmPassword(false)

    setLoginError('')
  }


  const switchToActivation = () => {
    setMode('activate')

    setAccountCode('')
    setPassword('')
    setConfirmPassword('')

    setAccountCodeTouched(false)
    setPasswordTouched(false)
    setConfirmPasswordTouched(false)

    setShowPassword(false)
    setShowConfirmPassword(false)

    setLoginError('')
    setActivationSuccess('')
  }


  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (event) => {
    event.preventDefault()

    setEmailTouched(true)
    setPasswordTouched(true)

    setLoginError('')
    setActivationSuccess('')


    if (mode === 'activate') {
      setAccountCodeTouched(true)
      setConfirmPasswordTouched(true)
    }


    if (!isFormValid) {
      return
    }


    /* =========================
       AKTIVASI AKUN
    ========================= */

    if (mode === 'activate') {
      /*
        NANTI BACKEND:

        1. Cek email Administrator terdaftar
        2. Cek status = Menunggu Aktivasi
        3. Validasi kode akun ADM-XXXXXX
        4. Pastikan kode milik email tersebut
        5. Hash password baru
        6. Ubah status menjadi Aktif
        7. Nonaktifkan kode akun
      */

      setMode('login')

      setAccountCode('')
      setPassword('')
      setConfirmPassword('')

      setAccountCodeTouched(false)
      setPasswordTouched(false)
      setConfirmPasswordTouched(false)

      setShowPassword(false)
      setShowConfirmPassword(false)

      setActivationSuccess(
        'Akun berhasil diaktifkan. Silakan masuk menggunakan password yang telah dibuat.'
      )

      return
    }


    /* =========================
       LOGIN
    ========================= */

    if (busy) return
    setBusy(true)
    try {
      const body = new FormData()
      body.append('email', email.trim())
      body.append('password', password)
      const res = await api('auth/login', { method: 'POST', body })
      if (res.data?.role !== 'admin' && res.data?.role !== 'superadmin') {
        setLoginError('Akun ini tidak memiliki hak akses sebagai Administrator.')
        return
      }
      navigate('/admin/dashboard')
    } catch (err) {
      setLoginError(err.message || 'Login gagal. Periksa kembali email dan password Anda.')
    } finally {
      setBusy(false)
    }
  }


  return (
    <main className="login-page">

      <section className="login-card">

        {/* =========================
            LEFT SIDE
        ========================= */}

        <div className="login-left">

          <div className="brand">
            <img
              src={logoSiprestasiWhite}
              alt="SIPRESTASI"
              style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
            />
          </div>


          <div className="welcome-content">

            <h1>

              {mode === 'login'
                ? 'Selamat Datang Kembali'
                : 'Aktivasi Akun SIPRESTASI'}

            </h1>


            <p>

              {mode === 'login'
                ? 'Masuk sebagai Administrator untuk mengelola proses seleksi dan penilaian Mahasiswa Berprestasi.'
                : 'Aktifkan akun Administrator Anda menggunakan kode akun yang diberikan oleh Superadmin.'}

            </p>

          </div>


          <div className="decoration decoration-top" />

          <div className="decoration decoration-bottom" />

        </div>


        {/* =========================
            RIGHT SIDE
        ========================= */}

        <div className="login-right">

          <div className="login-form-wrapper">

            {/* HEADING */}

            <div className="login-heading">

              <h1>

                {mode === 'login'
                  ? 'Masuk ke SIPRESTASI'
                  : 'Aktivasi Akun'}

              </h1>


              <p>

                {mode === 'login'
                  ? 'Masukkan akun Administrator Anda untuk melanjutkan.'
                  : 'Masukkan email, kode akun, dan buat password baru.'}

              </p>

            </div>


            {/* SUCCESS MESSAGE */}

            {activationSuccess && (

              <div className="activation-success">
                {activationSuccess}
              </div>

            )}


            <form onSubmit={handleSubmit}>

              {/* =========================
                  EMAIL
              ========================= */}

              <div className="form-group">

                <label htmlFor="email">

                  Email
                  <span>*</span>

                </label>


                <div className="input-wrapper">

                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      setLoginError('')
                      setActivationSuccess('')
                    }}
                    onBlur={() =>
                      setEmailTouched(true)
                    }
                    className={
                      emailError
                        ? 'input-error'
                        : ''
                    }
                  />


                  {emailError && (

                    <span
                      className="error-icon"
                      aria-hidden="true"
                    >
                      !
                    </span>

                  )}

                </div>


                {emailError && (

                  <p
                    className="error-message"
                    role="alert"
                  >
                    Format email tidak valid.
                  </p>

                )}

              </div>


              {/* =========================
                  ACCOUNT CODE
              ========================= */}

              {mode === 'activate' && (

                <div className="form-group">

                  <label htmlFor="accountCode">

                    Kode Akun
                    <span>*</span>

                  </label>


                  <div className="input-wrapper">

                    <input
                      id="accountCode"
                      type="text"
                      name="accountCode"
                      autoComplete="off"
                      placeholder="Contoh: ADM-283137"
                      maxLength={10}
                      value={accountCode}
                      onChange={(event) => {
                        setAccountCode(
                          event.target.value
                            .toUpperCase()
                            .replace(/\s/g, '')
                        )

                        setLoginError('')
                      }}
                      onBlur={() =>
                        setAccountCodeTouched(true)
                      }
                      className={
                        accountCodeError
                          ? 'input-error'
                          : ''
                      }
                    />


                    {accountCodeError && (

                      <span
                        className="error-icon"
                        aria-hidden="true"
                      >
                        !
                      </span>

                    )}

                  </div>


                  {accountCodeError && (

                    <p
                      className="error-message"
                      role="alert"
                    >
                      Format kode akun tidak valid. Contoh: ADM-283137.
                    </p>

                  )}

                </div>

              )}


              {/* =========================
                  PASSWORD
              ========================= */}

              <div className="form-group">

                <label htmlFor="password">

                  {mode === 'login'
                    ? 'Password'
                    : 'Password Baru'}

                  <span>*</span>

                </label>


                <div className="password-input">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    name="password"
                    autoComplete={
                      mode === 'login'
                        ? 'current-password'
                        : 'new-password'
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value
                      )

                      setLoginError('')
                    }}
                    minLength={8}
                    maxLength={64}
                    onBlur={() =>
                      setPasswordTouched(true)
                    }
                    className={
                      passwordError
                        ? 'input-error'
                        : ''
                    }
                  />


                  {passwordError && (

                    <span
                      className="error-icon password-error-icon"
                      aria-hidden="true"
                    >
                      !
                    </span>

                  )}


                  <button
                    type="button"
                    className="show-password"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }
                  >

                    <EyeIcon
                      hidden={showPassword}
                    />

                  </button>

                </div>


                {passwordError && (

                  <p
                    className="error-message"
                    role="alert"
                  >

                    {password.length === 0
                      ? 'Password wajib diisi.'
                      : 'Password harus terdiri dari 8–64 karakter.'}

                  </p>

                )}


                {mode === 'activate' && (

                  <p className="password-helper">
                    Gunakan 8–64 karakter.
                  </p>

                )}

              </div>


              {/* =========================
                  CONFIRM PASSWORD
              ========================= */}

              {mode === 'activate' && (

                <div className="form-group">

                  <label htmlFor="confirmPassword">

                    Konfirmasi Password
                    <span>*</span>

                  </label>


                  <div className="password-input">

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      name="confirmPassword"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={64}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        setConfirmPasswordTouched(
                          true
                        )
                      }
                      className={
                        confirmPasswordError
                          ? 'input-error'
                          : ''
                      }
                    />


                    {confirmPasswordError && (

                      <span
                        className="error-icon password-error-icon"
                        aria-hidden="true"
                      >
                        !
                      </span>

                    )}


                    <button
                      type="button"
                      className="show-password"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? 'Sembunyikan konfirmasi password'
                          : 'Tampilkan konfirmasi password'
                      }
                    >

                      <EyeIcon
                        hidden={showConfirmPassword}
                      />

                    </button>

                  </div>


                  {confirmPasswordError && (

                    <p
                      className="error-message"
                      role="alert"
                    >
                      Konfirmasi password harus sama dengan password baru.
                    </p>

                  )}

                </div>

              )}


              {/* =========================
                  LOGIN ERROR
              ========================= */}

              {loginError && (

                <div
                  className="login-error-alert"
                  role="alert"
                >

                  <span className="login-error-alert-icon">
                    !
                  </span>

                  <span>
                    {loginError}
                  </span>

                </div>

              )}


              {/* =========================
                  LOGIN OPTIONS
              ========================= */}

              {mode === 'login' && (

                <div className="form-options">

                  <label className="remember-me">

                    <input type="checkbox" />

                    <span className="custom-checkbox" />

                    Ingat saya

                  </label>


                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() =>
                      navigate('/forgot-password')
                    }
                  >
                    Lupa Password?
                  </button>

                </div>

              )}


              {/* =========================
                  BUTTON
              ========================= */}

              <button
                type="submit"
                className="login-button"
                disabled={!isFormValid || busy}
              >

                <span>

                  {mode === 'login'
                    ? 'Masuk'
                    : 'Aktifkan Akun'}

                </span>

                <span className="arrow">
                  →
                </span>

              </button>


              {/* =========================
                  MODE SWITCH
              ========================= */}

              <div className="account-activation-switch">

                {mode === 'login' ? (

                  <p>

                    Akun baru?{' '}

                    <button
                      type="button"
                      onClick={switchToActivation}
                    >
                      Aktivasi akun
                    </button>

                  </p>

                ) : (

                  <p>

                    Sudah mengaktifkan akun?{' '}

                    <button
                      type="button"
                      onClick={switchToLogin}
                    >
                      Kembali ke Login
                    </button>

                  </p>

                )}

              </div>


              {/* =========================
                  NOTE
              ========================= */}

              <div className="login-note">

                <div className="separator">

                  <span />

                  <i />

                  <span />

                </div>


                <p>

                  {mode === 'login' ? (

                    <>
                      Hanya akun yang terdaftar sebagai Administrator
                      <br />
                      yang dapat mengakses sistem ini.
                    </>

                  ) : (

                    <>
                      Gunakan kode akun yang diberikan oleh Superadmin
                      <br />
                      untuk mengaktifkan akun Administrator.
                    </>

                  )}

                </p>

              </div>

            </form>

          </div>

        </div>

      </section>

    </main>
  )
}


/* =========================
   EYE ICON
========================= */

function EyeIcon({
  hidden = false,
}) {
  if (!hidden) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />

        <circle
          cx="12"
          cy="12"
          r="3"
        />
      </svg>
    )
  }


  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />

      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

      <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.2" />

      <path d="M6.6 6.6C3.8 8.3 2 12 2 12s3.5 8 10 8a9.8 9.8 0 0 0 4.4-1" />
    </svg>
  )
}


export default Login
