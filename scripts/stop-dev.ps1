$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$pidFile = Join-Path $projectRoot 'backend\data\runtime\runner.json'
if (-not (Test-Path -LiteralPath $pidFile)) { Write-Output 'No recorded CampusPath process.'; exit 0 }
$record = Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json
$process = Get-CimInstance Win32_Process -Filter "ProcessId = $($record.pid)" -ErrorAction SilentlyContinue
$expectedPath = Join-Path $PSScriptRoot 'start-dev.mjs'
if ($process -and $process.CommandLine -like "*$expectedPath*") {
    # Stop only the process tree belonging to this recorded, path-verified launcher.
    & taskkill.exe /PID $record.pid /T /F | Out-Null
    Write-Output 'CampusPath stopped. Candidate data has been retained.'
} else { Write-Output 'The recorded CampusPath process is no longer running.' }
