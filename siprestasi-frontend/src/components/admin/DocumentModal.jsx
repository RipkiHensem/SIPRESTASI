import './DocumentModal.css'

function DocumentModal({
  open,
  fileName,
  fileSize,
  onClose,
}) {
  if (!open) return null

  return (
    <div className="document-modal-overlay">
      <div className="document-modal">

        <div className="document-modal-header">
          <div>
            <h2>Preview Dokumen</h2>

            <p>
              Periksa dokumen sebelum melanjutkan proses verifikasi.
            </p>
          </div>

          <button
            type="button"
            className="document-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="document-preview">

          <div className="document-preview-icon">
            PDF
          </div>

          <strong>{fileName}</strong>

          <span>{fileSize}</span>

          <p>
            Preview dokumen akan ditampilkan dari file mahasiswa
            setelah data backend terhubung.
          </p>

        </div>

        <div className="document-modal-info">
          <span>✓</span>

          <div>
            <strong>Dokumen tersedia</strong>

            <p>
              File berhasil diunggah oleh mahasiswa dan siap
              diperiksa.
            </p>
          </div>
        </div>

        <div className="document-modal-actions">

          <button
            type="button"
            className="document-close-button"
            onClick={onClose}
          >
            Tutup
          </button>

          <button
            type="button"
            className="document-open-button"
          >
            Buka Dokumen
          </button>

        </div>

      </div>
    </div>
  )
}

export default DocumentModal