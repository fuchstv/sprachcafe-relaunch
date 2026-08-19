#!/usr/bin/env pwsh
# ==============================================================================
# SprachCafé Polnisch e.V. - SharePoint KPI & Statistik Sync Tool (PowerShell)
# 
# Synchronisiert alle aggregierten Kalender-Kennzahlen direkt aus der CSV 
# in die SharePoint-Liste 'Veranstaltungs_Statistik'.
#
# Behebt automatisch das SharePoint OData EntityType-Encoding (_x005f_).
# ==============================================================================

[CmdletBinding()]
param(
    [string]$BridgeUrl = "https://defaultb745a80af68245e4ba2ed48bbd9e70.3d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/10/workflows/9e151172d9964dbf93fc5853aab3561d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2YzyNYZx2Rd79_pdygdRpCVxUEXGktKotLwAoPKLnf0",
    [string]$ListTitle = "Veranstaltungs_Statistik",
    [string]$CsvPath = "$PSScriptRoot/kpi_exports/Veranstaltungs_Kennzahlen.csv"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " 🏛️ SPRACHCAFÉ POLNISCH e.V. - SHAREPOINT KPI STATISTIK SYNC (POWERSHELL)" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "Liste:      $ListTitle" -ForegroundColor Yellow
Write-Host "Datenbasis: $CsvPath`n" -ForegroundColor Yellow

# ------------------------------------------------------------------------------
# 1. Hilfsfunktion für Bridge-Aufrufe mit Fehlerprüfung
# ------------------------------------------------------------------------------
function Invoke-SharePointBridge {
    param(
        [Parameter(Mandatory=$true)] [string]$Method,
        [Parameter(Mandatory=$true)] [string]$Uri,
        [object]$Body = $null
    )

    $payload = @{
        method = $Method
        uri    = $Uri
        body   = if ($Body) { $Body | ConvertTo-Json -Compress -Depth 10 } else { "" }
    } | ConvertTo-Json -Compress

    $headers = @{ "Content-Type" = "application/json" }

    try {
        $response = Invoke-RestMethod -Uri $BridgeUrl -Method Post -Headers $headers -Body $payload
        return $response
    } catch {
        Write-Host "❌ HTTP-Fehler bei Bridge-Aufruf ($Uri): $_" -ForegroundColor Red
        throw $_
    }
}

# ------------------------------------------------------------------------------
# 2. Exakten OData EntityType der Liste ermitteln (z.B. SP.Data.Veranstaltungs_x005f_StatistikListItem)
# ------------------------------------------------------------------------------
Write-Host "🔍 [1/3] Frage Schema & OData EntityType für '$ListTitle' ab..." -ForegroundColor Cyan

$listInfo = Invoke-SharePointBridge -Method "GET" -Uri "_api/web/lists/GetByTitle('$ListTitle')?`$select=ListItemEntityTypeFullName,ItemCount,Title"

if (-not $listInfo -or -not $listInfo.d -or -not $listInfo.d.ListItemEntityTypeFullName) {
    Write-Host "⚠️ Warnung: Konnte EntityType nicht automatisch ermitteln. Verwende Fallback mit '_x005f_'..." -ForegroundColor Yellow
    $entityType = "SP.Data.Veranstaltungs_x005f_StatistikListItem"
} else {
    $entityType = $listInfo.d.ListItemEntityTypeFullName
    Write-Host "✅ Korrekter SharePoint EntityType ermittelt: " -NoNewline -ForegroundColor Green
    Write-Host "$entityType" -ForegroundColor Magenta
    Write-Host "   Aktuelle Anzahl Elemente in SharePoint: $($listInfo.d.ItemCount)`n" -ForegroundColor Gray
}

# ------------------------------------------------------------------------------
# 3. CSV-Datensätze einlesen
# ------------------------------------------------------------------------------
if (-not (Test-Path $CsvPath)) {
    Write-Error "❌ CSV-Datei unter '$CsvPath' nicht gefunden!"
    exit 1
}

$csvRows = Import-Csv -Path $CsvPath -Encoding UTF8
Write-Host "📂 [2/3] $($csvRows.Count) KPI-Datensätze aus CSV geladen.`n" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 4. Bestehende Einträge abrufen, um Duplikate zu vermeiden / abzugleichen
# ------------------------------------------------------------------------------
Write-Host "🔄 [3/3] Synchronisiere Datensätze nach SharePoint..." -ForegroundColor Cyan

$existingItemsQuery = Invoke-SharePointBridge -Method "GET" -Uri "_api/web/lists/GetByTitle('$ListTitle')/items?`$select=Id,Title,Jahr_Monat,Standort_Code,Kategorie"
$existingMap = @{}

if ($existingItemsQuery.d -and $existingItemsQuery.d.results) {
    foreach ($item in $existingItemsQuery.d.results) {
        if ($item.Title) {
            $existingMap[$item.Title] = $item.Id
        }
    }
}

$createdCount = 0
$updatedCount = 0
$index = 1

foreach ($row in $csvRows) {
    $titleKey = "$($row.Jahr_Monat)_$($row.Standort_Code)_$($row.Kategorie)"
    # Titel auf max 50 Zeichen begrenzen falls nötig
    if ($titleKey.Length -gt 50) {
        $titleKey = $titleKey.Substring(0, 50)
    }

    $itemPayload = @{
        "__metadata"             = @{ "type" = $entityType }
        "Title"                  = $titleKey
        "Jahr_Monat"             = $row.Jahr_Monat
        "Jahr"                   = [int]$row.Jahr
        "Monat_Nummer"           = [int]$row.Monat_Nummer
        "Monat_Name"             = $row.Monat_Name
        "Standort_Code"          = $row.Standort_Code
        "Standort_Name"          = $row.Standort_Name
        "Sprache"                = $row.Sprache
        "Zielgruppe"             = $row.Zielgruppe
        "Kategorie"              = $row.Kategorie
        "Projekt"                = $row.Projekt
        "Anzahl_Veranstaltungen" = [int]$row.Anzahl_Veranstaltungen
    }

    if ($existingMap.ContainsKey($titleKey)) {
        $itemId = $existingMap[$titleKey]
        Write-Host "  [$index/$($csvRows.Count)] 🔁 Aktualisiere Item ID $itemId ($titleKey)..." -NoNewline
        
        # In SharePoint REST nutzt man POST mit X-HTTP-Method MERGE
        # Da wir über die Bridge einheitlich POSTen, können wir das Item aktualisieren
        $updateRes = Invoke-SharePointBridge -Method "POST" -Uri "_api/web/lists/GetByTitle('$ListTitle')/items($itemId)" -Body $itemPayload
        Write-Host " [OK]" -ForegroundColor Green
        $updatedCount++
    } else {
        Write-Host "  [$index/$($csvRows.Count)] ➕ Erstelle neues Item ($titleKey)..." -NoNewline
        $createRes = Invoke-SharePointBridge -Method "POST" -Uri "_api/web/lists/GetByTitle('$ListTitle')/items" -Body $itemPayload
        
        if ($createRes.d -and $createRes.d.Id) {
            Write-Host " [Neu ID: $($createRes.d.Id)]" -ForegroundColor Green
            $existingMap[$titleKey] = $createRes.d.Id
            $createdCount++
        } else {
            Write-Host " [OK]" -ForegroundColor Green
            $createdCount++
        }
    }
    
    $index++
    Start-Sleep -Milliseconds 150
}

Write-Host "`n==========================================================================" -ForegroundColor Green
Write-Host " 🎉 SYNCHRONISATION ERFOLGREICH BEENDET!" -ForegroundColor Green
Write-Host "   • Neu angelegte Datensätze: $createdCount" -ForegroundColor Green
Write-Host "   • Aktualisierte Datensätze:  $updatedCount" -ForegroundColor Green
Write-Host "   • Gesamtdatensätze:          $($csvRows.Count)" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green
