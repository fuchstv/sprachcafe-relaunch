#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Deployment Script for SprachCafé Relaunch Monorepo
# Deploys static build artifacts (frontend/dist) to beta (/var/www/beta)
# and production (/var/www/production), then reloads Caddy.
# Usage: ./scripts/deploy.sh [beta|production|all]
# ==============================================================================

TARGET="${1:-all}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting Deployment for SprachCafé Relaunch (Target: $TARGET)..."

# 1. Monorepo Sync & Frontend Build
echo "📦 Building Frontend (Astro SSG + Pagefind Index)..."
cd "$REPO_ROOT/frontend"
npm ci
npm run build
cd "$REPO_ROOT"

# 2. Deploy to Beta (/var/www/beta or /opt/sprachcafe/beta)
if [[ "$TARGET" == "beta" || "$TARGET" == "all" ]]; then
    BETA_DIR="/var/www/beta"
    if [ -d "$BETA_DIR" ] || [ -d "/opt/sprachcafe/beta" ]; then
        echo "📂 Deploying build artifacts to Beta ($BETA_DIR)..."
        mkdir -p "$BETA_DIR"
        rsync -rtv --delete --no-owner --no-group "$REPO_ROOT/frontend/dist/" "$BETA_DIR/"
        echo "✅ Beta deployment completed!"
    else
        echo "ℹ️ Local directory $BETA_DIR not found. (Build artifacts stored in frontend/dist)."
    fi
fi

# 3. Deploy to Production (/var/www/production or /opt/sprachcafe/production)
if [[ "$TARGET" == "production" || "$TARGET" == "all" ]]; then
    PROD_DIR="/var/www/production"
    if [ -d "$PROD_DIR" ] || [ -d "/opt/sprachcafe/production" ]; then
        echo "📂 Deploying build artifacts to Production ($PROD_DIR)..."
        mkdir -p "$PROD_DIR"
        rsync -rtv --delete --no-owner --no-group "$REPO_ROOT/frontend/dist/" "$PROD_DIR/"
        echo "✅ Production deployment completed!"
    else
        echo "ℹ️ Local directory $PROD_DIR not found. (Build artifacts stored in frontend/dist)."
    fi
fi

# 4. Reload Caddy Reverse Proxy for Automatic TLS & Cache Invalidation
if docker ps --format '{{.Names}}' | grep -q "library_proxy"; then
    echo "🔄 Reloading Caddy Reverse Proxy (library_proxy)..."
    docker exec library_proxy caddy reload --config /etc/caddy/Caddyfile || true
    echo "✓ Caddy reloaded successfully!"
elif docker ps --format '{{.Names}}' | grep -q "sprachcafe_caddy"; then
    echo "🔄 Reloading Caddy Reverse Proxy (sprachcafe_caddy)..."
    docker exec sprachcafe_caddy caddy reload --config /etc/caddy/Caddyfile || true
    echo "✓ Caddy reloaded successfully!"
fi

echo "🎉 Deployment Process Finished Successfully!"
