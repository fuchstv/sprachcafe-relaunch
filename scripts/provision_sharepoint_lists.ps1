# ==============================================================================
# SprachCafé Polnisch e.V. - SharePoint Lists Provisioning PowerShell Script
# ==============================================================================
[CmdletBinding()]
param(
    [string]$SiteUrl = "https://sprachcafepolnisch.sharepoint.com/sites/intranet"
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " 🚀 PROVISIONING SHAREPOINT LISTS VIA GRAPH API" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Site: $SiteUrl" -ForegroundColor Yellow

npx tsx (Join-Path $PSScriptRoot "provision_sharepoint_lists.ts")
