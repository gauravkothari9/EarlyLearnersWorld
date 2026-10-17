#!/usr/bin/env bash
# Kids Shorts Studio (EarlyLearnersWorld) setup on the shared Ubuntu 24.04 EC2 box.
#
#   sudo bash deploy/setup.sh <hostname>
#   e.g. sudo bash deploy/setup.sh earlylearners.43-205-166-13.sslip.io
#
# Shares the box with TurtleReels (5000) and Stick Reels (5001): this app listens on 127.0.0.1:5002
# and adds its own Caddy site file for HTTPS. The pages are hosted on Vercel and call this API with
# the admin password from .admin-password (checked by server.js).
# Rendering runs at low CPU priority so the other sites stay responsive. Safe to run again.
set -euo pipefail

HOST="${1:?Usage: sudo bash deploy/setup.sh <hostname>}"
PORT=5002
[[ $EUID -eq 0 ]] || { echo "Run with sudo"; exit 1; }
APP_USER="${SUDO_USER:-ubuntu}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PASS_FILE="$APP_DIR/.admin-password"
as_app() { sudo -u "$APP_USER" -H bash -lc "$1"; }

echo "==> System packages (ffmpeg, fonts)"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y curl ca-certificates gnupg ffmpeg \
  fonts-dejavu-core fonts-noto-color-emoji fonts-liberation

echo "==> Google Chrome (headless rendering)"
if ! command -v google-chrome-stable >/dev/null; then
  curl -fsSL -o /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  DEBIAN_FRONTEND=noninteractive apt-get install -y /tmp/chrome.deb
  rm -f /tmp/chrome.deb
fi

echo "==> Node.js 22"
if ! node -v 2>/dev/null | grep -q '^v22'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

echo "==> Caddy"
if ! command -v caddy >/dev/null; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y && apt-get install -y caddy
fi

echo "==> Node packages"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
as_app "cd '$APP_DIR' && npm ci --omit=dev"
as_app "mkdir -p '$APP_DIR/data' '$APP_DIR/output' '$APP_DIR/.tmp'"

echo "==> Admin password"
if [[ ! -s "$PASS_FILE" ]]; then
  head -c 18 /dev/urandom | base64 | tr -d '/+=' > "$PASS_FILE"
  NEW_PASS=1
fi
chown "$APP_USER:$APP_USER" "$PASS_FILE" && chmod 600 "$PASS_FILE"   # server.js reads it

echo "==> systemd service"
cat > /etc/systemd/system/kids-shorts.service <<EOF
[Unit]
Description=Kids Shorts Studio (EarlyLearnersWorld)
After=network-online.target
Wants=network-online.target

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=$PORT
Environment=PUBLIC_URL=https://$HOST
Environment=CHROME_PATH=/usr/bin/google-chrome-stable
# Autopilot publish times are read in this time zone.
Environment=TZ=Asia/Kolkata
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
# Low priority so TurtleReels and Stick Reels stay fast while a video renders.
Nice=10
CPUWeight=40
IOWeight=40

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable kids-shorts >/dev/null
systemctl restart kids-shorts

echo "==> Caddy site for https://$HOST"
mkdir -p /etc/caddy/sites
cat > /etc/caddy/sites/kids-shorts.caddy <<EOF
$HOST {
	encode gzip
	reverse_proxy 127.0.0.1:$PORT
}
EOF
touch /etc/caddy/Caddyfile
grep -q '^import sites/\*.caddy' /etc/caddy/Caddyfile || printf '\nimport sites/*.caddy\n' >> /etc/caddy/Caddyfile
caddy validate --adapter caddyfile --config /etc/caddy/Caddyfile >/dev/null
systemctl reload caddy 2>/dev/null || systemctl restart caddy

sleep 3
if systemctl is-active --quiet kids-shorts && curl -fsS "http://127.0.0.1:$PORT/api/ping" >/dev/null; then
  echo
  echo "Kids Shorts Studio is running: https://$HOST"
  echo "Admin password: $( [[ -n "${NEW_PASS:-}" ]] && cat "$PASS_FILE" || echo "(unchanged; see $PASS_FILE)" )"
  echo "Logs:    sudo journalctl -u kids-shorts -f"
else
  echo "The service did not start. See: sudo journalctl -u kids-shorts -n 50"
  exit 1
fi
