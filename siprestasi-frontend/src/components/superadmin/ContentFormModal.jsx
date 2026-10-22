import './ContentFormModal.css'


function ContentFormModal({
  mode = 'add',
  formData,
  setFormData,
  onClose,
  onSave,
}) {
  const isValid =
    formData.title.trim() &&
    formData.description.trim()


  return (
    <div className="content-form-overlay">

      <div className="content-form-modal">

        {/* HEADER */}

        <div className="content-form-header">

          <div>
            <h2>
              {mode === 'add'
                ? 'Tambah Konten'
                : 'Edit Konten'}
            </h2>

            <p>
              {mode === 'add'
                ? 'Tambahkan konten baru ke SIPRESTASI.'
                : 'Perbarui informasi konten SIPRESTASI.'}
            </p>
          </div>


          <button
            type="button"
            className="content-form-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        {/* FORM */}

        <div className="content-form-fields">

          <label>
            <span>Judul Konten</span>

            <input
              type="text"
              placeholder="Masukkan judul konten"
              value={formData.title}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  title: event.target.value,
                })
              }
            />
          </label>


          <label>
            <span>Jenis Konten</span>

            <select
              value={formData.type}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  type: event.target.value,
                })
              }
            >
              <option>Informasi</option>
              <option>Pengumuman</option>
              <option>Panduan</option>
            </select>
          </label>


          <label>
            <span>Deskripsi</span>

            <textarea
              placeholder="Masukkan deskripsi konten"
              value={formData.description}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  description: event.target.value,
                })
              }
            />
          </label>


          <label>
            <span>Status</span>

            <select
              value={formData.status}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  status: event.target.value,
                })
              }
            >
              <option>Aktif</option>
              <option>Draft</option>
            </select>
          </label>

        </div>


        {/* ACTION */}

        <div className="content-form-actions">

          <button
            type="button"
            className="content-form-cancel"
            onClick={onClose}
          >
            Batal
          </button>


          <button
            type="button"
            className="content-form-save"
            disabled={!isValid}
            onClick={onSave}
          >
            {mode === 'add'
              ? 'Tambah Konten'
              : 'Simpan Perubahan'}
          </button>

        </div>

      </div>

    </div>
  )
}


export default ContentFormModal