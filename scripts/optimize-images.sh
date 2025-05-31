#!/usr/bin/env bash
# optimize-images.sh - Pre-process images before adding to git

set -euo pipefail

INPUT_DIR="src/content/photography/images"
TEMP_DIR=$(mktemp -d)

# Check if imagemagick and exiftool are available
command -v magick >/dev/null 2>&1 || {
  echo "ImageMagick required but not installed."
  exit 1
}
command -v exiftool >/dev/null 2>&1 || echo "Warning: exiftool not found, EXIF privacy cleaning will be skipped"
command -v oxipng >/dev/null 2>&1 || echo "Warning: oxipng not found, PNG optimization will be skipped"

optimize_image() {
  local input_file="$1"
  local output_file="$2"
  local max_width="$3"
  local quality="$4"

  echo "Optimizing: $(basename "$input_file")"

  # Get original dimensions
  original_width=$(magick identify -format "%w" "$input_file")

  # Only resize if larger than max_width
  if [ "$original_width" -gt "$max_width" ]; then
    resize_option="-resize ${max_width}x${max_width}>"
  else
    resize_option=""
  fi

  # Optimize based on file type
  case "${input_file,,}" in
  *.jpg | *.jpeg)
    magick "$input_file" \
      $resize_option \
      -auto-orient \
      -colorspace sRGB \
      -quality "$quality" \
      -interlace Plane \
      "$output_file"

    # Remove only privacy-sensitive EXIF data, keep camera settings
    if command -v exiftool >/dev/null 2>&1; then
      exiftool -overwrite_original \
        -GPS:all= \
        -EXIF:Artist= \
        -EXIF:Copyright= \
        -EXIF:ImageDescription= \
        -EXIF:UserComment= \
        -EXIF:XPComment= \
        -EXIF:XPAuthor= \
        -EXIF:XPKeywords= \
        -EXIF:XPSubject= \
        -EXIF:XPTitle= \
        -IPTC:all= \
        -XMP-dc:Creator= \
        -XMP-dc:Rights= \
        -XMP-dc:Description= \
        -XMP-dc:Title= \
        -XMP-dc:Subject= \
        "$output_file" 2>/dev/null || true
    fi
    ;;
  *.png)
    magick "$input_file" \
      $resize_option \
      -auto-orient \
      -colorspace sRGB \
      "$output_file"

    # PNG typically doesn't have camera EXIF, safe to strip
    if command -v oxipng >/dev/null 2>&1; then
      oxipng --opt max --strip safe "$output_file"
    fi
    ;;
  *.webp)
    magick "$input_file" \
      $resize_option \
      -auto-orient \
      -colorspace sRGB \
      -quality "$quality" \
      "$output_file"

    # Selectively remove metadata from WebP while preserving EXIF
    if command -v exiftool >/dev/null 2>&1; then
      exiftool -overwrite_original \
        -GPS:all= \
        -IPTC:all= \
        -XMP-dc:Creator= \
        -XMP-dc:Rights= \
        "$output_file" 2>/dev/null || true
    fi
    ;;
  *)
    echo "Unsupported format: $input_file"
    return 1
    ;;
  esac
}

# Process all images in the photography directory
if [ -d "$INPUT_DIR" ]; then
  for img in "$INPUT_DIR"/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}; do
    [ -f "$img" ] || continue

    filename=$(basename "$img")
    temp_output="$TEMP_DIR/$filename"

    # Optimize with max width 2048px and 85% quality
    optimize_image "$img" "$temp_output" 2048 85

    # Get file sizes for comparison
    original_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img")
    new_size=$(stat -f%z "$temp_output" 2>/dev/null || stat -c%s "$temp_output")

    # Calculate percentage reduction
    reduction=$(((original_size - new_size) * 100 / original_size))

    echo "  Original: $(numfmt --to=iec-i --suffix=B $original_size)"
    echo "  Optimized: $(numfmt --to=iec-i --suffix=B $new_size)"
    echo "  Reduction: ${reduction}%"

    # Only replace if we achieved significant reduction
    if [ "$new_size" -lt "$original_size" ]; then
      mv "$temp_output" "$img"
      echo "  ✓ Updated"
    else
      echo "  → No improvement, keeping original"
    fi
    echo
  done
else
  echo "Photography images directory not found: $INPUT_DIR"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo "Image optimization complete!"
