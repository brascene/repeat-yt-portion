# YouTube Repeat Extension

A Chrome/Arc browser extension that allows you to replay specific portions of YouTube videos for a specified number of times. Perfect for learning music, dance routines, studying lectures, or practicing any skill from YouTube videos.

![Version](https://img.shields.io/badge/version-1.0.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🎯 **Precise Time Selection** - Set exact start and end times using MM:SS or HH:MM:SS format
- 🔄 **Flexible Repeat Options** - Repeat a specific number of times or loop infinitely
- ⏸️ **Auto-Pause** - Automatically pauses the video when repeat cycle completes
- 📊 **Real-Time Display** - See current video time and duration updating live
- 🎨 **Clean UI** - Floating panel that stays visible while you interact with the video
- ⌨️ **Easy Controls** - One-click "Use Current" button to capture timestamps
- 🚀 **Lightweight** - No external dependencies, fast and efficient

## Installation

### Method 1: Load Unpacked (Developer Mode)

1. **Download the extension**
   - Click the green "Code" button at the top of this page
   - Select "Download ZIP"
   - Extract the ZIP file to a location on your computer

2. **Install the icons** (required)
   ```bash
   cd repeat-yt-portion
   pip install Pillow
   python3 create_icons.py
   ```

   Alternatively, you can create the icons manually (see `icons/README.md`)

3. **Load in Chrome/Arc**
   - Open your browser and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked"
   - Select the `repeat-yt-portion` folder

4. **You're ready!**
   - Navigate to any YouTube video
   - Look for the red floating button on the bottom-right
   - Click it to open the control panel

### Method 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon for one-click installation.

## Usage

### Basic Setup

1. **Open a YouTube video** you want to practice
2. **Click the red floating button** (↻) on the bottom-right of the video page
3. The control panel will appear

### Setting Timestamps

**Start Time:**
- Play the video to your desired start point
- Click "Use Current" to capture that timestamp
- Or manually type the time (e.g., `1:30` or `90` for 1 minute 30 seconds)

**End Time:**
- Scrub through the video timeline to find your end point
- Watch the "Current Time" display in the panel (updates every second)
- Type the end time when you find it (e.g., `2:00` or `120`)

**Repeat Count:**
- Enter the number of times to repeat (e.g., `5`)
- Or enter `0` for infinite loop

### Controls

- **Start Repeat** - Begins the repeat cycle
- **Stop** - Stops the current repeat cycle
- **Use Current** - Captures the current video time for start position

### Time Format Examples

The extension accepts multiple time formats:

- `90` - 90 seconds (1 minute 30 seconds)
- `1:30` - 1 minute 30 seconds
- `1:06:30` - 1 hour 6 minutes 30 seconds
- `0:05` - 5 seconds

## Use Cases

- 🎸 **Music Practice** - Loop difficult sections of guitar/piano tutorials
- 💃 **Dance Routines** - Repeat choreography segments until mastered
- 📚 **Language Learning** - Replay pronunciation and dialogue multiple times
- 🏋️ **Workout Training** - Repeat exercise demonstrations
- 🎓 **Educational Content** - Study complex lecture segments
- 🎮 **Gaming Tutorials** - Master specific game mechanics
- 🎨 **Art & Drawing** - Follow along with technique demonstrations

## Screenshots

### Control Panel
The floating control panel stays visible while you interact with the video:

```
┌─────────────────────────┐
│  🔁 YouTube Repeat      │
├─────────────────────────┤
│ Start Time: 1:30        │
│ [Use Current]           │
│                         │
│ End Time: 2:00          │
│                         │
│ Repeat Count: 3         │
│                         │
│ Current: 1:45           │
│ Duration: 5:30          │
│                         │
│ [Start Repeat] [Stop]   │
└─────────────────────────┘
```

## Browser Compatibility

- ✅ Google Chrome (Manifest V3)
- ✅ Arc Browser
- ✅ Microsoft Edge
- ✅ Brave Browser
- ✅ Any Chromium-based browser

## Technical Details

### File Structure

```
repeat-yt-portion/
├── manifest.json       # Extension configuration
├── content.js          # Main script (video control + UI)
├── background.js       # Background service worker
├── popup.html          # Legacy popup (optional)
├── popup.js            # Legacy popup script (optional)
├── popup.css           # Legacy popup styles (optional)
├── create_icons.py     # Icon generation script
├── icons/
│   ├── icon16.png      # 16x16 icon
│   ├── icon48.png      # 48x48 icon
│   ├── icon128.png     # 128x128 icon
│   ├── icon.svg        # SVG template
│   └── README.md       # Icon creation guide
└── README.md           # This file
```

### Permissions

The extension requires minimal permissions:
- `activeTab` - To interact with the current YouTube tab
- `storage` - To save preferences (future feature)
- `scripting` - To inject the control panel

### How It Works

1. **Content Script Injection** - When you load a YouTube video, `content.js` is automatically injected
2. **Video Element Detection** - The script finds the YouTube video player element
3. **UI Creation** - A floating button and control panel are added to the page
4. **Time Monitoring** - The script listens to video `timeupdate` events
5. **Loop Logic** - When video reaches end time, it jumps back to start time
6. **Repeat Counter** - Tracks how many loops have been completed
7. **Auto-Pause** - Pauses video when repeat count is reached

## Troubleshooting

### Extension not appearing on YouTube

1. Make sure you've created the icon files (see Installation step 2)
2. Reload the extension in `chrome://extensions/`
3. Refresh the YouTube page (F5 or Cmd+R)
4. Check browser console (F12) for error messages

### Red button not visible

- The button appears in the bottom-right corner
- Try scrolling down if the page is very short
- Check if another extension is overlapping it

### Popup keeps closing (Arc Browser)

The extension now uses an injected UI panel instead of a popup. Look for the red floating button on the YouTube page itself, not the extension popup.

### Time format not recognized

Make sure you're using one of these formats:
- Seconds: `90`
- MM:SS: `1:30`
- HH:MM:SS: `1:06:30`

## Contributing

Contributions are welcome! Here are ways you can help:

1. **Report Bugs** - Open an issue with details about the problem
2. **Suggest Features** - Share your ideas for improvements
3. **Submit Pull Requests** - Fix bugs or add features
4. **Improve Documentation** - Help make the docs clearer

### Development Setup

```bash
# Clone the repository
git clone https://github.com/brascene/repeat-yt-portion.git
cd repeat-yt-portion

# Create the icons
pip install Pillow
python3 create_icons.py

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select this directory
```

## Roadmap

Future features we're considering:

- [ ] Save favorite timestamp presets per video
- [ ] Keyboard shortcuts for quick control
- [ ] Visual timeline markers on the progress bar
- [ ] Slow motion playback option
- [ ] Export/import settings
- [ ] Playback speed control during repeat
- [ ] Loop regions list (multiple segments)
- [ ] Integration with YouTube chapters

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this extension helpful, consider:
- ⭐ Starring this repository
- 🐛 Reporting bugs or suggesting features
- 📢 Sharing with others who might find it useful

## Acknowledgments

- Inspired by the need to practice music and dance from YouTube tutorials
- Built with vanilla JavaScript for maximum performance
- Thanks to all contributors and users!

## Links

- **Repository**: https://github.com/brascene/repeat-yt-portion
- **Issues**: https://github.com/brascene/repeat-yt-portion/issues
- **Releases**: https://github.com/brascene/repeat-yt-portion/releases

---

Made with ❤️ for learners everywhere
