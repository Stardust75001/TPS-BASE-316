#!/bin/bash
echo "Running theme check..."
theme-check . --output json > theme_results.json 2>&1
echo "Theme check completed - results saved to theme_results.json"
echo ""
echo "Quick summary:"
if [ -f theme_results.json ]; then
    echo "File size: $(wc -c < theme_results.json) bytes"
    echo "First few lines:"
    head -10 theme_results.json
else
    echo "No results file created"
fi
