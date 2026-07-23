#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOGO="$SCRIPT_DIR/../public/favicon.png"

if [ -z "$1" ]; then
  echo "Uso: scripts/watermark-video.sh <video.mp4>"
  echo ""
  echo "Procesa un video con watermark (logo Horizonte Inmobiliario)"
  echo "y genera un archivo nuevo con sufijo -wm."
  echo ""
  echo "Ejemplo:"
  echo "  scripts/watermark-video.sh tour-departamento.mp4"
  echo "  → genera tour-departamento-wm.mp4"
  exit 1
fi

INPUT="$1"

if [ ! -f "$INPUT" ]; then
  echo "Error: No se encontró el archivo '$INPUT'"
  exit 1
fi

if [ ! -f "$LOGO" ]; then
  echo "Error: No se encontró el logo en '$LOGO'"
  exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
  echo "Error: ffmpeg no está instalado."
  echo "Instalar con:"
  echo "  Linux: sudo apt install ffmpeg"
  echo "  Mac:   brew install ffmpeg"
  exit 1
fi

BASENAME="${INPUT%.*}"
EXT="${INPUT##*.}"
OUTPUT="${BASENAME}-wm.${EXT}"

echo "Procesando video..."
echo "  Input:  $INPUT"
echo "  Logo:   $LOGO"
echo "  Output: $OUTPUT"
echo ""

ffmpeg -i "$INPUT" -i "$LOGO" -filter_complex \
  "[1]scale=W*0.12:-1,format=rgba,colorchannelmixer=aa=0.35[wm]; \
   [0][wm]overlay=W-w-20:H-h-20" \
  -c:v libx264 -crf 23 -c:a copy \
  -y "$OUTPUT"

echo ""
echo "✓ Listo: $OUTPUT"
