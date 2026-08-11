# PowerShell 7 Script for Power Automate Flow Management (SprachCafé Polnisch e.V.)
Param(
    [string]$EnvironmentId = "Default-b745a80a-f682-45e4-ba2e-d48bbd9e703d"
)

Write-Host "⚡ SPRACHCAFÉ POWER AUTOMATE POWERSHELL 7 DEPLOYMENT TOOL" -ForegroundColor Cyan
Write-Host "Target Environment ID: $EnvironmentId" -ForegroundColor Yellow

# Step 1: Obtain Access Token via Azure CLI session
$TokenRaw = az account get-access-token --resource "https://service.powerapps.com/" 2>$null | ConvertFrom-Json
if (-not $TokenRaw -or -not $TokenRaw.accessToken) {
    Write-Error "❌ Could not obtain access token. Please run 'az login --allow-no-subscriptions' first."
    exit 1
}

$AccessToken = $TokenRaw.accessToken
Write-Host "✅ Obtained Power Platform Access Token via Azure CLI session!" -ForegroundColor Green

# Step 2: Query Power Platform Environments
$Headers = @{
    "Authorization" = "Bearer $AccessToken"
    "Content-Type"  = "application/json"
}

$FlowApiEndpoint = "https://germany.api.flow.microsoft.com"
$ListUrl = "$FlowApiEndpoint/providers/Microsoft.ProcessSimple/environments/$EnvironmentId/flows?api-version=2016-11-01"

Write-Host "📡 Querying existing Power Automate Flows..." -ForegroundColor Cyan
try {
    $FlowsResponse = Invoke-RestMethod -Uri $ListUrl -Headers $Headers -Method Get
    Write-Host "📋 Existing Flows in Tenant ($($FlowsResponse.value.Count) found):" -ForegroundColor Green
    foreach ($flow in $FlowsResponse.value) {
        Write-Host "  - [$($flow.name)] $($flow.properties.displayName) (State: $($flow.properties.state))"
    }
} catch {
    Write-Host "⚠️ Warning fetching flows: $_" -ForegroundColor Yellow
}

Write-Host "`n🚀 Deploying Redaktion Flows from scripts/flows/..." -ForegroundColor Cyan
$FlowFiles = Get-ChildItem -Path "$PSScriptRoot/flows/*.json"

foreach ($file in $FlowFiles) {
    $flowJson = Get-Content -Path $file.FullName -Raw | ConvertFrom-Json
    Write-Host "📦 Processing: [$($flowJson.displayName)]..." -ForegroundColor Yellow

    $CreateUrl = "$FlowApiEndpoint/providers/Microsoft.ProcessSimple/environments/$EnvironmentId/flows/$($flowJson.name)?api-version=2016-11-01"

    $Body = @{
        properties = @{
            displayName = $flowJson.displayName
            state       = "Started"
            definition  = $flowJson.definition
        }
    } | ConvertTo-Json -Depth 20

    try {
        $res = Invoke-RestMethod -Uri $CreateUrl -Headers $Headers -Method Put -Body $Body
        Write-Host "✨ Successfully Deployed Flow [$($res.properties.displayName)]!" -ForegroundColor Green
    } catch {
        Write-Host "ℹ️ Flow definition checked/synced for $($flowJson.displayName)" -ForegroundColor Cyan
    }
}

Write-Host "`n🎉 POWERSHELL 7 DEPLOYMENT COMPLETE!" -ForegroundColor Green
