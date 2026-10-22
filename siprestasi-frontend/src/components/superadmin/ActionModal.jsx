import './ActionModal.css'

function ActionModal({
  open,
  type,
  studentName,
  revisionNote,
  setRevisionNote,
  onClose,
  onConfirm,
}) {
  if (!open) return null

  const isApprove = type === 'approve'
  const isRevision = type === 'revision'
  const isRevisionAgain = type === 'revision-again'

  return (
    <div className="action-modal-overlay">
      <div className="action-modal">

        <div className={`action-modal-icon ${type}`}>
          {isApprove ? '✓' : '✎'}
        </div>

        <h2>
          {isApprove
            ? 'Setujui Pengajuan?'
            : isRevisionAgain
              ? 'Minta Revisi Lagi?'
              : 'Minta Revisi?'}
        </h2>

        {isApprove && (
          <p className="action-modal-description">
            Pengajuan <strong>{studentName}</strong> akan
            dinyatakan lolos verifikasi Tahap 1 dan dapat
            diproses ke tahap pemeringkatan.
          </p>
        )}

        {(isRevision || isRevisionAgain) && (
          <>
            <p className="action-modal-description">
              Berikan catatan yang jelas agar mahasiswa mengetahui
              data atau dokumen yang harus diperbaiki.
            </p>

            <div className="revision-input-group">
              <label>Catatan Revisi</label>

              <textarea
                placeholder="Contoh: Mohon unggah kembali sertifikat organisasi dengan dokumen yang lebih jelas..."
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
              />

              <span>
                Catatan ini akan ditampilkan kepada mahasiswa.
              </span>
            </div>
          </>
        )}

        {isApprove && (
          <div className="approve-info">
            <span>i</span>

            <p>
              Setelah disetujui, status pengajuan akan berubah
              menjadi <strong>Disetujui</strong>.
            </p>
          </div>
        )}

        <div className="action-modal-buttons">
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
          >
            Batal
          </button>

          <button
            type="button"
            className={
              isApprove
                ? 'modal-confirm approve'
                : 'modal-confirm revision'
            }
            disabled={
              !isApprove && !revisionNote.trim()
            }
            onClick={onConfirm}
          >
            {isApprove
              ? '✓ Ya, Setujui Pengajuan'
              : 'Kirim Permintaan Revisi'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default ActionModal