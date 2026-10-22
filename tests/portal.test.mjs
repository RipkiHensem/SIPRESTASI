import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mapPortal, saveApplication } from '../siprestasi-frontend/src/data/portal.js'

const snapshot = () => ({ user: { name: 'Test Student', induk: '2099000001', year: '2099', email: 'test@example.invalid' },
  submission: null, documents: {}, master: null, score: null, rank: null, reviewers: [], lecturers: [] })

test('new student never receives sample scores, rankings, or reviewers', () => {
  const portal = mapPortal(snapshot())
  assert.equal(portal.student.ipk, '-')
  assert.equal(portal.selectionData.tahap1.rank, null)
  assert.equal(portal.selectionData.tahap1.score, null)
  assert.equal(portal.selectionData.finalResult.announced, false)
  assert.deepEqual(portal.selectionData.reviewers.peers, [])
  assert.equal(portal.registrationData.files.prestasi, null)
})

test('document status and lecturer responses are mapped from backend records', () => {
  const raw = snapshot()
  raw.submission = { status: 'pending_reviewed', peer_reviewer_1: 'peer@example.invalid', submitted_at: '2026-10-22 06:00:00' }
  raw.documents.prestasi = { pres_status: 'revisi', pres_file: 'certificate.pdf' }
  raw.lecturers = [{ user_id: 7, email: 'lecturer@example.invalid', name: 'Lecturer' }]
  raw.reviewers = [{ reviewer: 'lecturer@example.invalid', role: 'dosen', status: 'submitted' }]
  const portal = mapPortal(raw)
  assert.equal(portal.verificationStatus.prestasi, 'revision')
  assert.equal(portal.selectionData.reviewers.kaprodi.reviewStatus, 'completed')
  assert.equal(portal.selectionData.reviewers.peers[0].invitationStatus, 'waiting')
  assert.equal(portal.registrationData.files.prestasi.url, '/api/portal/document/prestasi')
  assert.equal(portal.registrationData.submittedAt, '2026-10-22T06:00:00Z')
})

test('failed upload prevents submission and preserves the backend error', async t => {
  const raw = snapshot()
  raw.submission = { status: 'draft' }
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    calls.push(url)
    if (url === '/api/portal') return Response.json({ success: true, data: raw })
    if (url === '/api/portal/form') return Response.json({ success: true })
    return Response.json({ success: false, message: 'Dokumen terlalu besar.' }, { status: 422 })
  })
  await assert.rejects(saveApplication({ formData: { hasPrestasi: 'ya', tingkatPrestasi: 'nasional_juara' }, files: { prestasi: new File(['test'], 'test.pdf') } }, true), /Dokumen terlalu besar/)
  assert.ok(!calls.includes('/api/pengajuan/submit'))
})
