#!/usr/bin/env python3
"""
Simple script to create placeholder PNG icons for the extension.
Run this to generate icon16.png, icon48.png, and icon128.png
"""

try:
    from PIL import Image, ImageDraw

    def create_icon(size):
        # Create a red square with rounded corners
        img = Image.new('RGB', (size, size), color='#FF0000')
        draw = ImageDraw.Draw(img)

        # Draw a simple repeat/loop symbol (white arrows)
        # This is a simplified version - you can replace with better icons later
        color = 'white'

        # Draw circular arrows indicating repeat
        if size >= 48:
            # Top arrow
            draw.arc([size//4, size//4, size*3//4, size*3//4],
                     start=45, end=180, fill=color, width=max(2, size//20))
            # Bottom arrow
            draw.arc([size//4, size//4, size*3//4, size*3//4],
                     start=225, end=360, fill=color, width=max(2, size//20))

        # Draw a play triangle in the center
        triangle_size = size // 3
        center_x, center_y = size // 2, size // 2
        points = [
            (center_x - triangle_size//3, center_y - triangle_size//2),
            (center_x - triangle_size//3, center_y + triangle_size//2),
            (center_x + triangle_size//2, center_y)
        ]
        draw.polygon(points, fill=color)

        return img

    # Create icons in different sizes
    for size in [16, 48, 128]:
        icon = create_icon(size)
        icon.save(f'icons/icon{size}.png')
        print(f'Created icon{size}.png')

    print('\nIcons created successfully!')
    print('You can replace these with custom icons later if desired.')

except ImportError:
    print('PIL/Pillow is not installed.')
    print('Install it with: pip install Pillow')
    print('\nAlternatively, you can:')
    print('1. Use any image editor to create 16x16, 48x48, and 128x128 PNG files')
    print('2. Save them as icon16.png, icon48.png, and icon128.png in the icons/ folder')
    print('3. Or use the provided icon.svg as a template')
