#!/bin/sh
set -e

# /app-data is expected to be a mounted persistent volume. On first boot it's
# empty, so seed it with the appsettings.json shipped in the image (no
# secrets baked in). On later boots, whatever the app itself wrote there
# (via the SMTP / DB Settings screens) is kept as-is.
if [ ! -f /app-data/appsettings.json ]; then
  cp /app/appsettings.json /app-data/appsettings.json
fi

ln -sf /app-data/appsettings.json /app/appsettings.json

exec "$@"
