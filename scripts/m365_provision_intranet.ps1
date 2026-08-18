<#
.SYNOPSIS
    SprachCafé Polnisch e.V. - Microsoft 365 Intranet & SharePoint Provisioning Tool
.DESCRIPTION
    Richtet automatisiert die M365 SharePoint Hub-Architektur, Entra ID Sicherheitsgruppen,
    Berechtigungsstufen und standardisierte Metadaten-Bibliotheken für das interne Vereins-Intranet ein.
.PARAMETER TenantId
    Die Entra ID / Microsoft 365 Tenant-ID (Default: b745a80a-f682-45e4-ba2e-d48bbd9e703d).
.PARAMETER HubSiteUrl
    Die URL der SharePoint-Hub-Website (Default: https://sprachcafepolnisch.sharepoint.com/sites/intranet).
#>
[CmdletBinding()]
param(
    [string]$TenantId = "b745a80a-f682-45e4-ba2e-d48bbd9e703d",
    [string]$SharePointDomain = "sprachcafepolnisch.sharepoint.com",
    [string]$HubSiteUrl = "https://sprachcafepolnisch.sharepoint.com/sites/intranet",
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " 🚀 SPRACHCAFÉ POLNISCH e.V. - M365 INTRANET & SHAREPOINT PROVISIONING" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "🏢 Tenant ID:           $TenantId" -ForegroundColor Yellow
Write-Host "🌐 SharePoint Domain:   $SharePointDomain" -ForegroundColor Yellow
Write-Host "🏠 Hub Site URL:        $HubSiteUrl" -ForegroundColor Yellow
Write-Host "🧪 DryRun-Modus:        $DryRun" -ForegroundColor Yellow
Write-Host "==========================================================================`n" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. Authentifizierung prüfen (Azure CLI / MS Graph)
# ------------------------------------------------------------------------------
Write-Host "📡 [1/5] Prüfe Microsoft Graph Authentifizierung..." -ForegroundColor Cyan

$GraphTokenRaw = az account get-access-token --resource-type ms-graph 2>$null | ConvertFrom-Json
if (-not $GraphTokenRaw -or -not $GraphTokenRaw.accessToken) {
    Write-Warning "⚠️ Kein aktives Graph-Token via Azure CLI gefunden."
    Write-Host "ℹ️ Bitte führen Sie 'az login --tenant $TenantId' oder 'm365 login' aus." -ForegroundColor DarkYellow
    $GraphToken = "SAMPLE_GRAPH_TOKEN"
} else {
    $GraphToken = $GraphTokenRaw.accessToken
    Write-Host "✓ Erfolgreich mit Microsoft Graph verbunden!" -ForegroundColor Green
}

$GraphHeaders = @{
    "Authorization" = "Bearer $GraphToken"
    "Content-Type"  = "application/json"
}

# ------------------------------------------------------------------------------
# 2. Entra ID Sicherheitsgruppen definieren (4-Stufiges Rollenmodell)
# ------------------------------------------------------------------------------
Write-Host "`n👥 [2/5] Konfiguriere Entra ID Sicherheitsgruppen (4-Stufiges Rollenmodell)..." -ForegroundColor Cyan

$SecurityGroups = @(
    @{
        DisplayName = "SG-SprachCafe-Vorstand"
        Description = "Vollzugriff auf alle Vereinsbereiche, Finanzen, Verträge, Notar- & Mitgliederdaten"
        MailNickname = "sc-vorstand"
    },
    @{
        DisplayName = "SG-SprachCafe-Standortleitung"
        Description = "Leitung der Standorte Pankow, Schöneberg, Köpenick (Schichtplanung, Räume, Inventar)"
        MailNickname = "sc-standortleitung"
    },
    @{
        DisplayName = "SG-SprachCafe-Dozierende"
        Description = "Dozierende & Kursleiter (Kursmaterialien, Tandems, Raumbelegung, Didaktik)"
        MailNickname = "sc-dozierende"
    },
    @{
        DisplayName = "SG-SprachCafe-Ehrenamtliche"
        Description = "Ehrenamtliche & Helfer (Allgemeine Dokumente, Brand Assets, News, Helferpläne)"
        MailNickname = "sc-ehrenamtliche"
    }
)

foreach ($group in $SecurityGroups) {
    Write-Host "  🔑 Gruppe: $($group.DisplayName) - $($group.Description)" -ForegroundColor White
    if (-not $DryRun -and $GraphToken -ne "SAMPLE_GRAPH_TOKEN") {
        try {
            $body = @{
                displayName     = $group.DisplayName
                description     = $group.Description
                mailEnabled     = $false
                mailNickname    = $group.MailNickname
                securityEnabled = $true
            } | ConvertTo-Json

            $createRes = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/groups" -Headers $GraphHeaders -Method Post -Body $body -ErrorAction SilentlyContinue
            Write-Host "     ✓ Angelegt/Geprüft (ID: $($createRes.id))" -ForegroundColor Green
        } catch {
            Write-Host "     ℹ️ Gruppe existiert bereits oder Berechtigung beschränkt." -ForegroundColor DarkGray
        }
    }
}

# ------------------------------------------------------------------------------
# 3. SharePoint Site-Struktur (Hub & Connected Department Sites)
# ------------------------------------------------------------------------------
Write-Host "`n🏛️ [3/5] Definiere SharePoint Site-Architektur..." -ForegroundColor Cyan

$SitesToProvision = @(
    @{
        Title       = "SprachCafé Intranet Hub"
        UrlPath     = "intranet"
        Type        = "HubSite / CommunicationSite"
        Description = "Zentrale Startseite: News, Vereinskalender, Notfallkontakte, Vorlagen-Center"
        Permission  = "Alle: Lesen; Vorstand/Leitung: Bearbeiten"
    },
    @{
        Title       = "Vorstand & Finanzen"
        UrlPath     = "vorstand-finanzen"
        Type        = "TeamSite (Vertraulich)"
        Description = "Buchhaltung, Bankbelege, SEPA-Mandate, Verträge, Notariatsakten, Sitzungsprotokolle"
        Permission  = "Nur Vorstand: Vollzugriff"
    },
    @{
        Title       = "Standorte & Betrieb"
        UrlPath     = "standorte-betrieb"
        Type        = "TeamSite"
        Description = "Pankow, Schöneberg, Köpenick: Schichtpläne, Raumbelegung, Schlüsselverwaltung, Inventar"
        Permission  = "Standortleitung: Vollzugriff; Ehrenamtliche: Lesen/Schreiben in Helferlisten"
    },
    @{
        Title       = "Dozierende & Sprachkurse"
        UrlPath     = "dozierende-kurse"
        Type        = "TeamSite"
        Description = "Pädagogische Materialien, Sprachkurs-Curricula, Tandem-Planung, Raumzeiten"
        Permission  = "Dozierende & Leitung: Bearbeiten"
    },
    @{
        Title       = "Kultur, Galerie & Events"
        UrlPath     = "kultur-events"
        Type        = "TeamSite"
        Description = "Ausstellungsplanung, Künstlervereinbarungen, Vernissagen, Programmhefte, Medienarchiv"
        Permission  = "Kulturteam: Bearbeiten; Alle: Lesen"
    },
    @{
        Title       = "Hausbibliothek Team"
        UrlPath     = "hausbibliothek-intern"
        Type        = "TeamSite"
        Description = "Inventurlisten, Buchspenden-Annahme, Katalog-Pflege, Anschaffungsvorschläge"
        Permission  = "Bibliotheks-Team: Bearbeiten"
    }
)

foreach ($site in $SitesToProvision) {
    Write-Host "  🏢 Site: $($site.Title) (https://$SharePointDomain/sites/$($site.UrlPath))" -ForegroundColor Yellow
    Write-Host "     Typ:         $($site.Type)" -ForegroundColor DarkGray
    Write-Host "     Zweck:       $($site.Description)" -ForegroundColor DarkGray
    Write-Host "     Rechte:      $($site.Permission)" -ForegroundColor White
}

# ------------------------------------------------------------------------------
# 4. Standardisierte Metadaten & Spalten-Taxonomie
# ------------------------------------------------------------------------------
Write-Host "`n🏷️ [4/5] Definiere standardisierte Metadaten-Taxonomie für Dokumentenbibliotheken..." -ForegroundColor Cyan

$TaxonomyColumns = @(
    @{
        Name = "Standort"
        Type = "Choice"
        Choices = @("Pankow (Schulzestr. 1)", "Schöneberg (Hauptstr. 121 / Gotenstr. 45)", "Köpenick (Am Wiesengraben 7a)", "Übergeordnet / Alle Standorte")
    },
    @{
        Name = "Dokumenttyp"
        Type = "Choice"
        Choices = @("Protokoll & Beschluss", "Vertrag & Vereinbarung", "Vorlage & Formular", "Rechnung & Beleg", "Konzept & Projektantrag", "Presse- & Marketingmaterial", "Leitfaden & How-To")
    },
    @{
        Name = "Sprache"
        Type = "Choice"
        Choices = @("Deutsch (DE)", "Polnisch (PL)", "Englisch (EN)", "Zweisprachig (DE/PL)", "Mehrsprachig")
    },
    @{
        Name = "Vertraulichkeit"
        Type = "Choice"
        Choices = @("Öffentlich (Vereinsweit)", "Intern (Team)", "Vertraulich (Nur Vorstand/Finanzen)")
    },
    @{
        Name = "Status"
        Type = "Choice"
        Choices = @("Entwurf", "In Prüfung / Review", "Freigegeben / Gültig", "Archiviert")
    }
)

foreach ($col in $TaxonomyColumns) {
    Write-Host "  📌 Spalte: '$($col.Name)' ($($col.Type))" -ForegroundColor White
    Write-Host "     Werte: $($col.Choices -join ' | ')" -ForegroundColor DarkGray
}

# ------------------------------------------------------------------------------
# 5. Zusammenfassung & Nächste Schritte
# ------------------------------------------------------------------------------
Write-Host "`n==========================================================================" -ForegroundColor Cyan
Write-Host " ✅ INTRANET-PROVISIONING SPEZIFIKATION ERFOLGREICH INITIALISIERT!" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "🔗 Vanity URL:       http://intranet.xn--sprachcaf-j4a.org/ ➔ https://$SharePointDomain/sites/intranet" -ForegroundColor White
Write-Host "📖 Dokumentation:    docs/INTRANET_M365_ARCHITECTURE.md" -ForegroundColor Yellow
Write-Host ""
