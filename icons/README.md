# Extension Icons

This folder needs icon files for the extension to work properly in Chrome/Arc browser.

## Required Files:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## How to Create Icons:

### Option 1: Use the Python script (recommended)
```bash
pip install Pillow
python3 ../create_icons.py
```

### Option 2: Use the SVG template
Use `icon.svg` as a template and convert it to PNG files at the required sizes using:
- Online tools like https://www.iloveimg.com/resize-image
- Design software (Figma, Sketch, Photoshop, GIMP, etc.)
- Command line tools (ImageMagick): `convert icon.svg -resize 16x16 icon16.png`

### Option 3: Create your own icons
Create simple 16x16, 48x48, and 128x128 PNG images with:
- A red (#FF0000) background
- White repeat/loop arrows or symbols
- Save them with the exact names above

## Temporary Workaround:
Until you create proper icons, you can create simple placeholder PNGs by:
1. Opening any image editor
2. Creating a red square at each size (16x16, 48x48, 128x128)
3. Saving them with the correct filenames

The extension will work without icons, but Chrome may show warnings during installation.
