# Bump PUBLISH_STAMP in index.html to current local time (UTF-8, no BOM).
$ErrorActionPreference = 'Stop'
$root = (& git rev-parse --show-toplevel 2>$null)
if (-not $root) { exit 0 }
$html = Join-Path $root 'index.html'
if (-not (Test-Path -LiteralPath $html)) { exit 0 }
$stamp = Get-Date -Format 'yyyy.MM.dd HH:mm'
$raw = [IO.File]::ReadAllText($html)
$pat = "const PUBLISH_STAMP='[^']*'"
$rep = "const PUBLISH_STAMP='$stamp'"
$new = [regex]::Replace($raw, $pat, $rep, 1)
if ($new -ne $raw) {
  [IO.File]::WriteAllText($html, $new, [Text.UTF8Encoding]::new($false))
  & git add -- $html
}
