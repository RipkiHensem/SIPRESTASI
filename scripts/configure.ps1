$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot
$backend = Join-Path $projectRoot 'siprestasi-backend-main/siprestasi-backend-main'
$ai = Join-Path $projectRoot 'siprestasi-ai-main'
if ((Test-Path (Join-Path $backend '.env')) -or (Test-Path (Join-Path $ai '.env'))) {
    throw 'File .env sudah ada. Lengkapi manual berdasarkan .env.example dan samakan kedua internal key; konfigurasi lama tidak ditimpa.'
}
$bytes = New-Object byte[] 32
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
$secret = [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
foreach ($directory in @($backend, $ai)) {
    $content = (Get-Content (Join-Path $directory '.env.example') -Raw).Replace('replace-with-the-same-random-secret-as-backend', $secret)
    [IO.File]::WriteAllText((Join-Path $directory '.env'), $content)
}
Write-Output 'Konfigurasi dibuat dengan internal key yang sama. Lengkapi database, SMTP, dan Gemini di .env.'
