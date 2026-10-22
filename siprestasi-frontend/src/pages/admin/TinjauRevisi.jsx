import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Navbar from '../../components/admin/Navbar'
import ActionModal from '../../components/admin/ActionModal'
import DocumentModal from '../../components/admin/DocumentModal'
import {
  fetchSubmissionDetail,
  updateSubmissionStatus,
  updateDocumentVerification,
} from '../../data/admin'

import './VerifikasiPengajuan.css'

function TinjauRevisi() {
  const navigate = useNavigate()
  const { nim } = useParams()

  const [modalType, setModalType] = useState(null)
  const [revisionNote, setRevisionNote] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    if (!nim) return
    let cancelled = false
    fetchSubmissionDetail(nim)
      .then((res) => {
        if (!cancelled && res?.data) setDetail(res.data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [nim])

  const student = {
    subId: detail?.sub_id,
    name: detail?.name || '',
    nim: detail?.nim || nim || '',
    prodi: detail?.prodi || 'S1 Informatika',
    angkatan: detail?.angkatan ? String(detail.angkatan) : '',
    periode: detail?.periode || '',
    initials: detail?.initials || (detail?.name ? detail.name.charAt(0) : ''),
    ipk: detail?.score?.ipk ? Number(detail.score.ipk).toFixed(2) : '0.00',
    prestasi: {
      nama:
        detail?.documents?.prestasi?.pres_name ||
        detail?.form_data?.prestasi_nama ||
        '-',
      tingkat:
        detail?.documents?.prestasi?.pres_level ||
        detail?.form_data?.prestasi_tingkat ||
        '-',
      tahun:
        detail?.documents?.prestasi?.pres_year ||
        detail?.form_data?.prestasi_tahun ||
        '-',
      instansi:
        detail?.documents?.prestasi?.pres_instansi ||
        detail?.form_data?.prestasi_instansi ||
        '-',
      fileName:
        detail?.documents?.prestasi?.pres_file || '',
      fileSize: detail?.documents?.prestasi?.pres_file ? 'Dokumen Terlampir' : '-',
      fileUrl: detail?.documents?.prestasi?.file_url,
    },
    organisasi: {
      nama:
        detail?.documents?.organisasi?.org_name ||
        detail?.form_data?.organisasi_nama ||
        '-',
      tingkat:
        detail?.documents?.organisasi?.org_level ||
        detail?.form_data?.organisasi_tingkat ||
        '-',
      jabatan:
        detail?.documents?.organisasi?.org_position ||
        detail?.form_data?.organisasi_jabatan ||
        '-',
      periode:
        detail?.documents?.organisasi?.org_period ||
        detail?.form_data?.organisasi_periode ||
        '-',
      fileName:
        detail?.documents?.organisasi?.org_file || '',
      fileSize: detail?.documents?.organisasi?.org_file ? 'Dokumen Terlampir' : '-',
      fileUrl: detail?.documents?.organisasi?.file_url,
    },
    bahasa: {
      jenis:
        detail?.documents?.bahasa?.bah_type ||
        detail?.form_data?.bahasa_jenis ||
        '-',
      skor:
        detail?.documents?.bahasa?.bah_score ||
        detail?.form_data?.bahasa_skor ||
        '-',
      instansi:
        detail?.documents?.bahasa?.bah_instansi ||
        detail?.form_data?.bahasa_instansi ||
        '-',
      masaBerlaku:
        detail?.documents?.bahasa?.bah_valid_until ||
        detail?.form_data?.bahasa_masa_berlaku ||
        '-',
      fileName:
        detail?.documents?.bahasa?.bah_file || '',
      fileSize: detail?.documents?.bahasa?.bah_file ? 'Dokumen Terlampir' : '-',
      fileUrl: detail?.documents?.bahasa?.file_url,
    },
    scoreTahap1: detail?.score?.total_score
      ? Number(detail.score.total_score).toFixed(2)
      : '0.00',
  }

  const handleConfirmAction = async () => {
    if (modalType === 'approve') {
      try {
        if (student.subId) {
          await Promise.allSettled([
            updateDocumentVerification(student.subId, 'prestasi', { status: 'verified' }),
            updateDocumentVerification(student.subId, 'organisasi', { status: 'verified' }),
            updateDocumentVerification(student.subId, 'bahasa', { status: 'verified' }),
            updateSubmissionStatus(student.subId, { status: 'top3' }),
          ])
        }
      } catch {
        // fallback
      }
      setResultMessage(
        'Revisi berhasil disetujui dan pengajuan dinyatakan lolos verifikasi Tahap 1.'
      )
    }

    if (modalType === 'revision-again') {
      try {
        if (student.subId) {
          await updateDocumentVerification(student.subId, 'prestasi', {
            status: 'revisi',
            catatan: revisionNote || 'Periksa kembali kelengkapan dokumen pengajuan.',
          })
        }
      } catch {
        // fallback
      }
      setResultMessage(
        'Permintaan revisi lanjutan berhasil dikirim kepada mahasiswa.'
      )
    }

    setModalType(null)
    setRevisionNote('')
  }

  const handleViewDocument = (fileName, fileSize) => {
    setSelectedDocument({
      fileName,
      fileSize,
    })
  }

  return (
    <div className="verification-page">

      <Navbar variant="light" />

      <main className="verification-content">

        {/* BACK */}
        <button
          type="button"
          className="verification-back"
          onClick={() =>
            navigate('/admin/daftar-mapres')
          }
        >
          ←
          <span>
            Kembali ke Daftar Mapres
          </span>
        </button>

        {/* HEADING */}
        <section className="verification-heading">

          <h1>
            Tinjau Revisi Pengajuan
          </h1>

          <p>
            Periksa kembali data dan dokumen yang telah diperbaiki
            oleh mahasiswa.
          </p>

        </section>

        {/* IDENTITAS */}
        <section className="student-summary-card">

          <div className="student-summary-left">

            <div className="verification-avatar">
              {student.initials}
            </div>

            <div>

              <h2>
                {student.name}
              </h2>

              <div className="student-summary-meta">

                <strong>
                  NIM {student.nim}
                </strong>

                <span>•</span>

                <span>
                  Program Studi: {student.prodi}
                </span>

                <span>•</span>

                <span>
                  Angkatan: {student.angkatan}
                </span>

                <span>•</span>

                <span>
                  Periode Seleksi: {student.periode}
                </span>

              </div>

            </div>

          </div>

          <span
            className="verification-status"
            style={{
              background: '#FFF4EA',
              color: '#B46000',
              border: '1px solid #F1C894',
            }}
          >
            ↻ Revisi Dikirim Ulang
          </span>

        </section>

        {/* CATATAN REVISI */}
        <section className="verification-section revision-note-section">

          <div className="verification-section-header">

            <h3>
              ✎ Catatan Revisi Sebelumnya
            </h3>

            <span>
              DIKIRIM ADMIN
            </span>

          </div>

          <div className="revision-note-box">

            <div className="revision-note-copy">

              <span className="revision-note-label">
                Catatan untuk mahasiswa
              </span>

              <p>
                Mohon unggah kembali bukti organisasi dengan dokumen
                yang lebih jelas dan pastikan nama organisasi serta
                jabatan dapat terbaca.
              </p>

            </div>

            <div className="revision-note-meta">

              <span>
                Dikirim: 17 Februari 2026
              </span>

              <strong>
                ✓ Revisi telah dikirim ulang
              </strong>

            </div>

          </div>

        </section>

        {/* DATA MAHASISWA */}
        <RevisionSection
          title="♙ Data Mahasiswa"
          rightLabel="TERINTEGRASI PDDIKTI / SIA"
        >

          <div className="verification-grid three-columns">

            <InfoBox
              label="Nama Lengkap"
              value={student.name}
            />

            <InfoBox
              label="Nomor Induk Mahasiswa (NIM)"
              value={student.nim}
            />

            <InfoBox
              label="Tahun Angkatan"
              value={student.angkatan}
            />

            <InfoBox
              label="Program Studi"
              value={student.prodi}
            />

            <InfoBox
              label="Indeks Prestasi Kumulatif (IPK)"
              value={
                <>
                  <span className="highlight-value">
                    {student.ipk}
                  </span>

                  <span className="muted-value">
                    {' '} / 4.00
                  </span>
                </>
              }
              tag="Data otomatis"
            />

            <InfoBox
              label="Status SKPI"
              value={
                <span className="available-value">
                  ✓ Tersedia
                </span>
              }
              tag="Data otomatis"
            />

          </div>

        </RevisionSection>

        {/* PRESTASI */}
        <RevisionSection
          title="♕ Prestasi Terbaik"
        >

          <div className="verification-grid four-columns">

            <InfoBox
              label="Nama Prestasi"
              value={student.prestasi.nama}
            />

            <InfoBox
              label="Tingkat Prestasi"
              value={student.prestasi.tingkat}
            />

            <InfoBox
              label="Tahun Perolehan"
              value={student.prestasi.tahun}
            />

            <InfoBox
              label="Instansi Penyelenggara"
              value={student.prestasi.instansi}
            />

          </div>

          <DocumentRow
            fileName={student.prestasi.fileName}
            fileSize={student.prestasi.fileSize}
            onView={handleViewDocument}
          />

        </RevisionSection>

        {/* ORGANISASI */}
        <RevisionSection
          title="♣ Organisasi"
        >

          <div className="verification-grid four-columns">

            <InfoBox
              label="Nama Organisasi"
              value={student.organisasi.nama}
            />

            <InfoBox
              label="Tingkat Organisasi"
              value={student.organisasi.tingkat}
            />

            <InfoBox
              label="Jabatan / Peran"
              value={student.organisasi.jabatan}
            />

            <InfoBox
              label="Periode Keaktifan"
              value={student.organisasi.periode}
            />

          </div>

          <div className="revision-document-label">
            Dokumen hasil revisi
          </div>

          <DocumentRow
            fileName={student.organisasi.fileName}
            fileSize={student.organisasi.fileSize}
            onView={handleViewDocument}
          />

        </RevisionSection>

        {/* BAHASA ASING */}
        <RevisionSection
          title="文 Bahasa Asing"
        >

          <div className="verification-grid three-columns">

            <InfoBox
              label="Bahasa"
              value="Bahasa Inggris"
            />

            <InfoBox
              label="Jenis Sertifikat"
              value={student.bahasa.jenis}
            />

            <InfoBox
              label="Skor / Level"
              value={
                <span className="highlight-value">
                  {student.bahasa.skor}
                </span>
              }
            />

            <InfoBox
              label="Tanggal Tes"
              value="22 Januari 2026"
            />

            <InfoBox
              label="Lembaga Penerbit"
              value={student.bahasa.instansi}
            />

            <InfoBox
              label="Masa Berlaku Hingga"
              value={student.bahasa.masaBerlaku}
            />

          </div>

          <DocumentRow
            fileName={student.bahasa.fileName}
            fileSize={student.bahasa.fileSize}
            onView={handleViewDocument}
          />

        </RevisionSection>

        {/* RINGKASAN */}
        <RevisionSection
          title="☑ Ringkasan Verifikasi"
        >

          <div className="verification-summary">

            <div className="verification-checks">

              <VerificationCheck
                label="Data Mahasiswa"
              />

              <VerificationCheck
                label="Prestasi Terbaik"
              />

              <VerificationCheck
                label="Organisasi"
              />

              <VerificationCheck
                label="Bahasa Asing"
              />

            </div>

            <div className="score-summary">

              <span>
                Nilai Tahap 1:
              </span>

              <strong>
                {student.scoreTahap1}
              </strong>

              <small>
                Dihitung otomatis berdasarkan data pengajuan.
              </small>

            </div>

          </div>

        </RevisionSection>

        {/* SUCCESS */}
        {resultMessage && (
          <div className="verification-success-message">

            <span>
              ✓
            </span>

            {resultMessage}

          </div>
        )}

        {/* KEPUTUSAN */}
        <section className="verification-decision">

          <div>

            <h3>
              Keputusan Tinjau Revisi
            </h3>

            <p>
              Tentukan hasil setelah memeriksa dokumen revisi
              mahasiswa.
            </p>

          </div>

          <div className="decision-actions">

            <button
              type="button"
              className="decision-button revise"
              onClick={() => {
                setResultMessage('')
                setModalType('revision-again')
              }}
            >
              ✎ Minta Revisi Lagi
            </button>

            <button
              type="button"
              className="decision-button approve"
              onClick={() => {
                setResultMessage('')
                setModalType('approve')
              }}
            >
              ✓ Setujui Pengajuan
            </button>

          </div>

        </section>

      </main>

      <footer className="verification-footer">
        © SIPRESTASI - Sistem Seleksi Mahasiswa
        Berprestasi Universitas.
      </footer>

      {/* ACTION MODAL */}
      <ActionModal
        open={modalType !== null}
        type={modalType}
        studentName={student.name}
        revisionNote={revisionNote}
        setRevisionNote={setRevisionNote}
        onClose={() => {
          setModalType(null)
          setRevisionNote('')
        }}
        onConfirm={handleConfirmAction}
      />

      {/* DOCUMENT MODAL */}
      <DocumentModal
        open={selectedDocument !== null}
        fileName={
          selectedDocument?.fileName || ''
        }
        fileSize={
          selectedDocument?.fileSize || ''
        }
        onClose={() =>
          setSelectedDocument(null)
        }
      />

    </div>
  )
}

/* =========================
   SECTION
========================= */

function RevisionSection({
  title,
  rightLabel,
  children,
}) {
  return (
    <section className="verification-section">

      <div className="verification-section-header">

        <h3>
          {title}
        </h3>

        {rightLabel && (
          <span>
            {rightLabel}
          </span>
        )}

      </div>

      {children}

    </section>
  )
}

/* =========================
   INFO BOX
========================= */

function InfoBox({
  label,
  value,
  tag,
}) {
  return (
    <div className="verification-info-box">

      <span className="verification-info-label">
        {label}
      </span>

      <div className="verification-info-value-row">

        <strong>
          {value}
        </strong>

        {tag && (
          <span className="auto-data-tag">
            {tag}
          </span>
        )}

      </div>

    </div>
  )
}

/* =========================
   DOCUMENT
========================= */

function DocumentRow({
  fileName,
  fileSize,
  onView,
}) {
  return (
    <div className="document-row">

      <div className="document-left">

        <div className="document-icon">
          ▣
        </div>

        <div>

          <strong>
            {fileName}
          </strong>

          <div className="document-meta">

            <span>
              {fileSize}
            </span>

            <span>
              •
            </span>

            <span className="document-available">
              ● Dokumen Tersedia
            </span>

          </div>

        </div>

      </div>

      <button
        type="button"
        className="view-document-button"
        onClick={() =>
          onView(fileName, fileSize)
        }
      >
        ◉ Lihat Dokumen
      </button>

    </div>
  )
}

/* =========================
   CHECK
========================= */

function VerificationCheck({
  label,
}) {
  return (
    <div className="verification-check">

      <span>
        ✓
      </span>

      <p>
        {label}:{' '}

        <strong>
          Terverifikasi
        </strong>
      </p>

    </div>
  )
}

export default TinjauRevisi
