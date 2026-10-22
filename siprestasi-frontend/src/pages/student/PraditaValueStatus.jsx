import { usePortal } from '../../data/portal'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  UserRound,
  Users,
} from 'lucide-react'

import {
  REVIEW_STATUS,
  SELECTION_STATUS,
} from '../../data/mockSelectionData'

import '../../styles/student/pradita-value-status.css'


function PraditaValueStatus() {
  const navigate = useNavigate()
  const location = useLocation()


  /* =========================================================
     ROUTE STATE
  ========================================================= */

  const routeState =
    location.state || {}

  const { selectionData } = usePortal()

  const registrationData =
    routeState.registrationData || null

  const rankingResult =
    routeState.rankingResult || null

  const peerInvitations =
    routeState.peerInvitations || []

  const praditaStage =
    routeState.praditaStage || null

  const reviewerProgress =
    routeState.reviewerProgress || null

  const finalResult =
    routeState.finalResult || null


  /* =========================================================
     HELPER STATUS
  ========================================================= */

  const mapLegacyStageToStatus = (stage) => {
    const mapping = {
      'need-peers':
        SELECTION_STATUS.NEED_PEERS,

      'waiting-admin':
        SELECTION_STATUS.WAITING_LECTURER,

      'in-progress':
        SELECTION_STATUS.PRADITA_IN_PROGRESS,

      completed:
        SELECTION_STATUS.PRADITA_COMPLETED,

      'final-announced':
        SELECTION_STATUS.FINAL_ANNOUNCED,
    }

    return mapping[stage] || null
  }


  const status =
    selectionData?.status ||
    mapLegacyStageToStatus(praditaStage) ||
    SELECTION_STATUS.WAITING_LECTURER


  const isNeedPeers =
    status ===
    SELECTION_STATUS.NEED_PEERS


  const isWaitingLecturer =
    status ===
    SELECTION_STATUS.WAITING_LECTURER


  const isInProgress =
    status ===
    SELECTION_STATUS.PRADITA_IN_PROGRESS


  const isCompleted =
    status ===
      SELECTION_STATUS.PRADITA_COMPLETED ||
    status ===
      SELECTION_STATUS.FINAL_ANNOUNCED


  const assessmentStarted =
    isInProgress || isCompleted


  /* =========================================================
     STUDENT
  ========================================================= */

  const student = selectionData.student


  /* =========================================================
     REVIEWER DATA
  ========================================================= */

  const selectionReviewers =
    selectionData?.reviewers || {}


  const rawPeers =
    selectionReviewers.peers?.length
      ? selectionReviewers.peers
      : peerInvitations


  const peers = [0, 1, 2].map(
    (index) => {
      const source =
        rawPeers?.[index] || {}

      return {
        id:
          source.id ||
          index + 1,

        email:
          source.email ||
          'Belum diisi',

        invitationStatus:
          source.invitationStatus ||
          source.status ||
          null,

        reviewStatus:
          source.reviewStatus ||
          null,
      }
    }
  )


  const kaprodi = selectionReviewers.kaprodi


  const lecturer = selectionReviewers.lecturer


  /* =========================================================
     REVIEWER STATUS HELPERS
  ========================================================= */

  const isReviewCompleted = (
    reviewer
  ) => {
    return (
      reviewer?.reviewStatus ===
        REVIEW_STATUS.COMPLETED ||
      reviewer?.reviewStatus ===
        'completed' ||
      reviewer?.status ===
        'completed'
    )
  }


  const isInvitationSent = (
    reviewer
  ) => {
    return (
      reviewer?.invitationStatus ===
        REVIEW_STATUS.INVITED ||
      reviewer?.invitationStatus ===
        'invited' ||
      reviewer?.invitationStatus ===
        'sent' ||
      reviewer?.status ===
        'sent'
    )
  }


  const completedPeers =
    peers.filter(
      (peer) =>
        isReviewCompleted(peer)
    ).length


  const kaprodiCompleted =
    isReviewCompleted(kaprodi)


  const lecturerCompleted =
    isReviewCompleted(lecturer)


  const completedAcademic =
    Number(kaprodiCompleted) +
    Number(lecturerCompleted)


  /* =========================================================
     PROGRESS
  ========================================================= */

  const progressData =
    selectionReviewers.progress ||
    reviewerProgress || {
      completed:
        isCompleted
          ? 5
          : isInProgress
            ? 3
            : 0,

      total: 5,
    }


  const progressCompleted =
    Math.min(
      Number(
        progressData.completed || 0
      ),
      5
    )


  const progressTotal =
    Number(
      progressData.total || 5
    )


  const progressPercentage =
    progressTotal > 0
      ? Math.min(
          100,
          Math.round(
            (
              progressCompleted /
              progressTotal
            ) * 100
          )
        )
      : 0


  /* =========================================================
     PEER STATUS
  ========================================================= */

  const renderPeerStatus = (
    peer
  ) => {
    if (
      isCompleted ||
      isReviewCompleted(peer)
    ) {
      return (
        <span className="pv-status-pill pv-status-completed">
          <CheckCircle2 size={14} />
          Penilaian Selesai
        </span>
      )
    }


    if (isInProgress) {
      return (
        <span className="pv-status-pill pv-status-waiting">
          <Clock3 size={14} />
          Menunggu Penilaian
        </span>
      )
    }


    if (isInvitationSent(peer)) {
      return (
        <span className="pv-status-pill pv-status-sent">
          <CheckCircle2 size={14} />
          Undangan Terkirim
        </span>
      )
    }


    return (
      <span className="pv-status-pill pv-status-waiting">
        Belum Diisi
      </span>
    )
  }


  /* =========================================================
     KAPRODI STATUS
  ========================================================= */

  const renderKaprodiStatus = () => {
    if (
      isCompleted ||
      kaprodiCompleted
    ) {
      return (
        <span className="pv-status-pill pv-status-completed">
          <CheckCircle2 size={14} />
          Selesai
        </span>
      )
    }


    if (isInProgress) {
      return (
        <span className="pv-status-pill pv-status-waiting">
          <Clock3 size={14} />
          Menunggu Penilaian
        </span>
      )
    }


    return (
      <span className="pv-status-pill pv-status-fixed">
        <CheckCircle2 size={14} />
        Sudah Ditentukan
      </span>
    )
  }


  /* =========================================================
     LECTURER STATUS
  ========================================================= */

  const renderLecturerStatus = () => {
    if (
      !lecturer?.id ||
      !lecturer?.name
    ) {
      return (
        <span className="pv-status-pill pv-status-admin">
          <Clock3 size={14} />
          Menunggu Admin
        </span>
      )
    }


    if (
      isCompleted ||
      lecturerCompleted
    ) {
      return (
        <span className="pv-status-pill pv-status-completed">
          <CheckCircle2 size={14} />
          Selesai
        </span>
      )
    }


    if (isInProgress) {
      return (
        <span className="pv-status-pill pv-status-waiting">
          <Clock3 size={14} />
          Menunggu Penilaian
        </span>
      )
    }


    return (
      <span className="pv-status-pill pv-status-fixed">
        <CheckCircle2 size={14} />
        Sudah Ditentukan
      </span>
    )
  }


  /* =========================================================
     SUMMARY BADGE
  ========================================================= */

  const getPeerSummary = () => {
    if (isCompleted) {
      return {
        text: '3/3 Selesai',
        success: true,
      }
    }


    if (isInProgress) {
      return {
        text:
          `${completedPeers}/3 Selesai`,
        success:
          completedPeers === 3,
      }
    }


    const sentCount =
      peers.filter(
        (peer) =>
          isInvitationSent(peer)
      ).length


    return {
      text:
        `${sentCount}/3 Terkirim`,
      success:
        sentCount === 3,
    }
  }


  const getAcademicSummary = () => {
    if (isCompleted) {
      return {
        text: '2/2 Selesai',
        success: true,
      }
    }


    if (isInProgress) {
      return {
        text:
          `${completedAcademic}/2 Selesai`,
        success:
          completedAcademic === 2,
      }
    }


    if (
      !lecturer?.id ||
      !lecturer?.name
    ) {
      return {
        text:
          '1 Siap • 1 Menunggu',
        success: false,
      }
    }


    return {
      text: '2/2 Siap',
      success: true,
    }
  }


  const peerSummary =
    getPeerSummary()


  const academicSummary =
    getAcademicSummary()


  /* =========================================================
     INFORMATION
  ========================================================= */

  const getInformationText = () => {
    if (isNeedPeers) {
      return (
        'Lengkapi 3 rekan sejawat ' +
        'sebelum proses penilaian dimulai.'
      )
    }


    if (isWaitingLecturer) {
      return (
        'Tidak ada tindakan tambahan dari mahasiswa. ' +
        'Penilaian dimulai setelah admin menentukan dosen penilai.'
      )
    }


    if (isInProgress) {
      return (
        'Penilaian sedang berlangsung. ' +
        'Status akan diperbarui ketika penilai mengirimkan hasil.'
      )
    }


    return (
      'Seluruh penilai telah menyelesaikan penilaian. ' +
      'Hasil akhir akan tampil setelah pengumuman dirilis.'
    )
  }


  /* =========================================================
     BACK
  ========================================================= */

  const handleBack = () => {
    navigate(
      '/dashboard/finalis',
      {
        state: {
          selectionData,

          registrationData,

          rankingResult,

          peerInvitations,

          praditaStage,

          reviewerProgress,

          finalResult,
        },
      }
    )
  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="pv-status-page">

      <div className="pv-status-container">


        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="pv-status-header">

          <div>

            <span className="pv-status-eyebrow">
              PRADITA VALUE
            </span>

            <h1>
              Status Penilaian
            </h1>

            <p>
              Pantau status penilai dan proses
              penilaian Pradita Value.
            </p>

          </div>

        </header>


        {/* =====================================================
            BACK
        ====================================================== */}

        <button
          type="button"
          className="pv-back-button"
          onClick={handleBack}
        >
          <ArrowLeft size={17} />

          Kembali ke Dashboard
        </button>


        {/* =====================================================
            MAIN STATUS

            Ini sengaja cuma SATU.
            Gak ada lagi 3 section berdasarkan state.
        ====================================================== */}

        <section className="pv-main-status-card">

          <div className="pv-main-status-copy">

            <span className="pv-main-status-label">
              PRADITA VALUE
            </span>

            <h2>
              Status Penilaian
            </h2>

            <p>
              Pantau ketersediaan dan progres
              penilai Pradita Value.
            </p>


            <div className="pv-main-student">

              <strong>
                {student.name}
              </strong>

              <span>
                {student.nim}
                {' • '}
                Angkatan {student.angkatan}
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            PROGRESS

            Tidak ditampilkan sebelum penilaian mulai.
            Jadi state waiting admin tidak punya 0/5.
        ====================================================== */}

        {assessmentStarted && (
          <section className="pv-progress-card">

            <div className="pv-progress-heading">

              <div>

                <h2>
                  Progress Penilaian
                </h2>

                <p>
                  Perkembangan pengisian
                  Pradita Value dari seluruh penilai.
                </p>

              </div>


              <strong>
                {progressCompleted}
                {' dari '}
                {progressTotal}
                {' penilai selesai'}
              </strong>

            </div>


            <div className="pv-progress-track">

              <div
                className="pv-progress-fill"
                style={{
                  width:
                    `${progressPercentage}%`,
                }}
              />

            </div>


            <span className="pv-progress-note">

              {isCompleted
                ? 'Seluruh penilaian Pradita Value telah selesai.'
                : 'Penilaian masih berlangsung.'}

            </span>

          </section>
        )}


        {/* =====================================================
            REVIEWER GRID
        ====================================================== */}

        <div className="pv-reviewer-grid">


          {/* ===================================================
              REKAN SEJAWAT
          ==================================================== */}

          <section className="pv-reviewer-card">

            <div className="pv-reviewer-heading">

              <div className="pv-reviewer-heading-icon">
                <Users size={19} />
              </div>


              <div className="pv-reviewer-heading-copy">

                <h2>
                  Rekan Sejawat
                </h2>

                <p>
                  Dipilih oleh mahasiswa finalis.
                </p>

              </div>


              <span
                className={
                  peerSummary.success
                    ? 'pv-reviewer-summary pv-reviewer-summary-success'
                    : 'pv-reviewer-summary'
                }
              >
                {peerSummary.text}
              </span>

            </div>


            <div className="pv-reviewer-list">

              {peers.map(
                (peer, index) => (

                  <div
                    className="pv-reviewer-item"
                    key={
                      peer.id ||
                      index
                    }
                  >

                    <div className="pv-reviewer-number">
                      {index + 1}
                    </div>


                    <div className="pv-reviewer-copy">

                      <span>
                        Rekan {index + 1}
                      </span>

                      <strong>
                        {peer.email}
                      </strong>

                    </div>


                    {renderPeerStatus(
                      peer
                    )}

                  </div>

                )
              )}

            </div>

          </section>


          {/* ===================================================
              PENILAI AKADEMIK
          ==================================================== */}

          <section className="pv-reviewer-card">

            <div className="pv-reviewer-heading">

              <div className="pv-reviewer-heading-icon">
                <UserRound size={19} />
              </div>


              <div className="pv-reviewer-heading-copy">

                <h2>
                  Penilai Akademik
                </h2>

                <p>
                  Kaprodi sudah tetap,
                  dosen ditentukan oleh admin.
                </p>

              </div>


              <span
                className={
                  academicSummary.success
                    ? 'pv-reviewer-summary pv-reviewer-summary-success'
                    : 'pv-reviewer-summary'
                }
              >
                {academicSummary.text}
              </span>

            </div>


            <div className="pv-reviewer-list">


              {/* KAPRODI */}

              <div className="pv-reviewer-item">

                <div className="pv-reviewer-number">
                  4
                </div>


                <div className="pv-reviewer-copy">

                  <span>
                    Kaprodi Sistem Informasi
                  </span>

                  <strong>
                    {kaprodi?.name ||
                      'Kaprodi Sistem Informasi'}
                  </strong>

                </div>


                {renderKaprodiStatus()}

              </div>


              {/* DOSEN PENILAI */}

              <div className="pv-reviewer-item">

                <div className="pv-reviewer-number">
                  5
                </div>


                <div className="pv-reviewer-copy">

                  <span>
                    Dosen Penilai
                  </span>

                  <strong>
                    {lecturer?.name ||
                      'Belum ditentukan'}
                  </strong>

                </div>


                {renderLecturerStatus()}

              </div>

            </div>

          </section>

        </div>


        {/* =====================================================
            INFORMATION
        ====================================================== */}

        <section className="pv-information-card">

          <div className="pv-information-icon">
            <Mail size={17} />
          </div>


          <div>

            <h2>
              Informasi Penilaian
            </h2>

            <p>
              {getInformationText()}
            </p>

          </div>

        </section>

      </div>

    </div>
  )
}


export default PraditaValueStatus
