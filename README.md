# EchoBeat

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

EchoBeat is a web-based Digital Audio Workstation built with Vue3, leveraging Yjs for collaboration features and Pinia for state management. This project aims to provide a professional-grade online music creation and editing experience.

## Features

### Track System
- **Virtual Instrument Tracks**: Support for MIDI input and virtual instrument playback
- **Audio Tracks (Voice/Audio)**: For recording and editing audio files
- **Planned Track Types**: Bass, Drum, Sampler, and more

### Editing & Creation
- **Piano Roll Editor**: Intuitive creation and editing of MIDI notes
- **Audio File Visualization**: Waveform display and editing
- **Tempo Control**: Precise setting and adjustment of project tempo and time signature
- **Grid View**: Alignment grid for precise editing

### File Operations
- **Standard MIDI Files**: Support for importing/exporting standard MIDI files (.mid)
- **Offline Storage**: Projects can be saved locally without requiring constant connection
- **History Management**: Operation history with undo/redo functionality

### Track Management
- **Batch Operations**: Edit multiple tracks or clips simultaneously
- **Track Controls**: Grouping, muting, soloing, and more
- **Instrument Switching**: Flexible replacement of different virtual instruments

## Tech Stack

- **Frontend Framework**: Vue 3
- **State Management**: Pinia
- **Collaboration Features**: Yjs
- **UI Components**: Element Plus UI
- **Audio Processing**: Web Audio API | Wavesurfer.js | @tonejs/midi
- **MIDI Processing**: Web MIDI API

## Installation & Usage

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build
```

## Project Structure

```
.
├── .vscode      # VS Code configuration
├── public       # Public static resources
├── recovery     # Recovery files
├── src/         # Source code
│   ├── apis/            # API interface definitions
│   ├── assets/          # Static resources
│   ├── components/      # Components
│   ├── composable/      # Vue composables
│   ├── constants/       # Constant definitions
│   ├── core/            # Core functionality modules
│   │   ├── audio/       # Audio processing core
│   │   ├── custom-event/# Custom event system
│   │   ├── graph/       # Graph processing
│   │   ├── history/     # History functionality
│   │   └── grid-size/   # Grid size control
│   │   └── ...
│   ├── stores/          # Pinia state management
│   ├── directives/      # Vue directives
│   ├── router/          # Vue Router
│   ├── utils/           # Utility functions
│   ├── styles/          # Global styles
│   └── views/           # Page views
├── .env.development     # Development environment config
├── .env.production      # Production environment config
├── .gitignore           # Git ignore file
├── .prettierrc          # Prettier code formatting config
├── components.d.ts      # Component type declarations
├── index.html           # HTML entry file
├── jsconfig.json        # JavaScript configuration
├── package.json         # Project dependency config
├── pnpm-lock.yaml       # pnpm lock file
├── README.md            # Project documentation
└── vite.config.js       # Vite configuration
```

## Usage Examples

### Creating a New Project
1. Click "New Project"
2. Set project parameters (BPM, time signature, etc.)
3. Add desired tracks
4. Start creating

### Editing MIDI
1. Click in the piano roll view to add notes
2. Drag to adjust note length and position
3. Use the toolbar to adjust velocity and other parameters

### Importing/Exporting
1. Click on the file menu
2. Select "Import MIDI" or "Export MIDI"
3. Choose file location

## Roadmap

- [ ] Add more track types (Bass, Drum, Sampler)
- [ ] Implement mixing functionality
- [ ] Add effects plugin system
- [ ] Support for VST plugins
- [ ] Improve collaboration features

## Contributing

Contributions, issues, and feature requests are welcome! If you want to contribute to the project:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Contact

- Project Maintainer: Dyolem
- Email: dyolem9@gmail.com
- Project Link: https://echobeat.com.cn/#/studio