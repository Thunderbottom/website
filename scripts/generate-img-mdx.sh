#!/usr/bin/env bash
# generate-mdx.sh - Generate MDX files from images with EXIF dates

set -euo pipefail

# Check dependencies
command -v exiftool >/dev/null 2>&1 || {
  echo "Error: exiftool required but not installed."
  exit 1
}

# Function to extract and format date from EXIF
get_photo_date() {
  local image_file="$1"

  # Try multiple EXIF date fields in order of preference
  local date_taken=$(exiftool -s3 -DateTimeOriginal "$image_file" 2>/dev/null)

  if [ -z "$date_taken" ]; then
    date_taken=$(exiftool -s3 -CreateDate "$image_file" 2>/dev/null)
  fi

  if [ -z "$date_taken" ]; then
    date_taken=$(exiftool -s3 -DateTime "$image_file" 2>/dev/null)
  fi

  if [ -z "$date_taken" ]; then
    # Fallback to file modification time
    if [[ "$OSTYPE" == "darwin"* ]]; then
      date_taken=$(stat -f "%Sm" -t "%Y:%m:%d %H:%M:%S" "$image_file")
    else
      date_taken=$(date -r "$image_file" "+%Y:%m:%d %H:%M:%S")
    fi
  fi

  # Convert to ISO format (YYYY-MM-DDTHH:MM:SS)
  if [ -n "$date_taken" ]; then
    # Handle format "YYYY:MM:DD HH:MM:SS" to "YYYY-MM-DDTHH:MM:SS"
    echo "$date_taken" | sed 's/:/\-/; s/:/\-/; s/ /T/'
  else
    echo "1970-01-01T00:00:00"
  fi
}

# Function to generate a clean title from filename
generate_title() {
  local filename="$1"
  local base_name=$(basename "$filename" | sed 's/\.[^.]*$//')

  # Remove common camera prefixes and convert to title case
  echo "$base_name" |
    sed 's/^IMG[_-]//i; s/^DSC[_-]//i; s/^P[0-9]*[_-]//; s/[_-]/ /g' |
    awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1'
}

# Function to create MDX file for photo
create_photo_mdx() {
  local image_file="$1"
  local output_dir="$2"
  local date_taken="$3"
  local title="$4"
  local image_basename="$5"

  # Extract date components for filename
  local date_prefix=$(echo "$date_taken" | cut -d'T' -f1)
  local mdx_filename="${date_prefix}-${image_basename}.mdx"
  local mdx_file="$output_dir/$mdx_filename"

  # Format display date
  local display_date
  if command -v date >/dev/null 2>&1; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      display_date=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$date_taken" "+%B %d, %Y" 2>/dev/null || echo "Unknown date")
    else
      display_date=$(date -d "$date_taken" "+%B %d, %Y" 2>/dev/null || echo "Unknown date")
    fi
  else
    display_date="Unknown date"
  fi

  cat >"$mdx_file" <<EOF
---
title: "$title"
date: "$date_taken"
image: "$image_basename"
draft: false
---

*Captured on $display_date*
EOF

  echo "  ✓ Created: $mdx_filename"
}

# Function to process a single image
process_image() {
  local image_file="$1"
  local output_dir="$2"
  local filename=$(basename "$image_file")
  local base_name=$(basename "$filename" | sed 's/\.[^.]*$//')

  echo "Processing: $filename"

  # Extract date from EXIF
  local photo_date=$(get_photo_date "$image_file")
  echo "  Date: $photo_date"

  # Generate title
  local photo_title=$(generate_title "$filename")
  echo "  Title: $photo_title"

  # Create MDX file
  create_photo_mdx "$image_file" "$output_dir" "$photo_date" "$photo_title" "$base_name"
  echo
}

# Main function
main() {
  local images_dir="$1"
  local mdx_dir="$2"

  # Validate input directory
  if [ ! -d "$images_dir" ]; then
    echo "Error: Images directory '$images_dir' does not exist."
    exit 1
  fi

  # Create output directory if it doesn't exist
  mkdir -p "$mdx_dir"

  echo "Generating MDX files from images..."
  echo "Images directory: $images_dir"
  echo "MDX output directory: $mdx_dir"
  echo

  # Process all image files
  local processed=0
  local skipped=0

  find "$images_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.tiff" -o -iname "*.webp" -o -iname "*.heic" \) | while read -r image_file; do
    local filename=$(basename "$image_file")
    local base_name=$(basename "$filename" | sed 's/\.[^.]*$//')
    local photo_date=$(get_photo_date "$image_file")
    local date_prefix=$(echo "$photo_date" | cut -d'T' -f1)
    local mdx_filename="${date_prefix}-${base_name}.mdx"
    local mdx_file="$mdx_dir/$mdx_filename"

    if [ -f "$mdx_file" ]; then
      echo "Skipping: $filename → $mdx_filename (already exists)"
    else
      echo "Processing: $filename"
      echo "  Date: $photo_date"

      # Generate title
      local photo_title=$(generate_title "$filename")
      echo "  Title: $photo_title"

      # Create MDX file
      create_photo_mdx "$image_file" "$mdx_dir" "$photo_date" "$photo_title" "$base_name"
    fi
    echo
  done

  echo "Processing complete!"
  echo "Generated MDX files are in: $mdx_dir"
}

# Show usage if incorrect arguments
if [ $# -ne 2 ]; then
  echo "Usage: $0 <images_directory> <mdx_output_directory>"
  echo
  echo "This script will:"
  echo "1. Read all images from the input directory"
  echo "2. Extract EXIF dates from each image"
  echo "3. Generate MDX files with format: YYYY-MM-DD-imagename.mdx"
  echo "4. Skip files that already exist"
  echo
  echo "Supported formats: JPG, JPEG, PNG, TIFF, WebP, HEIC"
  echo
  echo "Example:"
  echo "  $0 ./photos ./content/photography"
  exit 1
fi

main "$1" "$2"
