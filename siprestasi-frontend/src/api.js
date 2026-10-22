export async function api(path, { method = 'GET', body, signal } = {}) {
  let response
  try {
    response = await fetch(`/api/${path}`, {
      method,
      credentials: 'include',
      signal,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      headers: body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {},
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Server tidak dapat dihubungi. Pastikan semua layanan sudah berjalan.', { cause: error })
  }
  const data = await response.json().catch(() => null)
  if (!response.ok || data?.success === false || !data) {
    const error = new Error(
      Object.values(data?.errors || {}).join(' ') ||
      data?.message || `Permintaan gagal (${response.status}). Periksa koneksi backend.`,
    )
    error.status = response.status
    throw error
  }
  return data
}
