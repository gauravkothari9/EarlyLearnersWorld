param([string]$JsonPath)
# Renders narration lines to WAV files using the built-in Windows speech voices.
Add-Type -AssemblyName System.Speech
$cfg = Get-Content -Raw -Path $JsonPath | ConvertFrom-Json
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $s.SelectVoice($cfg.voice) } catch { }
$s.Rate = [int]$cfg.rate
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
foreach ($it in $cfg.items) {
  $s.SetOutputToWaveFile($it.file, $fmt)
  $s.Speak([string]$it.text)
}
$s.SetOutputToNull()
$s.Dispose()
