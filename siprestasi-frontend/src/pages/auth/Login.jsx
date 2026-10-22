import { api } from '../../api'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react'

import LoginSidebar from '../../components/auth/LoginSidebar'

import '../../styles/auth/auth-layout.css'
import '../../styles/auth/login.css'

function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const emailPattern =
    /^[^\s@]+@student\.pradita\.ac\.id$/i

  const emailValid =
    emailPattern.test(formData.email.trim())

  const passwordValid =
    formData.password.length > 0

  const formValid =
    emailValid && passwordValid

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email =
        'Email mahasiswa wajib diisi.'
    } else if (!emailValid) {
      newErrors.email =
        'Gunakan email @student.pradita.ac.id.'
    }

    if (!formData.password) {
      newErrors.password =
        'Password wajib diisi.'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (busy || !validateForm()) return
    setBusy(true)
    try {
      const body = new FormData()
      body.append('email', formData.email.trim())
      body.append('password', formData.password)
      await api('auth/login', { method: 'POST', body })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrors({ password: error.message })
    } finally { setBusy(false) }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">

        <LoginSidebar />

        <section className="auth-main">
          <div className="login-container">

            <div className="form-heading login-heading">
              <h2>
                Masuk ke SIPRESTASI
              </h2>

              <p>
                Masukkan akun mahasiswa Anda untuk
                melanjutkan.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="login-form">

                {/* EMAIL */}

                <div className="form-group">

                  <label htmlFor="email">
                    Email Mahasiswa
                    <span>*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@student.pradita.ac.id"
                    className={
                      errors.email
                        ? 'input-error'
                        : ''
                    }
                  />

                  {errors.email && (
                    <p className="field-error">
                      {errors.email}
                    </p>
                  )}

                </div>

                {/* PASSWORD */}

                <div className="form-group password-group">

                  <label htmlFor="password">
                    Password
                    <span>*</span>
                  </label>

                  <div
                    className={`password-input ${
                      errors.password
                        ? 'input-error'
                        : ''
                    }`}
                  >
                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Masukkan password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      aria-label={
                        showPassword
                          ? 'Sembunyikan password'
                          : 'Tampilkan password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="field-error">
                      {errors.password}
                    </p>
                  )}

                </div>

                {/* OPTIONS */}

                <div className="login-options">

                  <label className="remember-me">

                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />

                    <span className="remember-checkbox">
                      {formData.rememberMe && (
                        <Check size={13} />
                      )}
                    </span>

                    <span className="remember-label">
                      Ingat saya
                    </span>

                  </label>

                  <Link
                    to="/forgot-password"
                    className="forgot-password-link"
                  >
                    Lupa password?
                  </Link>

                </div>

                {/* LOGIN */}

                <button
                  type="submit"
                  className="primary-button login-button"
                  disabled={busy || !formValid}
                >
                  Masuk
                  <ArrowRight size={18} />
                </button>

                {/* REGISTER */}

                <div className="auth-bottom-link login-register-link">
                  Belum punya akun?{' '}

                  <Link to="/register">
                    Daftar
                  </Link>
                </div>

              </div>
            </form>

          </div>
        </section>

      </div>
    </main>
  )
}

export default Login
