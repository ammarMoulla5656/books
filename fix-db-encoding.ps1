# Fix PostgreSQL Database Encoding for Arabic Text
# This script will recreate the database with UTF-8 encoding

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Database UTF-8 Encoding Fix" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will DELETE all existing data!" -ForegroundColor Red
Write-Host ""

# Find PostgreSQL bin directory
$pgPaths = @(
    "F:\sql\bin",
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "C:\Program Files (x86)\PostgreSQL\16\bin",
    "C:\Program Files (x86)\PostgreSQL\15\bin",
    "C:\PostgreSQL\16\bin",
    "C:\PostgreSQL\15\bin"
)

$psqlPath = $null
foreach ($path in $pgPaths) {
    if (Test-Path "$path\psql.exe") {
        $psqlPath = "$path\psql.exe"
        Write-Host "Found PostgreSQL at: $path" -ForegroundColor Green
        break
    }
}

if ($null -eq $psqlPath) {
    Write-Host "ERROR: Could not find PostgreSQL installation!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL or add it to PATH" -ForegroundColor Yellow
    exit 1
}

# Execute SQL script
Write-Host ""
Write-Host "Step 1: Recreating database with UTF-8 encoding..." -ForegroundColor Cyan

$env:PGPASSWORD = "iioopp00"
& $psqlPath -U postgres -d postgres -f "recreate-db-utf8.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to recreate database!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Applying Prisma schema..." -ForegroundColor Cyan
npx prisma db push --accept-data-loss

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to apply schema!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Running seed data..." -ForegroundColor Cyan
npx prisma db seed

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "DATABASE ENCODING FIX COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "The database has been recreated with UTF-8 encoding." -ForegroundColor Green
Write-Host "You can now upload ABX files with Arabic text!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the dev server: npm run dev" -ForegroundColor White
Write-Host "2. Upload an ABX file to test" -ForegroundColor White
Write-Host ""
