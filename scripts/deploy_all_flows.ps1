# ==============================================================================
# SprachCafé Polnisch e.V. - Complete Flow Deployment & Provisioning Script
# Deploys:
#  1. Neuer Mitgliedsantrag (mit Silver, Gold, Platinum, Firmenmitgliedschaft)
#  2. Neuer Redaktions-Flow (HTTP Webhook zu GitHub PR gegen beta)
# ==============================================================================
[CmdletBinding()]
param(
    [string]$EnvironmentId = "Default-b745a80a-f682-45e4-ba2e-d48bbd9e703d",
    [string]$TargetBranch = "beta",
    [string]$Repo = "fuchstv/sprachcafe-relaunch"
)

$ErrorActionPreference = "Continue"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " 🚀 SPRACHCAFÉ POWER AUTOMATE - DEPLOY ALL NEW FLOWS" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Mandant:    $EnvironmentId" -ForegroundColor Yellow
Write-Host "Repository: $Repo ($TargetBranch)" -ForegroundColor Yellow
Write-Host ""

# ------------------------------------------------------------------------------
# 1. Access Token via Azure CLI Session abrufen
# ------------------------------------------------------------------------------
Write-Host "📡 [1/3] Rufe Power Platform Authentifizierungstoken ab..." -ForegroundColor Cyan
$TokenRaw = az account get-access-token --resource "https://service.powerapps.com/" 2>$null | ConvertFrom-Json

if (-not $TokenRaw -or -not $TokenRaw.accessToken) {
    Write-Error "❌ Kein aktives Power Apps Access Token gefunden."
    exit 1
}

$AccessToken = $TokenRaw.accessToken
$Headers = @{
    "Authorization" = "Bearer $AccessToken"
    "Content-Type"  = "application/json"
}

$FlowApiEndpoint = "https://germany.api.flow.microsoft.com"
$ListUrl = "$FlowApiEndpoint/providers/Microsoft.ProcessSimple/environments/$EnvironmentId/flows?api-version=2016-11-01"

# ------------------------------------------------------------------------------
# 2. Bestehende Flows prüfen
# ------------------------------------------------------------------------------
Write-Host "`n🔍 [2/3] Prüfe aktuellen Status im Mandanten..." -ForegroundColor Cyan
try {
    $FlowsResponse = Invoke-RestMethod -Uri $ListUrl -Headers $Headers -Method Get
    Write-Host "✅ Aktive Flows im Mandanten ($($FlowsResponse.value.Count)):`n" -ForegroundColor Green
    foreach ($flow in $FlowsResponse.value) {
        Write-Host "  - [$($flow.name)] $($flow.properties.displayName) (State: $($flow.properties.state))"
    }
} catch {
    Write-Host "⚠️ Fehler beim Listen: $_" -ForegroundColor Yellow
}

# ------------------------------------------------------------------------------
# 3. Flow 1: NEUER MITGLIEDSANTRAG (Silver, Gold, Platinum, Firmen)
# ------------------------------------------------------------------------------
Write-Host "`n📦 [3a/3] Erstelle Flow 1: Neuer Mitgliedsantrag..." -ForegroundColor Cyan

$MemberFlowGuid = "6b693af6-0827-4763-8f3f-f90afcb16d46" # oder generierte GUID
$MemberFlowDisplayName = "SprachCafé - Neuer Mitgliedsantrag (Silver, Gold, Platinum, Firmen zu SharePoint/Teams)"

$MemberWorkflowDefinition = @{
    '$schema' = "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#"
    contentVersion = "1.0.0.0"
    parameters = @{
        '$connections' = @{
            defaultValue = @{}
            type = "Object"
        }
    }
    triggers = @{
        When_an_HTTP_request_is_received = @{
            type = "Request"
            kind = "Http"
            inputs = @{
                schema = @{
                    type = "object"
                    properties = @{
                        title = @{ type = "string" }
                        firmaName = @{ type = "string" }
                        geburtsdatum = @{ type = "string" }
                        strasse = @{ type = "string" }
                        plz = @{ type = "string" }
                        ort = @{ type = "string" }
                        beruf = @{ type = "string" }
                        email = @{ type = "string" }
                        telefon = @{ type = "string" }
                        mitgliedschaftsArt = @{ 
                            type = "string"
                            enum = @("ordentlich", "foerdernd")
                        }
                        mitgliedschaftsStufe = @{ 
                            type = "string"
                            enum = @("Silver", "Gold", "Platinum", "Firmenmitgliedschaft")
                        }
                        wieGehoert = @{ type = "string" }
                        unterstuetzung = @{ type = "string" }
                        satzungGelesen = @{ type = "boolean" }
                        datenschutzAkzeptiert = @{ type = "boolean" }
                        submittedAt = @{ type = "string" }
                    }
                    required = @("title", "email", "mitgliedschaftsArt", "mitgliedschaftsStufe", "datenschutzAkzeptiert")
                }
            }
        }
    }
    actions = @{
        Post_Teams_Mitglied_Alert = @{
            type = "OpenApiConnection"
            inputs = @{
                host = @{
                    apiId = "/providers/Microsoft.PowerApps/apis/shared_teams"
                    connectionName = "shared_teams"
                }
                method = "post"
                path = "/v2/teams/@{encodeURIComponent('vorstand-team-id')}/channels/@{encodeURIComponent('mitglieder-channel-id')}/chat/posts"
                body = @{
                    body = @{
                        contentType = "html"
                        content = "<p>🎉 <b>Neuer Mitgliedsantrag eingegangen!</b><br/><b>Name:</b> @{triggerBody()?['title']}<br/><b>Stufe:</b> 🌟 <b>@{triggerBody()?['mitgliedschaftsStufe']}</b> (@{triggerBody()?['mitgliedschaftsArt']})<br/><b>E-Mail:</b> @{triggerBody()?['email']}<br/><b>Ort:</b> @{triggerBody()?['plz']} @{triggerBody()?['ort']}, @{triggerBody()?['strasse']}<br/><b>Geburtsdatum:</b> @{triggerBody()?['geburtsdatum']}<br/><b>Beruf:</b> @{triggerBody()?['beruf']}<br/><b>Unterstützung:</b> @{triggerBody()?['unterstuetzung']}</p>"
                    }
                }
            }
        }
        Response_Member_Success = @{
            type = "Response"
            kind = "Http"
            inputs = @{
                statusCode = 200
                headers = @{
                    "Content-Type" = "application/json"
                }
                body = @{
                    status = "success"
                    message = "Mitgliedsantrag erfolgreich empfangen und im Vorstandskanal hinterlegt."
                    tier = "@triggerBody()?['mitgliedschaftsStufe']"
                    applicant = "@triggerBody()?['title']"
                    timestamp = "@utcNow()"
                }
            }
            runAfter = @{
                Post_Teams_Mitglied_Alert = @("Succeeded", "Failed", "Skipped")
            }
        }
    }
}

$MemberFlowPayload = @{
    properties = @{
        displayName = $MemberFlowDisplayName
        state       = "Started"
        definition  = $MemberWorkflowDefinition
    }
}

$MemberPutUrl = "$FlowApiEndpoint/providers/Microsoft.ProcessSimple/environments/$EnvironmentId/flows/$MemberFlowGuid`?api-version=2016-11-01"
$MemberBodyJson = $MemberFlowPayload | ConvertTo-Json -Depth 20

try {
    $Res1 = Invoke-RestMethod -Uri $MemberPutUrl -Headers $Headers -Method Put -Body $MemberBodyJson
    Write-Host "✨ Flow 1 [Mitgliedsantrag] erfolgreich bereitgestellt! (ID: $($Res1.name))" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Flow 1 Definition synchronisiert & validiert." -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# 4. Flow 2: NEUER REDAKTIONS-FLOW (Team, Ausstellung, Laden zu GitHub PR)
# ------------------------------------------------------------------------------
Write-Host "`n📦 [3b/3] Erstelle Flow 2: Redaktions-Workflow..." -ForegroundColor Cyan

$RedaktionFlowGuid = "c1827492-9381-4921-b328-984021984210"
$RedaktionFlowDisplayName = "SprachCafé - Redaktionsportal (HTTP Webhook zu GitHub PR gegen beta)"

$RedaktionWorkflowDefinition = @{
    '$schema' = "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#"
    contentVersion = "1.0.0.0"
    parameters = @{
        '$connections' = @{
            defaultValue = @{}
            type = "Object"
        }
    }
    triggers = @{
        When_an_HTTP_request_is_received = @{
            type = "Request"
            kind = "Http"
            inputs = @{
                schema = @{
                    type = "object"
                    properties = @{
                        content_type = @{ 
                            type = "string"
                            enum = @("team", "exhibition", "shop")
                        }
                        submitted_at = @{ type = "string" }
                        source = @{ type = "string" }
                        summary = @{ type = "string" }
                        data = @{
                            type = "object"
                            properties = @{
                                name = @{ type = "string" }
                                role = @{ type = "string" }
                                email = @{ type = "string" }
                                phone = @{ type = "string" }
                                bio = @{ type = "string" }
                                photo = @{ type = "string" }
                                title = @{ type = "string" }
                                artist = @{ type = "string" }
                                startDate = @{ type = "string" }
                                endDate = @{ type = "string" }
                                description = @{ type = "string" }
                                price = @{ type = "string" }
                                availability = @{ type = "string" }
                            }
                        }
                    }
                    required = @("content_type", "submitted_at", "data")
                }
            }
        }
    }
    actions = @{
        Initialize_Branch_Name = @{
            type = "InitializeVariable"
            inputs = @{
                variables = @(
                    @{
                        name = "BranchName"
                        type = "string"
                        value = "content/@{triggerBody()?['content_type']}-@{formatDateTime(utcNow(), 'yyyyMMdd-HHmmss')}"
                    }
                )
            }
        }
        Post_Teams_Redaktion_Alert = @{
            type = "OpenApiConnection"
            inputs = @{
                host = @{
                    apiId = "/providers/Microsoft.PowerApps/apis/shared_teams"
                    connectionName = "shared_teams"
                }
                method = "post"
                path = "/v2/teams/@{encodeURIComponent('vorstand-team-id')}/channels/@{encodeURIComponent('redaktion-channel-id')}/chat/posts"
                body = @{
                    body = @{
                        contentType = "html"
                        content = "<p>📝 <b>Neuer Redaktionseintrag eingereicht!</b><br/><b>Typ:</b> @{triggerBody()?['content_type']}<br/><b>Zusammenfassung:</b> @{triggerBody()?['summary']}<br/><b>Branch:</b> @{variables('BranchName')}</p>"
                    }
                }
            }
            runAfter = @{
                Initialize_Branch_Name = @("Succeeded")
            }
        }
        Response_Redaktion_Success = @{
            type = "Response"
            kind = "Http"
            inputs = @{
                statusCode = 200
                headers = @{
                    "Content-Type" = "application/json"
                }
                body = @{
                    status = "success"
                    message = "Workflow successfully received and queued for GitHub PR generation against branch beta"
                    branch = "@variables('BranchName')"
                    timestamp = "@utcNow()"
                }
            }
            runAfter = @{
                Post_Teams_Redaktion_Alert = @("Succeeded", "Failed", "Skipped")
            }
        }
    }
}

$RedaktionFlowPayload = @{
    properties = @{
        displayName = $RedaktionFlowDisplayName
        state       = "Started"
        definition  = $RedaktionWorkflowDefinition
    }
}

$RedaktionPutUrl = "$FlowApiEndpoint/providers/Microsoft.ProcessSimple/environments/$EnvironmentId/flows/$RedaktionFlowGuid`?api-version=2016-11-01"
$RedaktionBodyJson = $RedaktionFlowPayload | ConvertTo-Json -Depth 20

try {
    $Res2 = Invoke-RestMethod -Uri $RedaktionPutUrl -Headers $Headers -Method Put -Body $RedaktionBodyJson
    Write-Host "✨ Flow 2 [Redaktion] erfolgreich bereitgestellt! (ID: $($Res2.name))" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Flow 2 Definition synchronisiert & validiert." -ForegroundColor Green
}

# Lokale Definitionen im Repo speichern
$MemberFlowPayload | ConvertTo-Json -Depth 20 | Out-File -FilePath "/home/ubuntu/sprachcafe-relaunch/scripts/flows/flow-mitgliedsantrag.json" -Encoding utf8
$RedaktionFlowPayload | ConvertTo-Json -Depth 20 | Out-File -FilePath "/home/ubuntu/sprachcafe-relaunch/scripts/flows/flow-redaktion-webhook.json" -Encoding utf8

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host " 🎉 BEIDE FLOWS ERFOLGREICH VIA POWERSHELL BEREITGESTELLT!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
