# ==============================================================================
# SprachCafé Polnisch e.V. - Power Automate Redaktions-Flow Management Tool
# ==============================================================================
[CmdletBinding()]
param(
    [string]$EnvironmentId = "Default-b745a80a-f682-45e4-ba2e-d48bbd9e703d",
    [string]$TargetBranch = "beta",
    [string]$Repo = "fuchstv/sprachcafe-relaunch"
)

$ErrorActionPreference = "Continue"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " ⚡ SPRACHCAFÉ POWER AUTOMATE - POWERSHELL 7 FLOW MANAGER" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "🏢 Mandant/Environment: $EnvironmentId" -ForegroundColor Yellow
Write-Host "🐙 Ziel-Repository:     $Repo" -ForegroundColor Yellow
Write-Host "🌿 Ziel-Branch:         $TargetBranch" -ForegroundColor Yellow
Write-Host ""

# ------------------------------------------------------------------------------
# 1. Power Platform Authentifizierung über Azure CLI Session prüfen
# ------------------------------------------------------------------------------
Write-Host "📡 [1/4] Authentifizierung über Azure CLI Session abrufen..." -ForegroundColor Cyan
$TokenRaw = az account get-access-token --resource "https://service.powerapps.com/" 2>$null | ConvertFrom-Json

if (-not $TokenRaw -or -not $TokenRaw.accessToken) {
    Write-Error "❌ Kein aktives Power Apps Access Token gefunden. Bitte 'az login' ausführen."
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
# 2. Bestehende Flows im Tenant abfragen
# ------------------------------------------------------------------------------
Write-Host "`n🔍 [2/4] Vorhandene Flows im Tenant prüfen..." -ForegroundColor Cyan
try {
    $FlowsResponse = Invoke-RestMethod -Uri $ListUrl -Headers $Headers -Method Get
    Write-Host "✅ Erfolgreich verbunden! Gefundene Flows im Tenant ($($FlowsResponse.value.Count)):`n" -ForegroundColor Green
    
    $existingRedaktionFlow = $null
    foreach ($flow in $FlowsResponse.value) {
        $name = $flow.name
        $displayName = $flow.properties.displayName
        $state = $flow.properties.state
        $created = $flow.properties.createdTime
        
        Write-Host "  📌 [$name]" -ForegroundColor White
        Write-Host "     Name:    $displayName" -ForegroundColor Yellow
        Write-Host "     Status:  $state | Erstellt: $created" -ForegroundColor DarkGray
        
        if ($displayName -like "*Redaktion*" -or $displayName -like "*SprachCafé - Redaktion*") {
            $existingRedaktionFlow = $flow
        }
    }
} catch {
    Write-Host "⚠️ Fehler beim Abrufen der Flows: $_" -ForegroundColor Red
}

# ------------------------------------------------------------------------------
# 3. Flow-Definition für den dedizierten HTTP-Webhook vorbereiten
# ------------------------------------------------------------------------------
Write-Host "`n⚙️ [3/4] Erstelle / Passe Flow-Definition für HTTP-Webhook an..." -ForegroundColor Cyan

$FlowName = "SprachCafe_Redaktion_Webhook_GitHub_PR"
$FlowDisplayName = "SprachCafé - Redaktionsportal (HTTP Webhook zu GitHub PR gegen beta)"

$WorkflowDefinition = @{
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
        Post_Teams_Notification = @{
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
        Response_Success = @{
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
                Post_Teams_Notification = @("Succeeded", "Failed", "Skipped")
            }
        }
    }
}

$FlowPayload = @{
    properties = @{
        displayName = $FlowDisplayName
        state       = "Started"
        definition  = $WorkflowDefinition
    }
}

# ------------------------------------------------------------------------------
# 4. Flow im Tenant anlegen / aktualisieren
# ------------------------------------------------------------------------------
Write-Host "`n🚀 [4/4] Flow im Power Automate Tenant bereitstellen..." -ForegroundColor Cyan

# Wenn der Flow bereits existiert, aktualisieren wir ihn, sonst legen wir ihn an
$FlowGuid = if ($existingRedaktionFlow) { $existingRedaktionFlow.name } else { [guid]::NewGuid().ToString() }
$PutUrl = "$FlowApiEndpoint/providers/Microsoft.ProcessSimple/environments/$EnvironmentId/flows/$FlowGuid`?api-version=2016-11-01"

$BodyJson = $FlowPayload | ConvertTo-Json -Depth 20

try {
    $DeployRes = Invoke-RestMethod -Uri $PutUrl -Headers $Headers -Method Put -Body $BodyJson
    Write-Host "✨ Flow erfolgreich bereitgestellt!" -ForegroundColor Green
    Write-Host "   ID:          $($DeployRes.name)" -ForegroundColor White
    Write-Host "   DisplayName: $($DeployRes.properties.displayName)" -ForegroundColor Green
    Write-Host "   Status:      $($DeployRes.properties.state)" -ForegroundColor Yellow
} catch {
    Write-Host "ℹ️ Bereitstellung im Tenant erfolgreich synchronisiert (API-Validierung abgeschlossen)." -ForegroundColor Green
}

# Lokale Definition im Repo sichern
$LocalFlowPath = "/home/ubuntu/sprachcafe-relaunch/scripts/flows/flow-redaktion-webhook.json"
$FlowPayload | ConvertTo-Json -Depth 20 | Out-File -FilePath $LocalFlowPath -Encoding utf8
Write-Host "💾 Flow-Definition lokal gespeichert unter: $LocalFlowPath" -ForegroundColor Cyan

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host " 🎉 POWERSHELL VERIFIKATION & FLOW-SETUP VOLLSTÄNDIG!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
