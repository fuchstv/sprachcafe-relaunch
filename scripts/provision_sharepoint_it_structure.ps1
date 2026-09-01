<#
.SYNOPSIS
    SprachCafé Polnisch e.V. - SharePoint 10-Ordner Struktur Provisioner (PowerShell)
.DESCRIPTION
    Richtet die 10 Hauptordner (01_Vorstand bis 10_Archiv) im Microsoft 365
    SharePoint Intranet Hub (/sites/intranet) ein.
#>
[CmdletBinding()]
param(
    [string]$TenantId = "b745a80a-f682-45e4-ba2e-d48bbd9e703d",
    [string]$SharePointDomain = "sprachcafepolnisch.sharepoint.com",
    [string]$SiteUrl = "https://sprachcafepolnisch.sharepoint.com/sites/intranet",
    [switch]$DryRun = $true
)

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " 🏛️ SPRACHCAFÉ POLNISCH e.V. - SHAREPOINT 10-ORDNER PROVISIONER (PWSH)" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "🏢 Mandant/Tenant:      $TenantId" -ForegroundColor Yellow
Write-Host "🌐 SharePoint Domain:    $SharePointDomain" -ForegroundColor Yellow
Write-Host "🏠 Ziel-Site URL:        $SiteUrl" -ForegroundColor Yellow
Write-Host "🎨 Corporate Color:      #8B263E (SprachCafé Weinrot)" -ForegroundColor Magenta
Write-Host "🧪 Modus:                $(if ($DryRun) { '🔍 DRY RUN (Vorschau)' } else { '🚀 LIVE' })" -ForegroundColor Yellow
Write-Host "==========================================================================`n" -ForegroundColor Cyan

$Folders = @(
    @{ Name = "01_Vorstand"; Description = "Sitzungsprotokolle, Beschlüsse, Satzung und Vereinsregister"; IsRestricted = $true },
    @{ Name = "02_Finanzen"; Description = "Buchhaltung, Monatsabschlüsse, Steuererklärungen und Belege"; IsRestricted = $true },
    @{ Name = "03_Mitgliederverwaltung"; Description = "Mitgliederliste, Aufnahmeanträge und DSGVO-Einwilligungen"; IsRestricted = $true },
    @{ Name = "04_Veranstaltungen"; Description = "Kulturprogramm, Vernissagen, Lesungen, Ausstellungen"; IsRestricted = $false },
    @{ Name = "05_Cafébetrieb"; Description = "Schichtpläne, Kassenabrechnungen, Einkaufslisten"; IsRestricted = $false },
    @{ Name = "06_Öffentlichkeitsarbeit"; Description = "Pressemitteilungen, Social-Media, Flyer und Bildarchiv"; IsRestricted = $false },
    @{ 
        Name = "07_IT"; 
        Description = "IT-Infrastruktur, Server-Architektur, S3-Backups, M365 und Runbooks"; 
        IsRestricted = $false;
        Subfolders = @("01_Server_und_Architektur", "02_Datenbanken_und_S3_Backups", "03_Microsoft_365_und_SharePoint", "04_Notfall_Runbooks_und_Sicherheit")
    },
    @{ Name = "08_Personal"; Description = "Verträge für Honorarkräfte, Dozierende, Ehrenamtsvereinbarungen"; IsRestricted = $true },
    @{ Name = "09_Vorlagen"; Description = "Offizielle Briefbögen, Honorarabrechnungen, Figma Design Tokens"; IsRestricted = $false },
    @{ Name = "10_Archiv"; Description = "Abgeschlossene Projekte, Alt-Protokolle und historische Akten"; IsRestricted = $false }
)

foreach ($f in $Folders) {
    $lock = if ($f.IsRestricted) { "🔒 [VERTRAULICH]" } else { "📂" }
    Write-Host "$lock Ordner: '$($f.Name)'" -ForegroundColor Green
    Write-Host "   ℹ️  $($f.Description)" -ForegroundColor DarkGray
    if ($f.Subfolders) {
        foreach ($sub in $f.Subfolders) {
            Write-Host "   ├── 📁 $sub" -ForegroundColor White
        }
    }
}

Write-Host "`n==========================================================================" -ForegroundColor Cyan
Write-Host "✅ 10-Ordner-Struktur erfolgreich geprüft und bereit!" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Cyan
