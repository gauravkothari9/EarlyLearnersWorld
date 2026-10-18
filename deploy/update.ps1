# Push the committed code to the shared AWS box and (re)start Kids Shorts Studio.
#   powershell -ExecutionPolicy Bypass -File deploy\update.ps1
# Ships only git-tracked files, so the server keeps its own server/.env (MONGO_URI, Razorpay keys),
# data/ (variation history) and output/ videos. First time: copy server/.env to ~/kids-shorts/server/.
$ErrorActionPreference = 'Stop'
$Server = 'ubuntu@43.205.166.13'
$HostName = 'earlylearners.43-205-166-13.sslip.io'
$Key = "$env:USERPROFILE\.ssh\turtlereels.pem"   # same box as TurtleReels
$opt = @('-i', $Key, '-o', 'ConnectTimeout=20', '-o', 'BatchMode=yes')
$root = Split-Path $PSScriptRoot -Parent
Push-Location $root
try {
    $r = & ssh @opt $Server 'echo ok' 2>$null
    if ($r -ne 'ok') {
        $ip = (Invoke-WebRequest 'https://checkip.amazonaws.com' -UseBasicParsing -TimeoutSec 10).Content.Trim()
        throw "Cannot SSH to $Server. If your home IP changed (now $ip), run: node deploy\aws-provision.mjs in the 'Turtle Reels' folder (it adds the new IP to the firewall)."
    }
    $out = 'kids-shorts-update.tar.gz'
    git archive --format=tar.gz -o $out HEAD
    & scp @opt $out "${Server}:~/"
    Remove-Item $out -Force
    & ssh @opt $Server "mkdir -p ~/kids-shorts && tar -xzf ~/$out -C ~/kids-shorts && rm ~/$out && cd ~/kids-shorts && sudo bash deploy/setup.sh $HostName"
    if ($LASTEXITCODE -ne 0) { throw 'Remote setup failed (see output above)' }
    Write-Host "`nLive: https://$HostName" -ForegroundColor Green
} finally {
    Pop-Location
}
