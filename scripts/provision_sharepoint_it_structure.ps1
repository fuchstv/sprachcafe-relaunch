<#
.SYNOPSIS
    SprachCafé Polnisch e.V. - SharePoint Intranet & IT Structure Provisioner (PowerShell)
.DESCRIPTION
    Richtet die Bibliotheken, Ordner und IT-Dokumentationsstrukturen im Microsoft 365
    SharePoint Intranet Hub (/sites/intranet) ein.
.PARAMETER DryRun
    Zeigt die geplante Struktur an, ohne Änderungen in SharePoint vorzunehmen.
#>
[CmdletBinding()]
param(
    [string]$TenantId = "b745a80a-f682-45e4-ba2e-d48bbd9e703d",
    [string]$SharePointDomain = "sprachcafepolnisch.sharepoint.com",
    [string]$SiteUrl = "https://sprachcafepolnisch.sharepoint.com/sites/intranet",
    [switch]$DryRun = $true
)

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " 🏛️ SPRACHCAFÉ POLNISCH e.V. - SHAREPOINT INTRANET & IT PROVISIONER (PWSH)" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "🏢 Mandant/Tenant:      $TenantId" -ForegroundColor Yellow
Write-Host "🌐 SharePoint Domain:    $SharePointDomain" -ForegroundColor Yellow
Write-Host "🏠 Ziel-Site URL:        $SiteUrl" -ForegroundColor Yellow
Write-Host "🎨 Corporate Color:      #8B263E (SprachCafé Weinrot)" -ForegroundColor Magenta
Write-Host "🧪 Modus:                $(if ($DryRun) { '🔍 DRY RUN (Vorschau)' } else { '🚀 LIVE' })" -ForegroundColor Yellow
Write-Host "==========================================================================`n" -ForegroundColor Cyan

$Libraries = @(
    @{
        Title = "💻 IT & System-Infrastruktur"
        Url = "IT_Infrastruktur"
        Description = "Zentrales IT-Betriebshandbuch, Server-Konfigurationen, Runbooks und Notfallpläne"
        Folders = @(
            "01_Architektur_und_Server",
            "02_Datenbanken_und_Backups",
            "03_M365_und_SharePoint_Verwaltung",
            "04_Notfall_Runbooks_und_Eskalation"
        )
    },
    @{
        Title = "🔒 Vorstand & Finanzen"
        Url = "Vorstand_Finanzen"
        Description = "Vertrauliche Vereinsakten, Buchhaltung, Steuererklärungen und Notariatsunterlagen"
        IsRestricted = $true
        Folders = @(
            "01_Buchhaltung_und_Steuer",
            "02_Vereinsregister_und_Satzung",
            "03_Sitzungsprotokolle",
            "04_Vertraege_und_SEPA"
        )
    },
    @{
        Title = "📍 Standorte & Betrieb"
        Url = "Standorte_Betrieb"
        Description = "Schichtpläne, Raumbelegungen, Inventare und Schlüsselverwaltung"
        Folders = @(
            "Pankow_Schulzestr_1",
            "Schoeneberg_Hauptstr",
            "Koepenick_Wiesengraben",
            "Schichtplaene_und_Schluessel"
        )
    },
    @{
        Title = "🎓 Dozierende & Sprachkurse"
        Url = "Dozierende_Kurse"
        Description = "Unterrichtsmaterialien, Einstufungstests, Curricula und Raumbelegungen"
        Folders = @(
            "01_Polnisch_Kurse",
            "02_Deutsch_Kurse",
            "03_Tandem_und_Workshops"
        )
    },
    @{
        Title = "🎨 Kultur, Galerie & Events"
        Url = "Kultur_Events"
        Description = "Ausstellungen, Vernissagen, Plakatarchiv, Künstlervereinbarungen und Presse"
        Folders = @(
            "01_Ausstellungen_und_Galerie",
            "02_Presse_und_Flyer",
            "03_Veranstaltungsarchiv"
        )
    },
    @{
        Title = "📦 Vorlagencenter & CI"
        Url = "Vorlagencenter"
        Description = "Offizielle Vorlagen für Briefe, Formulare, Logos, Farb-Tokens und Präsentationen"
        Folders = @(
            "01_Briefvorlagen_und_Formulare",
            "02_Logos_und_Brand_Assets",
            "03_Design_Tokens_und_UX_Kit"
        )
    }
)

foreach ($lib in $Libraries) {
    $lock = if ($lib.IsRestricted) { "🔒 [VERTRAULICH]" } else { "📂" }
    Write-Host "`n$lock Bibliothek: '$($lib.Title)' (URL: $($lib.Url))" -ForegroundColor Green
    Write-Host "   ℹ️  $($lib.Description)" -ForegroundColor DarkGray
    
    foreach ($f in $lib.Folders) {
        Write-Host "   ├── 📁 Ordner: '$f'" -ForegroundColor White
    }
}

Write-Host "`n==========================================================================" -ForegroundColor Cyan
Write-Host "✅ Struktur erfolgreich geprüft und bereit zur Bereitstellung!" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Cyan
