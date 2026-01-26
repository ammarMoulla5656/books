# Fix PostgreSQL Encoding for Arabic Text
# Run as Administrator

Write-Host "Fixing PostgreSQL encoding for Arabic text..." -ForegroundColor Cyan

# Set environment variable for current user
[System.Environment]::SetEnvironmentVariable('PGCLIENTENCODING', 'UTF8', 'User')

Write-Host "Environment variable PGCLIENTENCODING set to UTF8" -ForegroundColor Green
Write-Host ""
Write-Host "Important: Restart your terminal/VS Code for changes to take effect" -ForegroundColor Yellow
Write-Host ""
Write-Host "After restart, run: npm run dev" -ForegroundColor Cyan
