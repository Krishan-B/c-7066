#!/bin/bash
# Scan for lines longer than 5000 characters in YAML, JSON, and log files
find . -type f \( -name '*.yml' -o -name '*.yaml' -o -name '*.json' -o -name '*.log' \) | while read -r file; do
  awk 'length($0) > 5000 { print FILENAME ":" NR " => " length($0) " chars" }' "$file"
done
