# 📬 Mailchimp Webhook Setup Guide (Phase M.2)

Dieses Dokument beschreibt Schritt für Schritt die Einrichtung des Mailchimp-Webhooks für das Ereignis **„Kampagne gesendet“ (Campaign Sent)** zur automatisierten Benachrichtigung und Rebuild-Auslösung.

---

## 📋 Übersicht

| Parameter | Wert |
|---|---|
| **Webhook-Ziel-URL** | `https://redaktion.xn--sprachcaf-j4a.org/api/webhooks/mailchimp` |
| **Alternative Pages-URL** | `https://sprachcafe-redaktion.pages.dev/api/webhooks/mailchimp` |
| **Cloudflare Pages Projekt** | `sprachcafe-redaktion` |
| **HTTP-Methoden** | `GET` (Handshake/Validierung), `POST` (Ereignisübermittlung) |
| **Mailchimp-Ereignis** | `campaign` (`status: "sent"`) |
| **Optionales Secret** | `?secret=<DEIN_WEBHOOK_SECRET>` (in Cloudflare Pages Secrets via `MAILCHIMP_WEBHOOK_SECRET`) |

---

## 🛠️ Schritt-für-Schritt-Anleitung in Mailchimp

### 1. Zu den Webhook-Einstellungen navigieren
1. Melde Dich im **Mailchimp Dashboard** an: [https://admin.mailchimp.com/](https://admin.mailchimp.com/)
2. Klicke in der linken Navigation auf **Audience** und wähle **All contacts** (oder **Audience dashboard**).
3. Klicke oben rechts auf das Dropdown-Menü **Settings** und wähle **Webhooks**.

### 2. Neuen Webhook anlegen
1. Klicke auf den Button **"Create New Webhook"** (oder *"Add New Webhook"*).
2. Fülle die Felder wie folgt aus:
   - **Callback URL**: 
     ```
     https://redaktion.xn--sprachcaf-j4a.org/api/webhooks/mailchimp
     ```
     *(Falls ein Secret hinterlegt wurde: `https://redaktion.xn--sprachcaf-j4a.org/api/webhooks/mailchimp?secret=DEIN_SECRET`)*
   - **What type of updates should we send?**:
     - ✅ **Campaign sending status** (Sendet Ereignis bei gesendeter Kampagne)
     - ⬜ *(Optional abwählen)*: Subscribes, Unsubscribes, Profile updates, Email address changes, Cleaned emails
   - **Only send updates when a change is made by...**:
     - ✅ **By a subscriber**
     - ✅ **By an account admin**
     - ✅ **Via the API**
3. Klicke auf **"Save"**.
   - *Hinweis*: Mailchimp sendet beim Klick auf „Save“ sofort einen `GET`-Request zur Validierung an die URL. Unsere Cloudflare Function antwortet mit `200 OK`, woraufhin Mailchimp die Bestätigung anzeigt.

---

## 🧪 Webhook testen (Wichtiger Hinweis!)

> [!WARNING]
> **„Test senden“ (Send a Test Email) löst KEINEN Webhook aus!**
> Die interne Vorschaufunktion von Mailchimp dient nur der E-Mail-Prüfung und feuert keine Webhook-Events ab.

### Korrektes Testvorgehen für einen echten Webhook-Test:
1. Erstelle in Mailchimp eine neue reguläre Test-Kampagne (z. B. *„Webhook Live-Test SprachCafé“*).
2. Beschränke die Empfänger auf ein **internes Test-Segment** oder eine **Test-Audience** (z. B. nur Deine eigene E-Mail-Adresse).
3. Sende die Kampagne regulär über **„Send Now“** ab.
4. Sobald der Versand abgeschlossen ist, sendet Mailchimp einen HTTP-POST-Request mit dem Payload:
   ```json
   {
     "type": "campaign",
     "fired_at": "2026-08-19 11:45:00",
     "data": {
       "id": "...",
       "subject": "Webhook Live-Test SprachCafé",
       "status": "sent",
       "list_id": "..."
     }
   }
   ```
5. Die Cloudflare Pages Function verarbeitet das Event und gibt `200 OK` zurück.
