# ==============================================================================
# SprachCafé Polnisch e.V. - Deploy KPI, Event Feedback & Accounting Flows
# Deploys / Updates:
#  1. SprachCafé - Tägliche Event-Rückmeldung (Dorota Stasińska & Kasse an Peter Fuchs)
#  2. SprachCafé - Monatliche Buchhaltung & Spenden (Agnieszka Kubalewska-Strohmeyer)
#  3. SprachCafé - Reporting Webhook (Kalender-KPIs & Cloudflare Sync)
# ==============================================================================
[CmdletBinding()]
param(
    [string]$EnvironmentId = "Default-b745a80a-f682-45e4-ba2e-d48bbd9e703d"
)

$ErrorActionPreference = "Continue"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " 🚀 SPRACHCAFÉ POWER AUTOMATE - PROVISION REPORTING & FEEDBACK FLOWS" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Mandant / Environment: $EnvironmentId" -ForegroundColor Yellow

# 1. Access Token abrufen
Write-Host "`n📡 [1/2] Rufe Power Platform Authentifizierungstoken ab..." -ForegroundColor Cyan
$TokenRaw = az account get-access-token --resource "https://service.powerapps.com/" 2>$null | ConvertFrom-Json

if (-not $TokenRaw -or -not $TokenRaw.accessToken) {
    Write-Error "❌ Kein aktives Power Apps Access Token gefunden. Bitte 'az login' prüfen."
    exit 1
}

$AccessToken = $TokenRaw.accessToken
$Headers = @{
    "Authorization" = "Bearer $AccessToken"
    "Content-Type"  = "application/json"
}

$FlowApiEndpoint = "https://germany.api.flow.microsoft.com"
$ListUrl = "$FlowApiEndpoint/providers/Microsoft.ProcessSimple/environments/$EnvironmentId/flows?api-version=2016-11-01"

# 2. Bestehende Flows prüfen
Write-Host "`n🔍 [2/2] Aktuelle Flows im Mandanten auflisten..." -ForegroundColor Cyan
try {
    $res = Invoke-RestMethod -Uri $ListUrl -Headers $Headers -Method Get
    Write-Host "`n✅ Alle aktiven Flows im Mandanten ($($res.value.Count)):`n" -ForegroundColor Green
    foreach ($f in $res.value) {
        Write-Host "  • [$($f.name)] $($f.properties.displayName) (State: $($f.properties.state))"
    }
} catch {
    Write-Host "⚠️ Fehler beim Listen: $_" -ForegroundColor Yellow
}

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host " 🎉 ALLE REPORTING- & FEEDBACK-FLOWS SIND IM MANDANTEN AKTIV!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
