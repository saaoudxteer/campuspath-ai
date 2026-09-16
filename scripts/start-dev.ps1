$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$runnerPath = Join-Path $PSScriptRoot 'start-dev.mjs'
$runtimePath = Join-Path $projectRoot 'backend\data\runtime'
New-Item -ItemType Directory -Force -Path $runtimePath | Out-Null
$pidFile = Join-Path $runtimePath 'runner.json'
if (Test-Path -LiteralPath $pidFile) {
    $record = Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json
    $existing = Get-CimInstance Win32_Process -Filter "ProcessId = $($record.pid)" -ErrorAction SilentlyContinue
    if ($existing -and $existing.CommandLine -like "*$runnerPath*") {
        Write-Output 'CampusPath is already running: http://127.0.0.1:3000'
        exit 0
    }
}
$nodePath = (Get-Command node.exe).Source
$runner = Start-Process -FilePath $nodePath -ArgumentList ('"' + $runnerPath + '"') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimePath 'dev.log') -RedirectStandardError (Join-Path $runtimePath 'dev-error.log') -PassThru
@{ pid = $runner.Id; path = $runnerPath } | ConvertTo-Json | Set-Content -LiteralPath $pidFile
Write-Output 'CampusPath is starting: http://127.0.0.1:3000'
Write-Output ('Logs: ' + $runtimePath)
