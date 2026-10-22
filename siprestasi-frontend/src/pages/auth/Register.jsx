import { api } from '../../api'
import { setRegistrationDraft } from '../../data/portal'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  X,
} from 'lucide-react'

import AuthSidebar from '../../components/auth/AuthSidebar'
import PasswordStrength from '../../components/auth/PasswordStrength'

import '../../styles/auth/auth-layout.css'
import '../../styles/auth/register.css'





function Register() {
  const navigate = useNavigate()

  const otpInputRefs = useRef([])
  const otpBusy = useRef(false)
  const [registrationToken, setRegistrationToken] = useState('')


  /* =========================
     FORM STATE
  ========================= */

  const [formData, setFormData] =
    useState({
      name: '',
      email: '',
      nim: '',
      phone: '',
      password: '',
      confirmPassword: '',
    })


  const [errors, setErrors] =
    useState({})


  const [
    showPassword,
    setShowPassword,
  ] = useState(false)


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)


  /* =========================
     EMAIL VERIFICATION
  ========================= */

  const [
    emailVerified,
    setEmailVerified,
  ] = useState(false)


  const [
    verifiedEmail,
    setVerifiedEmail,
  ] = useState('')


  /* =========================
     OTP MODAL
  ========================= */

  const [
    otpModalOpen,
    setOtpModalOpen,
  ] = useState(false)


  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ])


  const [
    timeLeft,
    setTimeLeft,
  ] = useState(300)


  const [
    resendTime,
    setResendTime,
  ] = useState(30)


  const [
    otpError,
    setOtpError,
  ] = useState('')


  const [
    otpSuccess,
    setOtpSuccess,
  ] = useState(false)


  /* =========================
     VALIDASI LANGSUNG
  ========================= */

  const nameValid =
    formData.name.trim().length > 0


  const emailValid =
    /^[^\s@]+@student\.pradita\.ac\.id$/i.test(
      formData.email.trim()
    )


  const nimValid =
    /^\d{10}$/.test(
      formData.nim
    )


  const phoneValid =
    formData.phone.length > 0 &&
    formData.phone.length <= 16


  const passwordValid =
    formData.password.length >= 8 &&
    /[a-z]/.test(
      formData.password
    ) &&
    /[A-Z]/.test(
      formData.password
    ) &&
    /\d/.test(
      formData.password
    ) &&
    /[^A-Za-z0-9]/.test(
      formData.password
    )


  const confirmPasswordValid =
    formData.confirmPassword.length > 0 &&
    formData.confirmPassword ===
      formData.password


  const formValid =
    nameValid &&
    emailValid &&
    emailVerified &&
    nimValid &&
    phoneValid &&
    passwordValid &&
    confirmPasswordValid


  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    let nextValue = value


    /* NIM hanya angka */

    if (name === 'nim') {
      nextValue = value
        .replace(/\D/g, '')
        .slice(0, 10)
    }


    /* TELEPON hanya angka */

    if (name === 'phone') {
      nextValue = value
        .replace(/\D/g, '')
        .slice(0, 16)
    }


    /*
      Kalau email yang sudah verified
      diubah, status verified harus hilang.
    */

    if (
      name === 'email' &&
      emailVerified
    ) {
      const nextEmail =
        nextValue
          .trim()
          .toLowerCase()

      if (
        nextEmail !==
        verifiedEmail
      ) {
        setEmailVerified(false)
        setVerifiedEmail('')
      }
    }


    setFormData(
      (previous) => ({
        ...previous,
        [name]: nextValue,
      })
    )


    if (errors[name]) {
      setErrors(
        (previous) => ({
          ...previous,
          [name]: '',
        })
      )
    }
  }


  /* =========================
     VALIDASI FORM
  ========================= */

  const validateForm = () => {
    const newErrors = {}


    /* EMAIL */

    if (!formData.email.trim()) {
      newErrors.email =
        'Email student wajib diisi.'
    } else if (!emailValid) {
      newErrors.email =
        'Gunakan email @student.pradita.ac.id.'
    } else if (!emailVerified) {
      newErrors.email =
        'Verifikasi email student terlebih dahulu.'
    }


    /* NAMA */

    if (!formData.name.trim()) {
      newErrors.name =
        'Nama lengkap wajib diisi.'
    }


    /* NIM */

    if (!formData.nim) {
      newErrors.nim =
        'NIM wajib diisi.'
    } else if (!nimValid) {
      newErrors.nim =
        'NIM harus terdiri dari 10 digit angka.'
    }


    /* TELEPON */

    if (!formData.phone) {
      newErrors.phone =
        'Nomor telepon wajib diisi.'
    }


    /* PASSWORD */

    if (!formData.password) {
      newErrors.password =
        'Password wajib diisi.'
    } else if (!passwordValid) {
      newErrors.password =
        'Password harus memiliki minimal 8 karakter, huruf kecil, huruf kapital, angka, dan simbol.'
    }


    /* KONFIRMASI PASSWORD */

    if (
      !formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        'Konfirmasi password wajib diisi.'
    } else if (
      !confirmPasswordValid
    ) {
      newErrors.confirmPassword =
        'Konfirmasi password belum cocok.'
    }


    setErrors(newErrors)


    return (
      Object.keys(
        newErrors
      ).length === 0
    )
  }


  /* =========================
     BUKA OTP
  ========================= */

  const handleOpenOtp = async () => {
    if (otpBusy.current || !emailValid) {
      if (!emailValid) setErrors(previous => ({ ...previous, email: 'Gunakan email @student.pradita.ac.id.' }))
      return
    }
    otpBusy.current = true
    const email = formData.email.trim().toLowerCase()
    try {
      const response = await api('auth/register/otp', { method: 'POST', body: { email } })
      setErrors(previous => ({ ...previous, email: '' }))
      setEmailVerified(false)
      setRegistrationToken('')
      setOtp(Array(6).fill(''))
      setOtpError('')
      setOtpSuccess(false)
      setTimeLeft(response.data.expires_in)
      setResendTime(response.data.resend_after)
      setOtpModalOpen(true)
    } catch (error) { setErrors(previous => ({ ...previous, email: error.message })) }
    finally { otpBusy.current = false }
  }


  /* =========================
     TUTUP OTP
  ========================= */

  const handleCloseOtp = () => {
    if (otpSuccess) return

    setOtpModalOpen(false)

    setOtp([
      '',
      '',
      '',
      '',
      '',
      '',
    ])

    setOtpError('')
  }


  /* =========================
     ESC MODAL
  ========================= */

  useEffect(() => {
    if (!otpModalOpen) return


    const handleEscape = (
      event
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        if (otpSuccess) return
        setOtpModalOpen(false)
        setOtp(Array(6).fill(''))
        setOtpError('')
      }
    }


    window.addEventListener(
      'keydown',
      handleEscape
    )


    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [
    otpModalOpen,
    otpSuccess,
  ])


  /* =========================
     TIMER OTP
  ========================= */

  useEffect(() => {
    if (
      !otpModalOpen ||
      timeLeft <= 0
    ) {
      return
    }


    const timer = setInterval(
      () => {
        setTimeLeft(
          (previous) =>
            previous > 0
              ? previous - 1
              : 0
        )
      },
      1000
    )


    return () =>
      clearInterval(timer)
  }, [
    otpModalOpen,
    timeLeft,
  ])


  /* =========================
     TIMER RESEND
  ========================= */

  useEffect(() => {
    if (
      !otpModalOpen ||
      resendTime <= 0
    ) {
      return
    }


    const timer = setInterval(
      () => {
        setResendTime(
          (previous) =>
            previous > 0
              ? previous - 1
              : 0
        )
      },
      1000
    )


    return () =>
      clearInterval(timer)
  }, [
    otpModalOpen,
    resendTime,
  ])


  /* =========================
     MASK EMAIL
  ========================= */

  const maskEmail = (
    value
  ) => {
    if (
      !value ||
      !value.includes('@')
    ) {
      return ''
    }


    const [
      username,
      domain,
    ] = value.split('@')


    const visibleUsername =
      username.length <= 2
        ? username.charAt(0)
        : username.slice(0, 2)


    return `${visibleUsername}*****@${domain}`
  }


  /* =========================
     FORMAT TIMER
  ========================= */

  const formatTime = (
    seconds
  ) => {
    const minutes =
      Math.floor(
        seconds / 60
      )

    const remainingSeconds =
      seconds % 60


    return `${String(
      minutes
    ).padStart(
      2,
      '0'
    )}:${String(
      remainingSeconds
    ).padStart(
      2,
      '0'
    )}`
  }


  /* =========================
     INPUT OTP
  ========================= */

  const handleOtpChange = (
    index,
    value
  ) => {
    const digit =
      value
        .replace(/\D/g, '')
        .slice(-1)


    const nextOtp = [
      ...otp,
    ]

    nextOtp[index] = digit


    setOtp(nextOtp)
    setOtpError('')
    setOtpSuccess(false)


    if (
      digit &&
      index < 5
    ) {
      otpInputRefs
        .current[index + 1]
        ?.focus()
    }
  }


  /* =========================
     KEYBOARD OTP
  ========================= */

  const handleOtpKeyDown = (
    index,
    event
  ) => {
    if (
      event.key ===
        'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      otpInputRefs
        .current[index - 1]
        ?.focus()
    }


    if (
      event.key ===
        'ArrowLeft' &&
      index > 0
    ) {
      otpInputRefs
        .current[index - 1]
        ?.focus()
    }


    if (
      event.key ===
        'ArrowRight' &&
      index < 5
    ) {
      otpInputRefs
        .current[index + 1]
        ?.focus()
    }
  }


  /* =========================
     PASTE OTP
  ========================= */

  const handleOtpPaste = (
    event
  ) => {
    event.preventDefault()


    const pastedValue =
      event.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, 6)


    if (!pastedValue) {
      return
    }


    const nextOtp = [
      '',
      '',
      '',
      '',
      '',
      '',
    ]


    pastedValue
      .split('')
      .forEach(
        (
          digit,
          index
        ) => {
          nextOtp[index] =
            digit
        }
      )


    setOtp(nextOtp)

    setOtpError('')


    const nextFocusIndex =
      Math.min(
        pastedValue.length,
        5
      )


    otpInputRefs
      .current[nextFocusIndex]
      ?.focus()
  }


  /* =========================
     VERIFIKASI OTP
  ========================= */

  const handleVerifyOtp = async () => {
    if (otpBusy.current) return
    const enteredOtp = otp.join('')
    if (enteredOtp.length !== 6 || timeLeft <= 0) {
      setOtpError('Masukkan OTP yang masih berlaku dari email Anda.')
      return
    }
    otpBusy.current = true
    const email = formData.email.trim().toLowerCase()
    try {
      const response = await api('auth/register/otp/verify', { method: 'POST', body: { email, otp: enteredOtp } })
      setRegistrationToken(response.data.registration_token)
      setVerifiedEmail(email)
      setEmailVerified(true)
      setOtpError('')
      setOtpSuccess(true)
      setOtpModalOpen(false)
    } catch (error) { setOtpError(error.message) }
    finally { otpBusy.current = false }
  }


  /* =========================
     KIRIM ULANG OTP
  ========================= */

  const handleResendOtp = async () => {
    if (resendTime > 0 || otpBusy.current) return
    otpBusy.current = true
    try {
      const response = await api('auth/register/otp', { method: 'POST', body: { email: formData.email.trim().toLowerCase() } })
      setOtp(Array(6).fill(''))
      setOtpError('')
      setTimeLeft(response.data.expires_in)
      setResendTime(response.data.resend_after)
      otpInputRefs.current[0]?.focus()
    } catch (error) { setOtpError(error.message) }
    finally { otpBusy.current = false }
  }


  /* =========================
     PASSWORD MATCH
  ========================= */

  const passwordsMatch =
    formData.confirmPassword
      .length > 0 &&
    formData.confirmPassword ===
      formData.password


  const passwordsDoNotMatch =
    formData.confirmPassword
      .length > 0 &&
    formData.confirmPassword !==
      formData.password


  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault()


    if (!formValid) {
      validateForm()

      return
    }


    if (!validateForm()) {
      return
    }


    if (!registrationToken) return
    setRegistrationDraft({ ...formData, registration_token: registrationToken })
    sessionStorage.removeItem('registrationData')


    navigate(
      '/register/krs'
    )
  }


  /* =========================
     OTP INPUT COMPONENT
  ========================= */

  const renderOtpInput = (
    digit,
    index
  ) => (
    <input
      key={index}
      ref={(element) => {
        otpInputRefs.current[
          index
        ] = element
      }}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      onChange={(event) =>
        handleOtpChange(
          index,
          event.target.value
        )
      }
      onKeyDown={(event) =>
        handleOtpKeyDown(
          index,
          event
        )
      }
      className={
        otpError
          ? 'otp-modal-input otp-modal-input-error'
          : 'otp-modal-input'
      }
      aria-label={`Digit OTP ${
        index + 1
      }`}
    />
  )


  return (
    <main className="auth-page">

      <div className="auth-card">

        {/* SIDEBAR */}

        <AuthSidebar
          activeStep={1}
        />


        {/* MAIN */}

        <section className="auth-main">

          <div className="register-container">

            {/* HEADING */}

            <div className="form-heading">

              <h2>
                Daftar Akun
              </h2>

              <p>
                Lengkapi data berikut untuk
                membuat akun SIPRESTASI.
              </p>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
              noValidate
            >

              <div className="form-grid">


                {/* EMAIL */}

                <div className="form-group form-group-full">

                  <label htmlFor="email">
                    Email Student
                    <span>*</span>
                  </label>


                  <div
                    className={[
                      'email-verification-field',
                      errors.email
                        ? 'input-error'
                        : '',
                      emailVerified
                        ? 'is-verified'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan Email Student"
                    />


                    {emailVerified ? (

                      <div className="email-verified-badge">

                        <CheckCircle2
                          size={17}
                        />

                        Verified

                      </div>

                    ) : (

                      <button
                        type="button"
                        className="email-verify-button"
                        onClick={
                          handleOpenOtp
                        }
                        disabled={
                          !emailValid
                        }
                      >
                        Verifikasi
                      </button>

                    )}

                  </div>


                  {errors.email ? (

                    <p className="field-error">
                      {errors.email}
                    </p>

                  ) : emailVerified ? (

                    <p className="email-verification-success">

                      <CheckCircle2
                        size={14}
                      />

                      Email student berhasil diverifikasi.

                    </p>

                  ) : (

                    <p className="field-helper">
                      OTP akan dikirim ke email ini.
                    </p>

                  )}

                </div>


                {/* NAMA */}

                <div className="form-group form-group-full">

                  <label htmlFor="name">
                    Nama Lengkap
                    <span>*</span>
                  </label>


                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Masukkan Nama Lengkap"
                    className={
                      errors.name
                        ? 'input-error'
                        : ''
                    }
                  />


                  {errors.name ? (

                    <p className="field-error">
                      {errors.name}
                    </p>

                  ) : (

                    <p className="field-helper">
                      Gunakan nama sesuai
                      data akademik.
                    </p>

                  )}

                </div>


                {/* NIM */}

                <div className="form-group">

                  <label htmlFor="nim">
                    NIM
                    <span>*</span>
                  </label>


                  <input
                    id="nim"
                    name="nim"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={
                      formData.nim
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Masukkan NIM"
                    className={
                      errors.nim
                        ? 'input-error'
                        : ''
                    }
                  />


                  {errors.nim && (

                    <p className="field-error">
                      {errors.nim}
                    </p>

                  )}

                </div>


                {/* TELEPON */}

                <div className="form-group">

                  <label htmlFor="phone">
                    Nomor Telepon
                    <span>*</span>
                  </label>


                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={16}
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Masukkan Nomor Aktif"
                    className={
                      errors.phone
                        ? 'input-error'
                        : ''
                    }
                  />


                  {errors.phone && (

                    <p className="field-error">
                      {errors.phone}
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
                      value={
                        formData.password
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan Password"
                    />


                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      aria-label={
                        showPassword
                          ? 'Sembunyikan password'
                          : 'Tampilkan password'
                      }
                    >

                      {showPassword ? (

                        <EyeOff
                          size={19}
                        />

                      ) : (

                        <Eye
                          size={19}
                        />

                      )}

                    </button>

                  </div>


                  <PasswordStrength
                    password={
                      formData.password
                    }
                  />


                  {errors.password && (

                    <p className="field-error">
                      {errors.password}
                    </p>

                  )}

                </div>


                {/* KONFIRMASI PASSWORD */}

                <div className="form-group password-group">

                  <label htmlFor="confirmPassword">
                    Konfirmasi Password
                    <span>*</span>
                  </label>


                  <div
                    className={`password-input ${
                      errors.confirmPassword
                        ? 'input-error'
                        : ''
                    }`}
                  >

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      value={
                        formData.confirmPassword
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan Password"
                    />


                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? 'Sembunyikan password'
                          : 'Tampilkan password'
                      }
                    >

                      {showConfirmPassword ? (

                        <EyeOff
                          size={19}
                        />

                      ) : (

                        <Eye
                          size={19}
                        />

                      )}

                    </button>

                  </div>


                  {passwordsMatch && (

                    <p className="password-match">

                      <CheckCircle2
                        size={16}
                      />

                      Password cocok

                    </p>

                  )}


                  {passwordsDoNotMatch && (

                    <p className="password-mismatch">
                      Password belum cocok
                    </p>

                  )}


                  {errors.confirmPassword &&
                    !passwordsDoNotMatch && (

                    <p className="field-error">
                      {
                        errors.confirmPassword
                      }
                    </p>

                  )}

                </div>

              </div>


              {/* BUTTON */}

              <button
                className="primary-button"
                type="submit"
                disabled={
                  !formValid
                }
              >
                Lanjutkan

                <ArrowRight
                  size={20}
                />
              </button>


              {/* LOGIN */}

              <div className="auth-bottom-link">

                Sudah punya akun?{' '}

                <Link to="/login">
                  Masuk
                </Link>

              </div>

            </form>

          </div>

        </section>

      </div>


      {/* =========================
          OTP MODAL
      ========================= */}

      {otpModalOpen && (

        <div
          className="otp-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseOtp()
            }
          }}
        >

          <div
            className="otp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="otp-modal-title"
          >

            {!otpSuccess && (

              <button
                type="button"
                className="otp-modal-close"
                onClick={
                  handleCloseOtp
                }
                aria-label="Tutup"
              >

                <X size={19} />

              </button>

            )}


            <div className="otp-modal-icon">

              {otpSuccess ? (

                <CheckCircle2
                  size={27}
                />

              ) : (

                <Mail
                  size={25}
                />

              )}

            </div>


            <div className="otp-modal-heading">

              <h2 id="otp-modal-title">
                {otpSuccess
                  ? 'Email Terverifikasi'
                  : 'Verifikasi Email'}
              </h2>


              <p>
                {otpSuccess
                  ? 'Email student berhasil diverifikasi.'
                  : 'Masukkan kode OTP yang kami kirim ke email student Anda.'}
              </p>

            </div>


            {!otpSuccess && (
              <>

                <div className="otp-modal-email">

                  <span>
                    Kode OTP dikirim ke
                  </span>

                  <strong>
                    {maskEmail(
                      formData.email
                    )}
                  </strong>

                </div>


                <div className="otp-modal-section">

                  <label>
                    KODE VERIFIKASI 6 DIGIT
                  </label>


                  <div
                    className="otp-modal-input-group"
                    onPaste={
                      handleOtpPaste
                    }
                  >

                    {otp
                      .slice(0, 3)
                      .map(
                        (
                          digit,
                          index
                        ) =>
                          renderOtpInput(
                            digit,
                            index
                          )
                      )}


                    <span className="otp-modal-divider">
                      -
                    </span>


                    {otp
                      .slice(3)
                      .map(
                        (
                          digit,
                          index
                        ) =>
                          renderOtpInput(
                            digit,
                            index + 3
                          )
                      )}

                  </div>


                  <div className="otp-modal-timer-row">

                    <span>
                      Kode berlaku selama 5 menit
                    </span>


                    <strong
                      className={
                        timeLeft <= 60
                          ? 'is-warning'
                          : ''
                      }
                    >
                      {formatTime(
                        timeLeft
                      )}
                    </strong>

                  </div>


                  {otpError && (

                    <p className="otp-modal-error">
                      {otpError}
                    </p>

                  )}


                  <button
                    type="button"
                    className="primary-button otp-modal-verify-button"
                    onClick={
                      handleVerifyOtp
                    }
                  >
                    Verifikasi

                    <ArrowRight
                      size={20}
                    />
                  </button>


                  <div className="otp-modal-resend">

                    Tidak menerima kode?{' '}


                    {resendTime > 0 ? (
                      <>

                        Kirim ulang dalam{' '}

                        <strong>
                          00:
                          {String(
                            resendTime
                          ).padStart(
                            2,
                            '0'
                          )}
                        </strong>

                      </>
                    ) : (

                      <button
                        type="button"
                        onClick={
                          handleResendOtp
                        }
                      >
                        Kirim ulang kode
                      </button>

                    )}

                  </div>

                </div>

              </>
            )}


            {otpSuccess && (

              <div className="otp-modal-success">

                <CheckCircle2
                  size={17}
                />

                Verifikasi berhasil

              </div>

            )}

          </div>

        </div>

      )}

    </main>
  )
}


export default Register
