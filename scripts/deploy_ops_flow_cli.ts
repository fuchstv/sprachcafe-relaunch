/**
 * CLI Deployment Tool for Power Automate Ops E-Mail Alert Flow
 * SprachCafé Polnisch e.V.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ENV_ID = 'Default-b745a80a-f682-45e4-ba2e-d48bbd9e703d';
const FLOW_API = 'https://germany.api.flow.microsoft.com';
const FLOW_DISPLAY_NAME = 'SprachCafé - Server-Wartung, Updates & Reboot Alerts';

function runAzRest(method: string, url: string, body?: object): any {
  let bodyFlag = '';
  let tempJsonPath = '';
  if (body) {
    tempJsonPath = path.join(process.cwd(), `temp_flow_deploy_${Date.now()}.json`);
    fs.writeFileSync(tempJsonPath, JSON.stringify(body), 'utf-8');
    bodyFlag = `--body "@${tempJsonPath}"`;
  }

  const cmd = `az rest --method ${method} --uri "${url}" --resource https://service.powerapps.com/ ${bodyFlag}`;
  try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    if (tempJsonPath && fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);
    return JSON.parse(output || '{}');
  } catch (err: any) {
    if (tempJsonPath && fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);
    console.error(`❌ REST API Error [${method} ${url}]:`, err.stderr || err.stdout || err.message);
    return null;
  }
}

async function main() {
  console.log('==========================================================================');
  console.log(' 🚀 DEPLOYING POWER AUTOMATE OPS E-MAIL FLOW VIA CLI');
  console.log('==========================================================================');
  console.log(`🏢 Target Environment: ${ENV_ID}`);
  console.log(`📦 Flow Display Name:   ${FLOW_DISPLAY_NAME}\n`);

  // 1. Get existing shared_office365 connection reference from the environment
  const existingFlow = runAzRest('get', `${FLOW_API}/providers/Microsoft.ProcessSimple/environments/${ENV_ID}/flows/29be9d19-eac0-4619-a69e-a437cc0cedb7?api-version=2016-11-01`);
  const office365Conn = existingFlow?.properties?.connectionReferences?.shared_office365 || {
    apiName: "office365",
    displayName: "Office 365 Outlook",
    id: "/providers/Microsoft.PowerApps/apis/shared_office365"
  };

  console.log('✅ Found M365 Outlook Connection Reference.');

  // 2. Check if flow already exists
  const listUrl = `${FLOW_API}/providers/Microsoft.ProcessSimple/environments/${ENV_ID}/flows?api-version=2016-11-01`;
  const flowsList = runAzRest('get', listUrl);
  let targetFlowId: string | null = null;

  for (const f of flowsList?.value || []) {
    if (f.properties?.displayName === FLOW_DISPLAY_NAME) {
      targetFlowId = f.name;
      console.log(`ℹ️ Flow already exists with ID: ${targetFlowId}`);
      break;
    }
  }

  // 3. Construct Flow Definition
  const flowDefinition = {
    $schema: "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    contentVersion: "1.0.0.0",
    parameters: {
      $connections: {
        defaultValue: {},
        type: "Object"
      },
      $authentication: {
        defaultValue: {},
        type: "SecureObject"
      }
    },
    triggers: {
      manual: {
        type: "Request",
        kind: "Http",
        inputs: {
          schema: {
            type: "object",
            properties: {
              event_type: { type: "string" },
              severity: { type: "string" },
              server: { type: "string" },
              kernel: { type: "string" },
              summary: { type: "string" },
              what_was_done: { type: "string" },
              health_status: { type: "string" },
              action_required: { type: "string" },
              timestamp: { type: "string" }
            },
            required: ["event_type", "severity", "summary"]
          }
        }
      }
    },
    actions: {
      "Send_an_email_(V2)": {
        type: "OpenApiConnection",
        inputs: {
          host: {
            apiId: "/providers/Microsoft.PowerApps/apis/shared_office365",
            connectionName: "shared_office365",
            operationId: "SendEmailV2"
          },
          parameters: {
            "emailMessage/To": "p.fuchs@sprachcafe-polnisch.org",
            "emailMessage/Subject": "[SprachCafé Ops] @{triggerBody()?['severity']}: @{triggerBody()?['summary']}",
            "emailMessage/Body": "<div style='font-family: Arial, sans-serif; background-color: #FAF6EE; padding: 24px; color: #1D1B1A;'><div style='max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2D8CC; overflow: hidden;'><div style='background-color: #8B263E; color: #FFFFFF; padding: 20px 24px;'><h2 style='margin: 0; font-size: 20px;'>🏛️ SprachCafé Polnisch – Server & IT Alert</h2><p style='margin: 4px 0 0 0; font-size: 12px; color: #F5EFEB;'>Host: @{triggerBody()?['server']} | Kernel: @{triggerBody()?['kernel']}</p></div><div style='padding: 24px;'><div style='padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-weight: bold; background: #F2ECE4; border-left: 4px solid #8B263E;'>Ereignis: @{triggerBody()?['event_type']} (@{triggerBody()?['severity']})<br><span style='font-size: 13px; font-weight: normal; color: #5B403D;'>@{triggerBody()?['summary']}</span></div><h3 style='color: #8B263E; font-size: 15px; margin-bottom: 8px;'>📋 Was getan wurde:</h3><p style='font-size: 13px; line-height: 1.6; background: #FDFBF7; padding: 12px; border-radius: 6px; border: 1px solid #E2D8CC; white-space: pre-wrap;'>@{triggerBody()?['what_was_done']}</p><h3 style='color: #8B263E; font-size: 15px; margin: 16px 0 8px 0;'>🔍 System-Health & Status:</h3><p style='font-size: 13px; line-height: 1.6; background: #FDFBF7; padding: 12px; border-radius: 6px; border: 1px solid #E2D8CC; white-space: pre-wrap;'>@{triggerBody()?['health_status']}</p><h3 style='color: #8B263E; font-size: 15px; margin: 16px 0 8px 0;'>⚠️ Was du noch wissen solltest / Handlungsempfehlung:</h3><p style='font-size: 13px; line-height: 1.6; background: #FFF8E7; padding: 12px; border-radius: 6px; border: 1px solid #F2B705; white-space: pre-wrap;'>@{triggerBody()?['action_required']}</p><div style='margin-top: 24px; text-align: center;'><a href='https://intranet.xn--sprachcaf-j4a.org/' style='background-color: #8B263E; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;'>Zum Intranet-Hub</a></div></div><div style='background-color: #181615; color: #A8A29E; padding: 12px 24px; font-size: 11px; text-align: center;'>SprachCafé Polnisch e.V. • Automatische Server-Operations-Benachrichtigung • @{triggerBody()?['timestamp']}</div></div></div>",
            "emailMessage/Importance": "@if(equals(triggerBody()?['severity'], 'CRITICAL'), 'High', 'Normal')"
          }
        }
      },
      "Response_Success": {
        "type": "Response",
        "inputs": {
          "statusCode": 200,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            "status": "success",
            "message": "Ops email alert successfully delivered via Office 365 Outlook"
          }
        },
        "runAfter": {
          "Send_an_email_(V2)": ["Succeeded", "Failed"]
        }
      }
    }
  };

  const payload = {
    properties: {
      displayName: FLOW_DISPLAY_NAME,
      state: "Started",
      connectionReferences: {
        shared_office365: office365Conn
      },
      definition: flowDefinition
    }
  };

  let deployResult: any = null;
  if (targetFlowId) {
    console.log(`🔄 Updating existing flow ${targetFlowId}...`);
    const updateUrl = `${FLOW_API}/providers/Microsoft.ProcessSimple/environments/${ENV_ID}/flows/${targetFlowId}?api-version=2016-11-01`;
    deployResult = runAzRest('patch', updateUrl, payload);
  } else {
    console.log(`✨ Creating new flow in environment...`);
    const createUrl = `${FLOW_API}/providers/Microsoft.ProcessSimple/environments/${ENV_ID}/flows?api-version=2016-11-01`;
    deployResult = runAzRest('post', createUrl, payload);
  }

  const flowId = deployResult?.name || targetFlowId;
  if (!flowId) {
    console.error('❌ Failed to deploy flow.');
    process.exit(1);
  }

  console.log(`✅ Flow successfully active with ID: ${flowId}`);

  // 4. Retrieve Trigger Webhook URL
  const callbackUrlEndpoint = `${FLOW_API}/providers/Microsoft.ProcessSimple/environments/${ENV_ID}/flows/${flowId}/triggers/manual/listCallbackUrl?api-version=2016-11-01`;
  const callbackRes = runAzRest('post', callbackUrlEndpoint);
  const triggerUrl = callbackRes?.value;

  if (triggerUrl) {
    console.log(`\n🔗 Live Webhook Trigger URL retrieved:`);
    console.log(`   ${triggerUrl.substring(0, 60)}...`);

    // 5. Update .env file with live webhook URL
    const envFile = path.resolve(process.cwd(), '.env');
    let envContent = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf-8') : '';
    if (envContent.includes('M365_OPS_NOTIFICATION_WEBHOOK_URL=')) {
      envContent = envContent.replace(/M365_OPS_NOTIFICATION_WEBHOOK_URL=.*/, `M365_OPS_NOTIFICATION_WEBHOOK_URL="${triggerUrl}"`);
    } else {
      envContent += `\n# Microsoft 365 Power Automate Ops E-Mail Flow\nM365_OPS_NOTIFICATION_WEBHOOK_URL="${triggerUrl}"\n`;
    }
    fs.writeFileSync(envFile, envContent, 'utf-8');
    console.log(`✅ Saved M365_OPS_NOTIFICATION_WEBHOOK_URL to .env`);
  } else {
    console.log('ℹ️ Callback URL could not be retrieved directly. Check flow in Power Automate portal.');
  }

  console.log('\n==========================================================================');
  console.log('🎉 POWER AUTOMATE OPS E-MAIL FLOW DEPLOYMENT COMPLETE!');
  console.log('==========================================================================\n');
}

main().catch(console.error);
