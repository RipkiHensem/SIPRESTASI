import './ContentDetailModal.css'


function ContentDetailModal({
  content,
  onClose,
  onEdit,
}) {
  if (!content) {
    return null
  }


  return (
    <div className="content-detail-overlay">

      <div className="content-detail-modal">

        {/* HEADER */}

        <div className="content-detail-header">

          <div>
            <h2>Detail Konten</h2>

            <p>
              Informasi lengkap konten SIPRESTASI.
            </p>
          </div>


          <button
            type="button"
            className="content-detail-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        {/* CONTENT */}

        <div className="content-detail-title-box">

          <span>
            {content.type}
          </span>

          <strong>
            {content.title}
          </strong>

        </div>


        <div className="content-detail-information">

          <DetailRow
            label="Judul"
            value={content.title}
          />

          <DetailRow
            label="Jenis Konten"
            value={content.type}
          />

          <DetailRow
            label="Deskripsi"
            value={content.description}
          />

          <DetailRow
            label="Status"
            value={
              <span
                className={`content-detail-status ${
                  content.status === 'Aktif'
                    ? 'active'
                    : 'inactive'
                }`}
              >
                <span />

                {content.status}
              </span>
            }
          />

        </div>


        {/* ACTION */}

        <div className="content-detail-actions">

          <button
            type="button"
            className="content-detail-cancel"
            onClick={onClose}
          >
            Tutup
          </button>


          <button
            type="button"
            className="content-detail-edit"
            onClick={() =>
              onEdit(content)
            }
          >
            Edit Konten
          </button>

        </div>

      </div>

    </div>
  )
}


function DetailRow({
  label,
  value,
}) {
  return (
    <div className="content-detail-row">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  )
}


export default ContentDetailModal