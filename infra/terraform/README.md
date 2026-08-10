# AWS Infrastructure via Terraform (`/infra/terraform`)

Dieses Verzeichnis enthält die Terraform-Definitionen für den S3 Media Storage Bucket (`sprachcafe-media-storage`), das CloudFront CDN mit Origin Access Control (OAC), CORS-Regeln sowie den dedizierten IAM-Service-User.

---

## 🏗️ Erstellte AWS Ressourcen

1. **S3 Bucket `sprachcafe-media-storage`**:
   - Privater Bucket mit Server-Side-Encryption (`AES256`).
   - Öffentlicher Zugriff über `aws_s3_bucket_public_access_block` vollständig blockiert.
   - CORS-Konfiguration für Uploads aus dem CMS und Anfragen von `sprachcafe-polnisch.org` & `admin.sprachcafe-polnisch.org`.
2. **CloudFront CDN Distribution (OAC)**:
   - Sichere Auslieferung öffentlicher Assets über HTTPS mit Caching.
   - Zugriff auf das private S3-Bucket erfolgt exklusiv über Origin Access Control (OAC).
3. **IAM Service User `sprachcafe-cms-s3-user`**:
   - Dedizierter IAM User für den Headless-CMS-Container.
   - Minimalprinzip-Policy (`s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket`) ausschließlich für `sprachcafe-media-storage`.

---

## 🔑 Benötigte Umgebungsvariablen (`.env` auf dem Server)

Folgende Variablen müssen in der `.env` des CMS-Containers gesetzt werden:

| Variable Name | Beschreibung | Beispielwert |
|---------------|--------------|--------------|
| `AWS_REGION` | AWS Region des Buckets | `eu-central-1` |
| `AWS_ACCESS_KEY_ID` | Access Key des Service-Users `sprachcafe-cms-s3-user` | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key des Service-Users | `wJalrXUtn...` |
| `AWS_S3_BUCKET` | Name des S3 Buckets | `sprachcafe-media-storage` |

---

## 🛠️ Ausführung & Deployment

```bash
cd infra/terraform

# 1. Terraform initialisieren
terraform init

# 2. Ausführungsplan prüfen
terraform plan

# 3. Infrastruktur auf AWS bereitstellen
terraform apply
```
