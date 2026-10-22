import { useEffect, useMemo, useState } from 'react'

import SuperadminNavbar from '../../components/superadmin/SuperadminNavbar'
import SuperadminHeader from '../../components/superadmin/SuperadminHeader'
import { fetchAdminFinalists } from '../../data/superadmin'

import './HasilSeleksi.css'

import {
  FinalistIcon,
  CohortIcon,
  ApprovedIcon,
  WinnerIcon,
} from '../../components/superadmin/SummaryIcons'

/* =========================
   9 FINALIS TAHAP 2
========================= */

function HasilSeleksi() {
  const [selectedYear, setSelectedYear] =
    useState('2024')
  const [serverFinalists, setServerFinalists] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchAdminFinalists()
      .then((res) => {
        if (!cancelled && res?.data && res.data.length > 0) {
          const mapped = res.data.map((f) => ({
            id: f.id,
            rank: f.rank,
            initials: f.initials,
            name: f.name,
            nim: f.nim,
            prodi: f.prodi,
            angkatan: f.angkatan,
            tahap1: f.tahap1,
            praditaValue: f.tahap1 * 0.95,
            finalScore: f.tahap1,
            status: f.rank === 1 ? 'Juara 1' : `Peringkat ${f.rank}`,
            statusType: f.rank === 1 ? 'winner' : 'ranked',
          }))
          setServerFinalists(mapped)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])


  /* =========================
     DATA YANG DITAMPILKAN
  ========================= */

  const activeFinalists = serverFinalists

  const displayedResults = useMemo(() => {
    if (selectedYear === 'all') {
      return [...activeFinalists]
        .sort((a, b) => (b.finalScore || b.tahap1) - (a.finalScore || a.tahap1))
        .map((student, index) => ({
          ...student,
          displayRank: index + 1,
        }))
    }

    return activeFinalists
      .filter((student) => student.angkatan === selectedYear)
      .sort((a, b) => a.rank - b.rank)
      .map((student) => ({
        ...student,
        displayRank: student.rank,
      }))
  }, [selectedYear, activeFinalists])

  const totalPeserta = useMemo(() => activeFinalists.length, [activeFinalists])
  const distinctAngkatan = useMemo(() => new Set(activeFinalists.map((f) => f.angkatan)).size, [activeFinalists])
  const totalFinalis = useMemo(() => activeFinalists.filter((f) => f.rank <= 3).length, [activeFinalists])
  const totalPemenang = useMemo(() => activeFinalists.filter((f) => f.rank === 1).length, [activeFinalists])


  const winner = displayedResults[0]


  return (
    <div className="hasil-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="admin-top-section">

        <SuperadminNavbar />

        <SuperadminHeader
          title="Hasil Seleksi"
          description="Lihat hasil akhir dan peringkat Mahasiswa Berprestasi per angkatan maupun secara keseluruhan."
          metaStage="Seleksi Selesai"
          metaInfo="Peringkat per angkatan & seluruh peserta"
        />

      </div>


      <main className="hasil-content">

        {/* =========================
            SUMMARY
        ========================= */}

        <section className="hasil-summary-grid">

          <SummaryCard
            title="Total Peserta"
            value={totalPeserta}
            description="Seluruh peserta seleksi"
            icon={<FinalistIcon />}
          />

          <SummaryCard
            title="Angkatan"
            value={distinctAngkatan}
            description="Angkatan terdaftar"
            icon={<CohortIcon />}
          />

          <SummaryCard
            title="Finalis Tahap 2"
            value={totalFinalis}
            description="Finalis setiap angkatan"
            icon={<ApprovedIcon />}
          />

          <SummaryCard
            title="Pemenang"
            value={totalPemenang}
            description="Juara 1 setiap angkatan"
            icon={<WinnerIcon />}
          />

        </section>


        {/* =========================
            RANKING
        ========================= */}

        <section className="hasil-ranking-section">

          <div className="hasil-section-heading">

            <div>

              <h2>
                Peringkat Akhir
              </h2>

              <p>
                Peringkat mahasiswa berdasarkan hasil
                seleksi per angkatan dan seluruh peserta.
              </p>

            </div>


            <span className="hasil-period-badge">
              Periode 2026
            </span>

          </div>


          {/* =========================
              TABS
          ========================= */}

          <div className="hasil-tabs">

            {[
              {
                value: '2024',
                label: 'Angkatan 2024',
              },
              {
                value: '2025',
                label: 'Angkatan 2025',
              },
              {
                value: '2026',
                label: 'Angkatan 2026',
              },
              {
                value: 'all',
                label: 'Semua Angkatan',
              },
            ].map((tab) => (

              <button
                key={tab.value}
                type="button"
                className={
                  selectedYear === tab.value
                    ? 'hasil-tab active'
                    : 'hasil-tab'
                }
                onClick={() =>
                  setSelectedYear(tab.value)
                }
              >
                {tab.label}
              </button>

            ))}

          </div>


          {/* =========================
              WINNER
          ========================= */}

          {winner && (
            <section className="winner-card">

              <div className="winner-left">

                <div className="winner-rank">
                  ★
                </div>


                <div className="winner-avatar">
                  {winner.initials}
                </div>


                <div className="winner-copy">

                  <span>
                    {selectedYear === 'all'
                      ? 'PERINGKAT 1 SEMUA ANGKATAN'
                      : `JUARA 1 ANGKATAN ${selectedYear}`}
                  </span>


                  <h3>
                    {winner.name}
                  </h3>


                  <p>
                    {winner.nim}
                    {' • '}
                    {winner.prodi}

                    {selectedYear === 'all' && (
                      <>
                        {' • '}
                        Angkatan {winner.angkatan}
                      </>
                    )}
                  </p>

                </div>

              </div>


              <div className="winner-score">

                <span>
                  Nilai Akhir
                </span>

                <strong>
                  {winner.finalScore.toFixed(2)}
                </strong>

              </div>

            </section>
          )}


          {/* =========================
              TABLE
          ========================= */}

          <div className="hasil-table-card">

            <table className="hasil-table">

              <thead>

                <tr>

                  <th>
                    PERINGKAT
                  </th>

                  <th>
                    MAHASISWA
                  </th>


                  {selectedYear === 'all' && (
                    <th>
                      ANGKATAN
                    </th>
                  )}


                  <th>
                    NILAI TAHAP 1
                  </th>

                  <th>
                    PRADITA VALUE
                  </th>

                  <th>
                    NILAI AKHIR
                  </th>


                  {selectedYear !== 'all' && (
                    <th>
                      HASIL
                    </th>
                  )}

                </tr>

              </thead>


              <tbody>

                {displayedResults.map(
                  (student) => (

                    <tr key={student.id}>

                      {/* RANK */}

                      <td>

                        <div
                          className={`hasil-rank ${
                            student.displayRank <= 3
                              ? `rank-${student.displayRank}`
                              : ''
                          }`}
                        >
                          {student.displayRank}
                        </div>

                      </td>


                      {/* STUDENT */}

                      <td>

                        <div className="hasil-student">

                          <div className="hasil-avatar">
                            {student.initials}
                          </div>


                          <div>

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


                      {/* ANGKATAN */}

                      {selectedYear === 'all' && (
                        <td>
                          <strong>
                            {student.angkatan}
                          </strong>
                        </td>
                      )}


                      {/* TAHAP 1 */}

                      <td>

                        <span className="hasil-score">
                          {student.tahap1.toFixed(2)}
                        </span>

                      </td>


                      {/* PRADITA VALUE */}

                      <td>

                        <span className="hasil-score">
                          {student.praditaValue !== null
                            ? student.praditaValue.toFixed(2)
                            : '—'}
                        </span>

                      </td>


                      {/* FINAL SCORE */}

                      <td>

                        {student.finalScore !== null ? (

                          <strong className="hasil-final-score">
                            {student.finalScore.toFixed(2)}
                          </strong>

                        ) : (

                          <span className="hasil-score">
                            —
                          </span>

                        )}

                      </td>


                      {/* HASIL PER ANGKATAN */}

                      {selectedYear !== 'all' && (

                        <td>

                          <span
                            className={`hasil-status ${student.statusType}`}
                          >
                            {student.status}
                          </span>

                        </td>

                      )}

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =========================
            INFORMATION
        ========================= */}

        <section className="hasil-information">

          <div className="hasil-info-icon">
            i
          </div>


          <div>

            <strong>
              INFORMASI HASIL SELEKSI
            </strong>


            <p>
              Peringkat per angkatan menampilkan tiga
              finalis dari setiap angkatan. Pada tab
              Semua Angkatan, seluruh peserta ditampilkan
              dalam satu urutan peringkat tanpa pemisahan
              status seleksi.
            </p>

          </div>

        </section>

      </main>


      <footer className="hasil-footer">

        © SIPRESTASI - Sistem Seleksi Mahasiswa
        Berprestasi Universitas.

      </footer>

    </div>
  )
}


/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="hasil-summary-card">

      <div className="hasil-summary-copy">

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


      <div className="hasil-summary-icon">
        {icon}
      </div>

    </div>
  )
}


export default HasilSeleksi
