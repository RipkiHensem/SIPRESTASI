import { api } from '../../api'
import { usePortal } from '../../data/portal'
import {
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
  Users,
  X,
} from 'lucide-react'

import '../../styles/student/pradita-value-peers.css'

function PraditaValuePeers() {
  const navigate = useNavigate()

  const portal = usePortal()
  const registrationData = portal.registrationData

  const rankingResult = portal.rankingResult

  const student = portal.student

  const [sending, setSending] = useState(false)
  const [emails, setEmails] = useState([1, 2, 3].map(index => portal.submission?.[`peer_reviewer_${index}`] || ''))

  const [errors, setErrors] = useState([
    '',
    '',
    '',
  ])

  const [showConfirmModal, setShowConfirmModal] =
    useState(false)

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const allowedDomain =
    '@student.pradita.ac.id'

  const handleEmailChange = (
    index,
    value
  ) => {
    const updatedEmails = [...emails]

    updatedEmails[index] = value

    setEmails(updatedEmails)

    const updatedErrors = [...errors]

    updatedErrors[index] = ''

    setErrors(updatedErrors)
  }

  const validateEmails = () => {
    const newErrors = [
      '',
      '',
      '',
    ]

    const normalizedEmails =
      emails.map((email) =>
        email.trim().toLowerCase()
      )

    emails.forEach(
      (email, index) => {
        const trimmedEmail =
          email.trim()

        const normalizedEmail =
          trimmedEmail.toLowerCase()

        if (!trimmedEmail) {
          newErrors[index] =
            'Email rekan sejawat wajib diisi.'

          return
        }

        if (
          !emailPattern.test(
            trimmedEmail
          )
        ) {
          newErrors[index] =
            'Format email belum benar.'

          return
        }

        if (
          !normalizedEmail.endsWith(
            allowedDomain
          )
        ) {
          newErrors[index] =
            'Gunakan email mahasiswa dengan domain @student.pradita.ac.id.'

          return
        }

        const duplicateCount =
          normalizedEmails.filter(
            (item) =>
              item ===
              normalizedEmail
          ).length

        if (duplicateCount > 1) {
          newErrors[index] =
            'Email ini sudah digunakan.'

          return
        }

        if (
          student.email &&
          normalizedEmail ===
            student.email
              .trim()
              .toLowerCase()
        ) {
          newErrors[index] =
            'Anda tidak dapat memilih email sendiri sebagai rekan sejawat.'
        }
      }
    )

    setErrors(newErrors)

    return newErrors.every(
      (error) => !error
    )
  }

  const handleSubmit = () => {
    const isValid =
      validateEmails()

    if (!isValid) {
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmSend = async () => {
    if (sending || !validateEmails()) return
    setSending(true)
    try {
      const body = Object.fromEntries(emails.map((email, i) => [`peer_reviewer_${i + 1}`, email.trim().toLowerCase()]))
      await api('pengajuan/peer-reviewers', { method: 'PUT', body })
      navigate('/dashboard/finalis', { replace: true })
    } catch (error) {
      setShowConfirmModal(false)
      setErrors([error.message, '', ''])
    } finally { setSending(false) }
  }

  const handleBack = () => {
    navigate(
      '/dashboard/finalis',
      {
        state: {
          registrationData,
          rankingResult,
        },
      }
    )
  }

  return (
    <div className="peer-page">
      <div className="peer-container">

        <header className="peer-page-header">
          <div>
            <span className="peer-page-eyebrow">
              PRADITA VALUE
            </span>

            <h1>
              Rekan Sejawat
            </h1>

            <p>
              Tambahkan mahasiswa yang
              akan memberikan penilaian
              Pradita Value.
            </p>
          </div>
        </header>

        <button
          type="button"
          className="peer-back-button"
          onClick={handleBack}
        >
          <ArrowLeft size={15} />
          Kembali
        </button>

        <div className="peer-main-grid">

          <section className="peer-form-card">

            <div className="peer-card-heading">
              <div className="peer-heading-icon">
                <Users size={19} />
              </div>

              <div>
                <h2>
                  Tambahkan 3 Rekan Sejawat
                </h2>

                <p>
                  Masukkan email mahasiswa
                  yang Anda pilih sebagai
                  rekan sejawat.
                </p>
              </div>
            </div>

            <div className="peer-student-info">
              <span>
                Mahasiswa Finalis
              </span>

              <strong>
                {student.name}
              </strong>

              <small>
                {student.nim}
                {' • '}
                Angkatan{' '}
                {student.angkatan}
              </small>
            </div>

            <div className="peer-fields">

              {emails.map(
                (email, index) => (
                  <div
                    className="peer-field-group"
                    key={index}
                  >
                    <label
                      htmlFor={`peer-email-${index}`}
                    >
                      Email Rekan Sejawat{' '}
                      {index + 1}
                      <span>*</span>
                    </label>

                    <div
                      className={
                        errors[index]
                          ? 'peer-input-wrapper has-error'
                          : 'peer-input-wrapper'
                      }
                    >
                      <Mail size={16} />

                      <input
                        id={`peer-email-${index}`}
                        type="email"
                        value={email}
                        placeholder="nama@student.pradita.ac.id"
                        autoComplete="off"
                        onChange={(event) =>
                          handleEmailChange(
                            index,
                            event.target.value
                          )
                        }
                      />
                    </div>

                    {errors[index] && (
                      <p className="peer-field-error">
                        {errors[index]}
                      </p>
                    )}
                  </div>
                )
              )}

            </div>

            <div className="peer-form-note">
              <Mail size={17} />

              <div>
                <strong>
                  Gunakan email mahasiswa Pradita
                </strong>

                <p>
                  Rekan sejawat harus menggunakan
                  email dengan domain
                  {' '}
                  @student.pradita.ac.id.
                  Alamat rekan disimpan untuk proses penilaian oleh pengelola.
                </p>
              </div>
            </div>

            <div className="peer-form-actions">
              <button
                type="button"
                className="peer-cancel-button"
                onClick={handleBack}
              >
                Batal
              </button>

              <button
                type="button"
                className="peer-submit-button"
                onClick={handleSubmit}
              >
                <Send size={15} />
                Simpan Rekan Penilai
              </button>
            </div>

          </section>

          <aside className="peer-info-card">

            <div className="peer-info-heading">
              <h2>
                Penilai Pradita Value
              </h2>

              <p>
                Total penilaian berasal dari
                5 penilai.
              </p>
            </div>

            <div className="peer-reviewer-list">

              <div className="peer-reviewer-item is-current">
                <div className="peer-reviewer-number">
                  3
                </div>

                <div>
                  <strong>
                    Rekan Sejawat
                  </strong>

                  <span>
                    Dipilih oleh mahasiswa
                  </span>
                </div>
              </div>

              <div className="peer-reviewer-item">
                <div className="peer-reviewer-number">
                  1
                </div>

                <div>
                  <strong>
                    Kaprodi
                  </strong>

                  <span>
                    Ditentukan oleh admin
                  </span>
                </div>
              </div>

              <div className="peer-reviewer-item">
                <div className="peer-reviewer-number">
                  1
                </div>

                <div>
                  <strong>
                    Dosen
                  </strong>

                  <span>
                    Ditentukan oleh admin
                  </span>
                </div>
              </div>

            </div>

            <div className="peer-info-footer">
              <CheckCircle2 size={16} />

              <p>
                Anda hanya perlu mengisi
                3 email rekan sejawat.
                Penilai dosen dan Kaprodi
                dikelola oleh admin.
              </p>
            </div>

          </aside>

        </div>
      </div>

      {showConfirmModal && (
        <div className="peer-modal-overlay">

          <div className="peer-modal">

            <button
              type="button"
              className="peer-modal-close"
              onClick={() =>
                setShowConfirmModal(false)
              }
              aria-label="Tutup"
            >
              <X size={17} />
            </button>

            <div className="peer-modal-icon">
              <Send size={20} />
            </div>

            <h2>
              Simpan rekan penilai?
            </h2>

            <p className="peer-modal-description">
              Tiga alamat email berikut akan disimpan sebagai rekan penilai.
            </p>

            <div className="peer-modal-email-list">
              {emails.map(
                (email, index) => (
                  <div key={index}>
                    <span>
                      Rekan {index + 1}
                    </span>

                    <strong>
                      {email
                        .trim()
                        .toLowerCase()}
                    </strong>
                  </div>
                )
              )}
            </div>

            <p className="peer-modal-warning">
              Pastikan alamat email sudah
              benar sebelum data disimpan.
            </p>

            <div className="peer-modal-actions">
              <button
                type="button"
                className="peer-modal-cancel"
                onClick={() =>
                  setShowConfirmModal(false)
                }
              >
                Batal
              </button>

              <button
                type="button"
                className="peer-modal-confirm"
                onClick={handleConfirmSend}
                disabled={sending}
              >
                <Send size={14} />
                Simpan Rekan Penilai
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default PraditaValuePeers
