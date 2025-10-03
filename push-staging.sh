#!/bin/bash
set -e

STORE="f6d72e-0f"
THEME_ID="187147125084"

shopify theme push --store "$STORE" --theme "$THEME_ID" --force
