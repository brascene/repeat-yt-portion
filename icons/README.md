# Extension Icons

This folder contains the icon files required for the extension to work in Chrome/Arc browser.

## Included Files:
- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store, if published)
- `icon.svg` - Vector source file for custom modifications

## Already Ready to Use!

The PNG icons are already included and ready to use. You don't need to do anything - just load the extension and it will work.

## Customizing Icons (Optional)

If you want to create your own custom icons:

1. **Edit the SVG template**: Modify `icon.svg` with any vector graphics editor
2. **Convert to PNG**: Use one of these methods:
   - Online tools like https://www.iloveimg.com/resize-image
   - Design software (Figma, Sketch, Photoshop, GIMP)
   - Command line tools (ImageMagick): `convert icon.svg -resize 16x16 icon16.png`
3. **Replace the files**: Save your new PNGs with the same filenames
