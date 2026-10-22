import './StudentDetailModal.css'


function StudentDetailModal({
  student,
  onClose,
  onEdit,
}) {
  if (!student) {
    return null
  }


  return (
    <div className="student-detail-overlay">

      <div className="student-detail-modal">

        {/* HEADER */}

        <div className="student-detail-header">

          <div>

            <h2>
              Detail Mahasiswa
            </h2>

            <p>
              Informasi mahasiswa yang terdaftar pada SIPRESTASI.
            </p>

          </div>


          <button
            type="button"
            className="student-detail-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        {/* PROFILE */}

        <div className="student-detail-profile">

          <div className="student-detail-avatar">
            {student.initials}
          </div>


          <div>

            <strong>
              {student.name}
            </strong>

            <span>
              {student.nim}
            </span>

          </div>

        </div>


        {/* DATA */}

        <div className="student-detail-information">

          <DetailRow
            label="Nama Lengkap"
            value={student.name}
          />

          <DetailRow
            label="NIM"
            value={student.nim}
          />

          <DetailRow
            label="Program Studi"
            value={student.prodi}
          />

          <DetailRow
            label="Angkatan"
            value={student.angkatan}
          />

          <DetailRow
            label="Status"
            value={
              <span className="student-detail-status">
                <span />
                {student.status}
              </span>
            }
          />

        </div>


        {/* ACTION */}

        <div className="student-detail-actions">

          <button
            type="button"
            className="student-detail-cancel"
            onClick={onClose}
          >
            Tutup
          </button>


          <button
            type="button"
            className="student-detail-edit"
            onClick={() => onEdit(student)}
          >
            Edit Data
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
    <div className="student-detail-row">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  )
}


export default StudentDetailModal