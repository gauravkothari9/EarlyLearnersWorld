#!/usr/bin/env bash
# Kids Shorts Studio API on the shared Ubuntu 24.04 EC2 box.
#
#   sudo bash deploy/setup.sh <hostname>
#   e.g. sudo bash deploy/setup.sh earlylearners.43-205-166-13.sslip.io
#
# Shares the box with TurtleReels (5000) and Stick Reels (5001): this app listens on 127.0.0.1:5002
# and adds its own Caddy site file for HTTPS. It serves the React app itself, and Vercel can also host it
# and forward /api and /media here (see vercel.json). Needs server/.env with MONGO_URI (MongoDB Atlas).
# Rendering runs at low CPU priority so the other sites stay responsive. Safe to run again.
set -euo pipefail

HOST="${1:?Usage: sudo bash deploy/setup.sh <hostname>}"
PORT=5002
[[ $EUID -eq 0 ]] || { echo "Run with sudo"; exit 1; }
APP_USER="${SUDO_USER:-ubuntu}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$APP_DIR/server/.env"
as_app() { sudo -u "$APP_USER" -H bash -lc "$1"; }
[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE (copy server/.env.example, set MONGO_URI, Razorpay keys)"; exit 1; }

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
as_app "cd '$APP_DIR' && npm ci --omit=dev && npm --prefix server ci --omit=dev"

echo "==> React app (served here too, so https://$HOST works on its own)"
as_app "cd '$APP_DIR' && npm --prefix client ci && npm --prefix client run build"
as_app "mkdir -p '$APP_DIR/data' '$APP_DIR/output' '$APP_DIR/.tmp'"

echo "==> Production settings in server/.env"
set_env() {
  if grep -q "^$1=" "$ENV_FILE"; then sed -i "s#^$1=.*#$1=$2#" "$ENV_FILE"; else echo "$1=$2" >> "$ENV_FILE"; fi
}
set_env PORT $PORT
set_env HOST 127.0.0.1
set_env CLIENT_URL ""
set_env SECURE_COOKIES true
set_env TRUST_PROXY_HOPS 2        # Vercel -> Caddy -> app
chown "$APP_USER:$APP_USER" "$ENV_FILE" && chmod 600 "$ENV_FILE"

echo "==> systemd service"
cat > /etc/systemd/system/kids-shorts.service <<EOF
[Unit]
Description=Kids Shorts Studio (EarlyLearnersWorld)
After=network-online.target
Wants=network-online.target

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR/server
Environment=NODE_ENV=production
Environment=CHROME_PATH=/usr/bin/google-chrome-stable
ExecStart=/usr/bin/node --env-file-if-exists=.env src/index.js
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

sleep 4
if systemctl is-active --quiet kids-shorts && curl -fsS "http://127.0.0.1:$PORT/api/voices" >/dev/null; then
  echo
  echo "Kids Shorts Studio API is running: https://$HOST"
  echo "Logs: sudo journalctl -u kids-shorts -f"
else
  echo "The service did not start. See: sudo journalctl -u kids-shorts -n 50"
  exit 1
fi
