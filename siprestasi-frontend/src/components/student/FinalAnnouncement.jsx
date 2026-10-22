import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import '../../styles/student/final-announcement.css'

const COHORTS = ['2024', '2025', '2026']

const scoreText = (value) => {
  const number = Number(value)

  return value == null ||
    value === '' ||
    !Number.isFinite(number)
    ? '-'
    : number.toFixed(2)
}

const initials = (name = '') => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return words.length > 1
    ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
    : (words[0] || 'MB').slice(0, 2).toUpperCase()
}

function FinalAnnouncement({
  selectionData,
  finalists,
  student,
  finalResult,
  onViewHistory,
}) {
  const initialIndex = Math.max(
    COHORTS.indexOf(String(student.angkatan)),
    0
  )

  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [showAll, setShowAll] = useState(false)
  const [filter, setFilter] = useState('semua')

  const allResultsRef = useRef(null)

  /* ==========================================
     DATA PEMENANG PER ANGKATAN
  ========================================== */

  const winnersByCohort = Object.fromEntries(
    COHORTS.map((year) => {
      const given =
        selectionData.finalistsByCohort?.[year]

      const source =
        Array.isArray(given) && given.length
          ? given
          : String(student.angkatan) === year
            ? finalists
            : []

      const winners = source.filter(person => Number(person.rank) <= 3)

      return [year, winners]
    })
  )

  /* ==========================================
     SEMUA PERINGKAT
  ========================================== */

  const rankingsByCohort = Object.fromEntries(
    COHORTS.map((year) => {
      const fromBackend =
        selectionData.finalRankingsByCohort?.[year] ||
        selectionData.rankingsByCohort?.[year]

      if (
        Array.isArray(fromBackend) &&
        fromBackend.length
      ) {
        return [
          year,
          [...fromBackend].sort(
            (a, b) =>
              Number(a.rank) - Number(b.rank)
          ),
        ]
      }

      return [year, winnersByCohort[year]]
    })
  )

  const hasSampleData = COHORTS.some((year) =>
    rankingsByCohort[year].some(
      (person) => person.sample
    )
  )

  /* ==========================================
     CAROUSEL ACTIONS
  ========================================== */

  const previous = () => {
    setActiveIndex(
      (index) => (index + COHORTS.length - 1) % COHORTS.length
    )
  }

  const next = () => {
    setActiveIndex(
      (index) => (index + 1) % COHORTS.length
    )
  }

  const openAllResults = () => {
    setShowAll((wasOpen) => !wasOpen)

    if (!showAll) {
      requestAnimationFrame(() => {
        allResultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    }
  }

  return (
    <>
      {/* ======================================
          PENGUMUMAN FINAL
      ====================================== */}

      <section className="fa-section">

        <div className="fa-heading">
          <span className="fa-eyebrow">
            PENGUMUMAN FINAL
          </span>

          <h2>
            Pemenang Mahasiswa Berprestasi
          </h2>

          <p>
            Program Studi Sistem Informasi
          </p>
        </div>

        {/* ==================================
            COVERFLOW CAROUSEL
        ================================== */}

        <div
          className="fa-coverflow"
          aria-label="Pemenang berdasarkan angkatan"
        >
          {COHORTS.map((year, index) => {
            const offset =
              index === activeIndex
                ? 0
                : (index + 1) % COHORTS.length === activeIndex
                  ? -1
                  : 1

            const isActive = offset === 0

            const displayed = [
              winnersByCohort[year][1],
              winnersByCohort[year][0],
              winnersByCohort[year][2],
            ]

            return (
              <motion.article
                key={year}
                className={`fa-slide ${
                  isActive ? 'is-active' : 'is-side'
                }`}
                initial={false}
                animate={{
                  x:
                    offset === 0
                      ? '0%'
                      : offset === -1
                        ? '-75%'
                        : '75%',

                  scale: isActive ? 1 : 0.81,
                  opacity: isActive ? 1 : 0.65,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 170,
                  damping: 26,
                  mass: 1,
                }}
                style={{
                  zIndex: isActive ? 3 : 1,
                }}
              >
                <div className="fa-slide-content">

                  <span className="fa-slide-eyebrow">
                    ANGKATAN
                  </span>

                  <h3>{year}</h3>

                  <p>
                    3 Pemenang Mahasiswa Berprestasi
                  </p>

                  <div className="fa-podium">
                    {displayed.map((winner) => (
                      <div
                        key={winner.rank}
                        className={`fa-winner fa-winner-${winner.rank}`}
                      >
                        <span className="fa-winner-title">
                          Juara {winner.rank}
                        </span>

                        <div className="fa-avatar">
                          {winner.photo ||
                          winner.photoUrl ? (
                            <img
                              src={
                                winner.photo ||
                                winner.photoUrl
                              }
                              alt=""
                            />
                          ) : (
                            initials(winner.name)
                          )}
                        </div>

                        <strong
                          className="fa-winner-name"
                          title={winner.name}
                        >
                          {winner.name}
                        </strong>

                        <span className="fa-winner-nim">
                          {winner.nim || '-'}
                        </span>

                        <strong className="fa-winner-score">
                          {scoreText(winner.finalScore)}
                        </strong>

                        <span className="fa-winner-score-label">
                          Nilai Akhir
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {!isActive && (
                  <button
                    type="button"
                    className="fa-side-click"
                    onClick={() =>
                      setActiveIndex(index)
                    }
                    aria-label={`Lihat pemenang angkatan ${year}`}
                  />
                )}
              </motion.article>
            )
          })}
        </div>

        {/* ==================================
            CAROUSEL CONTROLS
        ================================== */}

        <div className="fa-controls">

          <button
            type="button"
            onClick={previous}
            aria-label="Angkatan sebelumnya"
          >
            <ChevronLeft size={19} />
          </button>

          <div className="fa-year-tabs">
            {COHORTS.map((year, index) => (
              <button
                key={year}
                type="button"
                onClick={() =>
                  setActiveIndex(index)
                }
                className={
                  activeIndex === index
                    ? 'is-active'
                    : ''
                }
                aria-pressed={
                  activeIndex === index
                }
              >
                {year}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Angkatan berikutnya"
          >
            <ChevronRight size={19} />
          </button>

        </div>

        {/* ==================================
            LIHAT SEMUA
        ================================== */}

        <div className="fa-all-action">
          <button
            type="button"
            onClick={openAllResults}
            aria-expanded={showAll}
          >
            {showAll
              ? 'Tutup Semua Peringkat'
              : 'Lihat Semua Peringkat'}

            <ArrowRight size={16} />
          </button>
        </div>

      </section>

      {/* ======================================
          SEMUA HASIL FINAL
      ====================================== */}

      {showAll && (
        <section
          className="fa-results"
          ref={allResultsRef}
        >
          <div className="fa-results-header">

            <div>
              <span className="fa-eyebrow">
                HASIL FINAL
              </span>

              <h2>Semua Peringkat</h2>

              <p>
                Jelajahi hasil berdasarkan angkatan.
              </p>
            </div>

            <div className="fa-filters">
              {['semua', ...COHORTS].map((year) => (
                <button
                  type="button"
                  key={year}
                  onClick={() => setFilter(year)}
                  className={
                    filter === year
                      ? 'is-active'
                      : ''
                  }
                  aria-pressed={filter === year}
                >
                  {year === 'semua'
                    ? 'Semua'
                    : year}
                </button>
              ))}
            </div>

          </div>

          {(
            filter === 'semua'
              ? COHORTS
              : [filter]
          ).map((year) => (
            <div
              className="fa-ranking-group"
              key={year}
            >
              <h3>
                Angkatan {year}
              </h3>

              <div className="fa-ranking-list">
                {rankingsByCohort[year].map(
                  (person, index) => {
                    const isMine =
                      String(person.nim) ===
                        String(student.nim) &&
                      year ===
                        String(student.angkatan)

                    return (
                      <div
                        key={`${year}-${person.nim || 'sample'}-${person.rank ?? index}`}
                        className={`fa-ranking-row ${
                          isMine ? 'is-mine' : ''
                        }`}
                      >
                        <span className="fa-ranking-place">
                          #{person.rank ?? index + 1}
                        </span>

                        <div className="fa-ranking-person">
                          <strong>
                            {person.name ||
                              'Nama belum tersedia'}
                          </strong>

                          <span>
                            {person.nim || '-'}
                          </span>
                        </div>

                        {person.sample && (
                          <span className="fa-sample-tag">
                            Demo
                          </span>
                        )}

                        <strong className="fa-ranking-score">
                          {scoreText(
                            person.finalScore ??
                            person.score
                          )}
                        </strong>
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          ))}

          {hasSampleData && (
            <p className="fa-demo-note">
              Baris berlabel Demo adalah data contoh
              untuk pengujian tampilan.
            </p>
          )}
        </section>
      )}

      {/* ======================================
          HASIL PRIBADI
      ====================================== */}

      <section className="fa-my-result">

        <div>
          <span className="fa-eyebrow">
            HASIL ANDA · ANGKATAN {student.angkatan}
          </span>

          <h2>
            Peringkat #{finalResult.rank ?? '-'}
            {' '}
            <span>·</span>
            {' '}
            Nilai Akhir{' '}
            {scoreText(finalResult.finalScore)}
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewHistory}
        >
          Lihat Riwayat Penilaian
          <ArrowRight size={16} />
        </button>

      </section>
    </>
  )
}

export default FinalAnnouncement
