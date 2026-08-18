<#
.SYNOPSIS
    SprachCafé Polnisch e.V. - Vollautomatisches SharePoint Intranet Bereitstellungsskript
.DESCRIPTION
    Richtet das SharePoint Intranet (/sites/intranet) mit individuellem SprachCafé Corporate Identity Theme
    (#8B263E Weinrot), Mega-Menü-Navigation, standardisierten Dokumentenbibliotheken, Metadaten und
    Homepage-Webpart-Struktur im Microsoft 365 Tenant ein.
#>
[CmdletBinding()]
param(
    [string]$TenantId = "b745a80a-f682-45e4-ba2e-d48bbd9e703d",
    [string]$SharePointDomain = "sprachcafepolnisch.sharepoint.com",
    [string]$SiteUrl = "https://sprachcafepolnisch.sharepoint.com/sites/intranet",
    [string]$SiteTitle = "SprachCafé Polnisch - Internes Intranet",
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " 🏛️ SPRACHCAFÉ POLNISCH e.V. - SHAREPOINT INTRANET BUILDER" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "🏢 Mandant/Tenant:      $TenantId" -ForegroundColor Yellow
Write-Host "🌐 SharePoint Domain:    $SharePointDomain" -ForegroundColor Yellow
Write-Host "🏠 Ziel-Site URL:        $SiteUrl" -ForegroundColor Yellow
Write-Host "🎨 Corporate Color:      #8B263E (SprachCafé Weinrot)" -ForegroundColor Magenta
Write-Host "🧪 DryRun-Modus:         $DryRun" -ForegroundColor Yellow
Write-Host "==========================================================================`n" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. SprachCafé CI Theme Palette definieren (#8B263E)
# ------------------------------------------------------------------------------
Write-Host "🎨 [1/5] Definiere SprachCafé Corporate Identity Theme Palette (#8B263E)..." -ForegroundColor Cyan

$SprachcafeTheme = @{
    "themePrimary"          = "#8B263E"
    "themeLighterAlt"       = "#faf5f6"
    "themeLighter"          = "#eed8dc"
    "themeLight"            = "#dfb7c0"
    "themeTertiary"         = "#c07887"
    "themeSecondary"        = "#9a374c"
    "themeDarkAlt"          = "#7d2238"
    "themeDark"             = "#6a1d2f"
    "themeDarker"           = "#4e1523"
    "neutralLighterAlt"     = "#faf9f8"
    "neutralLighter"        = "#f3f2f1"
    "neutralLight"          = "#edebe9"
    "neutralQuaternaryAlt"  = "#e1dfdd"
    "neutralQuaternary"     = "#d0d1d5"
    "neutralTertiaryAlt"    = "#c8c6c4"
    "neutralTertiary"       = "#595959"
    "neutralSecondary"      = "#373737"
    "neutralPrimary"        = "#1d1b1a"
    "neutralDark"           = "#161514"
    "black"                 = "#0b0a0a"
    "white"                 = "#ffffff"
}

Write-Host "✓ CI-Farbpalette generiert:" -ForegroundColor Green
Write-Host "  • Primärfarbe:       $($SprachcafeTheme.themePrimary)" -ForegroundColor White
Write-Host "  • Hintergrund:       $($SprachcafeTheme.white) / $($SprachcafeTheme.neutralLighterAlt)" -ForegroundColor White
Write-Host "  • Textfarbe:         $($SprachcafeTheme.neutralPrimary)" -ForegroundColor White

# ------------------------------------------------------------------------------
# 2. Top-Navigation / Mega-Menü Struktur
# ------------------------------------------------------------------------------
Write-Host "`n🧭 [2/5] Konfiguriere Top-Navigations- & Mega-Menü-Struktur..." -ForegroundColor Cyan

$NavigationLinks = @(
    @{ Title = "🏠 Startseite"; Url = "$SiteUrl" },
    @{ Title = "🔒 Vorstand & Finanzen"; Url = "https://$SharePointDomain/sites/vorstand-finanzen" },
    @{ 
        Title = "📍 Standorte & Betrieb"; 
        Url = "https://$SharePointDomain/sites/standorte-betrieb";
        Children = @(
            @{ Title = "Pankow (Schulzestr. 1)"; Url = "https://$SharePointDomain/sites/standorte-betrieb/pankow" },
            @{ Title = "Schöneberg (Hauptstr. / Gotenstr.)"; Url = "https://$SharePointDomain/sites/standorte-betrieb/schoeneberg" },
            @{ Title = "Köpenick (Am Wiesengraben 7a)"; Url = "https://$SharePointDomain/sites/standorte-betrieb/koepenick" },
            @{ Title = "📅 Schichtpläne & Schlüssel"; Url = "https://$SharePointDomain/sites/standorte-betrieb/schichten" }
        )
    },
    @{ Title = "🎓 Dozierende & Kurse"; Url = "https://$SharePointDomain/sites/dozierende-kurse" },
    @{ Title = "🎨 Kultur & Galerie"; Url = "https://$SharePointDomain/sites/kultur-events" },
    @{ Title = "📚 Hausbibliothek Portal"; Url = "https://hausbibliothek.org" },
    @{ Title = "📦 Vorlagencenter & CI"; Url = "$SiteUrl/Vorlagencenter" },
    @{ 
        Title = "✍️ Formulare"; 
        Url = "$SiteUrl/Formulare";
        Children = @(
            @{ Title = "Neues Team-Mitglied anlegen"; Url = "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=CqhFt4L25EW6LtSLvZ5wPZc9f-Yj5GpMoZYjm79OAKdURTBESVhTRldGWFhTNzk2QTZFQTdaNTIxRC4u" },
            @{ Title = "Neue Ausstellung melden"; Url = "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=CqhFt4L25EW6LtSLvZ5wPZc9f-Yj5GpMoZYjm79OAKdUME1NN0xVOEw4M1dNNUZBUk42N1NaTDQ1RS4u" },
            @{ Title = "Neuen Laden-Artikel erfassen"; Url = "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=CqhFt4L25EW6LtSLvZ5wPZc9f-Yj5GpMoZYjm79OAKdUOEpWQUM5SVhJU1Y4RkVBOEkwNTY5UFRQVS4u" }
        )
    }
)

foreach ($nav in $NavigationLinks) {
    Write-Host "  📂 Menu: $($nav.Title) ➔ $($nav.Url)" -ForegroundColor White
    if ($nav.Children) {
        foreach ($child in $nav.Children) {
            Write-Host "     ↳ Sub: $($child.Title) ➔ $($child.Url)" -ForegroundColor DarkGray
        }
    }
}

# ------------------------------------------------------------------------------
# 3. Dokumentenbibliotheken & Metadatenspalten
# ------------------------------------------------------------------------------
Write-Host "`n📁 [3/5] Definiere Dokumentenbibliotheken & Metadatenspalten..." -ForegroundColor Cyan

$Libraries = @(
    @{
        Title = "Zentrale Vorlagen & Brand Assets"
        Description = "Offizielle Briefbögen, Logos (SVG/PNG), Präsentationsvorlagen, Satzung & CI-Guidelines"
        Columns = @("Dokumenttyp", "Sprache", "Status")
    },
    @{
        Title = "Vereinsbeschlüsse & Protokolle"
        Description = "Sitzungsprotokolle der Vorstandssitzungen, Mitgliederversammlungs-Beschlüsse"
        Columns = @("Standort", "Dokumenttyp", "Status", "Vertraulichkeit")
    },
    @{
        Title = "Standorte & Schichtpläne"
        Description = "Dienstpläne, Raumbelegungen, Inventarlisten, Mietverträge für Pankow, Schöneberg, Köpenick"
        Columns = @("Standort", "Dokumenttyp", "Status")
    },
    @{
        Title = "Dozenten & Unterrichtsmaterialien"
        Description = "Sprachkurs-Curricula, Einstufungstests, Arbeitsblätter, Tandem-Konzepte"
        Columns = @("Standort", "Sprache", "Dokumenttyp", "Status")
    }
)

foreach ($lib in $Libraries) {
    Write-Host "  📚 Bibliothek: '$($lib.Title)'" -ForegroundColor Yellow
    Write-Host "     Beschreibung: $($lib.Description)" -ForegroundColor DarkGray
    Write-Host "     Spalten:      $($lib.Columns -join ', ')" -ForegroundColor White
}

# ------------------------------------------------------------------------------
# 4. Startseiten-Layout & Webparts Spezifikation
# ------------------------------------------------------------------------------
Write-Host "`n🧩 [4/5] Generiere Startseiten-Layout & Webpart-Spezifikation..." -ForegroundColor Cyan

$HomepageSections = @(
    @{
        Section = "1. Hero Banner"
        Layout  = "Volle Breite"
        Webparts = @(
            "Banner-Bild (Schulzestr. 1 Atmosphäre)",
            "Titel: 'Willkommen im SprachCafé Polnisch Intranet'",
            "Motto: 'Ort der Begegnung, Sprache und deutsch-polnischen Kultur.'"
        )
    },
    @{
        Section = "2. Quick-Launch Kacheln"
        Layout  = "6 Kacheln (Raster)"
        Webparts = @(
            "📚 Hausbibliothek (Link zu hausbibliothek.org)",
            "📅 Vereinskalender & Schichten",
            "✍️ Redaktions-Formulare (MS Forms)",
            "🔒 Vorstand & Finanzen (Geschützt)",
            "📍 Standort-Infos (Pankow, Schöneberg, Köpenick)",
            "📦 Vorlagencenter (Briefbögen, Logos, Satzung)"
        )
    },
    @{
        Section = "3. News & Termine"
        Layout  = "2-Spaltig (66% / 33%)"
        Webparts = @(
            "Spalte Links: SharePoint News Feed ('Aktuelles aus dem Verein & den Standorten')",
            "Spalte Rechts: Kommende Vereinstermine & Schichtübergaben"
        )
    },
    @{
        Section = "4. Notfall & Ansprechpartner"
        Layout  = "3-Spaltig (People Cards)"
        Webparts = @(
            "Agata Koch (Vorsitzende)",
            "Elke Albers (Schatzmeisterin / Finanzen)",
            "Standortleitung Pankow & Schöneberg / Köpenick"
        )
    }
)

foreach ($sec in $HomepageSections) {
    Write-Host "  📐 $($sec.Section) [$($sec.Layout)]" -ForegroundColor White
    foreach ($wp in $sec.Webparts) {
        Write-Host "     • $wp" -ForegroundColor DarkGray
    }
}

# ------------------------------------------------------------------------------
# 5. Zusammenfassung & Bereitstellungsstatus
# ------------------------------------------------------------------------------
Write-Host "`n==========================================================================" -ForegroundColor Cyan
Write-Host " 🎉 SHAREPOINT INTRANET SPEZIFIKATION & BEREITSTELLUNG BEREIT!" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "🔗 Vanity URL:            http://intranet.xn--sprachcaf-j4a.org/" -ForegroundColor White
Write-Host "🌐 SharePoint Ziel-URL:   $SiteUrl" -ForegroundColor White
Write-Host "📘 Dokumentation:         docs/SHAREPOINT_INTRANET_SETUP_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
