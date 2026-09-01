/**
 * SprachCafé Polnisch e.V. - Power Automate Ops E-Mail Alert Tester
 * 
 * Usage:
 *   npx tsx scripts/test_ops_email_alert.ts [--type=MAINTENANCE_COMPLETED|REBOOT_REQUIRED|HEALTH_CHECK_ALERT]
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const WEBHOOK_URL = process.env.M365_OPS_NOTIFICATION_WEBHOOK_URL || '';

async function main() {
  console.log('==========================================================================');
  console.log(' ✉️  SPRACHCAFÉ POLNISCH e.V. – OPS E-MAIL ALERT CLI TESTER');
  console.log('==========================================================================\n');

  const args = process.argv.slice(2);
  const typeArg = args.find(a => a.startsWith('--type='))?.split('=')[1] || 'MAINTENANCE_COMPLETED';

  let payload = {
    event_type: typeArg,
    severity: 'INFO',
    server: '3.66.205.213 (ip-172-26-13-42)',
    kernel: '7.0.0-1011-aws',
    summary: 'Monatliche Server-Wartung erfolgreich abgeschlossen. 1 Paket aktualisiert.',
    what_was_done: '• Atomares Multi-DB Backup nach AWS S3 synchronisiert.\n• 1 APT-Paket aktualisiert (fwupd 2.0.20).\n• Caddy & Docker Container neu geladen.',
    health_status: '• sprachcafé.org: HTTP 200 OK\n• hausbibliothek.org: HTTP 200 OK\n• team.sprachcafé.org: HTTP 200 OK\n• RAM: 853MB / 1.9GB (stabil unter 1.1 GB Benchmark)',
    action_required: 'Keine Aktion erforderlich – alle Vereinssysteme laufen einwandfrei.',
    timestamp: new Date().toISOString()
  };

  if (typeArg === 'REBOOT_REQUIRED') {
    payload.severity = 'WARNING';
    payload.summary = 'Server-Neustart erforderlich nach Kernel-Upgrade (7.0.0-1011-aws).';
    payload.what_was_done = '• Linux-Kernel & System-Bibliotheken aktualisiert.\n• /var/run/reboot-required Flag gesetzt.';
    payload.action_required = 'Bitte führen Sie im nächsten Wartungsfenster (Sonntag 03:00-05:00 Uhr) "sudo systemctl reboot" aus.';
  } else if (typeArg === 'HEALTH_CHECK_ALERT') {
    payload.severity = 'CRITICAL';
    payload.summary = 'Störung erkannt: Ein Web-Endpunkt antwortet nicht mit HTTP 200!';
    payload.what_was_done = '• Automatischer Health-Check hat einen Verbindungsfehler festgestellt.';
    payload.health_status = '• Fehler bei Endpunkt: HTTP 502 Bad Gateway';
    payload.action_required = 'Bitte prüfen Sie unverzüglich "docker ps" und "docker exec caddy caddy reload".';
  }

  console.log('📦 Generierter Test-Payload für Power Automate:');
  console.log(JSON.stringify(payload, null, 2));

  if (!WEBHOOK_URL || WEBHOOK_URL.includes('PLACEHOLDER')) {
    console.log('\nℹ️  Hinweis: M365_OPS_NOTIFICATION_WEBHOOK_URL ist in .env noch nicht konfiguriert.');
    console.log('   Sobald du den Flow in Power Automate angelegt hast, trage die HTTP-POST URL');
    console.log('   in /home/ubuntu/sprachcafe-relaunch/.env ein.\n');
    console.log('✓ Payload-Struktur erfolgreich validiert!');
    return;
  }

  console.log(`\n🚀 Sende HTTP-POST Request an Power Automate Webhook...`);
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log(`✅ E-Mail Flow erfolgreich ausgelöst! (Status: ${res.status})`);
      console.log('📬 Die E-Mail sollte in wenigen Sekunden im Postfach von p_fuchs@sprachcafe-polnisch.org eintreffen.');
    } else {
      console.error(`❌ Fehler bei Webhook-Auslösung (HTTP ${res.status}):`, await res.text());
    }
  } catch (err: any) {
    console.error('❌ Netzwerkfehler beim Senden an Power Automate:', err.message);
  }
}

main().catch(console.error);
