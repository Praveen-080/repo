$ErrorActionPreference = 'SilentlyContinue'
Get-ChildItem -Path "$PSScriptRoot\..\node_modules" -Recurse -Filter *.jsx |
  Where-Object { Test-Path ($_.FullName -replace '\.jsx$', '.tsx') } |
  ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force }
Write-Host "Cleanup complete."
