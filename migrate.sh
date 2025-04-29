#!/usr/bin/env bash

# Script to convert Markdown footnotes to Zola sidenote shortcodes
# Usage: ./convert_footnotes.sh [directory]

set -e

# Directory to process (default: content)
DIR=${1:-content}

# Check if directory exists
if [ ! -d "$DIR" ]; then
  echo "Error: Directory '$DIR' not found"
  exit 1
fi

# Temporary file for processing
TEMP_FILE=$(mktemp)
BACKUP_DIR="footnote_backups_$(date +%Y%m%d%H%M%S)"

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "Creating backups in: $BACKUP_DIR"

# Find all markdown files recursively
echo "Finding markdown files in $DIR..."
MARKDOWN_FILES=$(find "$DIR" -type f -name "*.md")
FILE_COUNT=$(echo "$MARKDOWN_FILES" | wc -l)

echo "Found $FILE_COUNT markdown files"

# Process each file
PROCESSED=0
MODIFIED=0

for file in $MARKDOWN_FILES; do
  PROCESSED=$((PROCESSED + 1))
  echo -ne "Processing ($PROCESSED/$FILE_COUNT): $file\r"

  # Make a backup
  cp "$file" "$BACKUP_DIR/$(basename "$file")"

  # Check if file contains any footnote references
  if ! grep -q '\[\^[0-9]\+\]' "$file"; then
    # No footnote references in this file, skip to next
    continue
  fi

  MODIFIED=$((MODIFIED + 1))

  # Create a new file for the processed content
  >"$TEMP_FILE"

  # First, collect all footnote definitions and their content
  declare -A footnote_content
  while IFS= read -r line; do
    if [[ "$line" =~ ^\[\^([0-9]+)\]:\ (.*) ]]; then
      fn_id="${BASH_REMATCH[1]}"
      fn_text="${BASH_REMATCH[2]}"
      footnote_content["$fn_id"]="$fn_text"
    fi
  done <"$file"

  # Now process the file line by line
  in_footnote_section=0
  while IFS= read -r line; do
    # Skip lines that are footnote definitions
    if [[ "$line" =~ ^\[\^[0-9]+\]: ]]; then
      in_footnote_section=1
      continue
    fi

    # If we're in the footnote section and encounter a blank line or non-footnote line,
    # reset the flag (in case there are more footnotes later)
    if [[ $in_footnote_section -eq 1 && (-z "$line" || ! "$line" =~ ^[[:space:]]+.*) ]]; then
      in_footnote_section=0
    fi

    # If we're in the footnote section and this line is indented, it's a continuation
    # of the previous footnote definition, so skip it
    if [[ $in_footnote_section -eq 1 && "$line" =~ ^[[:space:]]+.* ]]; then
      continue
    fi

    # Process footnote references in the line
    for fn_id in "${!footnote_content[@]}"; do
      fn_text="${footnote_content[$fn_id]}"
      # Escape any special characters for sed
      escaped_fn_text=$(echo "$fn_text" | sed 's/[\/&]/\\&/g')
      # Replace footnote reference with sidenote shortcode
      line=$(echo "$line" | sed "s/\[\^$fn_id\]/{% sidenote(id=\"$fn_id\") %}$escaped_fn_text{% end %}/g")
    done

    # Write the processed line to the temp file
    echo "$line" >>"$TEMP_FILE"
  done <"$file"

  # Move processed content back to original file
  mv "$TEMP_FILE" "$file"
done

echo
echo "Conversion complete!"
echo "Modified $MODIFIED out of $PROCESSED files"
echo "Backups saved to: $BACKUP_DIR"
echo
echo "Next steps:"
echo "1. Review the changes in your files"
echo "2. Test your site with 'zola serve'"
echo "3. If everything looks good, you can delete the backup directory"
echo
echo "If you need to revert changes, run:"
echo "  cp $BACKUP_DIR/* content/"
