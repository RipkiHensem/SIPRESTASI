import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ForgotPassword.css'

function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)

  const emailIsValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const emailError =
    emailTouched &&
    email.trim() !== '' &&
    !emailIsValid

  const isFormValid =
    email.trim() !== '' &&
    emailIsValid

  const handleSubmit = (e) => {
    e.preventDefault()

    setEmailTouched(true)

    if (!isFormValid) {
      return
    }

    // Nanti disambungkan ke backend
    console.log('Kirim link reset password ke:', email)
  }

  return (
    <main className="forgot-page">
      <section className="forgot-card">

        {/* =========================
            BAGIAN KIRI
        ========================= */}

        <div className="forgot-left">

          <div className="forgot-brand">

            <div className="forgot-brand-icon">
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 10l10-5 10 5-10 5-10-5Z" />
                <path d="M6 12v5c3 2 9 2 12 0v-5" />
              </svg>
            </div>

            <div>
              <h2>SIPRESTASI</h2>
              <p>SISTEM PRESTASI MAHASISWA</p>
            </div>

          </div>

          <div className="forgot-welcome">
            <h1>Selamat Datang Kembali</h1>

            <p>
              Masuk untuk melanjutkan proses seleksi
              Mahasiswa Berprestasi Anda.
            </p>
          </div>

          <div className="forgot-decoration forgot-decoration-top"></div>
          <div className="forgot-decoration forgot-decoration-bottom"></div>

        </div>

        {/* =========================
            BAGIAN KANAN
        ========================= */}

        <div className="forgot-right">

          <div className="forgot-form-wrapper">

            <div className="forgot-heading">
              <h1>Lupa Password?</h1>

              <p>
                Masukkan email Anda untuk menerima
                link reset password.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="forgot-form-group">

                <label htmlFor="forgot-email">
                  Email<span>*</span>
                </label>

                <div className="forgot-input-wrapper">

                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    placeholder="allegra.putri@student.pradita.ac.id"
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    className={
                      emailError
                        ? 'forgot-input-error'
                        : ''
                    }
                  />

                  {emailError && (
                    <span className="forgot-error-icon">
                      !
                    </span>
                  )}

                </div>

                {emailError && (
                  <p className="forgot-error-message">
                    Format email tidak valid.
                  </p>
                )}

              </div>

              {/* INFO */}

              <div className="forgot-info">

                <span className="forgot-info-icon">
                  i
                </span>

                <p>
                  Kami akan mengirimkan link reset password
                  ke email Anda.
                </p>

              </div>

              {/* BUTTON */}

              <div className="forgot-actions">

                <button
                  type="button"
                  className="forgot-back-button"
                  onClick={() => navigate('/login')}
                >
                  Kembali
                </button>

                <button
                  type="submit"
                  className="forgot-submit-button"
                  disabled={!isFormValid}
                >
                  Kirim Link
                </button>

              </div>

            </form>

          </div>

        </div>

      </section>
    </main>
  )
}

export default ForgotPassword
