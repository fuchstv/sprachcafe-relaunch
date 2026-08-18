/**
 * SprachCafé Polnisch e.V. - Cloudflare DNS Management CLI Tool
 * Setzt automatisiert den DNS A-Record für intranet.xn--sprachcaf-j4a.org via Cloudflare API v4.
 */

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
const ZONE_NAME = 'xn--sprachcaf-j4a.org';
const RECORD_NAME = 'intranet.xn--sprachcaf-j4a.org';
const TARGET_IP = '3.66.205.213';

if (!API_TOKEN) {
  console.error('❌ Fehler: Keine CLOUDFLARE_API_TOKEN Umgebungsvariable gefunden.');
  console.error('👉 Bitte führen Sie den Befehl mit Ihrem Cloudflare API Token aus:');
  console.error('   CLOUDFLARE_API_TOKEN="ihr_token_hier" npx tsx scripts/set_cloudflare_dns.ts\n');
  process.exit(1);
}

async function cfApi(endpoint: string, method: string = 'GET', body?: any) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  const data = await res.json() as any;
  if (!res.ok || !data.success) {
    throw new Error(`Cloudflare API Fehler (${res.status}): ${JSON.stringify(data.errors || data)}`);
  }
  return data.result;
}

async function main() {
  console.log('================================================================');
  console.log(' ⛅ SPRACHCAFÉ POLNISCH - CLOUDFLARE DNS RECORD MANAGER');
  console.log('================================================================\n');

  console.log(`🔍 [1/3] Suche Cloudflare Zone ID für "${ZONE_NAME}"...`);
  const zones = await cfApi(`/zones?name=${encodeURIComponent(ZONE_NAME)}`);
  if (!zones || zones.length === 0) {
    throw new Error(`Keine Cloudflare Zone für Domain "${ZONE_NAME}" gefunden.`);
  }

  const zone = zones[0];
  const zoneId = zone.id;
  console.log(`✓ Zone gefunden: ${zone.name} (ID: ${zoneId})\n`);

  console.log(`🔍 [2/3] Prüfe bestehende DNS-Einträge für "${RECORD_NAME}"...`);
  const existingRecords = await cfApi(`/zones/${zoneId}/dns_records?name=${encodeURIComponent(RECORD_NAME)}&type=A`);

  if (existingRecords && existingRecords.length > 0) {
    const existing = existingRecords[0];
    console.log(`📌 Bestehender Eintrag gefunden (ID: ${existing.id}, IP: ${existing.content}).`);
    
    if (existing.content === TARGET_IP) {
      console.log(`✅ Record zeigt bereits korrekt auf ${TARGET_IP}. Keine Änderung notwendig!`);
      return;
    }

    console.log(`🔄 Aktualisiere A-Record auf ${TARGET_IP}...`);
    const updateRes = await cfApi(`/zones/${zoneId}/dns_records/${existing.id}`, 'PATCH', {
      content: TARGET_IP,
      ttl: 1, // Auto TTL
      proxied: false // DNS-only für direkte Caddy TLS-Zertifikatsausstellung
    });
    console.log(`✅ DNS A-Record erfolgreich aktualisiert: ${updateRes.name} ➔ ${updateRes.content}`);
  } else {
    console.log(`➕ [3/3] Lege neuen DNS A-Record an: ${RECORD_NAME} ➔ ${TARGET_IP}...`);
    const createRes = await cfApi(`/zones/${zoneId}/dns_records`, 'POST', {
      type: 'A',
      name: RECORD_NAME,
      content: TARGET_IP,
      ttl: 1, // Auto TTL
      proxied: false // DNS-only
    });
    console.log(`✅ DNS A-Record erfolgreich erstellt: ${createRes.name} ➔ ${createRes.content}`);
  }

  console.log('\n================================================================');
  console.log(' 🎉 DNS KONFIGURATION ERFOLGREICH ABGESCHLOSSEN!');
  console.log('================================================================');
  console.log(`🌐 Subdomain:  https://${RECORD_NAME}/`);
  console.log(`🎯 Server-IP:  ${TARGET_IP}`);
  console.log('🔒 Caddy wird das SSL-Zertifikat in wenigen Sekunden automatisch beziehen.\n');
}

main().catch(err => {
  console.error('\n❌ Fehler bei der Ausführung:', err.message);
  process.exit(1);
});
