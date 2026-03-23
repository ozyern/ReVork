# Update version pages with mobile optimization and centering

$versionFiles = @(
  'oxygen-versions.html',
  'coloros-versions.html'
)

$mobileStyles = @'

  <style>
    @media (max-width: 1024px) {
      section {
        padding-left: 30px !important;
        padding-right: 30px !important;
      }
    }
    @media (max-width: 768px) {
      section {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .hero-section {
        padding: 100px 20px 60px !important;
      }
      .version-grid {
        grid-template-columns: 1fr !important;
      }
    }
    @media (max-width: 480px) {
      section {
        padding-left: 15px !important;
        padding-right: 15px !important;
      }
      .hero-section {
        padding: 80px 15px 40px !important;
      }
    }
  </style>
'@

$versionFiles | ForEach-Object {
  $filePath = "c:\Users\gameb\OneDrive\Desktop\ReVork\$_"
  Write-Host "Processing: $_"
  
  $content = Get-Content $filePath -Raw
  
  # Add mobile styles if not already present
  if ($content -notmatch '@media.*max-width') {
    $content = $content -replace '(</head>)', "$mobileStyles`n`$1"
    Write-Host "  + Added mobile optimization styles"
  }
  
  # Center hero sections
  $content = $content -replace 'style="padding: 220px 60px 100px; text-align: center;"', 'class="hero-section" style="padding: 220px 60px 100px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;"'
  
  # Add grid class
  $content = $content -replace 'style="display: grid; grid-template-columns: repeat\(auto-fit, minmax\(280px, 1fr\)\);', 'class="version-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));'
  
  Set-Content -Path $filePath -Value $content
  Write-Host "  + Enhanced with centering and mobile optimization"
}

Write-Host "`nVersion pages updated successfully!"
