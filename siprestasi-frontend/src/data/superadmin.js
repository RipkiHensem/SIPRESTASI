import { createContext, useContext } from 'react'
import { api } from '../api.js'

export {
  fetchAdminSubmissions,
  fetchSubmissionDetail,
  updateDocumentVerification,
  updateSubmissionStatus,
  importStudentMaster,
  fetchAdminFinalists,
  fetchDosenList,
  setLecturers,
  sendPvInvitations,
} from './admin.js'

export const SuperadminContext = createContext(null)
export const useSuperadmin = () => useContext(SuperadminContext)

export async function fetchUsers({ role, year, is_active, q, page, per_page } = {}) {
  const params = new URLSearchParams()
  if (role && role !== 'Semua') params.set('role', role)
  if (year && year !== 'Semua') params.set('year', year)
  if (is_active !== undefined && is_active !== null && is_active !== '') params.set('is_active', is_active)
  if (q) params.set('q', q)
  if (page) params.set('page', page)
  if (per_page) params.set('per_page', per_page)
  const qs = params.toString()
  return api(`superadmin/users${qs ? '?' + qs : ''}`)
}

export async function createSuperadminUser(data) {
  return api('superadmin/users', { method: 'POST', body: data })
}

export async function updateSuperadminUserRole(id, { role, is_kaprodi } = {}) {
  return api(`superadmin/users/${id}/role`, {
    method: 'PUT',
    body: { role, is_kaprodi: !!is_kaprodi },
  })
}

export async function updateSuperadminUserStatus(id, isActive) {
  return api(`superadmin/users/${id}/status`, {
    method: 'PUT',
    body: { is_active: !!isActive },
  })
}

export async function deleteSuperadminUser(id) {
  return api(`superadmin/users/${id}`, { method: 'DELETE' })
}

export async function fetchSuperadminLogs() {
  return api('superadmin/logs')
}

export async function fetchCurrentPeriod() {
  return api('periode/current')
}

export async function createPeriod(data) {
  return api('periode', { method: 'POST', body: data })
}

export async function fetchActiveQuestionnaire() {
  return api('pv-questionnaire/active')
}

export async function createQuestionnaire(data) {
  return api('pv-questionnaire', { method: 'POST', body: data })
}
