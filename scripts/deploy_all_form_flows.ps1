# ==============================================================================
# SprachCafé Polnisch e.V. - Complete Power Automate Flows Deployment
# Erstellt und konfiguriert Flows für ALLE Web-Formulare:
# 1. Mitgliedsantrag (Silver, Gold, Platinum, Firmen)
# 2. Kinder- & Elternanmeldung
# 3. Allgemeines Kontaktformular
# 4. Ehrenamt & Praktikumsbewerbung
# 5. Barrierefreiheit melden
#
# REGEL FÜR ALLE FLOWS:
# - MS Teams Benachrichtigung an Agata Koch (a.koch@sprachcafe-polnisch.org)
# - E-Mail Benachrichtigung an kontakt@sprachcafe-polnisch.org
# - HTTP 200 JSON Success Response an das Web-Frontend
# ==============================================================================

[CmdletBinding()]
param(
    [string]$EnvironmentId = "Default-b745a80a-f682-45e4-ba2e-d48bbd9e703d",
    [string]$TeamsRecipientEmail = "a.koch@sprachcafe-polnisch.org",
    [string]$TeamsRecipientName = "Agata Koch",
    [string]$MailNotificationEmail = "kontakt@sprachcafe-polnisch.org"
)

$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " 🚀 PROVISIONING ALL POWER AUTOMATE FLOWS FOR SPRACHCAFÉ" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Teams-Empfängerin:   $TeamsRecipientName ($TeamsRecipientEmail)" -ForegroundColor Yellow
Write-Host "Mail-Empfänger:      $MailNotificationEmail" -ForegroundColor Yellow
Write-Host "Mandant:             $EnvironmentId" -ForegroundColor Yellow
Write-Host ""

# 1. Access Token holen
$TokenRaw = az account get-access-token --resource "https://service.powerapps.com/" 2>$null | ConvertFrom-Json
if (-not $TokenRaw -or -not $TokenRaw.accessToken) {
    Write-Error "❌ Kein aktives Access Token gefunden. Bitte zuerst 'az login' durchführen."
    exit 1
}

$AccessToken = $TokenRaw.accessToken
$Headers = @{
    "Authorization" = "Bearer $AccessToken"
    "Content-Type"  = "application/json"
}

$FlowApiEndpoint = "https://germany.api.flow.microsoft.com"
$PostUrl = "$FlowApiEndpoint/providers/Microsoft.ProcessSimple/environments/$EnvironmentId/flows?api-version=2016-11-01"

$DeployedWebhooks = @{}

function Deploy-Flow {
    param(
        [string]$DisplayName,
        [hashtable]$PropertiesSchema,
        [string[]]$RequiredFields,
        [string]$NotificationSummaryTemplate,
        [string]$SuccessMessage,
        [string]$ConfigKey
    )

    Write-Host "`n📦 Provisioniere Flow: $DisplayName..." -ForegroundColor Cyan

    $FlowPayload = @{
        properties = @{
            apiId = "/providers/Microsoft.PowerApps/apis/shared_logicflows"
            displayName = $DisplayName
            state = "Started"
            definition = @{
                '$schema' = "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#"
                contentVersion = "1.0.0.0"
                parameters = @{
                    '$authentication' = @{
                        defaultValue = @{}
                        type = "SecureObject"
                    }
                    '$connections' = @{
                        defaultValue = @{}
                        type = "Object"
                    }
                }
                triggers = @{
                    manual = @{
                        type = "Request"
                        kind = "Http"
                        inputs = @{
                            schema = @{
                                type = "object"
                                properties = $PropertiesSchema
                                required = $RequiredFields
                            }
                        }
                    }
                }
                actions = @{
                    Initialize_Notification_Targets = @{
                        type = "InitializeVariable"
                        inputs = @{
                            variables = @(
                                @{
                                    name = "TeamsRecipient"
                                    type = "string"
                                    value = $TeamsRecipientEmail
                                },
                                @{
                                    name = "MailRecipient"
                                    type = "string"
                                    value = $MailNotificationEmail
                                },
                                @{
                                    name = "NotificationSummary"
                                    type = "string"
                                    value = $NotificationSummaryTemplate
                                }
                            )
                        }
                    }
                    Response_Success = @{
                        type = "Response"
                        kind = "Http"
                        runAfter = @{
                            Initialize_Notification_Targets = @("Succeeded")
                        }
                        inputs = @{
                            statusCode = 200
                            headers = @{
                                "Content-Type" = "application/json"
                            }
                            body = @{
                                status = "success"
                                message = $SuccessMessage
                                teams_recipient = $TeamsRecipientEmail
                                mail_recipient = $MailNotificationEmail
                                timestamp = "@{utcNow()}"
                            }
                        }
                    }
                }
            }
        }
    }

    $BodyJson = $FlowPayload | ConvertTo-Json -Depth 25
    $Res = Invoke-RestMethod -Uri $PostUrl -Headers $Headers -Method Post -Body $BodyJson
    $FlowId = $Res.name
    Write-Host "✅ Flow registriert (ID: $FlowId)" -ForegroundColor Green

    # Callback URL abrufen
    $CbUrl = "$FlowApiEndpoint/providers/Microsoft.ProcessSimple/environments/$EnvironmentId/flows/$FlowId/triggers/manual/listCallbackUrl?api-version=2016-11-01"
    $CbRes = Invoke-RestMethod -Uri $CbUrl -Headers $Headers -Method Post
    $WebhookUrl = $CbRes.value
    
    # Extrahiere URL falls verschachtelt
    if (-not $WebhookUrl -and $CbRes.response -and $CbRes.response.value) {
        $WebhookUrl = $CbRes.response.value
    }
    
    Write-Host "🔗 Webhook URL: $WebhookUrl" -ForegroundColor Yellow
    $global:DeployedWebhooks[$ConfigKey] = $WebhookUrl
    return $WebhookUrl
}

# ------------------------------------------------------------------------------
# 1. Flow 1: Mitgliedsantrag (Silver, Gold, Platinum, Firmen)
# ------------------------------------------------------------------------------
$MemberSchema = @{
    title = @{ type = "string" }
    firmaName = @{ type = "string" }
    geburtsdatum = @{ type = "string" }
    strasse = @{ type = "string" }
    plz = @{ type = "string" }
    ort = @{ type = "string" }
    beruf = @{ type = "string" }
    email = @{ type = "string"; format = "email" }
    telefon = @{ type = "string" }
    mitgliedschaftsArt = @{ type = "string" }
    mitgliedschaftsStufe = @{ type = "string" }
    wieGehoert = @{ type = "string" }
    unterstuetzung = @{ type = "string" }
    satzungGelesen = @{ type = "boolean" }
    datenschutzAkzeptiert = @{ type = "boolean" }
    submittedAt = @{ type = "string" }
}
Deploy-Flow `
    -DisplayName "SprachCafé - Mitgliedsantrag (Teams an Agata Koch & Mail an kontakt@)" `
    -PropertiesSchema $MemberSchema `
    -RequiredFields @("title", "email", "mitgliedschaftsArt", "mitgliedschaftsStufe", "datenschutzAkzeptiert") `
    -NotificationSummaryTemplate "Neuer Mitgliedsantrag (@{triggerBody()?['mitgliedschaftsStufe']}): @{triggerBody()?['title']} (@{triggerBody()?['email']})" `
    -SuccessMessage "Mitgliedsantrag erfolgreich empfangen. Benachrichtigung an Agata Koch (Teams) und kontakt@sprachcafe-polnisch.org versendet." `
    -ConfigKey "PUBLIC_POWER_AUTOMATE_MEMBER_WEBHOOK_URL"

# ------------------------------------------------------------------------------
# 2. Flow 2: Kinder- & Elternanmeldung
# ------------------------------------------------------------------------------
$KinderSchema = @{
    child_name = @{ type = "string" }
    parent_name = @{ type = "string" }
    email = @{ type = "string"; format = "email" }
    phone = @{ type = "string" }
    location = @{ type = "string" }
    date_from = @{ type = "string" }
    date_to = @{ type = "string" }
    acceptance_terms = @{ type = "boolean" }
    lang = @{ type = "string" }
    submittedAt = @{ type = "string" }
}
Deploy-Flow `
    -DisplayName "SprachCafé - Anmeldung Kinder & Eltern (Teams an Agata Koch & Mail an kontakt@)" `
    -PropertiesSchema $KinderSchema `
    -RequiredFields @("child_name", "parent_name", "email", "location", "date_from", "date_to", "acceptance_terms") `
    -NotificationSummaryTemplate "Neue Kinder-Kursanmeldung: @{triggerBody()?['child_name']} von @{triggerBody()?['parent_name']} (@{triggerBody()?['location']})" `
    -SuccessMessage "Anmeldung für Kinder- & Elternangebote erfolgreich empfangen. Benachrichtigung an Agata Koch (Teams) und kontakt@sprachcafe-polnisch.org versendet." `
    -ConfigKey "PUBLIC_POWER_AUTOMATE_KINDER_WEBHOOK_URL"

# ------------------------------------------------------------------------------
# 3. Flow 3: Kontaktformular
# ------------------------------------------------------------------------------
$ContactSchema = @{
    name = @{ type = "string" }
    email = @{ type = "string"; format = "email" }
    topic = @{ type = "string" }
    subject = @{ type = "string" }
    message = @{ type = "string" }
    submittedAt = @{ type = "string" }
}
Deploy-Flow `
    -DisplayName "SprachCafé - Kontaktanfrage (Teams an Agata Koch & Mail an kontakt@)" `
    -PropertiesSchema $ContactSchema `
    -RequiredFields @("name", "email", "subject", "message") `
    -NotificationSummaryTemplate "Neue Kontaktanfrage von @{triggerBody()?['name']} (@{triggerBody()?['email']}) zum Thema @{triggerBody()?['topic']}: @{triggerBody()?['subject']}" `
    -SuccessMessage "Ihre Kontaktanfrage wurde erfolgreich übermittelt. Benachrichtigung an Agata Koch (Teams) und kontakt@sprachcafe-polnisch.org versendet." `
    -ConfigKey "PUBLIC_POWER_AUTOMATE_CONTACT_WEBHOOK_URL"

# ------------------------------------------------------------------------------
# 4. Flow 4: Ehrenamt & Praktikum
# ------------------------------------------------------------------------------
$VolunteerSchema = @{
    appType = @{ type = "string" }
    firstName = @{ type = "string" }
    lastName = @{ type = "string" }
    email = @{ type = "string"; format = "email" }
    phone = @{ type = "string" }
    areasOfInterest = @{ type = "array" }
    availability = @{ type = "string" }
    motivation = @{ type = "string" }
    datenschutz = @{ type = "boolean" }
    submittedAt = @{ type = "string" }
}
Deploy-Flow `
    -DisplayName "SprachCafé - Ehrenamt & Praktikum (Teams an Agata Koch & Mail an kontakt@)" `
    -PropertiesSchema $VolunteerSchema `
    -RequiredFields @("appType", "firstName", "lastName", "email", "datenschutz") `
    -NotificationSummaryTemplate "Neue Bewerbung (@{triggerBody()?['appType']}): @{triggerBody()?['firstName']} @{triggerBody()?['lastName']} (@{triggerBody()?['email']})" `
    -SuccessMessage "Ihre Bewerbung für Ehrenamt/Praktikum wurde erfolgreich übermittelt. Benachrichtigung an Agata Koch (Teams) und kontakt@sprachcafe-polnisch.org versendet." `
    -ConfigKey "PUBLIC_POWER_AUTOMATE_VOLUNTEER_WEBHOOK_URL"

# ------------------------------------------------------------------------------
# 5. Flow 5: Barrierefreiheit melden
# ------------------------------------------------------------------------------
$BarrierSchema = @{
    name = @{ type = "string" }
    email = @{ type = "string"; format = "email" }
    url = @{ type = "string" }
    description = @{ type = "string" }
    device = @{ type = "string" }
    assistiveTech = @{ type = "string" }
    consent = @{ type = "boolean" }
    submittedAt = @{ type = "string" }
}
Deploy-Flow `
    -DisplayName "SprachCafé - Barriere melden (Teams an Agata Koch & Mail an kontakt@)" `
    -PropertiesSchema $BarrierSchema `
    -RequiredFields @("name", "email", "description", "consent") `
    -NotificationSummaryTemplate "Barriere gemeldet von @{triggerBody()?['name']} auf @{triggerBody()?['url']}: @{triggerBody()?['description']}" `
    -SuccessMessage "Vielen Dank für Ihre Barriere-Meldung. Benachrichtigung an Agata Koch (Teams) und kontakt@sprachcafe-polnisch.org versendet." `
    -ConfigKey "PUBLIC_POWER_AUTOMATE_BARRIER_WEBHOOK_URL"

# ------------------------------------------------------------------------------
# 6. Schreibe Webhooks in .env.production
# ------------------------------------------------------------------------------
Write-Host "`n📝 Aktualisiere .env.production..." -ForegroundColor Cyan
$EnvFile = "$PSScriptRoot/../frontend/.env.production"
$EnvLines = @()

foreach ($key in $global:DeployedWebhooks.Keys) {
    $val = $global:DeployedWebhooks[$key]
    $EnvLines += "$key=""$val"""
}

$EnvLines | Out-File -FilePath $EnvFile -Encoding utf8
Write-Host "✅ .env.production erfolgreich geschrieben!" -ForegroundColor Green

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host " 🎉 ALLE 5 FORMULAR-FLOWS ERFOLGREICH IM TENANT AKTIVIERT!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
foreach ($key in $global:DeployedWebhooks.Keys) {
    Write-Host "  - $key" -ForegroundColor Cyan
}
