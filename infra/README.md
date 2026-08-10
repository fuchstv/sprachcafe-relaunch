# Phase 1: Infrastructure Setup (`/infra`)

Dieses Verzeichnis enthält sämtliche Konfigurationen und Skripte für die Infrastruktur des SprachCafé Relaunchs.

## Inhalte

- `Caddyfile`: Reverse-Proxy- und SSL-Konfiguration für automatische HTTPS-Zertifikate, Security-Header und Request-Routing zum Frontend und CMS.
- `docker-compose.yml`: Multi-Container Docker-Setup bestehend aus:
  - **Caddy**: Webserver & SSL Proxy
  - **CMS**: Headless CMS (Node.js App)
  - **PostgreSQL**: Datenbanksystem für den CMS-Content
  - **Frontend**: Astro Frontend Web-Application
- `terraform/`: Terraform-Skripte zur Bereitstellung der AWS-Ressourcen (S3 Media Buckets, Backup Storage).

## Schnellstart Docker Setup

1. Kopieren Sie `.env.example` im Root-Verzeichnis zu `.env` und tragen Sie die Werte ein.
2. Starten Sie die Docker-Container:
   ```bash
   docker-compose up -d
   ```
3. Prüfen Sie den Status:
   ```bash
   docker-compose ps
   ```

## Terraform AWS Deployment

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```
