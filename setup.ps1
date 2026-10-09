# One-command setup for Windows PowerShell. Safe to run more than once.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Need($cmd, $hint) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "Missing '$cmd'. $hint" -ForegroundColor Red
        exit 1
    }
}
# Runs a native command and stops the script when it fails.
function Run($exe, [string[]]$arguments) {
    & $exe @arguments
    if ($LASTEXITCODE -ne 0) { throw "'$exe $($arguments -join ' ')' failed (exit $LASTEXITCODE)." }
}
function EnvVal($name) {
    $line = Get-Content (Join-Path $PSScriptRoot 'backend\.env') | Where-Object { $_ -match "^$name=" } | Select-Object -First 1
    if ($line) { return ($line -replace "^$name=", '').Trim('"', "`r") }
    return ''
}

Step 'Checking tools'
Need php 'Install PHP 8.3+ (Laragon includes it) and add its php folder to PATH.'
Need composer 'Install Composer 2 (Laragon includes it) and add it to PATH.'
Need node 'Install Node.js 20+.'
Need npm 'Install Node.js 20+.'
& php -r 'exit(PHP_VERSION_ID >= 80300 ? 0 : 1);'
if ($LASTEXITCODE -ne 0) { Write-Host 'PHP 8.3+ is required.' -ForegroundColor Red; exit 1 }

Step 'Backend: installing PHP packages'
Push-Location backend
Run composer @('install', '--no-interaction')
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
# Keep an existing key: regenerating it would log everyone out.
if (-not (Select-String -Path .env -Pattern '^APP_KEY=.+' -Quiet)) { Run php @('artisan', 'key:generate', '--ansi') }

Step 'Backend: creating the database'
$dbName = EnvVal 'DB_DATABASE'
if (Get-Command mysql -ErrorAction SilentlyContinue) {
    $env:MYSQL_PWD = EnvVal 'DB_PASSWORD'
    & mysql "-h$(EnvVal 'DB_HOST')" "-P$(EnvVal 'DB_PORT')" "-u$(EnvVal 'DB_USERNAME')" -e "CREATE DATABASE IF NOT EXISTS ``$dbName`` CHARACTER SET utf8mb4" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database '$dbName' is ready."
    } else {
        Write-Host "Could not create '$dbName' (is MySQL running? are the DB_* values in backend\.env right?)."
        Write-Host 'Create it yourself and re-run this script. Continuing in case it already exists.'
    }
    Remove-Item Env:MYSQL_PWD
} else {
    Write-Host "The 'mysql' command is not in PATH. Create an empty database named '$dbName' yourself"
    Write-Host '(Laragon: HeidiSQL). Continuing in case it already exists.'
}

Step 'Backend: migrating and seeding'
& php artisan migrate --force --no-interaction
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Migration failed. Check that MySQL is running and the database exists.' -ForegroundColor Red
    Write-Host 'More help: docs\SETUP.md' -ForegroundColor Red
    exit 1
}
Run php @('artisan', 'db:seed', '--force', '--no-interaction')
Pop-Location

Step 'Frontend: installing packages'
Push-Location frontend
Run npm @('install')
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
Pop-Location

Write-Host @'

Setup finished.

Start the app in two terminals:
  1) cd backend;  php artisan serve    # http://localhost:8000
  2) cd frontend; npm run dev          # http://localhost:3000

Demo recruiter: recruiter@example.com / password

Optional, for the end-to-end tests (about 120 MB, one time):
  cd frontend; npx playwright install chromium
'@
