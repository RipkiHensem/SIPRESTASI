import { saveApplication } from '../../data/portal'
import { useState } from 'react'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  Pencil,
  Send,
  X,
} from 'lucide-react'

import '../../styles/student/review-tahap1.css'

function ReviewTahap1() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const [showConfirmModal, setShowConfirmModal] =
    useState(false)

  /*
    ============================================
    DATA DARI TAHAP 1
    ============================================
  */

  const registrationData =
    location.state?.registrationData

  /*
    ============================================
    JIKA DATA REVIEW TIDAK ADA
    ============================================
  */

  if (!registrationData) {
    return (
      <div className="review-page">
        <div className="review-container">
          {sendError && <p role="alert">{sendError}</p>}
          <button
            type="button"
            className="review-back-button"
            onClick={() =>
              navigate('/pendaftaran-mapres')
            }
          >
            <ArrowLeft size={17} />
            Kembali ke Tahap 1
          </button>

          <section className="review-section">
            <div className="review-empty">
              Data pendaftaran belum tersedia. Silakan
              lengkapi Tahap 1 terlebih dahulu.
            </div>
          </section>
        </div>
      </div>
    )
  }

  const {
    student,
    formData,
    files,
  } = registrationData

  /*
    ============================================
    FORMAT LABEL
    ============================================
  */

  const getPrestasiLevelLabel = (value) => {
    const labels = {
      internasional: 'Internasional',
      nasional: 'Nasional',
      lokal: 'Lokal',
    }

    return labels[value] || value
  }

  const getOrganisasiLevelLabel = (value) => {
    const labels = {
      internasional: 'Internasional',
      nasional: 'Nasional',
      lokal: 'Lokal / Kampus',
      provinsi: 'Provinsi',
      'kabupaten-kota': 'Kabupaten / Kota',
      kecamatan: 'Kecamatan',
      kampus: 'Kampus',
      sekolah: 'Sekolah',
    }

    return labels[value] || value
  }

  const getJabatanLabel = (value) => {
    const labels = {
      ketua: 'Ketua',
      wakil: 'Wakil Ketua',
      'wakil-ketua': 'Wakil Ketua',
      sekretaris: 'Sekretaris',
      bendahara: 'Bendahara',
      'koordinator-divisi': 'Koordinator Divisi',
      koordinator: 'Koordinator Divisi',
      anggota_aktif: 'Anggota Aktif',
      anggota: 'Anggota',
    }

    return labels[value] || value
  }

  const getBahasaLabel = (value) => {
    const labels = {
      inggris: 'Bahasa Inggris',
      jepang: 'Bahasa Jepang',
      korea: 'Bahasa Korea',
      arab: 'Bahasa Arab',
    }

    return labels[value] || value
  }

  /*
    ============================================
    FORMAT TANGGAL
    ============================================
  */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return '-'
    }

    const date = new Date(
      `${dateValue}T00:00:00`
    )

    return new Intl.DateTimeFormat(
      'id-ID',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    ).format(date)
  }

  /*
    ============================================
    FORMAT UKURAN FILE
    ============================================
  */

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return '-'
    }

    if (bytes < 1024) {
      return `${bytes} B`
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`
  }

  /*
    ============================================
    NAVIGATION
    ============================================
  */

  const handleBack = () => {
    navigate(
      '/pendaftaran-mapres',
      {
        state: {
          registrationData,
        },
      }
    )
  }

  const handleEditSection = (section) => {
    navigate(
      '/pendaftaran-mapres',
      {
        state: {
          registrationData,
          editSection: section,
        },
      }
    )
  }

  /*
    ============================================
    LIHAT DOKUMEN
    ============================================
  */

  const handleViewDocument = (file) => {
    if (!file) {
      return
    }

    const fileUrl =
      file.url || URL.createObjectURL(file)

    window.open(
      fileUrl,
      '_blank',
      'noopener,noreferrer'
    )

    setTimeout(() => {
      URL.revokeObjectURL(fileUrl)
    }, 60000)
  }

  /*
    ============================================
    MODAL KIRIM
    ============================================
  */

  const handleOpenConfirm = () => {
    setShowConfirmModal(true)
  }

  const handleCloseConfirm = () => {
    setShowConfirmModal(false)
  }

  /*
    ============================================
    KIRIM PENDAFTARAN
    ============================================
  */

  const handleSubmitRegistration = async () => {
    if (sending) return
    setSending(true)
    setSendError('')
    try {
      await saveApplication(registrationData, true)
      navigate('/pendaftaran-mapres/status', { replace: true })
    } catch (error) {
      setSendError(error.message)
      setShowConfirmModal(false)
    } finally { setSending(false) }
  }

  /*
    ============================================
    STATUS ADA / TIDAK ADA
    ============================================
  */

  const hasPrestasi =
    formData.hasPrestasi === 'ya'

  const hasOrganisasi =
    formData.hasOrganisasi === 'ya'

  const hasBahasa =
    formData.hasBahasa === 'ya'

  /*
    ============================================
    DOCUMENT CARD
    ============================================
  */

  const renderDocumentCard = (file) => {
    if (!file) {
      return null
    }

    return (
      <div className="review-document-card">
        <div className="review-document-icon">
          <FileText size={20} />
        </div>

        <div className="review-document-info">
          <strong>
            {file.name}
          </strong>

          <span>
            {formatFileSize(file.size)}
          </span>
        </div>

        <button
          type="button"
          className="review-document-button"
          onClick={() =>
            handleViewDocument(file)
          }
        >
          <Eye size={15} />
          Lihat Dokumen
        </button>
      </div>
    )
  }

  return (
    <div className="review-page">
      <div className="review-container">

        {/* BACK */}

        <button
          type="button"
          className="review-back-button"
          onClick={handleBack}
        >
          <ArrowLeft size={17} />
          Kembali ke Tahap 1
        </button>

        {/* HEADER */}

        <section className="review-header">
          <div>
            <h1>
              Periksa & Kirim Pendaftaran
            </h1>

            <p>
              Periksa kembali data Tahap 1 sebelum
              dikirim.
            </p>
          </div>

          <div className="review-complete-badge">
            <CheckCircle2 size={19} />

            <div>
              <strong>
                4 dari 4 bagian lengkap
              </strong>

              <span>
                Data siap diperiksa
              </span>
            </div>
          </div>
        </section>

        {/* NOTICE */}

        <section className="review-notice">
          <FileText size={18} />

          <p>
            Periksa kembali data sebelum dikirim.
            Setelah pendaftaran dikirim, data hanya
            dapat diubah jika admin meminta revisi.
          </p>
        </section>

        {/* DATA MAHASISWA */}

        <section className="review-section">
          <div className="review-section-header">
            <div className="review-section-title">
              <span className="review-section-number">
                1
              </span>

              <div>
                <h2>
                  Data Mahasiswa
                </h2>

                <p>
                  Data profil dan akademik mahasiswa.
                </p>
              </div>
            </div>
          </div>

          <div className="review-divider" />

          <div className="review-data-grid review-data-grid-three">
            <div className="review-data-item">
              <span>
                Nama Mahasiswa
              </span>

              <strong>
                {student.name}
              </strong>
            </div>

            <div className="review-data-item">
              <span>
                NIM
              </span>

              <strong>
                {student.nim}
              </strong>
            </div>

            <div className="review-data-item">
              <span>
                Angkatan
              </span>

              <strong>
                {student.angkatan}
              </strong>
            </div>
          </div>

          <div className="review-data-grid review-academic-grid">
            <div className="review-data-item">
              <span>
                IPK Kumulatif
              </span>

              <strong>
                {student.ipk} / 4.00
              </strong>

              <small>
                Data akademik
              </small>
            </div>

            <div className="review-data-item">
              <span>
                SKPI
              </span>

              <strong>
                {student.skpi}
              </strong>

              <small>
                Data akademik
              </small>
            </div>
          </div>
        </section>

        {/* PRESTASI */}

        <section className="review-section">
          <div className="review-section-header">
            <div className="review-section-title">
              <span className="review-section-number">
                2
              </span>

              <div>
                <h2>
                  Prestasi Terbaik
                </h2>

                <p>
                  Prestasi yang diajukan untuk Tahap 1.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="review-edit-button"
              onClick={() =>
                handleEditSection('prestasi')
              }
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>

          <div className="review-divider" />

          {hasPrestasi ? (
            <>
              <div className="review-data-grid">
                <div className="review-data-item review-data-full">
                  <span>
                    Nama Prestasi
                  </span>

                  <strong>
                    {formData.namaPrestasi}
                  </strong>
                </div>

                <div className="review-data-item">
                  <span>
                    Tingkat Prestasi
                  </span>

                  <strong>
                    {getPrestasiLevelLabel(
                      formData.tingkatPrestasi
                    )}
                  </strong>
                </div>

                <div className="review-data-item">
                  <span>
                    Tahun Prestasi
                  </span>

                  <strong>
                    {formData.tahunPrestasi}
                  </strong>
                </div>

                <div className="review-data-item review-data-full">
                  <span>
                    Penyelenggara
                  </span>

                  <strong>
                    {formData.penyelenggara}
                  </strong>
                </div>
              </div>

              {renderDocumentCard(
                files.prestasi
              )}
            </>
          ) : (
            <div className="review-empty">
              Tidak ada prestasi yang diajukan.
            </div>
          )}
        </section>

        {/* ORGANISASI */}

        <section className="review-section">
          <div className="review-section-header">
            <div className="review-section-title">
              <span className="review-section-number">
                3
              </span>

              <div>
                <h2>
                  Organisasi
                </h2>

                <p>
                  Pengalaman organisasi yang diajukan.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="review-edit-button"
              onClick={() =>
                handleEditSection('organisasi')
              }
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>

          <div className="review-divider" />

          {hasOrganisasi ? (
            <>
              <div className="review-data-grid">
                <div className="review-data-item review-data-full">
                  <span>
                    Nama Organisasi
                  </span>

                  <strong>
                    {formData.namaOrganisasi}
                  </strong>
                </div>

                <div className="review-data-item">
                  <span>
                    Tingkat Organisasi
                  </span>

                  <strong>
                    {getOrganisasiLevelLabel(
                      formData.tingkatOrganisasi
                    )}
                  </strong>
                </div>

                <div className="review-data-item">
                  <span>
                    Jabatan / Peran
                  </span>

                  <strong>
                    {getJabatanLabel(
                      formData.jabatan
                    )}
                  </strong>
                </div>

                <div className="review-data-item review-data-full">
                  <span>
                    Periode
                  </span>

                  <strong>
                    {formData.periode}
                  </strong>
                </div>
              </div>

              {renderDocumentCard(
                files.organisasi
              )}
            </>
          ) : (
            <div className="review-empty">
              Tidak ada pengalaman organisasi yang
              diajukan.
            </div>
          )}
        </section>

        {/* BAHASA ASING */}

        <section className="review-section">
          <div className="review-section-header">
            <div className="review-section-title">
              <span className="review-section-number">
                4
              </span>

              <div>
                <h2>
                  Bahasa Asing
                </h2>

                <p>
                  Sertifikat bahasa asing yang diajukan.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="review-edit-button"
              onClick={() =>
                handleEditSection('bahasa')
              }
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>

          <div className="review-divider" />

          {hasBahasa ? (
            <>
              <div className="review-data-grid">
                <div className="review-data-item">
                  <span>
                    Bahasa
                  </span>

                  <strong>
                    {getBahasaLabel(
                      formData.bahasa
                    )}
                  </strong>
                </div>

                <div className="review-data-item">
                  <span>
                    Tingkat Sertifikat
                  </span>

                  <strong>
                    {formData.tingkatSertifikat}
                  </strong>
                </div>

                <div className="review-data-item">
                  <span>
                    Skor / Level
                  </span>

                  <strong>
                    {formData.skor}
                  </strong>
                </div>

                <div className="review-data-item">
                  <span>
                    Tanggal Tes / Terbit
                  </span>

                  <strong>
                    {formatDate(
                      formData.tanggalTes
                    )}
                  </strong>
                </div>

                <div className="review-data-item">
                  <span>
                    Lembaga Penerbit
                  </span>

                  <strong>
                    {formData.lembagaPenerbit}
                  </strong>
                </div>

                <div className="review-data-item">
                  <span>
                    Tanggal Kedaluwarsa
                  </span>

                  <strong>
                    {formData.tanggalKedaluwarsa
                      ? formatDate(
                        formData.tanggalKedaluwarsa
                      )
                      : 'Tidak tercantum'}
                  </strong>
                </div>
              </div>

              {renderDocumentCard(
                files.bahasa
              )}
            </>
          ) : (
            <div className="review-empty">
              Tidak ada sertifikat bahasa asing yang
              diajukan.
            </div>
          )}
        </section>

        {/* ACTION */}

        <section className="review-actions">
          <span>
            Periksa sekali lagi sebelum mengirim
            pendaftaran.
          </span>

          <button
            type="button"
            className="review-submit-button"
            onClick={handleOpenConfirm}
          >
            Kirim Pendaftaran
            <Send size={16} />
          </button>
        </section>
      </div>

      {/* CONFIRM MODAL */}

      {showConfirmModal && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <button
              type="button"
              className="review-modal-close"
              onClick={handleCloseConfirm}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>

            <div className="review-modal-icon">
              <Send size={22} />
            </div>

            <h2>
              Kirim pendaftaran?
            </h2>

            <p>
              Setelah dikirim, data tidak dapat diubah
              kecuali admin meminta revisi.
            </p>

            <div className="review-modal-actions">
              <button
                type="button"
                className="review-modal-cancel"
                onClick={handleCloseConfirm}
              >
                Batal
              </button>

              <button
                type="button"
                className="review-modal-submit"
                onClick={handleSubmitRegistration}
                disabled={sending}
              >
                Kirim Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewTahap1
