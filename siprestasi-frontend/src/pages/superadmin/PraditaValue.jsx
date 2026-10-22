import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import SuperadminNavbar from '../../components/superadmin/SuperadminNavbar'
import SuperadminHeader from '../../components/superadmin/SuperadminHeader'
import { fetchAdminFinalists } from '../../data/superadmin'

import './PraditaValue.css'
import {
  FinalistIcon,
  WaitingDataIcon,
  MailSentIcon,
  ApprovedIcon,
} from '../../components/superadmin/SummaryIcons'

function PraditaValue() {
  const navigate = useNavigate()

  const [selectedYear, setSelectedYear] = useState('2024')
  const [serverFinalists, setServerFinalists] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchAdminFinalists()
      .then((res) => {
        if (!cancelled && res?.data && res.data.length > 0) {
          setServerFinalists(res.data)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const currentFinalists = serverFinalists

  const filteredFinalists = useMemo(() => {
    return currentFinalists.filter(
      (student) => student.angkatan === selectedYear
    )
  }, [selectedYear, currentFinalists])

  const summary = {
    total: currentFinalists.length,

    waiting: currentFinalists.filter(
      (student) => student.statusType === 'waiting'
    ).length,

    sent: currentFinalists.filter(
      (student) =>
        student.statusType === 'progress' ||
        student.statusType === 'completed'
    ).length,

    completed: currentFinalists.filter(
      (student) => student.statusType === 'completed'
    ).length,
  }

  const getActionLabel = (student) => {
    if (student.statusType === 'waiting') {
      return 'Lihat Status'
    }

    if (student.statusType === 'ready') {
      return 'Kelola Penilai'
    }

    if (student.statusType === 'progress') {
      return 'Monitor'
    }

    return 'Lihat Hasil'
  }

  const handleAction = (student) => {
    navigate(`/superadmin/pradita-value/${student.nim}`)
  }

  return (
    <div className="pradita-page">

      <div className="admin-top-section">

        <SuperadminNavbar />

        <SuperadminHeader
          title="Pradita Value"
          description="Kelola proses penilaian finalis melalui dosen dan rekan sejawat."
          metaStage="Tahap 2 Pradita Value"
          metaInfo="5 penilai untuk setiap finalis"
        />

      </div>

      <main className="pradita-content">

        {/* =========================
            SUMMARY
        ========================= */}

        <section className="pradita-summary-grid">

              <SummaryCard
                title="Total Finalis"
                value={summary.total}
                description="3 finalis per angkatan"
                icon={<FinalistIcon />}
              />

              <SummaryCard
                title="Menunggu Data"
                value={summary.waiting}
                description="Data rekan sejawat belum lengkap"
                icon={<WaitingDataIcon />}
              />

              <SummaryCard
                title="Form Terkirim"
                value={summary.sent}
                description="Asesmen telah dikirim ke penilai"
                icon={<MailSentIcon />}
              />

              <SummaryCard
                title="Penilaian Lengkap"
                value={summary.completed}
                description="Seluruh penilai telah merespons"
                icon={<ApprovedIcon />}
              />

            </section>

        {/* =========================
            SECTION HEADER
        ========================= */}

        <section className="pradita-list-section">

          <div className="pradita-list-heading">

            <div>
              <h2>
                Finalis Pradita Value
              </h2>

              <p>
                Tiga mahasiswa dengan nilai Tahap 1 tertinggi
                dari setiap angkatan.
              </p>
            </div>

            <div className="pradita-total-badge">
              9 Finalis
            </div>

          </div>

          {/* =========================
              YEAR TABS
          ========================= */}

          <div className="pradita-tabs">

            {['2024', '2025', '2026'].map((year) => (
              <button
                type="button"
                key={year}
                className={
                  selectedYear === year
                    ? 'pradita-tab active'
                    : 'pradita-tab'
                }
                onClick={() => setSelectedYear(year)}
              >
                Angkatan {year}
              </button>
            ))}

          </div>

          {/* =========================
              TABLE
          ========================= */}

          <div className="pradita-table-card">

            <div className="pradita-table-wrapper">

              <table className="pradita-table">

                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>MAHASISWA</th>
                    <th>NILAI TAHAP 1</th>
                    <th>REKAN SEJAWAT</th>
                    <th>DOSEN PENILAI</th>
                    <th>FORM TERKIRIM</th>
                    <th>RESPON</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredFinalists.map((student) => (
                    <tr key={student.id}>

                      <td>
                        <div className="pradita-rank">
                          {student.rank}
                        </div>
                      </td>

                      <td>
                        <div className="pradita-student">

                          <div className="pradita-avatar">
                            {student.initials}
                          </div>

                          <div className="pradita-student-copy">

                            <strong>
                              {student.name}
                            </strong>

                            <span>
                              {student.nim}
                            </span>

                            <small>
                              {student.prodi}
                            </small>

                          </div>

                        </div>
                      </td>

                      <td>
                        <strong className="stage-one-score">
                          {student.tahap1.toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        <ProgressCount
                          value={student.peers}
                          total={3}
                        />
                      </td>

                      <td>
                        <ProgressCount
                          value={student.lecturers}
                          total={2}
                        />
                      </td>

                      <td>
                        <ProgressCount
                          value={student.formsSent}
                          total={5}
                        />
                      </td>

                      <td>
                        <ProgressCount
                          value={student.responses}
                          total={5}
                          success={
                            student.responses === 5
                          }
                        />
                      </td>

                      <td>
                        <span
                          className={`pradita-status ${student.statusType}`}
                        >
                          {student.status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`pradita-action ${student.statusType}`}
                          onClick={() =>
                            handleAction(student)
                          }
                        >
                          {getActionLabel(student)}
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </section>

        {/* =========================
            INFORMATION
        ========================= */}

        <section className="pradita-information">

          <div className="pradita-information-icon">
            i
          </div>

          <div>

            <strong>
              INFORMASI ASESMEN PRADITA VALUE
            </strong>

            <p>
              Setiap finalis dinilai oleh 3 rekan sejawat dan
              2 dosen. Dosen penilai terdiri dari Kaprodi dan
              satu dosen yang dipilih secara otomatis oleh sistem.
              Setiap penilai menerima token unik yang hanya dapat
              digunakan satu kali untuk mengirim penilaian.
            </p>

          </div>

        </section>

      </main>

      <footer className="pradita-footer">
        © SIPRESTASI - Sistem Seleksi Mahasiswa Berprestasi Universitas.
      </footer>

    </div>
  )
}

function SummaryCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="pradita-summary-card">

      <div className="pradita-summary-copy">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <p>
          {description}
        </p>

      </div>

      <div className="pradita-summary-icon">
        {icon}
      </div>

    </div>
  )
}

function ProgressCount({
  value,
  total,
  success = false,
}) {
  const complete = value === total

  return (
    <div
      className={
        success || complete
          ? 'progress-count complete'
          : value > 0
            ? 'progress-count partial'
            : 'progress-count empty'
      }
    >
      <strong>
        {value}/{total}
      </strong>
    </div>
  )
}

export default PraditaValue
