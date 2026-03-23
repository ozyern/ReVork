# Update all device pages with mobile optimization and centering

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
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
      }
      .grid-2-col {
        grid-template-columns: 1fr !important;
        gap: 30px !important;
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

Get-ChildItem device-*.html | ForEach-Object {
  Write-Host "Processing: $($_.Name)"
  $content = Get-Content $_.FullName -Raw
  
  # Add mobile styles if not already present
  if ($content -notmatch '@media.*max-width') {
    $content = $content -replace '(</head>)', "$mobileStyles`n`$1"
    Write-Host "  + Added mobile optimization styles"
  }
  
  # Center hero sections and add classes
  $content = $content -replace 'style="padding: 160px 60px 60px; text-align: center;"', 'class="hero-section" style="padding: 160px 60px 60px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;"'
  
  # Center grid layout and add class
  $content = $content -replace 'style="display: grid; grid-template-columns: 1fr 1fr;', 'class="grid-2-col" style="display: grid; grid-template-columns: 1fr 1fr;'
  
  Set-Content -Path $_.FullName -Value $content
  Write-Host "  + Enhanced with centering and mobile optimization"
}

Write-Host "`nAll device pages updated successfully!"
