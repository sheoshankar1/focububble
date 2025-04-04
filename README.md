# FocuBubble - Distraction-Free Browser Extension

FocuBubble is a Chrome extension designed to help you stay focused while browsing by blocking distracting websites and managing focused work sessions.

## Features

- 🎯 **Focus Mode Toggle**: Quickly enable/disable focus mode to hide distracting tabs
- ⏱️ **Pomodoro Timer**: 25-minute focus sessions with break reminders
- 🚫 **Site Blocking**: Automatically block or hide distracting websites
- 📊 **Focus Analytics**: Track your daily focus time and maintain streaks
- ⚙️ **Customizable Settings**: Personalize blocked sites and timer duration

## Installation

1. Clone this repository:
```bash
git clone https://github.com/sheoshankar1/focububble.git
```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Development

### Project Structure
```
focububble/
├── manifest.json        # Extension configuration
├── popup.html          # Extension popup UI
├── popup.js            # Popup functionality
├── background.js       # Background service worker
├── styles/
│   ├── popup.css      # Popup styles
│   └── content.css    # Content script styles
└── icons/             # Extension icons
```

### Building from Source

1. Install dependencies (if any are added in the future)
2. Make your changes
3. Test the extension locally
4. Create a pull request

## Usage

1. Click the FocuBubble icon in your Chrome toolbar
2. Toggle Focus Mode to start blocking distractions
3. Use the timer to track focused work sessions
4. View your daily stats and streaks
5. Customize blocked sites in the settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Chrome Extension APIs
- Inspired by the Pomodoro Technique
- Created to help users maintain focus in the digital age
