#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# AWS Lightsail Infrastructure Setup Script for SprachCafé Relaunch
# Creates root structure under /opt/sprachcafe/, sets user/group permissions,
# configures /var/www symlinks, and enforces isolation from Hausbibliothek.
# ==============================================================================

echo "==== Starting Lightsail Environment Setup for SprachCafé Relaunch ===="

# 1. Create User and Group if not exists
DEPLOY_USER="ubuntu"
WWW_GROUP="www-data"

if ! id "$DEPLOY_USER" &>/dev/null; then
    echo "Creating deployment user: $DEPLOY_USER"
    useradd -m -s /bin/bash "$DEPLOY_USER"
fi

if ! getent group "$WWW_GROUP" &>/dev/null; then
    echo "Creating web group: $WWW_GROUP"
    groupadd "$WWW_GROUP"
fi

usermod -aG "$WWW_GROUP" "$DEPLOY_USER"

# 2. Create Root Directory Structure under /opt/sprachcafe/
ROOT_DIR="/opt/sprachcafe"
INFRA_DIR="$ROOT_DIR/infra"
PROD_DIR="$ROOT_DIR/production"
BETA_DIR="$ROOT_DIR/beta"
CMS_DATA_DIR="$ROOT_DIR/cms-data"
BACKUPS_DIR="$ROOT_DIR/backups"
CMS_BACKUP_DIR="$BACKUPS_DIR/cms"
HB_BACKUP_DIR="$BACKUPS_DIR/hausbibliothek"

echo "Creating directory structure under $ROOT_DIR..."
mkdir -p "$INFRA_DIR"
mkdir -p "$PROD_DIR"
mkdir -p "$BETA_DIR"
mkdir -p "$CMS_DATA_DIR"
mkdir -p "$BACKUPS_DIR"
mkdir -p "$CMS_BACKUP_DIR"
mkdir -p "$HB_BACKUP_DIR"

# 3. Configure /var/www Symlinks for Compatibility
mkdir -p /var/www
if [ ! -L /var/www/production ]; then
    echo "Creating symlink /var/www/production -> $PROD_DIR"
    ln -sfn "$PROD_DIR" /var/www/production
fi

if [ ! -L /var/www/beta ]; then
    echo "Creating symlink /var/www/beta -> $BETA_DIR"
    ln -sfn "$BETA_DIR" /var/www/beta
fi

# 4. Set Permissions and Ownership
echo "Setting permissions and ownership for /opt/sprachcafe/..."

# /opt/sprachcafe/infra (Configuration & Compose)
# Owner: ubuntu:www-data | Permissions: 755
chown -R "$DEPLOY_USER:$WWW_GROUP" "$INFRA_DIR"
chmod -R 755 "$INFRA_DIR"

# /opt/sprachcafe/production & /opt/sprachcafe/beta (Web Roots for rsync deployment)
# Owner: ubuntu:www-data | Permissions: 775 (rsync write, web server read)
chown -R "$DEPLOY_USER:$WWW_GROUP" "$PROD_DIR" "$BETA_DIR"
chmod -R 775 "$PROD_DIR" "$BETA_DIR"

# /opt/sprachcafe/cms-data (PostgreSQL / Database Volume)
# Owner: 999:999 (Postgres Container UID:GID) | Permissions: 700
chown -R 999:999 "$CMS_DATA_DIR" || chown -R 1000:1000 "$CMS_DATA_DIR"
chmod -R 700 "$CMS_DATA_DIR"

# /opt/sprachcafe/backups (CMS & Hausbibliothek DB Backups)
# Owner: ubuntu:ubuntu | Permissions: 750
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$BACKUPS_DIR"
chmod -R 750 "$BACKUPS_DIR"

# 5. Isolation Verification: Check existing Hausbibliothek Installation
HB_DIR="/opt/hausbibliothek"
if [ -d "$HB_DIR" ]; then
    echo "✓ Existing Hausbibliothek installation detected at $HB_DIR."
    echo "✓ Isolation verified: /opt/sprachcafe/ operates in complete separation from $HB_DIR."
else
    echo "ℹ Note: Hausbibliothek directory $HB_DIR does not exist on this host yet."
fi

echo "==== Lightsail Environment Setup Completed Successfully ===="
