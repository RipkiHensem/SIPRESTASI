import { api } from '../../api'
import {
  useMemo,
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  AnimatePresence,
  motion,
} from 'framer-motion'

import {
  ArrowUpRight,
  Award,
  BookOpen,
  FileText,
  HeartHandshake,
  Languages,
  Search,
  Users,
} from 'lucide-react'

import logoSiprestasi from '../../assets/branding/logo-siprestasi.png'

import '../../styles/student/landing-page.css'


function LandingPage() {
  const navigate = useNavigate()


  /* =========================================================
     STATE
  ========================================================= */

  const [selectedCohort, setSelectedCohort] =
    useState('2024')

  const [showAllRanking, setShowAllRanking] =
    useState(false)

  const [rankingFilter, setRankingFilter] =
    useState('all')

  const [rankingSearch, setRankingSearch] =
    useState('')

  const [
    selectedRankingId,
    setSelectedRankingId,
  ] = useState(null)

  const [
  activeWinnerRank,
  setActiveWinnerRank,
] = useState(1)

  /* =========================================================
     DATA PUBLIK DARI BACKEND
  ========================================================= */

  const [publicData, setPublicData] = useState({ rankings: [], period: null })
  const [loadError, setLoadError] = useState('')
  const rankingData = publicData.rankings
  useEffect(() => {
    const controller = new AbortController()
    api('portal/public', { signal: controller.signal }).then(response => setPublicData(response.data))
      .catch(error => { if (error.name !== 'AbortError') setLoadError(error.message) })
    return () => controller.abort()
  }, [])


  const cohortOptions = [
    '2024',
    '2025',
    '2026',
  ]


  /* =========================================================
     WINNER DATA
  ========================================================= */

  const selectedWinners =
    useMemo(() => {
      const winners = rankingData
        .filter(
          (student) =>
            student.cohort ===
              selectedCohort &&
            student.cohortRank <= 3
        )
        .sort(
          (a, b) =>
            a.cohortRank -
            b.cohortRank
        )
      return [1, 2, 3].map(rank => winners.find(student => Number(student.cohortRank) === rank) || {
        cohort: selectedCohort,
        cohortRank: rank,
        name: 'Belum diumumkan',
        nim: '—',
        placeholder: true,
      })
    }, [
      selectedCohort,
      rankingData,
    ])


  /* =========================================================
     ALL RANKING FILTER
  ========================================================= */

  const filteredRankings =
    useMemo(() => {
      const keyword =
        rankingSearch
          .trim()
          .toLowerCase()

      return rankingData
        .filter((student) => {
          const matchesCohort =
            rankingFilter === 'all' ||
            student.cohort ===
              rankingFilter

          const matchesSearch =
            keyword === '' ||
            student.name
              .toLowerCase()
              .includes(keyword) ||
            student.nim
              .toLowerCase()
              .includes(keyword)

          return (
            matchesCohort &&
            matchesSearch
          )
        })
        .sort((a, b) => {
          if (
            rankingFilter === 'all'
          ) {
            return (
              a.overallRank -
              b.overallRank
            )
          }

          return (
            a.cohortRank -
            b.cohortRank
          )
        })
    }, [
      rankingFilter,
      rankingSearch,
      rankingData,
    ])


  /* =========================================================
     INITIALS
  ========================================================= */

  const getInitials = (name) => {
    const words =
      name
        .trim()
        .split(/\s+/)

    if (words.length === 1) {
      return words[0]
        .slice(0, 2)
        .toUpperCase()
    }

    return (
      words[0][0] +
      words[
        words.length - 1
      ][0]
    ).toUpperCase()
  }


  /* =========================================================
     SCORE
  ========================================================= */

  const formatScore = (score) => {
    return Number(score).toFixed(2)
  }


  /* =========================================================
     INDIKATOR
  ========================================================= */

  const indicators = [
    {
      number: '01',
      title: 'IPK',
      description:
        'Pencapaian akademik mahasiswa.',
      icon: BookOpen,
    },
    {
      number: '02',
      title: 'Prestasi',
      description:
        'Prestasi terbaik yang dimiliki mahasiswa.',
      icon: Award,
    },
    {
      number: '03',
      title: 'SKPI',
      description:
        'Poin kegiatan selama masa perkuliahan.',
      icon: FileText,
    },
    {
      number: '04',
      title: 'Organisasi',
      description:
        'Pengalaman dan peran dalam organisasi.',
      icon: Users,
    },
    {
      number: '05',
      title: 'Bahasa Asing',
      description:
        'Kemampuan bahasa asing yang tersertifikasi.',
      icon: Languages,
    },
    {
      number: '06',
      title: 'Pradita Value',
      description:
        'Penilaian nilai dan karakter mahasiswa.',
      icon: HeartHandshake,
    },
  ]


  /* =========================================================
     ALUR SELEKSI
  ========================================================= */

  const selectionSteps = [
    {
      number: '01',
      title: 'Tahap 1',
      description:
        'Pengisian data dan verifikasi dokumen pendaftaran.',
    },
    {
      number: '02',
      title: 'Ranking per Angkatan',
      description:
        'Penentuan Top 3 dari setiap angkatan.',
    },
    {
      number: '03',
      title: 'Pradita Value',
      description:
        'Penilaian lanjutan untuk mahasiswa finalis.',
    },
    {
      number: '04',
      title: 'Pengumuman Final',
      description:
        'Hasil akhir seleksi Mahasiswa Berprestasi.',
    },
  ]


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleLogin = () => {
    navigate('/login')
  }


  const handleRegister = () => {
    navigate('/register')
  }


  /* =========================================================
     RANKING SELECTION
  ========================================================= */

  const handleSelectRanking = (
    studentId
  ) => {
    setSelectedRankingId(
      (currentId) =>
        currentId === studentId
          ? null
          : studentId
    )
  }


  /* =========================================================
     ANIMATION
  ========================================================= */

  const sectionReveal = {
    hidden: {
      opacity: 0,
      y: 28,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.65,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  }


  return (
    <main className="landing-page">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="landing-header">

        <div className="landing-container landing-header-inner">

          <button
            type="button"
            className="landing-brand"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
          >
            <img
              src={logoSiprestasi}
              alt="SIPRESTASI"
              className="landing-brand-logo"
            />
          </button>


          <div className="landing-header-actions">

            <button
              type="button"
              className="landing-login-button"
              onClick={handleLogin}
            >
              Masuk
            </button>


            <button
              type="button"
              className="landing-register-button"
              onClick={handleRegister}
            >
              Daftar

              <ArrowUpRight
                size={16}
                strokeWidth={2}
              />
            </button>

          </div>

        </div>

      </header>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="landing-hero">

        <div className="landing-container landing-hero-grid">

          <div className="landing-hero-copy">

            <span className="landing-eyebrow">
              SIPRESTASI
            </span>


            <h1>
              Mahasiswa Berprestasi

              <span>
                Sistem Informasi.
              </span>
            </h1>


            <p className="landing-hero-description">

              <span>
                Sistem seleksi Mahasiswa Berprestasi untuk Program Studi Sistem Informasi
              </span>

              <span>
                Pradita University.
              </span>

            </p>


            <button
              type="button"
              className="landing-primary-button"
              onClick={handleRegister}
            >
              Mulai Pendaftaran

              <ArrowUpRight
                size={18}
                strokeWidth={2}
              />
            </button>

          </div>


          <aside className="landing-registration-info">
            <h2>
              {publicData.period && !Number(publicData.period.is_closed) ? 'Pendaftaran Dibuka' : 'Pendaftaran Belum Dibuka'}
            </h2>

            <p>
              Lengkapi data pendaftaran untuk
              mengikuti proses seleksi
              Mahasiswa Berprestasi 2026.
            </p>

            <span className="landing-registration-note">
              Sistem Informasi · Pradita University
            </span>

          </aside>

        </div>

      </section>


      {/* =====================================================
          PEMENANG
      ====================================================== */}

      <section className="landing-winners">

        <div className="landing-container">


          <motion.div
            className="landing-section-heading"
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.3,
            }}
          >

            <div>

              <span className="landing-section-eyebrow">
                SIPRESTASI 
              </span>

              <h2>
                Mahasiswa Berprestasi
              </h2>

            </div>


            <p>
              {loadError || 'Hasil ranking akan tampil setelah diumumkan oleh pengelola.'}
            </p>

          </motion.div>


          {/* =================================================
              TOOLBAR
          ================================================= */}

          <motion.div
            className="landing-winner-toolbar"
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.55,
              delay: 0.08,
            }}
          >

            <div className="landing-cohort-tabs">

              {cohortOptions.map(
                (cohort) => (
                  <button
                    type="button"
                    key={cohort}
                    className={
                      selectedCohort ===
                      cohort
                        ? 'landing-cohort-tab is-active'
                        : 'landing-cohort-tab'
                    }
                    onClick={() =>
                      setSelectedCohort(
                        cohort
                      )
                    }
                  >
                    Angkatan {cohort}
                  </button>
                )
              )}

            </div>


            <button
              type="button"
              className={
                showAllRanking
                  ? 'landing-ranking-toggle is-active'
                  : 'landing-ranking-toggle'
              }
              onClick={() =>
                setShowAllRanking(
                  (current) =>
                    !current
                )
              }
            >
              {showAllRanking
                ? 'Tutup Semua Peringkat'
                : 'Lihat Semua Peringkat'}

              <ArrowUpRight
                size={16}
                strokeWidth={1.8}
              />
            </button>

          </motion.div>


          {/* =================================================
              TOP 3
          ================================================= */}

          <div className="landing-winners-stage">

            <AnimatePresence
              mode="wait"
            >

<motion.div
  key={selectedCohort}
  className={`landing-winners-layout is-active-${activeWinnerRank}`}
  initial={{
    opacity: 0,
    y: 24,
  }}
  animate={{
    opacity: 1,
    y: 0,
  }}
  exit={{
    opacity: 0,
    y: -14,
  }}
  transition={{
    duration: 0.42,
    ease: [
      0.22,
      1,
      0.36,
      1,
    ],
  }}
  onMouseLeave={() =>
    setActiveWinnerRank(1)
  }
>
                {selectedWinners.map(
                  (
                    winner
                  ) => (

  <motion.article
  layout
  key={
    `${winner.cohort}-${winner.cohortRank}`
  }
  className={
    activeWinnerRank === winner.cohortRank
      ? 'landing-winner landing-winner-featured'
      : 'landing-winner'
  }
  initial={{
    opacity: 0,
    y: 24,
  }}
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    layout: {
      type: 'spring',
      stiffness: 260,
      damping: 28,
    },
    opacity: {
      duration: 0.3,
    },
    y: {
      duration: 0.4,
    },
  }}
  onMouseEnter={() =>
    setActiveWinnerRank(
      winner.cohortRank
    )
  }
>

                      <div className="landing-winner-top">

                        <span className="landing-winner-number">
                          {String(
                            winner.cohortRank
                          ).padStart(
                            2,
                            '0'
                          )}
                        </span>

                        <span className="landing-winner-cohort">
                          {winner.cohort}
                        </span>

                      </div>


                      <div className="landing-winner-copy">

                        <span className="landing-winner-rank">
                          {winner.placeholder ? 'Posisi Peringkat' : 'Peringkat'} {winner.cohortRank}
                        </span>

                        <h3>
                          {winner.name}
                        </h3>

                        <p>
                          {winner.nim}

                          <span>
                            •
                          </span>

                          Angkatan {winner.cohort}
                        </p>

                      </div>

                    </motion.article>

                  )
                )}

              </motion.div>

            </AnimatePresence>

          </div>


          {/* =================================================
              ALL RANKING
          ================================================= */}

          <AnimatePresence>

            {showAllRanking && (

              <motion.div
                className="landing-ranking-panel"
                initial={{
                  opacity: 0,
                  height: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: 10,
                }}
                transition={{
                  duration: 0.42,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
              >

                <div className="landing-ranking-header">

                  <div>

                    <span className="landing-ranking-eyebrow">
                      ALL RANKING
                    </span>

                    <h3>
                      Semua Peringkat
                    </h3>

                    <p>
                      Cari mahasiswa atau
                      tampilkan peringkat
                      berdasarkan angkatan.
                    </p>

                  </div>


                  <div className="landing-ranking-result-count">
                    {filteredRankings.length}
                    {' '}
                    mahasiswa
                  </div>

                </div>


                {/* FILTER */}

                <div className="landing-ranking-controls">

                  <div className="landing-ranking-filters">

                    <button
                      type="button"
                      className={
                        rankingFilter ===
                        'all'
                          ? 'is-active'
                          : ''
                      }
                      onClick={() =>
                        setRankingFilter(
                          'all'
                        )
                      }
                    >
                      Semua
                    </button>


                    {cohortOptions.map(
                      (cohort) => (
                        <button
                          type="button"
                          key={cohort}
                          className={
                            rankingFilter ===
                            cohort
                              ? 'is-active'
                              : ''
                          }
                          onClick={() =>
                            setRankingFilter(
                              cohort
                            )
                          }
                        >
                          {cohort}
                        </button>
                      )
                    )}

                  </div>


                  <label className="landing-ranking-search">

                    <Search
                      size={17}
                      strokeWidth={1.8}
                    />

                    <input
                      type="text"
                      value={
                        rankingSearch
                      }
                      onChange={(event) =>
                        setRankingSearch(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Cari nama atau NIM"
                    />

                  </label>

                </div>


                {/* COLUMN */}

                <div className="landing-ranking-column-head">

                  <span>
                    Mahasiswa
                  </span>

                  <div>

                    <span>
                      Rank
                    </span>

                    <span>
                      Score
                    </span>

                  </div>

                </div>


                {/* LIST */}

                <div className="landing-ranking-list">

                  <AnimatePresence
                    initial={false}
                  >

                    {filteredRankings.map(
                      (
                        student, index
                  ) => {
                        const isSelected =
                          selectedRankingId ===
                          student.id

                        return (
                          <motion.button
                            layout
                            type="button"
                            key={student.id}
                            className={
                              isSelected
                                ? 'landing-ranking-row is-selected'
                                : 'landing-ranking-row'
                            }
                            initial={{
                              opacity: 0,
                              y: 12,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              y: -8,
                            }}
                            transition={{
                              duration: 0.25,
                              delay:
                                Math.min(
                                  index *
                                    0.025,
                                  0.15
                                ),
                            }}
                            onClick={() =>
                              handleSelectRanking(
                                student.id
                              )
                            }
                          >

                            {isSelected && (
                              <motion.span
                                layoutId="landing-ranking-selected-background"
                                className="landing-ranking-selected-background"
                                transition={{
                                  type:
                                    'spring',
                                  stiffness:
                                    420,
                                  damping:
                                    36,
                                }}
                              />
                            )}


                            <div className="landing-ranking-student">

                              <div className="landing-ranking-avatar">

                                {getInitials(
                                  student.name
                                )}

                              </div>


                              <div className="landing-ranking-student-copy">

                                <strong>
                                  {student.name}
                                </strong>

                                <p>
                                  {student.nim}

                                  <span>
                                    •
                                  </span>

                                  Angkatan {student.cohort}
                                </p>

                              </div>

                            </div>


                            <div className="landing-ranking-meta">

                              <div className="landing-ranking-rank">

                                <span>
                                  Rank
                                </span>

                                <strong>
                                  #
                                  {rankingFilter ===
                                  'all'
                                    ? student.overallRank
                                    : student.cohortRank}
                                </strong>

                              </div>


                              <div className="landing-ranking-score">

                                <span>
                                  Score
                                </span>

                                <strong>
                                  {formatScore(
                                    student.score
                                  )}
                                </strong>

                              </div>

                            </div>

                          </motion.button>
                        )
                      }
                    )}

                  </AnimatePresence>


                  {filteredRankings.length ===
                    0 && (
                    <div className="landing-ranking-empty">

                      <strong>
                        Data tidak ditemukan
                      </strong>

                      <p>
                        Coba gunakan nama,
                        NIM, atau filter
                        angkatan lain.
                      </p>

                    </div>
                  )}

                </div>

              </motion.div>

            )}

          </AnimatePresence>


          <p className="landing-winner-note">
            Data pemenang akan diperbarui
            setelah hasil resmi tersedia.
          </p>

        </div>

      </section>


      {/* =====================================================
          ABOUT
      ====================================================== */}

      <section className="landing-about">

        <div className="landing-container">

          <div className="landing-about-heading">

            <span className="landing-section-eyebrow">
              TENTANG SIPRESTASI
            </span>


            <div className="landing-about-title-row">

              <h2>
                Apa yang dinilai dalam SIPRESTASI?
              </h2>


              <p>
                Penilaian mencakup data akademik,
                prestasi, aktivitas organisasi,
                kemampuan bahasa, dan penilaian
                Pradita Value.
              </p>

            </div>

          </div>


          <div className="landing-indicator-grid">

            {indicators.map(
              (indicator) => {
                const Icon =
                  indicator.icon

                return (
                  <article
                    className="landing-indicator"
                    key={
                      indicator.number
                    }
                  >

                    <div className="landing-indicator-top">

                      <span>
                        {indicator.number}
                      </span>

                      <Icon
                        size={20}
                        strokeWidth={1.7}
                      />

                    </div>


                    <h3>
                      {indicator.title}
                    </h3>


                    <p>
                      {indicator.description}
                    </p>

                  </article>
                )
              }
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          SELECTION
      ====================================================== */}

      <section className="landing-selection">

        <div className="landing-container">

          <div className="landing-selection-heading">

            <span className="landing-section-eyebrow">
              PROSES SELEKSI
            </span>

            <h2>
              Alur SIPRESTASI
            </h2>

            <p>
              Empat tahap utama dari pendaftaran
              sampai hasil akhir seleksi.
            </p>

          </div>


          <div className="landing-selection-grid">

            {selectionSteps.map(
              (
                step,
                index
              ) => (

                <article
                  className="landing-selection-step"
                  key={step.number}
                >

                  <div className="landing-selection-number">
                    {step.number}
                  </div>


                  {index <
                    selectionSteps.length -
                      1 && (
                    <div
                      className="landing-selection-line"
                      aria-hidden="true"
                    />
                  )}


                  <h3>
                    {step.title}
                  </h3>

                  <p>
                    {step.description}
                  </p>

                </article>

              )
            )}

          </div>

        </div>

      </section>

    </main>
  )
}


export default LandingPage
