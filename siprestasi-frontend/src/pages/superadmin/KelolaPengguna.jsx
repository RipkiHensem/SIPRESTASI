import { useEffect, useMemo, useState } from 'react'

import SuperadminNavbar from '../../components/superadmin/SuperadminNavbar'
import SuperadminHeader from '../../components/superadmin/SuperadminHeader'
import {
  fetchUsers,
  createSuperadminUser,
  updateSuperadminUserRole,
  updateSuperadminUserStatus,
} from '../../data/superadmin'

import './KelolaPengguna.css'


function KelolaPengguna() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchUsers({ per_page: 100 })
      .then((res) => {
        if (!cancelled && res?.data) {
          const mapped = res.data.map((u) => {
            const roleLabel =
              u.role === 'superadmin'
                ? 'Superadmin'
                : u.role === 'admin'
                  ? 'Administrator'
                  : u.role === 'dosen'
                    ? 'Dosen'
                    : 'Mahasiswa'
            const initials = u.name
              ? u.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
              : 'U'
            return {
              id: u.user_id,
              initials: initials || 'U',
              name: u.name,
              email: u.email,
              role: roleLabel,
              status: u.is_active ? 'Aktif' : 'Nonaktif',
              lastActive: u.created_at
                ? new Date(u.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Belum pernah login',
              accountCode: null,
            }
          })
          setUsers(mapped)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] =
    useState('Semua Role')
  const [statusFilter, setStatusFilter] =
    useState('Semua Status')


  /* =========================
     USER FORM MODAL
  ========================= */

  const [showUserModal, setShowUserModal] =
    useState(false)

  const [modalMode, setModalMode] =
    useState('add')

  const [editingUser, setEditingUser] =
    useState(null)


  /* =========================
     STATUS MODAL
  ========================= */

  const [showConfirmModal, setShowConfirmModal] =
    useState(false)

  const [selectedUser, setSelectedUser] =
    useState(null)


  /* =========================
     ACCOUNT CODE MODAL
  ========================= */

  const [showCodeModal, setShowCodeModal] =
    useState(false)

  const [codeUser, setCodeUser] =
    useState(null)

  const [codeModalMode, setCodeModalMode] =
    useState('created')

  const [codeCopied, setCodeCopied] =
    useState(false)


  /* =========================
     FORM
  ========================= */

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Administrator',
  })


  /* =========================
     SUMMARY
  ========================= */

  const totalUsers = users.length


  const adminCount = users.filter(
    (user) => user.role === 'Administrator'
  ).length


  const activeCount = users.filter(
    (user) => user.status === 'Aktif'
  ).length


  const pendingCount = users.filter(
    (user) =>
      user.status === 'Menunggu Aktivasi'
  ).length


  /* =========================
     FILTER
  ========================= */

  const filteredUsers = useMemo(() => {
    const keyword =
      search.toLowerCase().trim()

    return users.filter((user) => {
      const matchSearch =
        user.name
          .toLowerCase()
          .includes(keyword) ||
        user.email
          .toLowerCase()
          .includes(keyword)


      const matchRole =
        roleFilter === 'Semua Role' ||
        user.role === roleFilter


      const matchStatus =
        statusFilter === 'Semua Status' ||
        user.status === statusFilter


      return (
        matchSearch &&
        matchRole &&
        matchStatus
      )
    })
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ])


  /* =========================
     ACCOUNT CODE
  ========================= */

  const generateAccountCode = (role) => {
    const prefix =
      role === 'Superadmin'
        ? 'SA'
        : 'ADM'

    const randomNumber =
      Math.floor(
        100000 +
        Math.random() * 900000
      )

    return `${prefix}-${randomNumber}`
  }


  const openCodeModal = (user) => {
    setCodeUser(user)
    setCodeModalMode('view')
    setCodeCopied(false)
    setShowCodeModal(true)
  }


  const closeCodeModal = () => {
    setShowCodeModal(false)
    setCodeUser(null)
    setCodeCopied(false)
  }


  const handleCopyCode = async () => {
    if (!codeUser?.accountCode) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        codeUser.accountCode
      )

      setCodeCopied(true)
    } catch {
      setCodeCopied(false)
    }
  }


  /* =========================
     ADD USER
  ========================= */

  const openAddModal = () => {
    setModalMode('add')
    setEditingUser(null)

    setFormData({
      name: '',
      email: '',
      role: 'Administrator',
    })

    setShowUserModal(true)
  }


  /* =========================
     EDIT USER
  ========================= */

  const openEditModal = (user) => {
    setModalMode('edit')
    setEditingUser(user)

    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    })

    setShowUserModal(true)
  }


  /* =========================
     SAVE USER
  ========================= */

  const handleSaveUser = async () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim()
    ) {
      return
    }


    /* ADD */

    if (modalMode === 'add') {
      const backendRole = formData.role === 'Superadmin' ? 'superadmin' : 'admin'
      const initials =
        formData.name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map(
            (word) =>
              word.charAt(0)
          )
          .join('')
          .toUpperCase()


      const accountCode =
        generateAccountCode(
          formData.role
        )


      try {
        await createSuperadminUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: backendRole,
        })
      } catch (err) {
        console.warn('createSuperadminUser API notice:', err)
      }

      const newUser = {
        id: Date.now(),

        initials,

        name:
          formData.name.trim(),

        email:
          formData.email.trim(),

        role:
          formData.role,

        status:
          'Menunggu Aktivasi',

        lastActive:
          'Belum pernah login',

        accountCode,
      }


      setUsers(
        (currentUsers) => [
          ...currentUsers,
          newUser,
        ]
      )


      setShowUserModal(false)

      setCodeUser(newUser)
      setCodeModalMode('created')
      setCodeCopied(false)
      setShowCodeModal(true)

      return
    }


    /* EDIT */

    if (
      modalMode === 'edit' &&
      editingUser
    ) {
      const backendRole = formData.role === 'Superadmin' ? 'superadmin' : 'admin'
      try {
        await updateSuperadminUserRole(editingUser.id, { role: backendRole })
      } catch (err) {
        console.warn('updateSuperadminUserRole API notice:', err)
      }

      setUsers(
        (currentUsers) =>
          currentUsers.map(
            (user) => {
              if (
                user.id !==
                editingUser.id
              ) {
                return user
              }


              const initials =
                formData.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map(
                    (word) =>
                      word.charAt(0)
                  )
                  .join('')
                  .toUpperCase()


              return {
                ...user,

                initials,

                name:
                  formData.name.trim(),

                email:
                  formData.email.trim(),

                role:
                  formData.role,
              }
            }
          )
      )
    }


    setShowUserModal(false)
    setEditingUser(null)
  }


  /* =========================
     STATUS
  ========================= */

  const openStatusConfirm = (
    user
  ) => {
    setSelectedUser(user)
    setShowConfirmModal(true)
  }


  const handleToggleStatus = async () => {
    if (!selectedUser) {
      return
    }


    /*
      Menunggu Aktivasi tidak
      diubah manual menjadi Aktif.
      Aktivasi dilakukan oleh
      pengguna melalui Login.
    */

    if (
      selectedUser.status ===
      'Menunggu Aktivasi'
    ) {
      return
    }

    const nextIsActive = selectedUser.status !== 'Aktif'
    try {
      await updateSuperadminUserStatus(selectedUser.id, nextIsActive)
    } catch (err) {
      console.warn('updateSuperadminUserStatus API notice:', err)
    }

    setUsers(
      (currentUsers) =>
        currentUsers.map(
          (user) =>
            user.id ===
            selectedUser.id

              ? {
                  ...user,

                  status:
                    user.status ===
                    'Aktif'
                      ? 'Nonaktif'
                      : 'Aktif',
                }

              : user
        )
    )


    setShowConfirmModal(false)
    setSelectedUser(null)
  }


  /* =========================
     RESET FILTER
  ========================= */

  const resetFilters = () => {
    setSearch('')
    setRoleFilter('Semua Role')
    setStatusFilter('Semua Status')
  }


  return (
    <div className="manage-users-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="admin-top-section">

        <SuperadminNavbar />

        <SuperadminHeader
          title="Kelola Pengguna"
          description="Kelola akun administrator dan hak akses pengguna SIPRESTASI."
          metaStage="Manajemen Akun"
          metaInfo={`${totalUsers} pengguna terdaftar`}
          actionLabel="Tambah Pengguna"
          onActionClick={
            openAddModal
          }
        />

      </div>


      {/* =========================
          CONTENT
      ========================= */}

      <main className="manage-users-content">

        {/* SUMMARY */}

        <section className="manage-users-summary-grid">

          <SummaryCard
            title="Total Pengguna"
            value={totalUsers}
            description="Seluruh akun terdaftar"
            icon={<UsersIcon />}
          />


          <SummaryCard
            title="Administrator"
            value={adminCount}
            description="Akun administrator"
            icon={<AdminIcon />}
          />


          <SummaryCard
            title="Akun Aktif"
            value={activeCount}
            description="Pengguna aktif"
            icon={<ActiveIcon />}
          />


          <SummaryCard
            title="Menunggu Aktivasi"
            value={pendingCount}
            description="Akun belum diaktifkan"
            icon={<PendingIcon />}
          />

        </section>


        {/* =========================
            USER SECTION
        ========================= */}

        <section className="manage-users-section">

          <div className="manage-users-section-heading">

            <div>

              <h2>
                Daftar Pengguna
              </h2>

              <p>
                Kelola akun dan akses administrator SIPRESTASI.
              </p>

            </div>


            <span className="manage-users-count">
              {filteredUsers.length} Pengguna
            </span>

          </div>


          {/* FILTER */}

          <div className="manage-users-filter">

            <div className="manage-users-search">

              <SearchIcon />

              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={
                  (event) =>
                    setSearch(
                      event.target.value
                    )
                }
              />

            </div>


            <select
              value={roleFilter}
              onChange={
                (event) =>
                  setRoleFilter(
                    event.target.value
                  )
              }
            >

              <option>
                Semua Role
              </option>

              <option>
                Administrator
              </option>

              <option>
                Superadmin
              </option>

            </select>


            <select
              value={statusFilter}
              onChange={
                (event) =>
                  setStatusFilter(
                    event.target.value
                  )
              }
            >

              <option>
                Semua Status
              </option>

              <option>
                Aktif
              </option>

              <option>
                Menunggu Aktivasi
              </option>

              <option>
                Nonaktif
              </option>

            </select>


            <button
              type="button"
              className="manage-users-reset"
              onClick={
                resetFilters
              }
            >
              Reset Filter
            </button>

          </div>


          {/* =========================
              TABLE
          ========================= */}

          <div className="manage-users-table-wrapper">

            <table className="manage-users-table">

              <thead>

                <tr>
                  <th>PENGGUNA</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>AKTIVITAS TERAKHIR</th>
                  <th>AKSI</th>
                </tr>

              </thead>


              <tbody>

                {filteredUsers.map(
                  (user) => {

                    const statusClass =
                      user.status === 'Aktif'
                        ? 'active'
                        : user.status ===
                            'Menunggu Aktivasi'
                          ? 'pending'
                          : 'inactive'


                    return (
                      <tr key={user.id}>

                        {/* USER */}

                        <td>

                          <div className="manage-users-user">

                            <div className="manage-users-avatar">
                              {user.initials}
                            </div>

                            <strong>
                              {user.name}
                            </strong>

                          </div>

                        </td>


                        {/* EMAIL */}

                        <td>
                          {user.email}
                        </td>


                        {/* ROLE */}

                        <td>

                          <span
                            className={
                              user.role ===
                              'Superadmin'

                                ? 'manage-users-role superadmin'

                                : 'manage-users-role'
                            }
                          >
                            {user.role}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`manage-users-status ${statusClass}`}
                          >

                            <span />

                            {user.status}

                          </span>

                        </td>


                        {/* LAST ACTIVE */}

                        <td>
                          {user.lastActive}
                        </td>


                        {/* ACTION */}

                        <td>

                          <div className="manage-users-actions">

                            <button
                              type="button"
                              className="manage-users-edit-button"
                              onClick={() =>
                                openEditModal(
                                  user
                                )
                              }
                            >
                              Edit
                            </button>


                            {/* PENDING */}

                            {user.status ===
                              'Menunggu Aktivasi' &&
                              user.accountCode && (

                              <button
                                type="button"
                                className="manage-users-code-button"
                                onClick={() =>
                                  openCodeModal(
                                    user
                                  )
                                }
                              >
                                Kode Akun
                              </button>

                            )}


                            {/* ACTIVE / INACTIVE */}

                            {user.role !==
                              'Superadmin' &&
                              user.status !==
                                'Menunggu Aktivasi' && (

                              <button
                                type="button"
                                className={
                                  user.status ===
                                  'Aktif'

                                    ? 'manage-users-status-button deactivate'

                                    : 'manage-users-status-button activate'
                                }
                                onClick={() =>
                                  openStatusConfirm(
                                    user
                                  )
                                }
                              >

                                {user.status ===
                                'Aktif'
                                  ? 'Nonaktifkan'
                                  : 'Aktifkan'}

                              </button>

                            )}

                          </div>

                        </td>

                      </tr>
                    )
                  }
                )}


                {filteredUsers.length === 0 && (

                  <tr>

                    <td
                      colSpan="6"
                      className="manage-users-empty"
                    >
                      Tidak ada pengguna yang sesuai dengan filter.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>


      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showUserModal && (

        <div className="manage-users-modal-overlay">

          <div className="manage-users-modal">

            <div className="manage-users-modal-header">

              <div>

                <h2>

                  {modalMode === 'add'
                    ? 'Tambah Pengguna'
                    : 'Edit Pengguna'}

                </h2>


                <p>

                  {modalMode === 'add'
                    ? 'Tambahkan akun baru ke SIPRESTASI.'
                    : 'Perbarui informasi dan role pengguna.'}

                </p>

              </div>


              <button
                type="button"
                className="manage-users-modal-close"
                onClick={() =>
                  setShowUserModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            <div className="manage-users-form">

              {/* NAME */}

              <label>

                <span>
                  Nama Lengkap
                </span>

                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={
                    formData.name
                  }
                  onChange={
                    (event) =>
                      setFormData({
                        ...formData,
                        name:
                          event.target
                            .value,
                      })
                  }
                />

              </label>


              {/* EMAIL */}

              <label>

                <span>
                  Email
                </span>

                <input
                  type="email"
                  placeholder="nama@pradita.ac.id"
                  value={
                    formData.email
                  }
                  onChange={
                    (event) =>
                      setFormData({
                        ...formData,
                        email:
                          event.target
                            .value,
                      })
                  }
                />

              </label>


              {/* ROLE */}

              <label>

                <span>
                  Role
                </span>

                <select
                  value={
                    formData.role
                  }
                  onChange={
                    (event) =>
                      setFormData({
                        ...formData,
                        role:
                          event.target
                            .value,
                      })
                  }
                >

                  <option>
                    Administrator
                  </option>

                  <option>
                    Superadmin
                  </option>

                </select>

              </label>

            </div>


            <div className="manage-users-modal-actions">

              <button
                type="button"
                className="manage-users-modal-cancel"
                onClick={() =>
                  setShowUserModal(
                    false
                  )
                }
              >
                Batal
              </button>


              <button
                type="button"
                className="manage-users-modal-save"
                disabled={
                  !formData.name.trim() ||
                  !formData.email.trim()
                }
                onClick={
                  handleSaveUser
                }
              >

                {modalMode === 'add'
                  ? 'Tambah Pengguna'
                  : 'Simpan Perubahan'}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =========================
          ACCOUNT CODE MODAL
      ========================= */}

      {showCodeModal &&
        codeUser && (

        <div className="manage-users-modal-overlay">

          <div className="manage-users-confirm-modal manage-users-code-modal">

            <div className="manage-users-confirm-icon">
              <ShieldIcon />
            </div>


            <h2>

              {codeModalMode ===
              'created'
                ? 'Akun Berhasil Dibuat'
                : 'Kode Akun'}

            </h2>


            <p>

              {codeModalMode ===
              'created'
                ? 'Akun baru berhasil dibuat dan sedang menunggu aktivasi pengguna.'
                : 'Informasi kode akun pengguna yang masih menunggu aktivasi.'}

            </p>


            <div className="manage-users-code-meta">

              <div>
                <span>Nama</span>
                <strong>
                  {codeUser.name}
                </strong>
              </div>


              <div>
                <span>Email</span>
                <strong>
                  {codeUser.email}
                </strong>
              </div>


              <div>
                <span>Role</span>
                <strong>
                  {codeUser.role}
                </strong>
              </div>


              <div>
                <span>Status</span>

                <strong className="manage-users-code-pending">
                  Menunggu Aktivasi
                </strong>

              </div>

            </div>


            <div className="manage-users-code-box">

              <span>
                Kode Akun
              </span>


              <strong>
                {codeUser.accountCode}
              </strong>

            </div>


            <p className="manage-users-code-note">

              Simpan kode akun ini sebagai identitas akun baru.
              Akun belum dapat digunakan sampai pengguna menyelesaikan proses aktivasi.

            </p>


            <div className="manage-users-confirm-actions">

              <button
                type="button"
                className="manage-users-modal-cancel"
                onClick={
                  closeCodeModal
                }
              >
                Tutup
              </button>


              <button
                type="button"
                className="manage-users-modal-save"
                onClick={
                  handleCopyCode
                }
              >

                {codeCopied
                  ? 'Kode Disalin ✓'
                  : 'Salin Kode'}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =========================
          CONFIRM STATUS
      ========================= */}

      {showConfirmModal &&
        selectedUser && (

        <div className="manage-users-modal-overlay">

          <div className="manage-users-confirm-modal">

            <div className="manage-users-confirm-icon">
              <ShieldIcon />
            </div>


            <h2>

              {selectedUser.status ===
              'Aktif'
                ? 'Nonaktifkan Pengguna?'
                : 'Aktifkan Pengguna?'}

            </h2>


            <p>

              {selectedUser.status ===
              'Aktif'
                ? `Akun ${selectedUser.name} tidak dapat mengakses SIPRESTASI setelah dinonaktifkan.`
                : `Akun ${selectedUser.name} akan kembali mendapatkan akses ke SIPRESTASI.`}

            </p>


            <div className="manage-users-confirm-actions">

              <button
                type="button"
                className="manage-users-modal-cancel"
                onClick={() => {

                  setShowConfirmModal(
                    false
                  )

                  setSelectedUser(
                    null
                  )

                }}
              >
                Batal
              </button>


              <button
                type="button"
                className="manage-users-modal-save"
                onClick={
                  handleToggleStatus
                }
              >

                {selectedUser.status ===
                'Aktif'
                  ? 'Ya, Nonaktifkan'
                  : 'Ya, Aktifkan'}

              </button>

            </div>

          </div>

        </div>

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
    <article className="manage-users-summary-card">

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


      <div className="manage-users-summary-icon">
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
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />
    </svg>
  )
}


function UsersIcon() {
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
      <circle
        cx="9"
        cy="8"
        r="3"
      />

      <path d="M3.5 19c.5-3 2.5-5 5.5-5s5 2 5.5 5" />

      <circle
        cx="17"
        cy="9"
        r="2.2"
      />

      <path d="M15.5 14.5c2.8-.8 5 .8 5.5 3.5" />
    </svg>
  )
}


function AdminIcon() {
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
      <circle
        cx="12"
        cy="8"
        r="3"
      />

      <path d="M6 20c.5-4 2.5-6 6-6s5.5 2 6 6" />
    </svg>
  )
}


function ShieldIcon() {
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
      <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />

      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}


function ActiveIcon() {
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
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="m8.5 12 2.3 2.3 4.8-5" />
    </svg>
  )
}


function PendingIcon() {
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
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v4l2.5 1.5" />
    </svg>
  )
}


export default KelolaPengguna
