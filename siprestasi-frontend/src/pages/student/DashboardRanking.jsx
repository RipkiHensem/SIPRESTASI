import { usePortal } from '../../data/portal'
import {
  useNavigate,
} from 'react-router-dom'

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GraduationCap,
  Info,
  Languages,
  LockKeyhole,
  Trophy,
  Users,
} from 'lucide-react'

import '../../styles/student/dashboard-ranking.css'

function DashboardRanking() {
  const navigate = useNavigate()

  /*
    ============================================
    DATA PENDAFTARAN
    ============================================

    Data dari proses sebelumnya akan dibawa
    melalui route state.

    Data dibaca ulang dari backend saat halaman dibuka.
  */

  const portal = usePortal()
  const registrationData = portal.registrationData

  const student = portal.student

  const formData = registrationData.formData

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
    LIHAT DETAIL TAHAP 1
    ============================================
  */

  const handleViewDetail = () => {
    navigate(
      '/pendaftaran-mapres/status',
      {
        state: {
          registrationData,
        },
      }
    )
  }

  /*
    ============================================
    SIMULASI HASIL RANKING
    ============================================

    Hanya untuk demo frontend.
  */

  const handleCheckRanking = () => {
    navigate(['top3', 'pending_reviewed', 'ranked'].includes(portal.submission?.status) ? '/dashboard/finalis' : '/dashboard/ranking', { replace: true })
  }

  /*
    ============================================
    DATA RINGKASAN TAHAP 1
    ============================================
  */

  const indicators = [
    {
      id: 'ipk',
      title: 'IPK',
      value: `${student.ipk} / 4.00`,
      detail: '',
      status: portal.verificationStatus.ipk,
      Icon: GraduationCap,
    },

    {
      id: 'skpi',
      title: 'SKPI',
      value: student.skpi,
      detail: '',
      status: portal.verificationStatus.ipk,
      Icon: FileText,
    },

    {
      id: 'prestasi',
      title: 'Prestasi',
      value:
        formData.hasPrestasi === 'ya'
          ? formData.namaPrestasi
          : 'Tidak diajukan',
      detail:
        formData.hasPrestasi === 'ya'
          ? getPrestasiLevelLabel(
              formData.tingkatPrestasi
            )
          : '',
      status:
        formData.hasPrestasi === 'ya'
          ? portal.verificationStatus.prestasi
          : 'not-submitted',
      Icon: Trophy,
    },

    {
      id: 'organisasi',
      title: 'Organisasi',
      value:
        formData.hasOrganisasi === 'ya'
          ? formData.namaOrganisasi
          : 'Tidak diajukan',
      detail:
        formData.hasOrganisasi === 'ya'
          ? `${getOrganisasiLevelLabel(
              formData.tingkatOrganisasi
            )} • ${getJabatanLabel(
              formData.jabatan
            )}`
          : '',
      status:
        formData.hasOrganisasi === 'ya'
          ? portal.verificationStatus.organisasi
          : 'not-submitted',
      Icon: Users,
    },

    {
      id: 'bahasa',
      title: 'Bahasa Asing',
      value:
        formData.hasBahasa === 'ya'
          ? getBahasaLabel(
              formData.bahasa
            )
          : 'Tidak diajukan',
      detail:
        formData.hasBahasa === 'ya'
          ? `${formData.tingkatSertifikat} • Skor ${formData.skor}`
          : '',
      status:
        formData.hasBahasa === 'ya'
          ? portal.verificationStatus.bahasa
          : 'not-submitted',
      Icon: Languages,
    },
  ]

  /*
    ============================================
    STATUS INDIKATOR
    ============================================
  */

  const renderIndicatorStatus = (
    status
  ) => {
    if (status === 'verified') {
      return (
        <span className="ranking-indicator-status ranking-status-verified">
          <CheckCircle2 size={14} />
          Terverifikasi
        </span>
      )
    }

    return (
      <span className="ranking-indicator-status ranking-status-neutral">
        {{ checking: 'Sedang Diverifikasi', revision: 'Perlu Revisi', rejected: 'Ditolak', 'not-submitted': 'Tidak Diajukan' }[status] || 'Belum Tersedia'}
      </span>
    )
  }

  return (
    <div className="ranking-dashboard-page">

      {/* =========================
          HERO
      ========================== */}

      <section className="ranking-page-header">

        <div className="ranking-dashboard-container">

          <span className="ranking-page-eyebrow">
            MAHASISWA BERPRESTASI
          </span>

          <h1>
            Seleksi Mahasiswa Berprestasi
          </h1>

          <p>
            Pantau status pendaftaran dan tahapan seleksi Anda.
          </p>

        </div>

      </section>


      {/* =========================
          MAIN
      ========================== */}

      <main className="ranking-dashboard-main">

        <div className="ranking-dashboard-container">


          {/* =========================
              STATUS UTAMA
          ========================== */}

          <section className="ranking-main-status-card">

            <div className="ranking-main-status-content">

              <div className="ranking-main-status-icon">
                <CheckCircle2 size={23} />
              </div>

              <div>

                <span className="ranking-main-status-label">
                  TAHAP 1 SELESAI
                </span>

                <h2>
                  {portal.rank ? 'Hasil Ranking Tahap 1' : 'Menunggu Hasil Ranking Tahap 1'}
                </h2>

                <p>
                  {portal.rank ? `Peringkat saat ini: ${portal.rank}. Skor Tahap 1: ${portal.rankingResult.tahap1Score ?? '-'}.` : 'Hasil ranking belum ditetapkan. Pantau status verifikasi dokumen Anda.'}
                </p>

              </div>

            </div>

            <button
              type="button"
              className="ranking-detail-button"
              onClick={handleViewDetail}
            >
              Lihat Detail Tahap 1
              <ArrowRight size={16} />
            </button>

          </section>


          {/* =========================
              DEMO FRONTEND
          ========================== */}

          <div className="ranking-demo-area">

            <span>
              Status dari Backend
            </span>

            <button
              type="button"
              onClick={
                handleCheckRanking
              }
            >
              Periksa Hasil Ranking
            </button>

          </div>


          {/* =========================
              CONTENT GRID
          ========================== */}

          <div className="ranking-dashboard-grid">


            {/* =========================
                RINGKASAN TAHAP 1
            ========================== */}

            <section className="ranking-summary-card">

              <div className="ranking-card-heading">

                <div>

                  <h2>
                    Ringkasan Tahap 1
                  </h2>

                  <p>
                    Data yang digunakan dalam
                    penilaian Tahap 1.
                  </p>

                </div>

              </div>


              <div className="ranking-indicator-list">

                {indicators.map((item) => {
                  const Icon = item.Icon

                  return (
                    <article
                      className="ranking-indicator-row"
                      key={item.id}
                    >

                      <div className="ranking-indicator-icon">
                        <Icon size={19} />
                      </div>

                      <div className="ranking-indicator-content">

                        <span>
                          {item.title}
                        </span>

                        <strong>
                          {item.value}
                        </strong>

                        {item.detail && (
                          <small>
                            {item.detail}
                          </small>
                        )}

                      </div>

                      <div className="ranking-indicator-action">
                        {renderIndicatorStatus(
                          item.status
                        )}
                      </div>

                    </article>
                  )
                })}

              </div>

            </section>


            {/* =========================
                TAHAP SELEKSI
            ========================== */}

            <section className="ranking-selection-card">

              <div className="ranking-card-heading">

                <div>

                  <span className="ranking-section-label">
                    PROSES SELEKSI
                  </span>

                  <h2>
                    Tahap Seleksi
                  </h2>

                  <p>
                    Posisi Anda dalam proses seleksi.
                  </p>

                </div>

              </div>


              <div className="ranking-selection-timeline">


                {/* TAHAP 1 */}

                <div className="ranking-selection-step is-complete">

                  <div className="ranking-selection-marker-column">

                    <div className="ranking-selection-marker">
                      <CheckCircle2 size={16} />
                    </div>

                    <div className="ranking-selection-line is-complete" />

                  </div>

                  <div className="ranking-selection-copy">

                    <div className="ranking-selection-title-row">

                      <strong>
                        Tahap 1
                      </strong>

                    </div>

                    <p>
                      Selesai
                    </p>

                  </div>

                </div>


                {/* RANKING */}

                <div className="ranking-selection-step is-current">

                  <div className="ranking-selection-marker-column">

                    <div className="ranking-selection-marker">
                      2
                    </div>

                    <div className="ranking-selection-line" />

                  </div>

                  <div className="ranking-selection-copy">

                    <div className="ranking-selection-title-row">

                      <strong>
                        Ranking per Angkatan
                      </strong>

                      <span>
                        Sekarang
                      </span>

                    </div>

                    <p>
                      Sedang diproses
                    </p>

                  </div>

                </div>


                {/* PRADITA VALUE */}

                <div className="ranking-selection-step">

                  <div className="ranking-selection-marker-column">

                    <div className="ranking-selection-marker">
                      3
                    </div>

                    <div className="ranking-selection-line" />

                  </div>

                  <div className="ranking-selection-copy">

                    <div className="ranking-selection-title-row">

                      <strong>
                        Pradita Value
                      </strong>

                    </div>

                    <p>
                      Belum tersedia
                    </p>

                  </div>

                </div>


                {/* FINAL */}

                <div className="ranking-selection-step">

                  <div className="ranking-selection-marker-column">

                    <div className="ranking-selection-marker">
                      4
                    </div>

                  </div>

                  <div className="ranking-selection-copy">

                    <div className="ranking-selection-title-row">

                      <strong>
                        Pengumuman Final
                      </strong>

                    </div>

                    <p>
                      Belum tersedia
                    </p>

                  </div>

                </div>

              </div>

            </section>

          </div>


          {/* =========================
              PRADITA VALUE
          ========================== */}

          <section className="ranking-pradita-card">

            <div className="ranking-pradita-main">

              <div className="ranking-pradita-icon">
                <LockKeyhole size={20} />
              </div>

              <div className="ranking-pradita-copy">

                <span>
                  TAHAP LANJUTAN
                </span>

                <h2>
                  Pradita Value
                </h2>

                <p>
                  Tahap ini tersedia jika Anda
                  masuk Top 3 pada ranking angkatan.
                </p>

              </div>

            </div>

            <span className="ranking-pradita-status">
              <LockKeyhole size={14} />
              Terkunci
            </span>

          </section>


          {/* =========================
              INFORMASI PENTING
          ========================== */}

          <section className="ranking-information-card">

            <div className="ranking-information-heading">

              <div className="ranking-information-icon">
                <Info size={18} />
              </div>

              <div>

                <h2>
                  Informasi Penting
                </h2>

                <p>
                  Informasi yang perlu diketahui
                  selama proses ranking.
                </p>

              </div>

            </div>


            <div className="ranking-information-list">

              <div className="ranking-information-item">

                <span />

                <p>
                  Ranking dilakukan berdasarkan angkatan.
                </p>

              </div>

              <div className="ranking-information-item">

                <span />

                <p>
                  Top 3 dari setiap angkatan akan
                  lanjut ke tahap Pradita Value.
                </p>

              </div>

              <div className="ranking-information-item">

                <span />

                <p>
                  Hasil ranking akan tampil di dashboard
                  setelah proses selesai.
                </p>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}

export default DashboardRanking
