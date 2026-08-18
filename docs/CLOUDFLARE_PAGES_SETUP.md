# ☁️ Cloudflare Pages Setup & Custom Domain Deployment Guide

Dieses Dokument beschreibt die Einrichtung, das Deployment und die Subdomain-Anbindung des Projekts **`sprachcafe-redaktion`** auf **Cloudflare Pages** sowie den Vergleich der CLI- vs. API-Methoden.

---

## 📋 Übersicht

| Eigenschaft | Wert |
|---|---|
| **Pages Projektname** | `sprachcafe-redaktion` |
| **Production Branch** | `main` |
| **Pages Default URL** | [https://sprachcafe-redaktion.pages.dev](https://sprachcafe-redaktion.pages.dev) |
| **Custom Domain** | [https://redaktion.xn--sprachcaf-j4a.org](https://redaktion.xn--sprachcaf-j4a.org) (`redaktion.sprachcafé.org`) |
| **Cloudflare Zone** | `sprachcafé.org` (`cd0cbfef3ea0701dced3040b2589881c`) |
| **Wrangler Version** | `4.86.0` |

---

## 🛠️ 1. Installation & Remote-Authentifizierung

In Headless-/Remote-Umgebungen (z. B. Linux-Server ohne direkten GUI-Browser für OAuth-Callbacks) erfolgt die Authentifizierung zuverlässig über ein **Cloudflare API Token**.

### Installation:
```bash
sudo npm install -g wrangler
```

### Authentifizierung via Token:
```bash
export CLOUDFLARE_API_TOKEN="<DEIN_CLOUDFLARE_API_TOKEN>"
export CLOUDFLARE_ACCOUNT_ID="<DEINE_ACCOUNT_ID>"

# Status überprüfen
wrangler whoami
```

---

## 🚀 2. Projekt per CLI anlegen

Das Pages-Projekt wurde mit folgendem Befehl erstellt:

```bash
wrangler pages project create sprachcafe-redaktion --production-branch=main
```

---

## 📦 3. Platzhalter-Build & Test-Deployment

Ein erster statischer Platzhalter-Build wurde in `./dist` erstellt und bereitgestellt:

```bash
wrangler pages deploy ./dist --project-name=sprachcafe-redaktion --branch=main
```

* **Ergebnis:** Erfolgreich deployt unter `https://sprachcafe-redaktion.pages.dev`.

---

## 🌐 4. Subdomain-Anbindung: Vergleich CLI vs. API

### ❌ Methode A: Wrangler CLI (`wrangler pages domain add`)
* **Befehl:**
  ```bash
  wrangler pages domain add redaktion.xn--sprachcaf-j4a.org --project-name=sprachcafe-redaktion
  ```
* **Ergebnis:** **Fehlgeschlagen / Nicht verfügbar in Wrangler 4.x**
* **Fehlermeldung:** `Unknown arguments: project-name, projectName, domain, add, redaktion.xn--sprachcaf-j4a.org`
* **Ursache:** In Wrangler v4.86.0 existiert kein Subcommand `pages domain add`.

---

### ✅ Methode B: Cloudflare REST API Call (Erfolgreich)
Die Zuweisung der Custom Domain und die DNS-Verknüpfung wurden direkt über die Cloudflare REST API durchgeführt:

#### Schritt 1: Custom Domain am Pages-Projekt registrieren
```bash
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/sprachcafe-redaktion/domains" \
     -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"name":"redaktion.xn--sprachcaf-j4a.org"}'
```

#### Schritt 2: CNAME DNS-Record in der Zone anlegen
```bash
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
     -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "CNAME",
       "name": "redaktion.xn--sprachcaf-j4a.org",
       "content": "sprachcafe-redaktion.pages.dev",
       "ttl": 1,
       "proxied": true
     }'
```

---

## ✅ 5. Verifikation & Status

Beide Adressen antworten mit HTTP 200 OK und gültigem TLS-Zertifikat:
* `curl -sI https://sprachcafe-redaktion.pages.dev` ➜ `HTTP/2 200`
* `curl -sI https://redaktion.xn--sprachcaf-j4a.org` ➜ `HTTP/2 200`

---

## 🔒 6. Authentifizierung & Shared Secret

Das Redaktionsportal nutzt ein gemeinsames Redaktionspasswort (ohne OAuth oder Benutzerkonten).

### Ablauf:
1. **Passwort-Hash berechnen:**
   ```bash
   echo -n "DeinPasswort" | sha256sum | cut -d' ' -f1
   ```
2. **Secret via Wrangler CLI hinterlegen:**
   ```bash
   wrangler pages secret put ADMIN_PASSWORD_HASH --project-name=sprachcafe-redaktion
   ```
3. **Session-Validierung:**
   - Eine Cloudflare Pages Function (`functions/api/login.js`) prüft den Hash zeitkonstant (`constantTimeCompare`) gegen `ADMIN_PASSWORD_HASH`.
   - Bei Erfolg wird ein signiertes `httpOnly`, `Secure`, `SameSite=Lax` Session-Cookie (`sprachcafe_session`) gesetzt.
   - `functions/_middleware.js` schützt das gesamte Portal und leitet unauthentifizierte Aufrufe per `302` automatisch nach `/login` um.
