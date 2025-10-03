#!/usr/bin/env bash
set -euo pipefail

# Simple automated backup script for Shopify theme repo
# 1. Pull latest remote (Git + Shopify) changes
# 2. Theme pull (if Shopify CLI context available)
# 3. Commit and push any differences with timestamp

BRANCH="main"
TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%S%z")

# Ensure we are at repo root
cd "$(dirname "$0")"

# Stash uncommitted local WIP (if any) to avoid merge conflicts in CI context
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Uncommitted changes detected. Stashing before backup commit..."
  git stash push -u -m "pre-backup-$TIMESTAMP" || true
  STASHED=1
else
  STASHED=0
fi

echo "Pulling latest from origin/$BRANCH..."
git fetch origin "$BRANCH" --quiet
git checkout "$BRANCH" >/dev/null 2>&1 || git checkout -b "$BRANCH"
git pull --rebase origin "$BRANCH" --quiet || true

# Shopify theme pull (optional) - only run if CLI + shop configured
if command -v shopify >/dev/null 2>&1; then
  echo "Attempting shopify theme pull (non-fatal if fails)..."
  shopify theme pull || echo "Shopify theme pull skipped/failed"
fi

# Restore stashed local changes if we stashed
if [ "$STASHED" -eq 1 ]; then
  echo "Restoring stashed changes..."
  git stash pop || true
fi

# Detect changes post-sync
if git diff --quiet && git diff --cached --quiet; then
  echo "No changes to commit."  
  exit 0
fi

echo "Staging and committing backup snapshot..."
# Add all (could refine with a .backupignore if needed later)
git add .

SHORT_HASH=$(git rev-parse --short HEAD || echo "nohash")
COMMIT_MSG="chore(backup): automatic snapshot ${TIMESTAMP} (base ${SHORT_HASH})"

git commit -m "$COMMIT_MSG" || {
  echo "Nothing to commit after staging."; exit 0; }

echo "Pushing to origin/$BRANCH..."
git push origin "$BRANCH"

echo "Backup complete."