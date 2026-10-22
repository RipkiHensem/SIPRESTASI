import { useRef, useState } from 'react'
import { importStudentMaster } from '../../data/admin'

import './StudentUploadModal.css'


function StudentUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}) {
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const [uploadState, setUploadState] = useState('idle')
  const [progress, setProgress] = useState(0)

  const [errorMessage, setErrorMessage] = useState('')

  const [uploadResult, setUploadResult] = useState({
    total: 0,
    success: 0,
    duplicate: 0,
    invalid: 0,
  })


  const [problemData, setProblemData] = useState([])


  /* =========================
      FILE VALIDATION
  ========================= */

  const validateFile = (file) => {
    if (!file) {
      return false
    }

    const extension = file.name
      .split('.')
      .pop()
      ?.toLowerCase()

    const allowedExtensions = [
      'xlsx',
      'csv',
    ]

    if (!allowedExtensions.includes(extension)) {
      setErrorMessage(
        'Format file tidak didukung. Gunakan file .xlsx atau .csv.'
      )

      return false
    }

    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      setErrorMessage(
        'Ukuran file terlalu besar. Maksimal ukuran file adalah 10 MB.'
      )

      return false
    }

    setErrorMessage('')

    return true
  }


  /* =========================
      SELECT FILE
  ========================= */

  const handleFile = (file) => {
    if (!validateFile(file)) {
      return
    }

    setSelectedFile(file)
    setUploadState('idle')
    setProgress(0)
  }


  const handleFileInput = (event) => {
    const file = event.target.files?.[0]

    handleFile(file)
  }


  const handleRemoveFile = () => {
    setSelectedFile(null)
    setErrorMessage('')
    setUploadState('idle')
    setProgress(0)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }


  /* =========================
      DRAG & DROP
  ========================= */

  const handleDragOver = (event) => {
    event.preventDefault()

    setIsDragging(true)
  }


  const handleDragLeave = (event) => {
    event.preventDefault()

    setIsDragging(false)
  }


  const handleDrop = (event) => {
    event.preventDefault()

    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]

    handleFile(file)
  }


  /* =========================
      UPLOAD
      simulasi frontend
  ========================= */

  const handleUpload = async () => {
    if (!selectedFile) {
      return
    }

    setUploadState('uploading')
    setProgress(30)

    try {
      setProgress(60)
      const res = await importStudentMaster(selectedFile, '2025/2026')
      setProgress(100)
      setUploadState('success')
      const total = res.meta?.total || 0
      const successCount = (res.meta?.inserted || 0) + (res.meta?.updated || 0)
      const rawErrors = res.meta?.errors || res.data?.errors || []
      const mappedErrors = Array.isArray(rawErrors)
        ? rawErrors.map((e, idx) => ({
            row: e.row ?? (idx + 1),
            nim: e.nim ?? '-',
            name: e.nama || e.name || '-',
            issue: e.message || e.error || 'Data tidak valid',
          }))
        : []
      setProblemData(mappedErrors)
      const resData = {
        total: total || successCount,
        success: successCount,
        duplicate: 0,
        invalid: total - successCount > 0 ? total - successCount : mappedErrors.length,
      }
      setUploadResult(resData)
      if (onUploadComplete) {
        onUploadComplete({
          fileName: selectedFile.name,
          ...resData,
        })
      }
    } catch (err) {
      setUploadState('idle')
      setErrorMessage(err.message || 'Gagal mengunggah data mahasiswa.')
    }
  }


  /* =========================
      CLOSE / RESET
  ========================= */

  const resetModal = () => {
    setSelectedFile(null)
    setErrorMessage('')
    setProgress(0)
    setUploadState('idle')
    setIsDragging(false)
    setProblemData([])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }


  const handleClose = () => {
    resetModal()

    onClose()
  }


  if (!isOpen) {
    return null
  }


  return (
    <div className="student-upload-overlay">

      <div className="student-upload-modal">

        {/* =========================
            DETAIL DATA BERMASALAH
        ========================= */}

        {uploadState === 'detail' && (
          <>
            <div className="student-upload-header">

              <div>
                <h2>
                  Detail Data Bermasalah
                </h2>

                <p>
                  Berikut data yang tidak dapat ditambahkan ke sistem.
                </p>
              </div>

              <button
                type="button"
                className="student-upload-close"
                onClick={() => setUploadState('success')}
              >
                ×
              </button>

            </div>


            <div className="student-upload-problem-table-wrapper">

              <table className="student-upload-problem-table">

                <thead>
                  <tr>
                    <th>BARIS</th>
                    <th>NIM</th>
                    <th>NAMA</th>
                    <th>MASALAH</th>
                  </tr>
                </thead>

                <tbody>

                  {problemData.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                        Tidak ada data bermasalah.
                      </td>
                    </tr>
                  ) : (
                    problemData.map((item) => (
                      <tr key={item.row}>

                        <td>
                          {item.row}
                        </td>

                        <td>
                          {item.nim}
                        </td>

                        <td>
                          {item.name}
                        </td>

                        <td>
                          <span className="student-upload-problem-text">
                            {item.issue}
                          </span>
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>


            <div className="student-upload-detail-footer">

              <p>
                Perbaiki data pada file kemudian unggah kembali jika diperlukan.
              </p>

              <button
                type="button"
                className="student-upload-primary-button"
                onClick={() => setUploadState('success')}
              >
                Kembali
              </button>

            </div>
          </>
        )}


        {/* =========================
            SUCCESS
        ========================= */}

        {uploadState === 'success' && (
          <div className="student-upload-result">

            <div className="student-upload-success-icon">
              <CheckIcon />
            </div>

            <h2>
              Upload Berhasil
            </h2>

            <p className="student-upload-result-description">
              Data mahasiswa telah selesai diproses.
            </p>


            <div className="student-upload-result-grid">

              <div className="student-upload-result-card success">

                <strong>
                  {uploadResult.success}
                </strong>

                <span>
                  Data berhasil
                </span>

              </div>


              <div className="student-upload-result-card duplicate">

                <strong>
                  {uploadResult.duplicate}
                </strong>

                <span>
                  Data duplikat
                </span>

              </div>


              <div className="student-upload-result-card invalid">

                <strong>
                  {uploadResult.invalid}
                </strong>

                <span>
                  Data bermasalah
                </span>

              </div>

            </div>


            <div className="student-upload-result-total">

              Total data diproses:
              <strong>
                {' '}
                {uploadResult.total}
              </strong>

            </div>


            <div className="student-upload-result-actions">

              <button
                type="button"
                className="student-upload-secondary-button"
                onClick={handleClose}
              >
                Tutup
              </button>


              <button
                type="button"
                className="student-upload-primary-button"
                onClick={() => setUploadState('detail')}
              >
                Lihat Detail
              </button>

            </div>

          </div>
        )}


        {/* =========================
            UPLOADING
        ========================= */}

        {uploadState === 'uploading' && (
          <div className="student-upload-loading">

            <div className="student-upload-loading-icon">
              <UploadIcon />
            </div>

            <h2>
              Sedang Mengunggah Data...
            </h2>

            <p>
              Mohon tunggu, data mahasiswa sedang diproses.
            </p>


            <div className="student-upload-progress-wrapper">

              <div className="student-upload-progress-info">

                <span>
                  {selectedFile?.name}
                </span>

                <strong>
                  {progress}%
                </strong>

              </div>


              <div className="student-upload-progress-track">

                <div
                  className="student-upload-progress-bar"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

          </div>
        )}


        {/* =========================
            INITIAL / SELECT FILE
        ========================= */}

        {uploadState === 'idle' && (
          <>
            <div className="student-upload-header">

              <div>
                <h2>
                  Upload Data Mahasiswa
                </h2>

                <p>
                  Unggah file data mahasiswa baru untuk ditambahkan ke sistem.
                </p>
              </div>

              <button
                type="button"
                className="student-upload-close"
                onClick={handleClose}
              >
                ×
              </button>

            </div>


            {!selectedFile ? (
              <div
                className={`student-upload-dropzone ${
                  isDragging
                    ? 'dragging'
                    : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >

                <div className="student-upload-dropzone-icon">
                  <UploadIcon />
                </div>

                <strong>
                  Drag & drop file di sini
                </strong>

                <span>
                  atau
                </span>


                <button
                  type="button"
                  className="student-upload-select-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Pilih File
                </button>


                <p>
                  Format file: .xlsx atau .csv
                  <br />
                  Maksimal ukuran file 10 MB
                </p>


                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileInput}
                  hidden
                />

              </div>
            ) : (
              <div className="student-upload-selected-file">

                <div className="student-upload-file-icon">
                  <ExcelIcon />
                </div>


                <div className="student-upload-file-info">

                  <strong>
                    {selectedFile.name}
                  </strong>

                  <span>
                    {formatFileSize(selectedFile.size)}
                  </span>

                </div>


                <button
                  type="button"
                  className="student-upload-remove-file"
                  onClick={handleRemoveFile}
                >
                  ×
                </button>

              </div>
            )}


            {errorMessage && (
              <div className="student-upload-error">

                <span>
                  !
                </span>

                {errorMessage}

              </div>
            )}


            <div className="student-upload-format-info">

              <strong>
                Format file
              </strong>

              <ul>
                <li>
                  File harus berupa Excel (.xlsx) atau CSV (.csv).
                </li>

                <li>
                  Pastikan kolom dan data mahasiswa sudah terisi dengan benar.
                </li>

                <li>
                  Data duplikat akan dilewati oleh sistem.
                </li>
              </ul>

            </div>


            <div className="student-upload-actions">

              <button
                type="button"
                className="student-upload-secondary-button"
                onClick={handleClose}
              >
                Batal
              </button>


              <button
                type="button"
                className="student-upload-primary-button"
                disabled={!selectedFile}
                onClick={handleUpload}
              >
                Upload Data
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  )
}


/* =========================
   FILE SIZE
========================= */

function formatFileSize(bytes) {
  if (!bytes) {
    return '0 KB'
  }

  const kilobytes = bytes / 1024

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`
  }

  const megabytes = kilobytes / 1024

  return `${megabytes.toFixed(1)} MB`
}


/* =========================
   ICONS
========================= */

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  )
}


function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 12 4 4 8-9" />
    </svg>
  )
}


function ExcelIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v4h4" />
      <path d="m9 11 4 5" />
      <path d="m13 11-4 5" />
    </svg>
  )
}


export default StudentUploadModal