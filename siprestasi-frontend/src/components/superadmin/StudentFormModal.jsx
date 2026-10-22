import './StudentFormModal.css'


function StudentFormModal({
  mode = 'add',
  formData,
  setFormData,
  onClose,
  onSave,
}) {
  const isValid =
    formData.name.trim() &&
    formData.nim.trim()


  return (
    <div className="student-form-overlay">

      <div className="student-form-modal">

        {/* HEADER */}

        <div className="student-form-header">

          <div>

            <h2>
              {mode === 'add'
                ? 'Tambah Mahasiswa'
                : 'Edit Mahasiswa'}
            </h2>

            <p>
              {mode === 'add'
                ? 'Tambahkan data mahasiswa baru ke SIPRESTASI.'
                : 'Perbarui data mahasiswa yang terdaftar.'}
            </p>

          </div>


          <button
            type="button"
            className="student-form-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        {/* FORM */}

        <div className="student-form-fields">

          <label>

            <span>
              Nama Lengkap
            </span>

            <input
              type="text"
              placeholder="Masukkan nama mahasiswa"
              value={formData.name}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  name: event.target.value,
                })
              }
            />

          </label>


          <label>

            <span>
              NIM
            </span>

            <input
              type="text"
              placeholder="Masukkan NIM"
              value={formData.nim}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  nim: event.target.value,
                })
              }
            />

          </label>


         <label>

            <span>
                Program Studi
            </span>

            <input
                type="text"
                value="S1 Sistem Informasi"
                disabled
            />

        </label>


          <label>

            <span>
              Angkatan
            </span>

            <select
              value={formData.angkatan}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  angkatan: event.target.value,
                })
              }
            >
              <option>2024</option>
              <option>2025</option>
              <option>2026</option>
            </select>

          </label>

        </div>


        {/* ACTION */}

        <div className="student-form-actions">

          <button
            type="button"
            className="student-form-cancel"
            onClick={onClose}
          >
            Batal
          </button>


          <button
            type="button"
            className="student-form-save"
            disabled={!isValid}
            onClick={onSave}
          >
            {mode === 'add'
              ? 'Tambah Mahasiswa'
              : 'Simpan Perubahan'}
          </button>

        </div>

      </div>

    </div>
  )
}


export default StudentFormModal