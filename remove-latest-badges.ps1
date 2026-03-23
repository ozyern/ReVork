# Remove Latest Build badges from all device pages except 16.0.5.700

$badge = '  <span style="display: inline-block; font-size: 0.75rem; color: #5cff5c; background: rgba(92,255,92,0.15); padding: 6px 12px; border-radius: 20px; margin-bottom: 16px;">● Latest Build</span>'

$filesToProcess = @(
  'device-oneplus8-coloros-16.0.3.504.html',
  'device-oneplus8-oxygen-16.0.3.501.html',
  'device-oneplus9-coloros-16.0.3.504.html',
  'device-oneplus9-oxygen-16.0.3.500.html',
  'device-oneplus9-oxygen-16.0.3.503.html',
  'device-oneplus9pro-coloros-16.0.3.504.html',
  'device-oneplus9pro-oxygen-16.0.2.400.html',
  'device-oneplus9pro-oxygen-16.0.2.401.html',
  'device-oneplus9pro-oxygen-16.0.3.500.html',
  'device-oneplus9pro-oxygen-16.0.3.501.html',
  'device-oneplus9pro-oxygen-16.0.3.503.html',
  'device-oneplus9rt-oxygen-16.0.3.501.html'
)

$filesToProcess | ForEach-Object {
  $filePath = "c:\Users\gameb\OneDrive\Desktop\ReVork\$_"
  Write-Host "Processing: $_"
  
  $content = Get-Content $filePath -Raw
  
  # Remove the badge line
  if ($content -contains $badge) {
    $content = $content -replace [regex]::Escape($badge), ''
    Set-Content -Path $filePath -Value $content
    Write-Host "  ✓ Removed Latest Build badge"
  } else {
    Write-Host "  - Badge not found in expected format"
  }
}

Write-Host "`nDone!"
