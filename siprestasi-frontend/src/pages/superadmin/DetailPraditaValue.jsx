import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import SuperadminNavbar from '../../components/superadmin/SuperadminNavbar'
import { fetchSubmissionDetail, sendPvInvitations } from '../../data/superadmin'

import './DetailPraditaValue.css'

function createEvaluators(serverDetail, angkatan) {
  if (!serverDetail) return []
  const rev = serverDetail.reviewers || {}
  const responses = rev.responses || []
  const respByReviewer = {}
  responses.forEach((r) => {
    if (r.reviewer) respByReviewer[r.reviewer] = r
    if (r.role) respByReviewer[r.role] = r
  })

  const peers = [rev.peer_1, rev.peer_2, rev.peer_3]
  const peerEvaluators = [0, 1, 2].map((index) => {
    const peerEmail = peers[index]
    const resp = peerEmail ? (respByReviewer[peerEmail] || responses.find((r) => r.role === `peer_${index + 1}`)) : null
    const sent = !!resp
    const responded = resp?.status === 'submitted'
    return {
      id: `peer-${index + 1}`,
      type: 'Rekan Sejawat',
      role: `Rekan Sejawat ${index + 1}`,
      name: peerEmail ? peerEmail.split('@')[0] : 'Belum dikirim mahasiswa',
      email: peerEmail || '-',
      token: resp?.token ? `PV-${angkatan || ''}-${resp.token.slice(0, 6)}` : '-',
      sent,
      responded,
    }
  })

  const lecturers = rev.lecturers || []
  const lecturerEvaluators = [0, 1].map((index) => {
    const lec = lecturers[index]
    const resp = lec ? (respByReviewer[lec.email] || responses.find((r) => r.role === `dosen_${index + 1}`)) : null
    const sent = !!resp
    const responded = resp?.status === 'submitted'
    return {
      id: `lecturer-${index + 1}`,
      type: 'Dosen',
      role: lec?.is_kaprodi ? 'Kaprodi' : (index === 0 ? 'Kaprodi' : 'Dosen Terpilih Sistem'),
      name: lec?.name || (index === 0 ? 'Kaprodi' : 'Dosen'),
      email: lec?.email || '-',
      token: resp?.token ? `PV-${angkatan || ''}-${resp.token.slice(0, 6)}` : '-',
      sent,
      responded,
    }
  })

  return [...peerEvaluators, ...lecturerEvaluators]
}

function DetailPraditaValue() {
  const navigate = useNavigate()
  const { nim } = useParams()

  const [serverDetail, setServerDetail] = useState(null)
  const [evaluators, setEvaluators] = useState([])

  useEffect(() => {
    if (!nim) return
    let cancelled = false
    fetchSubmissionDetail(nim)
      .then((res) => {
        if (!cancelled && res?.data) {
          setServerDetail(res.data)
          setEvaluators(createEvaluators(res.data, res.data.angkatan))
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [nim])

  const finalist = useMemo(() => {
    if (!serverDetail) {
      return {
        initials: '',
        name: '',
        nim: nim || '',
        prodi: '',
        angkatan: '',
        tahap1: '0.00',
        status: '',
        statusType: 'waiting',
        responseCount: 0,
      }
    }
    const responses = serverDetail.reviewers?.responses || []
    const submittedCount = responses.filter((r) => r.status === 'submitted').length
    const sentCount = responses.length
    const rev = serverDetail.reviewers || {}
    const peersCount = [rev.peer_1, rev.peer_2, rev.peer_3].filter(Boolean).length
    const lecturerCount = (rev.lecturers || []).length

    let status = 'Menunggu Data Rekan Sejawat'
    let statusType = 'waiting'
    if (submittedCount >= 5 && sentCount >= 5) {
      status = 'Selesai'
      statusType = 'completed'
    } else if (sentCount > 0) {
      status = 'Penilaian Berlangsung'
      statusType = 'progress'
    } else if (peersCount === 3 && lecturerCount >= 2) {
      status = 'Siap Dikirim'
      statusType = 'ready'
    }

    return {
      initials: serverDetail.initials || 'M',
      name: serverDetail.name || '',
      nim: serverDetail.nim || '',
      prodi: serverDetail.prodi || 'S1 Informatika',
      angkatan: serverDetail.angkatan || '',
      tahap1: serverDetail.score?.total_score
        ? Number(serverDetail.score.total_score).toFixed(2)
        : '0.00',
      status,
      statusType,
      responseCount: submittedCount,
    }
  }, [serverDetail, nim])

  const [selectedEvaluator, setSelectedEvaluator] =
    useState(null)

  const [showSendAllModal, setShowSendAllModal] =
    useState(false)

  const [successMessage, setSuccessMessage] =
    useState('')

  const peers = evaluators.filter(
    (item) => item.type === 'Rekan Sejawat'
  )

  const lecturers = evaluators.filter(
    (item) => item.type === 'Dosen'
  )

  const sentCount = evaluators.filter(
    (item) => item.sent
  ).length

  const responseCount = evaluators.filter(
    (item) => item.responded
  ).length

  const canSendAll =
    finalist.statusType !== 'waiting' &&
    sentCount < 5

  const handleSendAll = async () => {
    if (serverDetail?.sub_id) {
      try {
        await sendPvInvitations(serverDetail.sub_id)
      } catch {
        // fallback
      }
    }

    setEvaluators((current) =>
      current.map((item, index) => {
        if (item.sent) {
          return item
        }

        return {
          ...item,
          sent: true,
          token: `PV-${finalist.angkatan}-${index + 1}A7K`,
        }
      })
    )

    setShowSendAllModal(false)

    setSuccessMessage(
      'Form Pradita Value berhasil dikirim ke seluruh penilai yang belum menerima form.'
    )
  }

  const handleSendSingle = async () => {
    if (!selectedEvaluator) return

    if (selectedEvaluator.sent) {
      setSelectedEvaluator(null)
      return
    }

    if (serverDetail?.sub_id) {
      try {
        await sendPvInvitations(serverDetail.sub_id)
      } catch {
        // fallback
      }
    }

    setEvaluators((current) =>
      current.map((item, index) => {
        if (item.id !== selectedEvaluator.id) {
          return item
        }

        return {
          ...item,
          sent: true,
          token: `PV-${finalist.angkatan}-${index + 1}B9M`,
        }
      })
    )

    setSuccessMessage(
      `Form berhasil dikirim ke ${selectedEvaluator.name}.`
    )

    setSelectedEvaluator(null)
  }

  return (
    <div className="pradita-detail-page">

      <SuperadminNavbar variant="light" />

      <main className="pradita-detail-content">

        {/* BACK */}

        <button
          type="button"
          className="pradita-detail-back"
          onClick={() =>
            navigate('/superadmin/pradita-value')
          }
        >
          ←

          <span>
            Kembali ke Pradita Value
          </span>
        </button>

        {/* HEADING */}

        <section className="pradita-detail-heading">

          <h1>
            Detail Asesmen Pradita Value
          </h1>

          <p>
            Kelola penilai, distribusi form, token,
            dan progres asesmen finalis.
          </p>

        </section>

        {/* FINALIST */}

        <section className="pradita-finalist-card">

          <div className="pradita-finalist-profile">

            <div className="pradita-finalist-avatar">
              {finalist.initials}
            </div>

            <div>

              <h2>
                {finalist.name}
              </h2>

              <div className="pradita-finalist-meta">

                <strong>
                  NIM {finalist.nim}
                </strong>

                <span>•</span>

                <span>
                  {finalist.prodi}
                </span>

                <span>•</span>

                <span>
                  Angkatan {finalist.angkatan}
                </span>

              </div>

            </div>

          </div>

          <div className="pradita-finalist-right">

            <div className="pradita-stage-score">

              <span>
                Nilai Tahap 1
              </span>

              <strong>
                {finalist.tahap1}
              </strong>

            </div>

            <span
              className={`pradita-detail-status ${finalist.statusType}`}
            >
              {finalist.status}
            </span>

          </div>

        </section>

        {/* SUMMARY */}

        <section className="pradita-detail-summary">

          <DetailSummary
            title="Total Penilai"
            value="5"
            description="3 rekan + 2 dosen"
          />

          <DetailSummary
            title="Form Terkirim"
            value={`${sentCount}/5`}
            description="Email asesmen terkirim"
          />

          <DetailSummary
            title="Respon Masuk"
            value={`${responseCount}/5`}
            description="Penilaian sudah dikirim"
          />

          <DetailSummary
            title="Sisa Penilaian"
            value={5 - responseCount}
            description="Belum memberikan respon"
          />

        </section>

        {/* SUCCESS */}

        {successMessage && (
          <div className="pradita-send-success">

            <span>
              ✓
            </span>

            {successMessage}

          </div>
        )}

        {/* REKAN SEJAWAT */}

        <EvaluatorSection
          title="Rekan Sejawat"
          subtitle="Tiga rekan sejawat diajukan oleh mahasiswa."
          badge={`${
            peers.filter(
              (item) =>
                item.name !==
                'Belum dikirim mahasiswa'
            ).length
          }/3 Data`}
        >

          {peers.map((evaluator, index) => (
            <EvaluatorRow
              key={evaluator.id}
              evaluator={evaluator}
              number={index + 1}
              onAction={() =>
                setSelectedEvaluator(evaluator)
              }
              disabled={
                evaluator.name ===
                'Belum dikirim mahasiswa'
              }
            />
          ))}

        </EvaluatorSection>

        {/* DOSEN */}

        <EvaluatorSection
          title="Dosen Penilai"
          subtitle="Kaprodi dan satu dosen dipilih otomatis oleh sistem."
          badge="2/2 Dosen"
        >

          {lecturers.map(
            (evaluator, index) => (
              <EvaluatorRow
                key={evaluator.id}
                evaluator={evaluator}
                number={index + 1}
                onAction={() =>
                  setSelectedEvaluator(evaluator)
                }
              />
            )
          )}

        </EvaluatorSection>

        {/* TOKEN INFO */}

        <section className="pradita-token-information">

          <div className="pradita-token-icon">
            i
          </div>

          <div>

            <strong>
              TOKEN PENILAIAN SATU KALI PAKAI
            </strong>

            <p>
              Setiap penilai menerima satu email
              berisi link form dan token unik.
              Form hanya dapat dikirim satu kali.
              Setelah token digunakan, token akan
              dinonaktifkan dan tidak dapat digunakan
              kembali.
            </p>

          </div>

        </section>

        {/* DISTRIBUTION */}

        <section className="pradita-distribution-card">

          <div>

            <h3>
              Distribusi Form Asesmen
            </h3>

            <p>
              Pastikan seluruh data penilai sudah
              lengkap sebelum mengirim form.
            </p>

          </div>

          {finalist.statusType === 'waiting' ? (
            <button
              type="button"
              className="pradita-send-all disabled"
              disabled
            >
              Menunggu Data Rekan Sejawat
            </button>
          ) : canSendAll ? (
            <button
              type="button"
              className="pradita-send-all"
              onClick={() =>
                setShowSendAllModal(true)
              }
            >
              ✉ Kirim Form ke Penilai
            </button>
          ) : (
            <div className="all-form-sent">
              ✓ Seluruh form telah dikirim
            </div>
          )}

        </section>

      </main>

      <footer className="pradita-detail-footer">
        © SIPRESTASI - Sistem Seleksi Mahasiswa
        Berprestasi Universitas.
      </footer>

      {/* SINGLE SEND MODAL */}

      {selectedEvaluator &&
        !selectedEvaluator.sent && (
          <div className="pradita-modal-overlay">

            <div className="pradita-send-modal">

              <div className="pradita-modal-icon">
                ✉
              </div>

              <h2>
                Kirim Form Penilaian?
              </h2>

              <p>
                Form Pradita Value akan dikirim
                satu kali kepada:
              </p>

              <div className="pradita-recipient-box">

                <strong>
                  {selectedEvaluator.name}
                </strong>

                <span>
                  {selectedEvaluator.email}
                </span>

                <small>
                  {selectedEvaluator.role}
                </small>

              </div>

              <div className="pradita-modal-note">

                <span>
                  i
                </span>

                <p>
                  Sistem akan membuat satu token unik.
                  Setelah email dikirim, form tidak
                  dapat dikirim ulang kepada penilai ini.
                </p>

              </div>

              <div className="pradita-modal-actions">

                <button
                  type="button"
                  className="pradita-modal-cancel"
                  onClick={() =>
                    setSelectedEvaluator(null)
                  }
                >
                  Batal
                </button>

                <button
                  type="button"
                  className="pradita-modal-confirm"
                  onClick={handleSendSingle}
                >
                  ✉ Ya, Kirim Form
                </button>

              </div>

            </div>

          </div>
        )}

      {/* SEND ALL MODAL */}

      {showSendAllModal && (
        <div className="pradita-modal-overlay">

          <div className="pradita-send-modal">

            <div className="pradita-modal-icon">
              ✉
            </div>

            <h2>
              Kirim Form ke Penilai?
            </h2>

            <p>
              Sistem akan mengirim form hanya kepada
              penilai yang belum pernah menerima form.
            </p>

            <div className="pradita-modal-summary">

              <div>
                <span>
                  Rekan Sejawat
                </span>

                <strong>
                  3 penilai
                </strong>
              </div>

              <div>
                <span>
                  Dosen Penilai
                </span>

                <strong>
                  2 penilai
                </strong>
              </div>

              <div>
                <span>
                  Total Penilai
                </span>

                <strong>
                  5 orang
                </strong>
              </div>

            </div>

            <div className="pradita-modal-note">

              <span>
                i
              </span>

              <p>
                Setiap penilai hanya menerima satu
                kali pengiriman form dan satu token
                unik. Form yang sudah terkirim tidak
                dapat dikirim ulang.
              </p>

            </div>

            <div className="pradita-modal-actions">

              <button
                type="button"
                className="pradita-modal-cancel"
                onClick={() =>
                  setShowSendAllModal(false)
                }
              >
                Batal
              </button>

              <button
                type="button"
                className="pradita-modal-confirm"
                onClick={handleSendAll}
              >
                ✉ Ya, Kirim Form
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

function DetailSummary({
  title,
  value,
  description,
}) {
  return (
    <div className="pradita-detail-summary-card">

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
  )
}

function EvaluatorSection({
  title,
  subtitle,
  badge,
  children,
}) {
  return (
    <section className="evaluator-section">

      <div className="evaluator-section-heading">

        <div>

          <h3>
            {title}
          </h3>

          <p>
            {subtitle}
          </p>

        </div>

        <span>
          {badge}
        </span>

      </div>

      <div className="evaluator-list">
        {children}
      </div>

    </section>
  )
}

function EvaluatorRow({
  evaluator,
  number,
  onAction,
  disabled = false,
}) {
  const actionDisabled =
    disabled ||
    evaluator.sent ||
    evaluator.responded

  return (
    <div className="evaluator-row">

      <div className="evaluator-number">
        {number}
      </div>

      <div className="evaluator-identity">

        <strong>
          {evaluator.name}
        </strong>

        <span>
          {evaluator.email}
        </span>

        <small>
          {evaluator.role}
        </small>

      </div>

      <div className="evaluator-token">

        <span>
          Token
        </span>

        <strong>
          {evaluator.token}
        </strong>

      </div>

      <div className="evaluator-delivery">

        <span>
          Status Form
        </span>

        <strong
          className={
            evaluator.sent
              ? 'sent'
              : 'not-sent'
          }
        >
          {evaluator.sent
            ? '✓ Terkirim'
            : 'Belum Dikirim'}
        </strong>

      </div>

      <div className="evaluator-response">

        <span>
          Respon
        </span>

        <strong
          className={
            evaluator.responded
              ? 'responded'
              : 'waiting'
          }
        >
          {evaluator.responded
            ? '✓ Sudah Mengisi'
            : evaluator.sent
              ? 'Menunggu Respon'
              : '-'}
        </strong>

      </div>

      <div className="evaluator-token-status">

        <span>
          Status Token
        </span>

        <strong
          className={
            evaluator.responded
              ? 'used'
              : evaluator.sent
                ? 'unused'
                : 'none'
          }
        >
          {evaluator.responded
            ? 'Sudah Digunakan'
            : evaluator.sent
              ? 'Belum Digunakan'
              : 'Belum Dibuat'}
        </strong>

      </div>

      <button
        type="button"
        className="evaluator-action"
        disabled={actionDisabled}
        onClick={onAction}
      >
        {evaluator.responded
          ? 'Selesai'
          : evaluator.sent
            ? 'Menunggu Respon'
            : disabled
              ? 'Belum Tersedia'
              : 'Kirim Form'}
      </button>

    </div>
  )
}

export default DetailPraditaValue
