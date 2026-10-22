$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path $PSScriptRoot
$frontend = Join-Path $projectRoot 'siprestasi-frontend'
$backend = Join-Path $projectRoot 'siprestasi-backend-main/siprestasi-backend-main'
$ai = Join-Path $projectRoot 'siprestasi-ai-main'
$pythonVenvDirectory = Join-Path $projectRoot '.venv'
$pythonVenv = Join-Path $pythonVenvDirectory 'Scripts/python.exe'

function Invoke-Native {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory
    )

    Push-Location $WorkingDirectory
    try {
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "Perintah gagal (exit code $LASTEXITCODE): $FilePath $($Arguments -join ' ')"
        }
    }
    finally {
        Pop-Location
    }
}

function Get-PythonCommand {
    if (Test-Path $pythonVenv) {
        & $pythonVenv -c 'import sys; raise SystemExit(0 if (3, 11) <= sys.version_info[:2] < (3, 13) else 1)' 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw 'Virtual environment .venv yang ada tidak menggunakan Python 3.11 atau 3.12. Hapus .venv lalu jalankan skrip ini lagi.'
        }
        return @{ File = $pythonVenv; Prefix = @() }
    }

    $launcher = Get-Command py -ErrorAction SilentlyContinue
    if ($launcher) {
        foreach ($version in @('3.12', '3.11')) {
            & $launcher.Source "-$version" -c 'import sys; raise SystemExit(0 if (3, 11) <= sys.version_info[:2] < (3, 13) else 1)' 2>$null
            if ($LASTEXITCODE -eq 0) {
                return @{ File = $launcher.Source; Prefix = @("-$version") }
            }
        }
    }

    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCommand) {
        & $pythonCommand.Source -c 'import sys; raise SystemExit(0 if (3, 11) <= sys.version_info[:2] < (3, 13) else 1)' 2>$null
        if ($LASTEXITCODE -eq 0) {
            return @{ File = $pythonCommand.Source; Prefix = @() }
        }
    }

    throw 'Python 3.11 atau 3.12 tidak ditemukan. Instal salah satu versi tersebut, lalu jalankan skrip ini lagi.'
}

$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npm) { throw 'Node.js dan npm belum ditemukan. Instal Node.js 20.19+ atau 22.12+, lalu buka terminal baru.' }

$composer = Get-Command composer -ErrorAction SilentlyContinue
if (-not $composer) { throw 'Composer belum ditemukan. Instal Composer dan pastikan perintah composer tersedia di terminal.' }

$phpPath = $env:PHP_BIN
if (-not $phpPath -and (Test-Path 'C:/xampp/php/php.exe')) {
    $phpPath = 'C:/xampp/php/php.exe'
}
if (-not $phpPath) {
    $phpCommand = Get-Command php -ErrorAction SilentlyContinue
    if ($phpCommand) { $phpPath = $phpCommand.Source }
}
if (-not $phpPath -or -not (Test-Path $phpPath)) {
    throw 'PHP 8.2+ belum ditemukan. Instal PHP (misalnya melalui XAMPP) atau atur variabel PHP_BIN ke lokasi php.exe.'
}

$phpVersionIsSupported = & $phpPath -r 'exit(PHP_VERSION_ID >= 80200 ? 0 : 1);'
if ($LASTEXITCODE -ne 0) { throw 'Backend membutuhkan PHP versi 8.2 atau lebih baru.' }
$phpExtensions = & $phpPath -r 'echo implode(" ", get_loaded_extensions());'
if ($LASTEXITCODE -ne 0) { throw "PHP tidak bisa dijalankan dari $phpPath" }
$loadedExtensions = @($phpExtensions -split '\s+' | ForEach-Object { $_.ToLowerInvariant() })
$requiredExtensions = @('intl', 'mbstring', 'curl', 'mysqli', 'fileinfo')
$missingExtensions = @($requiredExtensions | Where-Object { $_ -notin $loadedExtensions })
if ($missingExtensions.Count -gt 0) {
    throw "Aktifkan ekstensi PHP berikut di php.ini, lalu jalankan lagi: $($missingExtensions -join ', ')"
}

$python = Get-PythonCommand

Write-Host 'Memasang dependensi frontend dari package-lock.json...'
Invoke-Native -FilePath $npm.Source -Arguments @('ci', '--prefix', $frontend) -WorkingDirectory $projectRoot

if (-not (Test-Path $pythonVenv)) {
    Write-Host 'Membuat virtual environment Python...'
    Invoke-Native -FilePath $python.File -Arguments (@($python.Prefix) + @('-m', 'venv', $pythonVenvDirectory)) -WorkingDirectory $projectRoot
}
Write-Host 'Memasang dependensi layanan AI dari requirements.txt...'
Invoke-Native -FilePath $pythonVenv -Arguments @('-m', 'pip', 'install', '-r', (Join-Path $projectRoot 'requirements.txt')) -WorkingDirectory $projectRoot

Write-Host 'Memasang dependensi backend dari composer.lock...'
$env:PATH = "$(Split-Path $phpPath);$env:PATH"
Invoke-Native -FilePath $composer.Source -Arguments @('install', '--no-interaction', '--prefer-dist') -WorkingDirectory $backend

Write-Host 'Menyiapkan direktori writable CodeIgniter...'
$writable = Join-Path $backend 'writable'
foreach ($directory in @('cache', 'logs', 'session', 'uploads', 'debugbar')) {
    $path = Join-Path $writable $directory
    New-Item -ItemType Directory -Path $path -Force | Out-Null
    $placeholder = Join-Path $path 'index.html'
    if (-not (Test-Path $placeholder)) {
        Set-Content -LiteralPath $placeholder -Value '<!doctype html><title>403 Forbidden</title>' -Encoding ASCII
    }
}
$writeProbe = Join-Path $writable 'cache/.install-write-check'
try {
    [IO.File]::WriteAllText($writeProbe, 'ok')
}
catch {
    throw "CodeIgniter tidak dapat menulis ke $writable. Pindahkan proyek ke folder yang dapat ditulis atau periksa izin Windows."
}
finally {
    Remove-Item -LiteralPath $writeProbe -Force -ErrorAction SilentlyContinue
}

$backendEnv = Join-Path $backend '.env'
$aiEnv = Join-Path $ai '.env'
if (-not (Test-Path $backendEnv) -and -not (Test-Path $aiEnv)) {
    Write-Host 'Membuat konfigurasi awal .env dengan internal key yang sama...'
    Invoke-Native -FilePath 'powershell.exe' -Arguments @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'configure.ps1')) -WorkingDirectory $projectRoot
}
elseif (-not (Test-Path $backendEnv) -or -not (Test-Path $aiEnv)) {
    Write-Warning 'Salah satu file .env belum ada. Skrip tidak mengubah konfigurasi yang ada; samakan internal key kedua file berdasarkan .env.example.'
}
else {
    Write-Host 'File .env sudah ada dan dibiarkan tetap.'
}

if (-not (Get-Command tesseract -ErrorAction SilentlyContinue)) {
    Write-Warning 'Tesseract OCR belum ditemukan. Instal terpisah jika ingin memakai fitur pembacaan dokumen OCR.'
}

Write-Host ''
Write-Host 'Dependensi proyek selesai dipasang.'
Write-Host 'Lengkapi database, SMTP, Gemini API key, dan TESSERACT_CMD di file .env bila diperlukan.'
Write-Host 'Setelah database siap dan migrasi dijalankan, mulai aplikasi dengan: npm.cmd run dev'
