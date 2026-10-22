import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/admin/Navbar'
import AdminHeader from '../../components/admin/AdminHeader'
import StudentUploadModal from '../../components/admin/StudentUploadModal'
import { fetchAdminSubmissions } from '../../data/admin'

import {
  SubmissionIcon,
  ReviewIcon,
  RevisionIcon,
  ApprovedIcon,
} from '../../components/admin/SummaryIcons'

import './Admin_dashboard.css'


function AdminDashboard() {
  const navigate = useNavigate()

  const [showStudentUpload, setShowStudentUpload] = useState(false)
  const [lastUpload, setLastUpload] = useState(null)
  const [serverStats, setServerStats] = useState(null)
  const [serverSubmissions, setServerSubmissions] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchAdminSubmissions()
      .then((res) => {
        if (!cancelled && res?.data) {
          setServerSubmissions(res.data)
          if (res.stats) setServerStats(res.stats)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])


  /* =========================
      STATISTICS
  ========================= */

  const stats = [
    {
      title: 'Total Pengajuan',
      value: String(serverStats?.total ?? 0),
      note: 'Mahasiswa',
      icon: <SubmissionIcon />,
    },
    {
      title: 'Perlu Ditinjau',
      value: String(serverStats?.perlu_ditinjau ?? 0),
      note: 'Menunggu verifikasi',
      icon: <ReviewIcon />,
    },
    {
      title: 'Perlu Revisi',
      value: String(serverStats?.perlu_revisi ?? 0),
      note: 'Menunggu perbaikan',
      icon: <RevisionIcon />,
    },
    {
      title: 'Disetujui',
      value: String(serverStats?.disetujui ?? 0),
      note: 'Lolos verifikasi Tahap 1',
      icon: <ApprovedIcon />,
    },
  ]


  /* =========================
      STAGES
  ========================= */

  const stages = [
    {
      number: 1,
      title: 'Verifikasi Tahap 1',
      description: 'Pemeriksaan administrasi berkas',
      status: 'SEDANG BERJALAN',
      active: true,
    },
    {
      number: 2,
      title: 'Ranking per Angkatan',
      description: 'Top 3 mahasiswa per angkatan',
      status: 'Menunggu',
    },
    {
      number: 3,
      title: 'Pradita Value',
      description: 'Penilaian karakter & wawancara',
      status: 'Belum Dimulai',
    },
    {
      number: 4,
      title: 'Hasil Akhir',
      description: 'Penetapan Juara 1, 2, dan 3',
      status: 'Belum Dimulai',
    },
  ]


  /* =========================
      ACTIONS
  ========================= */

  const actions = [
    {
      icon: '☑',
      title: `${serverStats?.perlu_ditinjau ?? 0} Pengajuan Menunggu Verifikasi`,
      description:
        'Pengajuan baru membutuhkan pemeriksaan berkas Tahap 1',
      button: 'Verifikasi',
      primary: true,
    },
    {
      icon: '↻',
      title: `${serverStats?.perlu_revisi ?? 0} Revisi Telah Dikirim Ulang`,
      description:
        'Mahasiswa telah memperbarui data yang sebelumnya diminta untuk direvisi',
      button: 'Tinjau Revisi',
    },
    {
      icon: '♙',
      title: 'Penugasan Pradita Value Belum Diselesaikan',
      description:
        'Penugasan Kaprodi dan Dosen Penilai dapat disiapkan sebelum Tahap 2 dimulai',
      button: 'Lihat',
    },
  ]


  /* =========================
      RECENT SUBMISSIONS
  ========================= */

  const submissions = serverSubmissions.slice(0, 5).map((s) => ({
    name: s.name,
    nim: s.nim,
    year: s.angkatan,
    status: s.status,
    action:
      s.status === 'Disetujui'
        ? 'Lihat Detail'
        : s.status === 'Perlu Revisi'
          ? 'Tinjau Revisi'
          : 'Verifikasi',
  }))


  return (
    <div className="admin-dashboard">

      {/* =========================
          NAVBAR + HEADER
      ========================= */}

      <div className="admin-top-section">

        <Navbar />

        <AdminHeader
          title="Selamat Datang di SIPRESTASI"
          description="Kelola proses seleksi Mahasiswa Berprestasi secara terstruktur dan efisien"
          actionLabel="Upload Data Mahasiswa"
          onActionClick={() => setShowStudentUpload(true)}
        />

      </div>


      {/* =========================
          CONTENT
      ========================= */}

      <main className="admin-content">


        {/* =========================
            STAT CARDS
        ========================= */}

        <section className="stats-grid">

          {stats.map((item) => (
            <article
              className="stat-card"
              key={item.title}
            >

              <div className="stat-content">

                <span className="stat-title">
                  {item.title}
                </span>

                <strong className="stat-value">
                  {item.value}
                </strong>

                <span className="stat-note">
                  {item.note}
                </span>

              </div>


              <div className="stat-icon">
                {item.icon}
              </div>

            </article>
          ))}

        </section>


        {/* =========================
            TAHAP SELEKSI
        ========================= */}

        <section className="dashboard-section">

          <div className="section-heading">

            <h2>

              <span className="heading-icon">
                ⌘
              </span>

              Tahap Seleksi

            </h2>


            <span>
              {serverStats
                ? `${serverStats.disetujui} dari ${serverStats.total} pengajuan telah diverifikasi`
                : '18 dari 42 pengajuan telah diverifikasi'}
            </span>

          </div>


          <div className="stage-grid">

            {stages.map((stage) => (
              <article
                key={stage.number}
                className={
                  stage.active
                    ? 'stage-card stage-active'
                    : 'stage-card'
                }
              >

                <div className="stage-top">

                  <strong>
                    {stage.number}. {stage.title}
                  </strong>

                  <span
                    className={
                      stage.active
                        ? 'stage-status active'
                        : 'stage-status'
                    }
                  >
                    {stage.status}
                  </span>

                </div>


                <p>
                  {stage.description}
                </p>

              </article>
            ))}

          </div>

        </section>


        {/* =========================
            PERLU TINDAKAN
        ========================= */}

        <section className="dashboard-section">

          <div className="section-heading">

            <h2>

              <span className="heading-icon">
                ✓
              </span>

              Perlu Tindakan

            </h2>


            <span>
              3 Tindakan Membutuhkan Respon
            </span>

          </div>


          <div className="action-list">

            {actions.map((item) => (
              <div
                className="action-item"
                key={item.title}
              >

                <div className="action-icon">
                  {item.icon}
                </div>


                <div className="action-text">

                  <strong>
                    {item.title}
                  </strong>

                  <span>
                    {item.description}
                  </span>

                </div>


               <button
                  type="button"
                  className={
                    item.primary
                      ? 'action-button primary'
                      : 'action-button'
                  }
                  onClick={() => {
                    if (item.button === 'Verifikasi') {
                      navigate('/admin/daftar-mapres')
                    }

                    if (item.button === 'Tinjau Revisi') {
                      navigate('/admin/daftar-mapres')
                    }

                    if (item.button === 'Lihat') {
                      navigate('/admin/pradita-value')
                    }
                  }}
                >
                  {item.button}
                </button>

              </div>
            ))}

          </div>

        </section>


        {/* =========================
            PENGAJUAN TERBARU
        ========================= */}

        <section className="dashboard-section submissions-section">

          <div className="submission-header">

            <div>

              <h2>
                Pengajuan Terbaru
              </h2>

              <p>
                Pengajuan mahasiswa terbaru yang masuk ke sistem.
              </p>

            </div>


            <button
              type="button"
              className="see-all-button"
              onClick={() => navigate('/admin/daftar-mapres')}
            >
              Lihat Semua di Daftar Mapres →
            </button>

          </div>


          <div className="table-wrapper">

            <table className="submission-table">

              <thead>
                <tr>
                  <th>NAMA MAHASISWA</th>
                  <th>NIM</th>
                  <th>ANGKATAN</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>


              <tbody>

                {submissions.map((student) => (
                  <tr key={student.nim}>

                    <td className="student-name">
                      {student.name}
                    </td>

                    <td>
                      {student.nim}
                    </td>

                    <td>
                      {student.year}
                    </td>

                    <td>

                      <span
                        className={`status-pill ${
                          student.status === 'Disetujui'
                            ? 'approved'
                            : student.status === 'Perlu Revisi'
                              ? 'revision'
                              : 'review'
                        }`}
                      >
                        {student.status}
                      </span>

                    </td>

                    <td>

                      <button
                        type="button"
                        className={
                          student.action === 'Verifikasi'
                            ? 'table-action primary'
                            : 'table-action'
                        }
                        onClick={() => {
                          if (student.action === 'Verifikasi') {
                            navigate(
                              `/admin/daftar-mapres/${student.nim}/verifikasi`
                            )
                          }

                          if (student.action === 'Lihat Detail') {
                            navigate(
                              `/admin/daftar-mapres/${student.nim}/detail`
                            )
                          }

                          if (student.action === 'Tinjau Revisi') {
                            navigate(
                              `/admin/daftar-mapres/${student.nim}/revisi`
                            )
                          }
                        }}
                      >
                        {student.action}
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* =========================
            LAST STUDENT UPLOAD
            MUNCUL SETELAH UPLOAD
        ========================= */}

        {lastUpload && (
          <section className="last-upload-section">

            <div className="last-upload-info">

              <div className="last-upload-icon">
                ✓
              </div>


              <div className="last-upload-copy">

                <strong>
                  Upload Data Mahasiswa Terakhir
                </strong>

                <span>
                  {lastUpload.fileName} • {lastUpload.uploadedAt}
                </span>

              </div>


              <div className="last-upload-result">

                <span>
                  {lastUpload.total} data diproses
                </span>

                <small>
                  {lastUpload.success} berhasil •{' '}
                  {lastUpload.duplicate} duplikat •{' '}
                  {lastUpload.invalid} bermasalah
                </small>

              </div>

            </div>

          </section>
        )}

      </main>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="admin-footer">
        © SIPRESTASI - Sistem Seleksi Mahasiswa Berprestasi Universitas.
      </footer>


      {/* =========================
          STUDENT UPLOAD MODAL
      ========================= */}

      <StudentUploadModal
        isOpen={showStudentUpload}
        onClose={() => setShowStudentUpload(false)}
        onUploadComplete={(result) => {
          setLastUpload({
            ...result,

            uploadedAt: new Date().toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          })
        }}
      />

    </div>
  )
}


export default AdminDashboard
