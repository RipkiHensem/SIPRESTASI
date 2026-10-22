param([Parameter(Mandatory=$true)][string]$SourcePath)
$ErrorActionPreference = 'Stop'
$targetPath = Join-Path $PSScriptRoot '../siprestasi-backend-main/siprestasi-backend-main/.env'
$content = [IO.File]::ReadAllText($targetPath)
$settings = @{}
foreach ($line in [IO.File]::ReadAllLines($SourcePath)) {
    if ($line -match '^\s*((?:email\.[A-Za-z]+)|auth\.studentEmailDomain)\s*=\s*(.*)$') {
        $settings[$matches[1]] = $matches[2]
    }
}
foreach ($required in @('email.SMTPHost','email.SMTPUser','email.SMTPPass','email.fromEmail')) {
    if (!$settings.ContainsKey($required) -or [string]::IsNullOrWhiteSpace($settings[$required].Trim().Trim([char]34).Trim([char]39))) {
        throw "Konfigurasi wajib belum terisi: $required"
    }
}
$settings['otp.logToLog'] = 'false'
foreach ($key in $settings.Keys) {
    $line = "$key = $($settings[$key])"
    $pattern = '(?m)^\s*' + [regex]::Escape($key) + '\s*=.*$'
    if ([regex]::IsMatch($content, $pattern)) {
        $replacement = $line
        $content = [regex]::Replace($content, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $replacement })
    } else { $content += "`n$line`n" }
}
[IO.File]::WriteAllText($targetPath, $content, [Text.UTF8Encoding]::new($false))
Write-Output 'Konfigurasi email dan domain mahasiswa berhasil diimpor. Konfigurasi database dan koneksi AI lokal dipertahankan.'
