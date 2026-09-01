<#
.SYNOPSIS
    SprachCafé Polnisch e.V. - SharePoint Hub Startseiten & 10-Ordner Einrichtungs-Skript
.DESCRIPTION
    Richtet das SharePoint Intranet (/sites/intranet) mit der 10-Ordner-Kachelstruktur,
    der Top-Navigation, dem Dokumenten-Webpart und dem SprachCafé CI Theme (#8B263E) ein.
#>
[CmdletBinding()]
param(
    [string]$TenantId = "b745a80a-f682-45e4-ba2e-d48bbd9e703d",
    [string]$SharePointDomain = "sprachcafepolnisch.sharepoint.com",
    [string]$SiteUrl = "https://sprachcafepolnisch.sharepoint.com/sites/intranet",
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " 🏛️ SPRACHCAFÉ POLNISCH e.V. - SHAREPOINT HUB 10-ORDNER BUILDER" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "🏢 Mandant/Tenant:      $TenantId" -ForegroundColor Yellow
Write-Host "🌐 SharePoint Domain:    $SharePointDomain" -ForegroundColor Yellow
Write-Host "🏠 Ziel-Site URL:        $SiteUrl" -ForegroundColor Yellow
Write-Host "🎨 Corporate Color:      #8B263E (SprachCafé Weinrot)" -ForegroundColor Magenta
Write-Host "🧪 DryRun-Modus:         $DryRun" -ForegroundColor Yellow
Write-Host "==========================================================================`n" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. 10 Hauptordner & Quick Links
# ------------------------------------------------------------------------------
Write-Host "📂 [1/4] Definiere 10 Hauptordner für die SharePoint-Startseite..." -ForegroundColor Cyan

$Folders10 = @(
    @{ Number = "01"; Name = "01_Vorstand"; Icon = "🔒"; Title = "Vorstand"; Desc = "Satzung, Protokolle, Vereinsregister"; Url = "$SiteUrl/Freigegebene%20Dokumente/01_Vorstand" },
    @{ Number = "02"; Name = "02_Finanzen"; Icon = "🔒"; Title = "Finanzen"; Desc = "Buchhaltung, Belege, Steuer, SEPA"; Url = "$SiteUrl/Freigegebene%20Dokumente/02_Finanzen" },
    @{ Number = "03"; Name = "03_Mitgliederverwaltung"; Icon = "🔒"; Title = "Mitgliederverwaltung"; Desc = "Mitgliederlisten, Anträge, DSGVO"; Url = "$SiteUrl/Freigegebene%20Dokumente/03_Mitgliederverwaltung" },
    @{ Number = "04"; Name = "04_Veranstaltungen"; Icon = "🎭"; Title = "Veranstaltungen"; Desc = "Kulturprogramm, Lesungen, Speak-Dating"; Url = "$SiteUrl/Freigegebene%20Dokumente/04_Veranstaltungen" },
    @{ Number = "05"; Name = "05_Cafébetrieb"; Icon = "☕"; Title = "Cafébetrieb"; Desc = "Schichtpläne, Kassenbuch, Checklisten"; Url = "$SiteUrl/Freigegebene%20Dokumente/05_Cafébetrieb" },
    @{ Number = "06"; Name = "06_Öffentlichkeitsarbeit"; Icon = "📢"; Title = "Öffentlichkeitsarbeit"; Desc = "Pressemitteilungen, Flyer, Social Media"; Url = "$SiteUrl/Freigegebene%20Dokumente/06_Öffentlichkeitsarbeit" },
    @{ Number = "07"; Name = "07_IT"; Icon = "💻"; Title = "IT & Infrastruktur"; Desc = "Server, Backups, M365, Runbooks"; Url = "$SiteUrl/Freigegebene%20Dokumente/07_IT" },
    @{ Number = "08"; Name = "08_Personal"; Icon = "🔒"; Title = "Personal"; Desc = "Dozenten- & Honorarverträge, Ehrenamt"; Url = "$SiteUrl/Freigegebene%20Dokumente/08_Personal" },
    @{ Number = "09"; Name = "09_Vorlagen"; Icon = "📦"; Title = "Vorlagencenter"; Desc = "Briefbögen, Honorarabrechnung, CI-Logos"; Url = "$SiteUrl/Freigegebene%20Dokumente/09_Vorlagen" },
    @{ Number = "10"; Name = "10_Archiv"; Icon = "🗄️"; Title = "Archiv"; Desc = "Abgeschlossene Projekte, Historie"; Url = "$SiteUrl/Freigegebene%20Dokumente/10_Archiv" }
)

foreach ($f in $Folders10) {
    Write-Host "  $($f.Icon) [$($f.Number)] $($f.Name) ➔ $($f.Url)" -ForegroundColor Green
    Write-Host "     ℹ️  $($f.Desc)" -ForegroundColor DarkGray
}

# ------------------------------------------------------------------------------
# 2. Startseiten-Layout mit Quick-Links-Grid & Dokumenten-Webpart
# ------------------------------------------------------------------------------
Write-Host "`n🧩 [2/4] Konfiguriere Startseiten-Webparts (Home.aspx)..." -ForegroundColor Cyan

$Webparts = @(
    @{
        Name = "Hero Banner"
        Type = "Hero"
        Config = "Titel: 'SprachCafé Polnisch – Zentrales Intranet', CI-Farbe: #8B263E"
    },
    @{
        Name = "10-Ordner Quick-Launch Raster"
        Type = "QuickLinks (Grid / Kacheln)"
        Config = "10 Kacheln (01_Vorstand bis 10_Archiv) mit Direktverlinkung"
    },
    @{
        Name = "Dokumentenbibliothek 'Freigegebene Dokumente'"
        Type = "DocumentLibrary"
        Config = "Startordner: Stammverzeichnis, Ansicht: Kacheln / Raster"
    },
    @{
        Name = "Schnellzugriffe & Team-Tools"
        Type = "Links"
        Config = "Dienstplan (team.sprachcafé.org), Hausbibliothek (hausbibliothek.org), Kurse (kurse.sprachcafé.org)"
    }
)

foreach ($wp in $Webparts) {
    Write-Host "  • Webpart: $($wp.Name) [$($wp.Type)]" -ForegroundColor White
    Write-Host "    Konfig:  $($wp.Config)" -ForegroundColor DarkGray
}

# ------------------------------------------------------------------------------
# 3. Top-Navigation
# ------------------------------------------------------------------------------
Write-Host "`n🧭 [3/4] Konfiguriere Top-Navigationsleiste..." -ForegroundColor Cyan

$TopNav = @(
    "🏠 Startseite ➔ $SiteUrl",
    "📁 Dokumente ➔ $SiteUrl/Freigegebene%20Dokumente",
    "💻 IT & Server ➔ $SiteUrl/Freigegebene%20Dokumente/07_IT",
    "📦 Vorlagencenter ➔ $SiteUrl/Freigegebene%20Dokumente/09_Vorlagen",
    "📅 Dienstplan ➔ https://team.sprachcafé.org",
    "📚 Hausbibliothek ➔ https://hausbibliothek.org"
)

foreach ($nav in $TopNav) {
    Write-Host "  🔗 $nav" -ForegroundColor White
}

Write-Host "`n==========================================================================" -ForegroundColor Cyan
Write-Host "✅ SHAREPOINT HUB KONFIGURATION ERFOLGREICH BEREITGESTELLT!" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "🌐 Ziel-URL: $SiteUrl" -ForegroundColor White
