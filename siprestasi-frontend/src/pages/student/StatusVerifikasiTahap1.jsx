import { usePortal } from '../../data/portal'
import {
  useNavigate,
} from 'react-router-dom'

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  GraduationCap,
  Languages,
  Pencil,
  Trophy,
  Users,
} from 'lucide-react'

import '../../styles/student/status-verifikasi-tahap1.css'

function StatusVerifikasiTahap1() {
  const navigate = useNavigate()

  const portal = usePortal()
  const registrationData = portal.registrationData

  /*
    ============================================
    DATA MAHASISWA
    ============================================
  */

  const student = portal.student

  const formData = registrationData.formData

  const files =
    registrationData?.files || {
      prestasi: null,
      organisasi: null,
      bahasa: null,
    }

  const submittedAt =
    registrationData?.submittedAt || null

  /*
    ============================================
    FORMAT WAKTU KIRIM
    ============================================
  */

  const formatSubmittedDateTime = (
    dateValue
  ) => {
    if (!dateValue) {
      return 'Belum tersedia'
    }

    const date = new Date(dateValue)

    const datePart =
      new Intl.DateTimeFormat(
        'id-ID',
        {
          timeZone: 'Asia/Jakarta',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      ).format(date)

    const timePart =
      new Intl.DateTimeFormat(
        'id-ID',
        {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }
      )
        .format(date)
        .replace('.', ':')

    return `${datePart}, ${timePart} WIB`
  }

  const formatSubmittedShortDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return '-'
    }

    const date = new Date(dateValue)

    return new Intl.DateTimeFormat(
      'id-ID',
      {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    ).format(date)
  }

  /*
    ============================================
    LABEL
    ============================================
  */

  const getPrestasiLevelLabel = (value) => {
    const labels = {
      internasional: 'Internasional',
      nasional: 'Nasional',
      lokal: 'Lokal',
    }

    return labels[value] || value || '-'
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

    return labels[value] || value || '-'
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

    return labels[value] || value || '-'
  }

  const getBahasaLabel = (value) => {
    const labels = {
      inggris: 'Bahasa Inggris',
      jepang: 'Bahasa Jepang',
      korea: 'Bahasa Korea',
      arab: 'Bahasa Arab',
    }

    return labels[value] || value || '-'
  }

  /*
    ============================================
    LIHAT FILE
    ============================================
  */

  const handleViewFile = (file) => {
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
    NAVIGATION
    ============================================
  */

  const handleBackDashboard = () => {
    navigate(
      '/dashboard/ranking',
      {
        state: {
          registrationData,
        },
      }
    )
  }

  const handleRevision = (section) => {
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
    STATUS VERIFIKASI

    Status berasal dari backend.
    ============================================
  */

  const verificationStatus = portal.verificationStatus
  const revisionCount = Object.values(verificationStatus).filter(value => value === 'revision').length
  const verifiedCount = Object.values(verificationStatus).filter(value => value === 'verified').length
  const statusLabel = value => ({ verified: 'Terverifikasi', revision: 'Perlu revisi', rejected: 'Ditolak', checking: 'Sedang diverifikasi', 'not-submitted': 'Tidak diajukan' }[value] || 'Belum tersedia')

  /*
    ============================================
    STATUS BADGE
    ============================================
  */

  const getStatusBadge = (status) => {
    if (status === 'verified') {
      return (
        <span className="verification-badge verification-badge-success">
          <CheckCircle2 size={13} />
          Terverifikasi
        </span>
      )
    }

    if (status === 'checking') {
      return (
        <span className="verification-badge verification-badge-process">
          <Clock3 size={13} />
          Sedang Diverifikasi
        </span>
      )
    }

    if (status === 'revision' || status === 'rejected') {
      return (
        <span className="verification-badge verification-badge-revision">
          <AlertCircle size={13} />
          {status === 'rejected' ? 'Ditolak' : 'Perlu Revisi'}
        </span>
      )
    }

    return (
      <span className="verification-badge verification-badge-neutral">
        Tidak Diajukan
      </span>
    )
  }

  return (
    <div className="verification-page">
      <div className="verification-container">

        {/* =========================
            BACK BUTTON
        ========================== */}

        <button
          type="button"
          className="verification-back-button"
          onClick={handleBackDashboard}
        >
          <ArrowLeft size={17} />
          Kembali ke Dashboard
        </button>

        {/* =========================
            HEADER
        ========================== */}

        <header className="verification-header">
          <h1>
            Status Verifikasi Tahap 1
          </h1>

          <p>
            Pantau proses pemeriksaan data dan
            dokumen pendaftaran Anda.
          </p>
        </header>

        {/* =========================
            SUMMARY
        ========================== */}

        <section className="verification-summary">
          <div className="verification-summary-top">
            <div className="verification-summary-icon">
              <Clock3 size={20} />
            </div>

            <div className="verification-summary-content">
              <h2>
                {revisionCount ? 'Pendaftaran Perlu Revisi' : 'Status Pendaftaran'}
              </h2>

              <p>
                Data pendaftaran Anda sedang
                diperiksa. Silakan pantau status
                verifikasi secara berkala.
              </p>
            </div>

            <span className="verification-main-status">
              Sedang Diverifikasi
            </span>
          </div>

          <div className="verification-summary-info">
            <div>
              <span>
                Tanggal Kirim
              </span>

              <strong>
                {formatSubmittedDateTime(
                  submittedAt
                )}
              </strong>
            </div>

            <div>
              <span>
                Bagian Diverifikasi
              </span>

              <strong>
                {verifiedCount} dari 5 indikator
              </strong>
            </div>

            <div>
              <span>
                Perlu Revisi
              </span>

              <strong className="verification-summary-danger">
                {revisionCount} dokumen
              </strong>
            </div>
          </div>

          {/* =========================
              PROGRESS
          ========================== */}

          <div className="verification-progress">

            <div className="verification-progress-step is-complete">
              <div className="verification-progress-dot">
                <CheckCircle2 size={16} />
              </div>

              <div>
                <strong>
                  Dikirim
                </strong>

                <span>
                  {formatSubmittedShortDate(
                    submittedAt
                  )}
                </span>
              </div>
            </div>

            <div className="verification-progress-line is-active" />

            <div className="verification-progress-step is-active">
              <div className="verification-progress-dot">
                <Clock3 size={16} />
              </div>

              <div>
                <strong>
                  Diverifikasi
                </strong>

                <span>
                  Sedang berjalan
                </span>
              </div>
            </div>

            <div className="verification-progress-line" />

            <div className="verification-progress-step">
              <div className="verification-progress-dot">
                <CheckCircle2 size={16} />
              </div>

              <div>
                <strong>
                  Selesai
                </strong>

                <span>
                  Menunggu
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* =========================
            REVISION NOTICE
        ========================== */}

        {revisionCount > 0 && <section className="verification-revision-notice">
          <AlertCircle size={18} />

          <div>
            <strong>
              Ada 1 dokumen yang perlu diperbaiki.
            </strong>

            <span>
              Perbaiki dokumen tersebut agar proses
              verifikasi dapat dilanjutkan.
            </span>
          </div>
        </section>

        }
        {/* =========================
            STATUS DATA TITLE
        ========================== */}

        <div className="verification-list-heading">
          <h2>
            Status Data
          </h2>

          <p>
            Hasil pemeriksaan setiap indikator
            Tahap 1.
          </p>
        </div>

        {/* =========================
            IPK
        ========================== */}

        <section className="verification-item">
          <div className="verification-item-icon verification-icon-success">
            <GraduationCap size={20} />
          </div>

          <div className="verification-item-content">
            <span className="verification-item-label">
              IPK Kumulatif
            </span>

            <h3>
              {student.ipk} / 4.00
            </h3>

            <p>
              Data IPK berhasil diverifikasi
              dari data akademik.
            </p>
          </div>

          <div className="verification-item-action">
            {getStatusBadge(
              verificationStatus.ipk
            )}
          </div>
        </section>

        {/* =========================
            SKPI
        ========================== */}

        <section className="verification-item">
          <div className="verification-item-icon verification-icon-success">
            <FileText size={20} />
          </div>

          <div className="verification-item-content">
            <span className="verification-item-label">
              SKPI
            </span>

            <h3>
              {student.skpi}
            </h3>

            <p>
              Data SKPI berhasil diverifikasi
              dari data akademik.
            </p>
          </div>

          <div className="verification-item-action">
            {getStatusBadge(
              verificationStatus.skpi
            )}
          </div>
        </section>

        {/* =========================
            PRESTASI
        ========================== */}

        <section className="verification-item">
          <div className="verification-item-icon verification-icon-process">
            <Trophy size={20} />
          </div>

          <div className="verification-item-content">
            <span className="verification-item-label">
              Prestasi Terbaik
            </span>

            {formData.hasPrestasi ===
            'ya' ? (
              <>
                <h3>
                  {formData.namaPrestasi}
                </h3>

                <div className="verification-item-meta">
                  <span>
                    {getPrestasiLevelLabel(
                      formData.tingkatPrestasi
                    )}
                  </span>

                  <span>
                    {formData.tahunPrestasi}
                  </span>

                  {files.prestasi && (
                    <span>
                      {files.prestasi.name}
                    </span>
                  )}
                </div>

                <p>
                  {portal.documents.prestasi?.catatan || statusLabel(verificationStatus.prestasi)}
                </p>
              </>
            ) : (
              <>
                <h3>
                  Tidak ada prestasi yang
                  diajukan.
                </h3>

                <p>
                  Mahasiswa memilih tidak
                  mengajukan prestasi.
                </p>
              </>
            )}
          </div>

          <div className="verification-item-action">
            {files.prestasi && (
              <button
                type="button"
                className="verification-file-button"
                onClick={() =>
                  handleViewFile(
                    files.prestasi
                  )
                }
              >
                <Eye size={14} />
                Lihat
              </button>
            )}

            {verificationStatus.prestasi === 'revision' && <button type="button" className="verification-revision-button" onClick={() => handleRevision('prestasi')}>Perbaiki Data</button>}
            {getStatusBadge(verificationStatus.prestasi)}
          </div>
        </section>

        {/* =========================
            ORGANISASI
        ========================== */}

        <section className="verification-item verification-item-revision">
          <div className="verification-item-icon verification-icon-revision">
            <Users size={20} />
          </div>

          <div className="verification-item-content">
            <span className="verification-item-label">
              Organisasi
            </span>

            {formData.hasOrganisasi ===
            'ya' ? (
              <>
                <h3>
                  {formData.namaOrganisasi}
                </h3>

                <div className="verification-item-meta">
                  <span>
                    {getOrganisasiLevelLabel(
                      formData.tingkatOrganisasi
                    )}
                  </span>

                  <span>
                    {getJabatanLabel(
                      formData.jabatan
                    )}
                  </span>

                  <span>
                    {formData.periode}
                  </span>

                  {files.organisasi && (
                    <span>
                      {files.organisasi.name}
                    </span>
                  )}
                </div>

                <p className="verification-revision-text">
                  {portal.documents.organisasi?.catatan || statusLabel(verificationStatus.organisasi)}
                </p>
              </>
            ) : (
              <>
                <h3>
                  Tidak ada organisasi yang
                  diajukan.
                </h3>

                <p>
                  Mahasiswa memilih tidak
                  mengajukan pengalaman
                  organisasi.
                </p>
              </>
            )}
          </div>

          <div className="verification-item-action">

            {verificationStatus.organisasi === 'revision' && (
              <button
                type="button"
                className="verification-revision-button"
                onClick={() =>
                  handleRevision(
                    'organisasi'
                  )
                }
              >
                <Pencil size={14} />
                Perbaiki Data
              </button>
            )}

            {getStatusBadge(
              verificationStatus.organisasi
            )}
          </div>
        </section>

        {/* =========================
            BAHASA ASING
        ========================== */}

        <section className="verification-item">
          <div className="verification-item-icon verification-icon-process">
            <Languages size={20} />
          </div>

          <div className="verification-item-content">
            <span className="verification-item-label">
              Bahasa Asing
            </span>

            {formData.hasBahasa ===
            'ya' ? (
              <>
                <h3>
                  {getBahasaLabel(
                    formData.bahasa
                  )}
                </h3>

                <div className="verification-item-meta">
                  <span>
                    {formData.tingkatSertifikat}
                  </span>

                  <span>
                    Skor {formData.skor}
                  </span>

                  {files.bahasa && (
                    <span>
                      {files.bahasa.name}
                    </span>
                  )}
                </div>

                <p>
                  {portal.documents.bahasa?.catatan || statusLabel(verificationStatus.bahasa)}
                </p>
              </>
            ) : (
              <>
                <h3>
                  Tidak ada sertifikat yang
                  diajukan.
                </h3>

                <p>
                  Mahasiswa memilih tidak
                  mengajukan sertifikat bahasa
                  asing.
                </p>
              </>
            )}
          </div>

          <div className="verification-item-action">

            {files.bahasa && (
              <button
                type="button"
                className="verification-file-button"
                onClick={() =>
                  handleViewFile(
                    files.bahasa
                  )
                }
              >
                <Eye size={14} />
                Lihat
              </button>
            )}

            {verificationStatus.bahasa === 'revision' && <button type="button" className="verification-revision-button" onClick={() => handleRevision('bahasa')}>Perbaiki Data</button>}
            {getStatusBadge(verificationStatus.bahasa)}
          </div>
        </section>

        {/* =========================
            NEXT INFO

            TIDAK ADA BUTTON DASHBOARD
            DI BAGIAN BAWAH
        ========================== */}

        <section className="verification-next">
          <div>
            <strong>
              Setelah Verifikasi Selesai
            </strong>

            <p>
              Jika seluruh data sudah
              terverifikasi, nilai Tahap 1
              akan diproses untuk menentukan
              ranking per angkatan.
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}

export default StatusVerifikasiTahap1
