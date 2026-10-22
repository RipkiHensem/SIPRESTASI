import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import SuperadminNavbar from '../../components/superadmin/SuperadminNavbar'
import { api } from '../../api'

import {
  FinalistIcon,
  CohortIcon,
  WinnerIcon,
} from '../../components/superadmin/SummaryIcons'

import './PeringkatTahap1.css'


/* =========================
   TOP 3 PER ANGKATAN
========================= */

function PeringkatTahap1() {
  const navigate = useNavigate()

  const [selectedAngkatan, setSelectedAngkatan] =
    useState('2024')
  const [serverRanking, setServerRanking] = useState({})

  useEffect(() => {
    let cancelled = false
    const years = ['2024', '2025', '2026']
    Promise.allSettled(
      years.map((yr) =>
        api(`pengajuan/ranking?angkatan=${yr}`).then((res) => ({
          year: yr,
          data: res?.data || [],
        }))
      )
    ).then((results) => {
      if (cancelled) return
      const map = {}
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value.data.length > 0) {
          map[r.value.year] = r.value.data.map((row) => {
            const initials = row.name
              ? row.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
              : 'M'
            return {
              id: row.sub_id,
              name: row.name,
              initials: initials || 'M',
              nim: row.induk,
              prodi: 'S1 Informatika',
              angkatan: String(row.year),
              score: Number(row.total_score || 0),
            }
          })
        }
      })
      if (Object.keys(map).length > 0) setServerRanking(map)
    })
    return () => {
      cancelled = true
    }
  }, [])


  /* =========================
     RANKING
  ========================= */

  const currentRanking = useMemo(() => {
    if (selectedAngkatan === 'all') {
      const serverAll = Object.values(serverRanking).flat()
      return [...serverAll]
        .sort((a, b) => b.score - a.score)
        .map((student, index) => ({
          ...student,
          displayRank: index + 1,
        }))
    }

    if (serverRanking[selectedAngkatan] && serverRanking[selectedAngkatan].length > 0) {
      return serverRanking[selectedAngkatan]
        .slice(0, 3)
        .sort((a, b) => b.score - a.score)
        .map((student, index) => ({
          ...student,
          displayRank: index + 1,
        }))
    }

    return []
  }, [selectedAngkatan, serverRanking])

  const totalPeserta = useMemo(() => Object.values(serverRanking).flat().length, [serverRanking])
  const totalAngkatan = useMemo(() => Object.keys(serverRanking).filter((k) => (serverRanking[k] || []).length > 0).length, [serverRanking])
  const totalFinalis = useMemo(() => Object.values(serverRanking).reduce((acc, arr) => acc + Math.min(arr.length, 3), 0), [serverRanking])


  return (
    <div className="ranking-page">

      {/* NAVBAR */}

      <SuperadminNavbar variant="light" />


      <main className="ranking-content">

        {/* BACK */}

        <button
          type="button"
          className="ranking-back-button"
          onClick={() =>
            navigate('/superadmin/daftar-mapres')
          }
        >
          <span>←</span>
          Kembali ke Daftar Mapres
        </button>


        {/* PAGE TITLE */}

        <div className="ranking-page-heading">

          <h1>
            Peringkat Tahap 1
          </h1>

          <p>
            Lihat peringkat sementara seleksi Tahap 1
            berdasarkan angkatan maupun seluruh peserta.
          </p>

        </div>


        {/* =========================
            SUMMARY
        ========================= */}

        <section className="ranking-summary-grid">

          <div className="ranking-summary-card">

            <div className="ranking-summary-copy">

              <span>
                Total Peserta
              </span>

              <strong>
                {totalPeserta}
              </strong>

              <p>
                Seluruh mahasiswa peserta seleksi
              </p>

            </div>


            <div className="ranking-summary-icon">
              <FinalistIcon />
            </div>

          </div>


          <div className="ranking-summary-card">

            <div className="ranking-summary-copy">

              <span>
                Angkatan
              </span>

              <strong>
                {totalAngkatan}
              </strong>

              <p>
                2024, 2025, dan 2026
              </p>

            </div>


            <div className="ranking-summary-icon">
              <CohortIcon />
            </div>

          </div>


          <div className="ranking-summary-card">

            <div className="ranking-summary-copy">

              <span>
                Finalis Tahap 2
              </span>

              <strong>
                {totalFinalis}
              </strong>

              <p>
                Top 3 dari setiap angkatan
              </p>

            </div>


            <div className="ranking-summary-icon">
              <WinnerIcon />
            </div>

          </div>

        </section>


        {/* =========================
            RANKING
        ========================= */}

        <section className="ranking-section">

          <div className="ranking-section-header">

            <div>

              <h2>
                Peringkat Mahasiswa
              </h2>

              <p>
                {selectedAngkatan === 'all'
                  ? 'Peringkat seluruh peserta berdasarkan Nilai Tahap 1.'
                  : 'Kandidat Top 3 berdasarkan Nilai Tahap 1 dari setiap angkatan.'}
              </p>

            </div>


            <span className="ranking-total-badge">

              {selectedAngkatan === 'all'
                ? `${totalPeserta} Peserta`
                : `${currentRanking.length} Finalis`}

            </span>

          </div>


          {/* =========================
              TABS
          ========================= */}

          <div className="ranking-tabs">

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
                  selectedAngkatan === tab.value
                    ? 'ranking-tab active'
                    : 'ranking-tab'
                }
                onClick={() =>
                  setSelectedAngkatan(tab.value)
                }
              >
                {tab.label}
              </button>

            ))}

          </div>


          {/* =========================
              TABLE
          ========================= */}

          <div className="ranking-table-wrapper">

            <table className="ranking-table">

              <thead>

                <tr>

                  <th>
                    PERINGKAT
                  </th>

                  <th>
                    MAHASISWA
                  </th>

                  <th>
                    NIM
                  </th>


                  {selectedAngkatan === 'all' && (
                    <th>
                      ANGKATAN
                    </th>
                  )}


                  <th>
                    PROGRAM STUDI
                  </th>

                  <th>
                    NILAI TAHAP 1
                  </th>


                  {selectedAngkatan !== 'all' && (
                    <th>
                      STATUS
                    </th>
                  )}

                </tr>

              </thead>


              <tbody>

                {currentRanking.map((student) => (

                  <tr key={student.id}>

                    {/* RANK */}

                    <td>

                      <div
                        className={`ranking-position ${
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

                      <div className="ranking-student">

                        <div className="ranking-avatar">
                          {student.initials}
                        </div>


                        <div className="ranking-student-info">

                          <strong>
                            {student.name}
                          </strong>


                          {selectedAngkatan !== 'all' && (
                            <span>
                              Angkatan {student.angkatan}
                            </span>
                          )}

                        </div>

                      </div>

                    </td>


                    {/* NIM */}

                    <td>
                      {student.nim}
                    </td>


                    {/* ANGKATAN */}

                    {selectedAngkatan === 'all' && (
                      <td>
                        <strong>
                          {student.angkatan}
                        </strong>
                      </td>
                    )}


                    {/* PRODI */}

                    <td>
                      {student.prodi}
                    </td>


                    {/* SCORE */}

                    <td>

                      <strong className="ranking-score">
                        {student.score
                          .toFixed(2)
                          .replace('.', ',')}
                      </strong>

                    </td>


                    {/* STATUS */}

                    {selectedAngkatan !== 'all' && (

                      <td>

                        <span className="ranking-status">
                          Kandidat Top 3
                        </span>

                      </td>

                    )}

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          {/* =========================
              INFO
          ========================= */}

          <div className="ranking-info">

            <div className="ranking-info-icon">
              ✓
            </div>


            <div>

              <strong>
                Peringkat Sementara
              </strong>


              <p>

                {selectedAngkatan === 'all'
                  ? 'Tab Semua Angkatan menampilkan seluruh peserta dalam satu urutan berdasarkan Nilai Tahap 1 tertinggi.'
                  : 'Peringkat dapat berubah selama periode seleksi masih berlangsung. Tiga mahasiswa dengan nilai tertinggi dari setiap angkatan akan melanjutkan ke Pradita Value.'}

              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}


export default PeringkatTahap1
