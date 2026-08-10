#!/usr/bin/env bash
# Script to install Git pre-commit hook for secret scanning

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)

echo "Installing Git hooks for SprachCafé Monorepo..."

# Method 1: Set core.hooksPath to .githooks
git config core.hooksPath "$REPO_ROOT/.githooks"

# Method 2: Copy to .git/hooks for compatibility
mkdir -p "$REPO_ROOT/.git/hooks"
cp "$REPO_ROOT/.githooks/pre-commit" "$REPO_ROOT/.git/hooks/pre-commit"
chmod +x "$REPO_ROOT/.git/hooks/pre-commit"

echo "✓ Pre-Commit Hook installed successfully!"
