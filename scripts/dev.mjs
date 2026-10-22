import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const backend = path.join(root, 'siprestasi-backend-main/siprestasi-backend-main')
const ai = path.join(root, 'siprestasi-ai-main')
const frontend = path.join(root, 'siprestasi-frontend')
const php = process.env.PHP_BIN || (existsSync('C:/xampp/php/php.exe') ? 'C:/xampp/php/php.exe' : 'php')
const python = process.env.PYTHON_BIN || path.join(root, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python')
const required = [
  path.join(backend, 'vendor/autoload.php'),
  path.join(backend, '.env'),
  path.join(ai, '.env'),
  path.join(frontend, 'node_modules/vite/bin/vite.js'),
  python,
]
for (const file of required) {
  if (!existsSync(file)) {
    console.error(`Belum tersedia: ${file}\nIkuti instalasi di README.md terlebih dahulu.`)
    process.exit(1)
  }
}
if (spawnSync(php, ['-v'], { stdio: 'ignore' }).status !== 0) {
  console.error('PHP tidak ditemukan. Atur PHP_BIN ke lokasi php.exe.')
  process.exit(1)
}

// Check the ports before starting, so an old process cannot silently serve another app.
const { createServer } = await import('node:net')
for (const port of [8000, 8080, 5173]) {
  await new Promise((resolve, reject) => {
    const probe = createServer()
    probe.once('error', () => reject(new Error(`Port ${port} sedang digunakan. Hentikan layanan lama terlebih dahulu.`)))
    probe.listen(port, '127.0.0.1', () => probe.close(resolve))
  })
}
const children = []
let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (!child.pid) continue
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    else child.kill('SIGTERM')
  }
  process.exitCode = code
}
function start(name, executable, args, cwd) {
  const child = spawn(executable, args, { cwd, stdio: 'inherit', windowsHide: true })
  children.push(child)
  child.on('error', error => { console.error(`${name}: ${error.message}`); stop(1) })
  child.on('exit', code => { if (!stopping) { console.error(`${name} berhenti (${code}).`); stop(code || 1) } })
}
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
start('AI', python, ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], ai)
start('Backend', php, ['spark', 'serve', '--host', '127.0.0.1', '--port', '8080'], backend)
start('Frontend', process.execPath, [path.join(frontend, 'node_modules/vite/bin/vite.js')], frontend)
console.log('')
console.log('╔══════════════════════════════════════════════════════╗')
console.log('║               SIPRESTASI — Server Aktif              ║')
console.log('╠══════════════════════════════════════════════════════╣')
console.log('║  Portal Mahasiswa  →  http://localhost:5173/login    ║')
console.log('║  Portal Admin      →  http://localhost:5173/admin    ║')
console.log('║  Portal Superadmin →  http://localhost:5173/superadmin ║')
console.log('╚══════════════════════════════════════════════════════╝')
console.log('')
console.log('Tekan Ctrl+C untuk menghentikan semua layanan.')

