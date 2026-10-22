import { Check } from 'lucide-react'

import logoSiPradita from '../../assets/branding/logo-siprestasi-white.png'


function AuthSidebar({
  activeStep = 1,
  completed = false,
}) {
  const steps = [
    {
      number: 1,
      title: 'Data Akun',
      subtitle: 'Identitas & Kata Sandi',
    },
    {
      number: 2,
      title: 'Verifikasi KRS',
      subtitle: 'Validasi Status Akademik',
    },
  ]


  return (
    <aside className="auth-sidebar">

      {/* =========================
          BRAND
      ========================== */}

      <div className="sidebar-brand">

        <div className="brand-logo-badge">

          <img
            src={logoSiPradita}
            alt="Logo Sistem Informasi Pradita University"
            className="brand-logo"
          />

        </div>
      </div>


      {/* =========================
          SIDEBAR CONTENT
      ========================== */}

      <div className="sidebar-content">

        <h1>
          Mulai Pendaftaran Anda
        </h1>

        <p>
          Buat akun SIPRESTASI untuk mengikuti
          proses seleksi Mahasiswa Berprestasi.
        </p>


        {/* =========================
            STEPPER
        ========================== */}

        <div className="registration-steps">

          {steps.map((step) => {
            const isActive =
              !completed &&
              activeStep === step.number

            const isCompleted =
              completed ||
              activeStep > step.number


            return (
              <div
                key={step.number}
                className={[
                  'registration-step',
                  isActive
                    ? 'active'
                    : '',
                  isCompleted
                    ? 'completed'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >

                <div className="step-number">

                  {isCompleted ? (
                    <Check size={19} />
                  ) : (
                    step.number
                  )}

                </div>


                <div className="step-content">

                  <div className="step-title-row">

                    <div className="step-title">
                      {step.title}
                    </div>


                    {isCompleted && (
                      <span className="step-completed-badge">
                        Selesai
                      </span>
                    )}

                  </div>


                  <div className="step-subtitle">
                    {step.subtitle}
                  </div>

                </div>

              </div>
            )
          })}

        </div>

      </div>

    </aside>
  )
}


export default AuthSidebar
