import { createContext, useContext } from 'react'
import { api } from '../api.js'

export const PortalContext = createContext(null)
export const usePortal = () => useContext(PortalContext)

export function mapPortal(data) {
  const { user, submission: sub, documents: docs, master, score, rank, reviewers, lecturers } = data
  const student = { name: user.name, nim: user.induk, email: user.email, angkatan: user.year,
    ipk: docs.ipk?.ipk_nilai ?? master?.ipk ?? '-', skpi: docs.skpi?.skpi_nilai ?? master?.skpi ?? '-' }
  const formData = sub?.form_data ? JSON.parse(sub.form_data) : {}
  const files = { prestasi: null, organisasi: null, bahasa: null }
  const statuses = { diterima: 'verified', valid: 'verified', verified: 'verified', revisi: 'revision', ditolak: 'rejected', pending: 'checking' }
  const verificationStatus = { ipk: docs.ipk || master ? 'verified' : 'checking', skpi: docs.skpi || master ? 'verified' : 'checking' }
  for (const [key, prefix, field] of [['prestasi','pres','hasPrestasi'], ['organisasi','org','hasOrganisasi'], ['bahasa','bah','hasBahasa']]) {
    verificationStatus[key] = docs[key] ? statuses[docs[key][`${prefix}_status`]] || 'checking' : 'not-submitted'
    formData[field] ??= docs[key] ? 'ya' : 'tidak'
    if (docs[key]) files[key] = { name: docs[key][`${prefix}_file`], size: 0, url: `/api/portal/document/${key}` }
  }
  const reviewStatus = row => row?.status === 'submitted' ? 'completed' : 'waiting'
  const peers = [1, 2, 3].filter(i => sub?.[`peer_reviewer_${i}`]).map(i => {
    const email = sub[`peer_reviewer_${i}`]
    const row = reviewers.find(r => r.reviewer === email && r.role === 'sejawat')
    return { id: i, email, invitationStatus: row ? 'ready' : 'waiting', reviewStatus: reviewStatus(row) }
  })
  const lecturer = index => {
    const person = lecturers[index]
    const row = reviewers.find(r => r.reviewer === person?.email && r.role === 'dosen')
    return { id: person?.user_id, name: person?.name, status: person ? 'ready' : 'waiting', reviewStatus: reviewStatus(row) }
  }
  const completed = reviewers.filter(r => r.status === 'submitted').length
  const tahap1Score = score ? Number(score.ipk_result) + Number(score.skpi_result) + Number(score.pres_result) + Number(score.org_result) + Number(score.bah_result) : null
  const selectionData = {
    student,
    status: peers.length < 3 ? 'need_peers' : completed >= 5 ? 'pradita_completed' : reviewers.length ? 'pradita_in_progress' : 'waiting_lecturer',
    tahap1: { rank, score: tahap1Score,
      prestasi: { submitted: !!docs.prestasi, name: formData.namaPrestasi || docs.prestasi?.pres_cat, level: formData.tingkatPrestasi, verificationStatus: verificationStatus.prestasi },
      organisasi: { submitted: !!docs.organisasi, name: formData.namaOrganisasi || docs.organisasi?.org_cat, level: formData.tingkatOrganisasi, position: formData.jabatan, verificationStatus: verificationStatus.organisasi },
      bahasaAsing: { submitted: !!docs.bahasa, language: formData.bahasa, certificate: formData.tingkatSertifikat, score: formData.skor, verificationStatus: verificationStatus.bahasa } },
    reviewers: { peers, kaprodi: lecturer(0), lecturer: lecturer(1), progress: { completed, total: 5 } },
    praditaValue: { score: score?.pv_result == null ? null : Number(score.pv_result) / 0.15 },
    finalResult: { announced: false, rank: null, tahap1Score, praditaValueScore: null, finalScore: null },
  }
  return { ...data, student, verificationStatus, selectionData,
    registrationData: { student, formData, files, submittedAt: sub?.submitted_at ? sub.submitted_at.replace(' ', 'T') + 'Z' : null },
    rankingResult: { rank, tahap1Score },
  }
}

const uploadedFiles = new WeakMap()

export async function saveApplication(registrationData, submit = false) {
  let snapshot = (await api('portal')).data
  if (!snapshot.submission) {
    await api('pengajuan', { method: 'POST' })
    snapshot = (await api('portal')).data
  }
  const { formData, files = {} } = registrationData
  const organizationLevel = {
    internasional: 'internasional', nasional: 'nasional', lokal: 'lokal',
    provinsi: 'lokal', 'kabupaten-kota': 'lokal', kecamatan: 'lokal', kampus: 'lokal', sekolah: 'lokal',
  }
  const organizationRole = {
    ketua: 'ketua', wakil: 'wakil', 'wakil-ketua': 'wakil',
    anggota_aktif: 'anggota_aktif', anggota: 'anggota_aktif', sekretaris: 'anggota_aktif',
    bendahara: 'anggota_aktif', 'koordinator-divisi': 'anggota_aktif', koordinator: 'anggota_aktif',
  }
  const normalizedOrganizationCategory = `${organizationLevel[formData.tingkatOrganisasi] || ''}_${organizationRole[formData.jabatan] || ''}`
  const categories = [
    ['prestasi', 'pres', formData.hasPrestasi, formData.tingkatPrestasi],
    ['organisasi', 'org', formData.hasOrganisasi, normalizedOrganizationCategory],
    ['bahasa', 'bah', formData.hasBahasa, formData.tingkatSertifikat],
  ]
  for (const [key, , enabled] of categories) {
    if (enabled !== 'ya' && snapshot.documents[key] && snapshot.submission.status !== 'draft') throw new Error(`Dokumen ${key} sudah dikirim dan tidak dapat dihapus.`)
    if (submit && enabled === 'ya' && !(files[key] instanceof File) && !snapshot.documents[key]) throw new Error(`Unggah dokumen ${key} sebelum mengirim.`)
  }
  await api('portal/form', { method: 'PUT', body: formData })
  for (const [key, prefix, enabled, category] of categories) {
    if (enabled !== 'ya') {
      if (snapshot.documents[key]) await api(`portal/document/${key}`, { method: 'DELETE' })
      continue
    }
    if (files[key] instanceof File) {
      const uploadKey = `${snapshot.submission.sub_id}:${key}:${category}`
      if (uploadedFiles.get(files[key]) === uploadKey && snapshot.documents[key]) continue
      const body = new FormData()
      body.append(`${prefix}_cat`, category)
      body.append(`${prefix}_file`, files[key])
      await api(`pengajuan/${key}`, { method: 'POST', body })
      uploadedFiles.set(files[key], uploadKey)
    } else if (submit && !snapshot.documents[key]) {
      throw new Error(`Unggah dokumen ${key} sebelum menyimpan.`)
    }
  }
  if (submit && snapshot.submission.status === 'draft') await api('pengajuan/submit', { method: 'POST' })
}

let registrationDraft = null
export const setRegistrationDraft = value => { registrationDraft = value }
export const getRegistrationDraft = () => registrationDraft
