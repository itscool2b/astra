#!/bin/bash
# Downloads planet textures from Solar System Scope (CC BY 4.0)
# https://www.solarsystemscope.com/textures/
#
# Usage: ./scripts/download-textures.sh
# The app works without textures (falls back to solid colors).

TEXTURE_DIR="public/textures"
BASE_URL="https://www.solarsystemscope.com/textures/download"

mkdir -p "$TEXTURE_DIR"

echo "Downloading planet textures (this may take a few minutes)..."

# 2K textures for initial load (small enough for fast loading)
declare -A TEXTURES=(
  ["earth_daymap.jpg"]="2k_earth_daymap.jpg"
  ["earth_nightmap.jpg"]="2k_earth_nightlight.jpg"
  ["earth_clouds.png"]="2k_earth_clouds.jpg"
  ["earth_normal.jpg"]="2k_earth_normal_map.tif"
  ["earth_specular.jpg"]="2k_earth_specular_map.tif"
  ["mercury_albedo.jpg"]="2k_mercury.jpg"
  ["venus_surface.jpg"]="2k_venus_surface.jpg"
  ["venus_atmosphere.jpg"]="2k_venus_atmosphere.jpg"
  ["mars_albedo.jpg"]="2k_mars.jpg"
  ["jupiter_albedo.jpg"]="2k_jupiter.jpg"
  ["saturn_albedo.jpg"]="2k_saturn.jpg"
  ["saturn_ring_color.png"]="2k_saturn_ring_alpha.png"
  ["uranus_albedo.jpg"]="2k_uranus.jpg"
  ["neptune_albedo.jpg"]="2k_neptune.jpg"
  ["moon_albedo.jpg"]="2k_moon.jpg"
  ["sun_albedo.jpg"]="2k_sun.jpg"
)

for local_name in "${!TEXTURES[@]}"; do
  remote_name="${TEXTURES[$local_name]}"
  if [ ! -f "$TEXTURE_DIR/$local_name" ]; then
    echo "  Downloading $local_name..."
    curl -sL "${BASE_URL}/${remote_name}" -o "$TEXTURE_DIR/$local_name" 2>/dev/null || echo "  Warning: Could not download $local_name"
  else
    echo "  Skipping $local_name (already exists)"
  fi
done

echo "Done! Textures saved to $TEXTURE_DIR/"
