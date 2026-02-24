# ReVork Website - GitHub Pages Setup

This is a static HTML/CSS/JavaScript version of your ReVork website, ready for GitHub Pages.

## Files Included

1. **index.html** - Main HTML structure
2. **styles.css** - All styling (OnePlus-inspired clean white theme)
3. **script.js** - JavaScript for interactivity (slideshow, mobile menu, smooth scrolling)
4. **README.md** - This file

## Required Images

You need to add these image files to the same folder as your HTML files:

1. **logo.png** - Your neon X logo
2. **device1.png** - Your first tablet device image (OxygenOS 16)
3. **device2.png** - Your second tablet device image (ColorOS 16)

### Image Setup Instructions:

1. Save your neon X logo as `logo.png`
2. Save your first device/tablet image as `device1.png`
3. Save your second device/tablet image (ColorOS 16) as `device2.png`
4. Place all three images in the same directory as `index.html`

## How to Deploy to GitHub Pages

### Method 1: Using the main branch

1. Create a new repository on GitHub (e.g., `revork-website`)
2. Upload all files:
   - index.html
   - styles.css
   - script.js
   - logo.png
   - device1.png
   - device2.png
3. Go to repository Settings → Pages
4. Under "Source", select "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Click "Save"
7. Your site will be live at: `https://yourusername.github.io/revork-website/`

### Method 2: Using a docs folder

1. Create a folder named `docs` in your repository
2. Move all files into the `docs` folder
3. In Settings → Pages, select "main" branch and "/docs" folder

### Method 3: Using GitHub Desktop (Easiest)

1. Install GitHub Desktop
2. Create a new repository
3. Add all files to the repository folder
4. Commit and push to GitHub
5. Enable GitHub Pages in repository settings

## Customization

### Changing Colors

The site uses a red/black/white theme. To change the accent color from red to another color:

In `styles.css`, find all instances of `#dc2626` and `#ef4444` (red colors) and replace with your preferred color:
- `#dc2626` - Main red accent
- `#ef4444` - Lighter red shade

### Adding More Slides

To add more slides to the hero section:

1. In `index.html`, duplicate a slide div:
```html
<div class="slide">
    <img src="your-new-image.png" alt="ReVork Device" class="device-img">
</div>
```

2. Add a new indicator button:
```html
<button class="indicator" data-slide="3"></button>
```

3. Update the total slides in `script.js` if needed (it auto-detects based on HTML)

### Modifying Content

All content is in `index.html`. Simply edit the text within the HTML tags to update:
- Navigation menu items
- Section titles
- Feature descriptions
- Tech specifications
- Statistics

## Browser Compatibility

This website is compatible with:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Features Included

✅ Responsive design (mobile, tablet, desktop)
✅ Sticky header navigation
✅ Auto-rotating hero slideshow (5-second intervals)
✅ Smooth scroll navigation
✅ Mobile hamburger menu
✅ Hover effects on cards and buttons
✅ ROG ASUS-inspired design theme
✅ Scroll animations
✅ Click-to-navigate slide indicators

## Support

For issues or questions, please create an issue in the GitHub repository.

## License

This project is open source and available for your personal use.