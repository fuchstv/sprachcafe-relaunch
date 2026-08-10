# Rollback-Strategie & Notfallprozedur

> [!IMPORTANT]
> Befolgen Sie diese Schritte sorgfältig im Falle eines fehlerhaften Deployments oder eines kritischen Ausfalls in Produktion.

## 1. Quick-Rollback (Docker Service Release)

Falls ein fehlerhafter Container auf dem Produktionsserver gestartet wurde, machen Sie den Release auf das vorherige Docker Tag rückgängig:

```bash
cd /infra
docker-compose down
docker-compose up -d --build
```

Falls spezifische Container zurückgerollt werden müssen (z. B. Frontend):

```bash
docker pull sprachcafe-frontend:previous-tag
docker-compose up -d --no-deps frontend
```

## 2. Datenbank-Rollback (PostgreSQL)

Im Falle von Datenkorruption oder fehlerhaften Migrationen stellen Sie den letzten funktionierenden Snapshot wieder her:

```bash
# 1. Stoppen des CMS-Containers
docker-compose stop cms

# 2. Wiederherstellen des letzten S3 Backups
aws s3 cp s3://sprachcafe-backups-prod/latest_dump.sql.gz ./dump.sql.gz
gunzip -c dump.sql.gz | docker exec -i sprachcafe_postgres psql -U sprachcafe_user -d sprachcafe_cms

# 3. CMS neu starten
docker-compose start cms
```

## 3. Git Commit Revert

Um fehlerhafte Code-Änderungen in der CI/CD-Pipeline rückgängig zu machen:

```bash
git checkout main
git pull origin main
git revert HEAD -m 1
git push origin main
```

## 4. DNS / Proxy Fallback (Caddy)

Bei Ausfall der Anwendungsdienste kann Caddy vorübergehend eine statische Wartungsseite ausgeben:

```caddy
# In infra/Caddyfile vorübergehend aktivieren:
{$DOMAIN_NAME} {
    root * /var/www/maintenance
    file_server
}
```
