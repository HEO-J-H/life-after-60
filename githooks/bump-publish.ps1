# Bump Ver. stamp in index.html to current local time (UTF-8, no BOM).
# Updates: const PUBLISH_STAMP and the static <span id="hdr-publish"> (no-JS preview).
# Does not git-add; callers (pre-commit / pre-push) stage as needed.
$ErrorActionPreference = 'Stop'
$hookDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $hookDir
$html = Join-Path $root 'index.html'
if (-not (Test-Path -LiteralPath $html)) { exit 0 }
$stamp = Get-Date -Format 'yyyy.MM.dd HH:mm'
$raw = [IO.File]::ReadAllText($html)
$new = $raw -replace "const PUBLISH_STAMP='[^']*'", "const PUBLISH_STAMP='$stamp'"
$spanPat = '(<span id="hdr-publish"[^>]*>)Ver\.\s[^<]+(</span>)'
$spanRep = "`$1Ver. $stamp`$2"
$new = $new -replace $spanPat, $spanRep
if ($new -ne $raw) {
  [IO.File]::WriteAllText($html, $new, [Text.UTF8Encoding]::new($false))
}
