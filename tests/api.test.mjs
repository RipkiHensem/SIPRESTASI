import { test } from 'node:test'
import assert from 'node:assert/strict'
import { api } from '../siprestasi-frontend/src/api.js'

test('API preserves session cookies and multipart login fields', async t => {
  const body = new FormData()
  body.set('email', 'test@example.com')
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/auth/login')
    assert.equal(options.credentials, 'include')
    assert.equal(options.body, body)
    assert.deepEqual(options.headers, {})
    return Response.json({ success: true })
  })
  assert.equal((await api('auth/login', { method: 'POST', body })).success, true)
})

test('JSON updates preserve the API contract', async t => {
  t.mock.method(globalThis, 'fetch', async (_, options) => {
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(options.body), { contact: '08123456789' })
    return Response.json({ success: true })
  })
  await api('profile', { method: 'PUT', body: { contact: '08123456789' } })
})

test('validation errors, expired sessions, and offline backend are actionable', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ errors: { email: 'Email tidak valid.' } }, { status: 422 }))
  await assert.rejects(api('auth/login'), /Email tidak valid/)
  fetch.mock.mockImplementation(async () => Response.json({ message: 'Silakan login.' }, { status: 401 }))
  await assert.rejects(api('profile'), error => error.status === 401)
  fetch.mock.mockImplementation(async () => new Response('<html>Error</html>', { status: 502 }))
  await assert.rejects(api('profile'), /502/)
  fetch.mock.mockImplementation(async () => { throw new TypeError('fetch failed') })
  await assert.rejects(api('profile'), /Server tidak dapat dihubungi/)
})
