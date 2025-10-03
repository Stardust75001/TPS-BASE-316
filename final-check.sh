#!/bin/bash

echo "=== Final Theme Check Report ==="
echo "Date: $(date)"
echo ""

# Run theme check and capture output
theme-check . --config .theme-check.yml > final_report.log 2>&1

# Count lines and show summary
line_count=$(wc -l < final_report.log 2>/dev/null)
echo "Report generated with $line_count lines"
echo ""

# Show first 10 lines
echo "=== First 10 lines ==="
head -10 final_report.log

echo ""
echo "=== Last 10 lines ==="
tail -10 final_report.log

echo ""
echo "=== Error count ==="
grep -c "error" final_report.log 2>/dev/null || echo "0"

echo ""
echo "=== Warning count ==="
grep -c "suggestion" final_report.log 2>/dev/null || echo "0"

echo ""
echo "=== Report complete ==="
