# Headless CMS Direktes S3 Media-Streaming (Zero Local SSD Disk Cache)

Dieses Dokument beschreibt die Konfiguration des Headless CMS für das direkte In-Memory Streaming aller hochgeladenen Bild- und Dokumentendateien in den AWS S3 Bucket `sprachcafe-media-storage`.

---

## ⚡ 1. Architektur & Zero Local SSD Disk Footprint

- **AWS S3 Bucket**: `sprachcafe-media-storage` (Region: `eu-central-1`)
- **Streaming-Verfahren**: `multer.memoryStorage()` speichert Dateien ausschließlich im RAM-Puffer und streamt sie via `@aws-sdk/client-s3` (`PutObjectCommand`) direkt an AWS S3.
- **Kein lokaler Cache**: Auf der Server-SSD (`/opt/sprachcafe/`) verbleiben **0 Bytes** temporäre Dateirückstände.

---

## 🔒 2. Upload API-Endpunkt ([`cms/server.js`](../cms/server.js))

- **HTTP Methode**: `POST /api/upload`
- **Authentifizierung**: JWT Bearer Token (`Authorization: Bearer <token>`)
- **Body Parameters**: `file` (Multipart), `prefix` (z. B. `brand-assets`, `uploads`, `events`)

### Beispiel-Request:
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@foto.jpg" \
  -F "prefix=events"
```

### JSON-Response:
```json
{
  "status": "uploaded",
  "filename": "foto.jpg",
  "s3_key": "events/1786369663995-foto.jpg",
  "url": "https://sprachcafe-media-storage.s3.eu-central-1.amazonaws.com/events/1786369663995-foto.jpg",
  "mimetype": "image/jpeg",
  "size_bytes": 1048576,
  "streaming_mode": "Direct In-Memory Buffer -> S3 (0 Bytes Local Disk)"
}
```

---

## 🧪 3. Verifikationstest (`scripts/test_s3_upload_flow.py`)

```bash
python3 scripts/test_s3_upload_flow.py
```

**Testergebnis**:
- JWT Admin Login: ✅ Erhalten
- Direct In-Memory Stream: ✅ 0 Bytes temporäre SSD-Lagerung
- HTTPS URL Format: ✅ `https://sprachcafe-media-storage.s3.eu-central-1.amazonaws.com/...`
