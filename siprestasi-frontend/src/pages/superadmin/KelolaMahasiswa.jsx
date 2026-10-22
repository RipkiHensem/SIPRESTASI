import { useEffect, useMemo, useState } from 'react'

import SuperadminNavbar from '../../components/superadmin/SuperadminNavbar'
import SuperadminHeader from '../../components/superadmin/SuperadminHeader'
import { fetchUsers } from '../../data/superadmin'

import StudentFormModal from '../../components/superadmin/StudentFormModal'
import StudentDetailModal from '../../components/superadmin/StudentDetailModal'

import './KelolaMahasiswa.css'


function KelolaMahasiswa() {
  const [students, setStudents] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchUsers({ role: 'mahasiswa', per_page: 100 })
      .then((res) => {
        if (!cancelled && res?.data) {
          const mapped = res.data.map((u) => {
            const initials = u.name
              ? u.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((word) => word.charAt(0))
                  .join('')
                  .toUpperCase()
              : 'M'
            return {
              id: u.user_id || u.id,
              initials: initials || 'M',
              name: u.name,
              nim: u.nim || (u.email ? u.email.split('@')[0] : ''),
              prodi: u.prodi || 'S1 Sistem Informasi',
              angkatan: String(u.year || u.angkatan || ''),
              status: u.is_active === false ? 'Nonaktif' : 'Aktif',
            }
          })
          setStudents(mapped)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // --- stats dihitung dari data backend ---
  const totalStudents = students.length
  const countByYear = (yr) => students.filter(s => s.angkatan === String(yr)).length

  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('Semua Angkatan')

  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const [formMode, setFormMode] = useState('add')
  const [selectedStudent, setSelectedStudent] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    prodi: 'S1 Sistem Informasi',
    angkatan: '2024',
  })


  const filteredStudents = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(keyword) ||
        student.nim.toLowerCase().includes(keyword)

      const matchYear =
        yearFilter === 'Semua Angkatan' ||
        student.angkatan === yearFilter

      return matchSearch && matchYear
    })
  }, [
    students,
    search,
    yearFilter,
  ])


  const createInitials = (name) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
  }


  const resetFilter = () => {
    setSearch('')
    setYearFilter('Semua Angkatan')
  }


  /* =========================
     ADD
  ========================= */

  const openAddModal = () => {
    setFormMode('add')
    setSelectedStudent(null)

    setFormData({
      name: '',
      nim: '',
      prodi: 'S1 Sistem Informasi',
      angkatan: '2024',
    })

    setShowFormModal(true)
  }


  /* =========================
     EDIT
  ========================= */

  const openEditModal = (student) => {
    setFormMode('edit')
    setSelectedStudent(student)

    setFormData({
      name: student.name,
      nim: student.nim,
      prodi: student.prodi,
      angkatan: student.angkatan,
    })

    setShowDetailModal(false)
    setShowFormModal(true)
  }


  /* =========================
     DETAIL
  ========================= */

  const openDetailModal = (student) => {
    setSelectedStudent(student)
    setShowDetailModal(true)
  }


  /* =========================
     SAVE
  ========================= */

  const handleSaveStudent = () => {
    if (
      !formData.name.trim() ||
      !formData.nim.trim()
    ) {
      return
    }


    if (formMode === 'add') {
      const newStudent = {
        id: Date.now(),
        initials: createInitials(formData.name),
        name: formData.name.trim(),
        nim: formData.nim.trim(),
        prodi: formData.prodi,
        angkatan: formData.angkatan,
        status: 'Aktif',
      }

      setStudents((current) => [
        ...current,
        newStudent,
      ])
    }


    if (
      formMode === 'edit' &&
      selectedStudent
    ) {
      setStudents((current) =>
        current.map((student) =>
          student.id === selectedStudent.id
            ? {
                ...student,
                initials: createInitials(formData.name),
                name: formData.name.trim(),
                nim: formData.nim.trim(),
                prodi: formData.prodi,
                angkatan: formData.angkatan,
              }
            : student
        )
      )
    }


    setShowFormModal(false)
    setSelectedStudent(null)
  }


  return (
    <div className="manage-students-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="admin-top-section">

        <SuperadminNavbar />

        <SuperadminHeader
          title="Kelola Mahasiswa"
          description="Kelola data mahasiswa yang terdaftar pada SIPRESTASI."
          metaStage="Data Mahasiswa"
          metaInfo={`${totalStudents} mahasiswa terdaftar`}
          actionLabel="Tambah Mahasiswa"
          onActionClick={openAddModal}
        />

      </div>


      {/* =========================
          CONTENT
      ========================= */}

      <main className="manage-students-content">

        {/* SUMMARY */}

        <section className="manage-students-summary-grid">

          <SummaryCard
            title="Total Mahasiswa"
            value={totalStudents}
            description="Seluruh mahasiswa terdaftar"
            icon={<StudentIcon />}
          />

          <SummaryCard
            title="Angkatan 2024"
            value={countByYear(2024)}
            description="Mahasiswa aktif"
            icon={<CohortIcon />}
          />

          <SummaryCard
            title="Angkatan 2025"
            value={countByYear(2025)}
            description="Mahasiswa aktif"
            icon={<CohortIcon />}
          />

          <SummaryCard
            title="Angkatan 2026"
            value={countByYear(2026)}
            description="Mahasiswa aktif"
            icon={<CohortIcon />}
          />

        </section>


        {/* =========================
            TABLE SECTION
        ========================= */}

        <section className="manage-students-section">

          <div className="manage-students-section-heading">

            <div>

              <h2>
                Daftar Mahasiswa
              </h2>

              <p>
                Cari dan kelola data mahasiswa SIPRESTASI.
              </p>

            </div>


            <span className="manage-students-count">
              {filteredStudents.length} Data
            </span>

          </div>


          {/* FILTER */}

          <div className="manage-students-filter">

            <div className="manage-students-search">

              <SearchIcon />

              <input
                type="text"
                placeholder="Cari nama atau NIM..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>


            <select
              value={yearFilter}
              onChange={(event) =>
                setYearFilter(event.target.value)
              }
            >
              <option>Semua Angkatan</option>
              <option>2024</option>
              <option>2025</option>
              <option>2026</option>
            </select>

            <button
              type="button"
              className="manage-students-reset"
              onClick={resetFilter}
            >
              Reset Filter
            </button>

          </div>


          {/* TABLE */}

          <div className="manage-students-table-wrapper">

            <table className="manage-students-table">

              <thead>
                <tr>
                  <th>MAHASISWA</th>
                  <th>NIM</th>
                  <th>PROGRAM STUDI</th>
                  <th>ANGKATAN</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>


              <tbody>

                {filteredStudents.map((student) => (
                  <tr key={student.id}>

                    <td>

                      <div className="manage-students-user">

                        <div className="manage-students-avatar">
                          {student.initials}
                        </div>

                        <strong>
                          {student.name}
                        </strong>

                      </div>

                    </td>


                    <td>
                      {student.nim}
                    </td>


                    <td>
                      {student.prodi}
                    </td>


                    <td>
                      {student.angkatan}
                    </td>


                    <td>

                      <span className="manage-students-status">

                        <span />

                        {student.status}

                      </span>

                    </td>


                    <td>

                      <div className="manage-students-actions">

                        <button
                          type="button"
                          className="manage-students-detail-button"
                          onClick={() =>
                            openDetailModal(student)
                          }
                        >
                          Lihat Detail
                        </button>


                        <button
                          type="button"
                          className="manage-students-edit-button"
                          onClick={() =>
                            openEditModal(student)
                          }
                        >
                          Edit
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}


                {filteredStudents.length === 0 && (
                  <tr>

                    <td
                      colSpan="6"
                      className="manage-students-empty"
                    >
                      Tidak ada mahasiswa yang sesuai dengan filter.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>


      {/* =========================
          FORM MODAL
      ========================= */}

      {showFormModal && (
        <StudentFormModal
          mode={formMode}
          formData={formData}
          setFormData={setFormData}
          onClose={() => {
            setShowFormModal(false)
            setSelectedStudent(null)
          }}
          onSave={handleSaveStudent}
        />
      )}


      {/* =========================
          DETAIL MODAL
      ========================= */}

      {showDetailModal && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedStudent(null)
          }}
          onEdit={openEditModal}
        />
      )}

    </div>
  )
}


/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <article className="manage-students-summary-card">

      <div>

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


      <div className="manage-students-summary-icon">
        {icon}
      </div>

    </article>
  )
}


/* =========================
   ICONS
========================= */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}


function StudentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 8 9-5 9 5-9 5-9-5Z" />
      <path d="M7 11v4c3 2 7 2 10 0v-4" />
      <path d="M21 8v6" />
    </svg>
  )
}


function CohortIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 8 4-8 4-8-4 8-4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="m4 17 8 4 8-4" />
    </svg>
  )
}


export default KelolaMahasiswa
