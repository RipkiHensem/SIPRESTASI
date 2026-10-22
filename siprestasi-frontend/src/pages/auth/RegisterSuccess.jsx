import {
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import AuthSidebar from '../../components/auth/AuthSidebar'

import '../../styles/auth/auth-layout.css'
import '../../styles/auth/register-success.css'


function RegisterSuccess() {
  const navigate = useNavigate()


  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }


  return (
    <main className="auth-page">

      <div className="auth-card">

        <AuthSidebar completed />


        <section className="auth-main">

          <div className="register-success-container">

            <div className="register-success-icon">

              <CheckCircle2
                size={36}
              />

            </div>


            <div className="register-success-badge">
              REGISTRASI BERHASIL
            </div>


            <h1>
              Akun Berhasil Dibuat
            </h1>


            <p className="register-success-description">
              Data mahasiswa Anda telah berhasil diverifikasi.
              <br />
              Akun SIPRESTASI sudah dapat digunakan.
            </p>


            <button
              type="button"
              className="primary-button register-success-button"
              onClick={handleGoToDashboard}
            >
              Masuk ke SIPRESTASI

              <ArrowRight
                size={20}
              />
            </button>

          </div>

        </section>

      </div>

    </main>
  )
}


export default RegisterSuccess