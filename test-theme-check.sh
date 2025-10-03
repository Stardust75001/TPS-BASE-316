#!/bin/bash

echo "=== Theme Check Test ==="
echo "Date: $(date)"
echo "Working directory: $(pwd)"
echo ""

echo "Testing theme-check..."
theme-check . --list > theme_check_result.txt 2>&1
if [ $? -eq 0 ]; then
    echo "theme-check executed successfully"
    cat theme_check_result.txt | head -20
else
    echo "theme-check failed, trying shopify theme check..."
    shopify theme check . > theme_check_result.txt 2>&1
    if [ $? -eq 0 ]; then
        echo "shopify theme check executed successfully"
        cat theme_check_result.txt | head -20
    else
        echo "Both commands failed"
        cat theme_check_result.txt
    fi
fi

echo ""
echo "=== Test Complete ==="
