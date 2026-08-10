# Schritt-für-Schritt Anleitung: Power Automate Flow für Mitgliedsanträge & Bewerbungen

Dieses Dokument führt Schritt für Schritt durch die Einrichtung des Microsoft Power Automate Flows im Microsoft 365 Admin Center / Power Automate Portal für den SprachCafé Polnisch e.V.

---

## 🎯 Ziel des Flows
Sobald ein Nutzer das Online-Formular auf `/mitmachen/` absendet:
1. Empfängt Power Automate den HTTP-POST JSON Request.
2. Ein neues Element wird in der SharePoint-Liste **"Mitgliedsanträge & Bewerbungen"** angelegt.
3. Der Vorstand / das Team erhält eine automatische Benachrichtigung im Microsoft Teams-Kanal **"#02-mitglieder-und-ehrenamt"**.
4. Der Browser erhält eine Bestätigung (HTTP 200 OK).

---

## 🛠️ Schritt-für-Schritt Anleitung im Power Automate Portal

### 1. Power Automate öffnen & neuen Flow erstellen
1. Navigieren Sie zu [make.powerautomate.com](https://make.powerautomate.com) und melden Sie sich mit dem M365-Vereinskonto an.
2. Klicken Sie links im Menü auf **+ Erstellen**.
3. Wählen Sie **Sofortiger Cloud-Flow** (Instant Cloud Flow).
4. Geben Sie dem Flow den Namen: `M365-Flow-Mitgliedsantrag-SharePoint-Teams`.
5. Wählen Sie als Trigger: **Beim Empfang einer HTTP-Anforderung** (HTTP Request Received).
6. Klicken Sie auf **Erstellen**.

---

### 2. Trigger konfigurieren (HTTP Request Received)
1. Klicken Sie auf den Trigger-Baustein **"Beim Empfang einer HTTP-Anforderung"**.
2. Stellen Sie die **Methode** auf `POST`.
3. Klicken Sie auf **"Beispielnutzdaten zum Generieren eines Schemas verwenden"** und fügen Sie folgenden JSON-Code ein:

```json
{
  "application_type": "mitgliedsantrag",
  "first_name": "Anna",
  "last_name": "Kowalska",
  "email": "anna.kowalska@example.com",
  "phone": "+49 170 1234567",
  "location_preference": "Pankow",
  "motivation": "Ich möchte mich gerne ehrenamtlich als Sprachbegleiterin im SprachCafé Pankow engagieren.",
  "submitted_at": "2026-08-10T13:50:00.000Z",
  "source": "SprachCafé Relaunch Webportal"
}
```

4. Klicken Sie auf **Fertig**. Das Schema wird automatisch generiert.

---

### 3. Aktion 1: SharePoint-Eintrag erstellen
1. Klicken Sie unter dem Trigger auf **+ Neuer Schritt**.
2. Suchen Sie nach `SharePoint` und wählen Sie **Element erstellen** (Create Item).
3. Konfigurieren Sie die Felder:
   - **Websiteadresse**: `https://sprachcafepolnisch.sharepoint.com/sites/Vereinsverwaltung`
   - **Listenname**: `Mitgliedsanträge & Bewerbungen`
   - **Titel**: `@{triggerBody()?['last_name']}, @{triggerBody()?['first_name']}`
   - **E-Mail**: Dynamischer Inhalt -> `email`
   - **Telefon**: Dynamischer Inhalt -> `phone`
   - **Antragstyp**: Dynamischer Inhalt -> `application_type`
   - **Standort**: Dynamischer Inhalt -> `location_preference`
   - **Nachricht / Motivation**: Dynamischer Inhalt -> `motivation`

---

### 4. Aktion 2: MS Teams-Kanal Benachrichtigung
1. Klicken Sie auf **+ Neuer Schritt**.
2. Suchen Sie nach `Microsoft Teams` und wählen Sie **Nachricht in einem Chat oder Kanal veröffentlichen**.
3. Konfigurieren Sie die Felder:
   - **Veröffentlichen als**: `Flow-Bot`
   - **Veröffentlichen in**: `Channel`
   - **Team**: `SprachCafé Polnisch e.V.`
   - **Kanal**: `02-mitglieder-und-ehrenamt`
   - **Nachricht**:
     > 📋 **Neuer Mitgliedsantrag / Bewerbung eingegangen!**
     > **Name**: @{triggerBody()?['first_name']} @{triggerBody()?['last_name']} (@{triggerBody()?['email']})
     > **Tel**: @{triggerBody()?['phone']}
     > **Antragstyp**: @{triggerBody()?['application_type']}
     > **Standort**: @{triggerBody()?['location_preference']}
     > **Motivation**:
     > *@{triggerBody()?['motivation']}*

---

### 5. Aktion 3: HTTP Antwort an Browser zurücksenden (Response)
1. Klicken Sie auf **+ Neuer Schritt**.
2. Suchen Sie nach `Antwort` (Response).
3. Konfigurieren Sie die Felder:
   - **Statuscode**: `200`
   - **Header**: `Content-Type: application/json`
   - **Textkörper**:
     ```json
     {
       "status": "success",
       "message": "Mitgliedsantrag erfolgreich in SharePoint & Teams verarbeitet."
     }
     ```

---

### 6. Flow speichern & HTTP-URL kopieren
1. Klicken Sie oben rechts auf **Speichern**.
2. Öffnen Sie den ersten Trigger-Baustein ("Beim Empfang einer HTTP-Anforderung").
3. Kopieren Sie die neu erzeugte **HTTP POST-URL** (z. B. `https://prod-xx.westeurope.logic.azure.com:443/workflows/...`).
4. Tragen Sie diese URL in die `.env` des Projekts ein:
   ```env
   PUBLIC_POWER_AUTOMATE_MEMBER_WEBHOOK_URL=https://prod-xx.westeurope.logic.azure.com:443/workflows/...
   ```
