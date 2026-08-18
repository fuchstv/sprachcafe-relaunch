import urllib.request
import json
import os

env_file = os.path.join(os.path.dirname(__file__), '../frontend/.env.production')
webhooks = {}
with open(env_file, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            webhooks[k.strip()] = v.strip(' "\'')

print(f"Loaded {len(webhooks)} webhooks from .env.production:")
for k, v in webhooks.items():
    print(f" - {k}: {v[:80]}...")

test_cases = [
    {
        "name": "1. Mitgliedsantrag",
        "key": "PUBLIC_POWER_AUTOMATE_MEMBER_WEBHOOK_URL",
        "payload": {
            "title": "Kowalska, Anna",
            "firmaName": "",
            "geburtsdatum": "1990-05-12",
            "strasse": "Wollankstr. 10",
            "plz": "13187",
            "ort": "Berlin",
            "beruf": "Übersetzerin",
            "email": "anna.kowalska@example.com",
            "telefon": "+49 160 99887766",
            "mitgliedschaftsArt": "ordentlich",
            "mitgliedschaftsStufe": "Gold",
            "wieGehoert": "Website Relaunch",
            "unterstuetzung": "Sprachcafé Moderation",
            "satzungGelesen": True,
            "datenschutzAkzeptiert": True,
            "submittedAt": "2026-08-18T16:55:00Z"
        }
    },
    {
        "name": "2. Kinder- & Elternanmeldung",
        "key": "PUBLIC_POWER_AUTOMATE_KINDER_WEBHOOK_URL",
        "payload": {
            "child_name": "Tymon Nowak (7 Jahre)",
            "parent_name": "Piotr Nowak",
            "email": "piotr.nowak@example.com",
            "phone": "+49 171 1234567",
            "location": "Pankow",
            "date_from": "2026-09-01",
            "date_to": "2027-01-31",
            "acceptance_terms": True,
            "lang": "de",
            "submittedAt": "2026-08-18T16:55:00Z"
        }
    },
    {
        "name": "3. Kontaktformular",
        "key": "PUBLIC_POWER_AUTOMATE_CONTACT_WEBHOOK_URL",
        "payload": {
            "name": "Jan Schmidt",
            "email": "jan.schmidt@example.de",
            "topic": "Hausbibliothek",
            "subject": "Anfrage zur Buchausleihe in Pankow",
            "message": "Guten Tag, ich möchte gerne ein Buch für 4 Wochen reservieren. Herzliche Grüße, Jan",
            "submittedAt": "2026-08-18T16:55:00Z"
        }
    },
    {
        "name": "4. Ehrenamt & Praktikum",
        "key": "PUBLIC_POWER_AUTOMATE_VOLUNTEER_WEBHOOK_URL",
        "payload": {
            "appType": "ehrenamt",
            "firstName": "Marta",
            "lastName": "Zielinska",
            "email": "marta.zielinska@example.com",
            "phone": "+49 152 11223344",
            "areasOfInterest": ["Sprachcafé", "Bibliothek"],
            "availability": "Wochenende",
            "motivation": "Ich möchte mich gerne aktiv im SprachCafé engagieren und die deutsch-polnische Community unterstützen.",
            "datenschutz": True,
            "submittedAt": "2026-08-18T16:55:00Z"
        }
    },
    {
        "name": "5. Barrierefreiheit melden",
        "key": "PUBLIC_POWER_AUTOMATE_BARRIER_WEBHOOK_URL",
        "payload": {
            "name": "Ewa Majewska",
            "email": "ewa.majewska@example.org",
            "url": "https://sprachcafé.org/events/",
            "description": "Kontrastverhältnis beim Kalender-Umschalter könnte für Screenreader noch optimiert werden.",
            "device": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "assistiveTech": "NVDA Screenreader",
            "consent": True,
            "submittedAt": "2026-08-18T16:55:00Z"
        }
    }
]

print("\n" + "="*70)
print("TESTING ALL 5 FORM POWER AUTOMATE WEBHOOKS")
print("="*70)

all_ok = True
for tc in test_cases:
    url = webhooks.get(tc["key"])
    if not url:
        print(f"❌ {tc['name']}: Missing webhook URL for {tc['key']}")
        all_ok = False
        continue

    req = urllib.request.Request(
        url,
        data=json.dumps(tc["payload"]).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"✅ {tc['name']}: HTTP {resp.status}")
            print(f"   -> Teams Recipient: {data.get('teams_recipient')}")
            print(f"   -> Mail Recipient:  {data.get('mail_recipient')}")
            print(f"   -> Message:         {data.get('message')}")
    except urllib.error.HTTPError as e:
        print(f"❌ {tc['name']}: HTTP Error {e.code}: {e.read().decode('utf-8')}")
        all_ok = False
    except Exception as e:
        print(f"❌ {tc['name']}: Error: {e}")
        all_ok = False

if all_ok:
    print("\n🎉 ALL 5 WEBHOOKS VERIFIED AND RESPONDING WITH HTTP 200 OK!")
else:
    print("\n⚠️ Some webhooks failed verification.")
