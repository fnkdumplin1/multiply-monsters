# 🎯 Multiply Monsters

An engaging, gamified multiplication practice app designed for elementary school students. Features multiple game modes including single-player practice, multiplayer classroom battles, and detective-style problem solving.

![Version](https://img.shields.io/badge/version-3.0.1-blue)
![React](https://img.shields.io/badge/React-19.1.1-61dafb)
![Firebase](https://img.shields.io/badge/Firebase-12.1.0-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎮 Game Modes

#### Single Player
- **Unlimited Practice** - Practice at your own pace with instant feedback
- **Timed Challenge** - Race against the clock (60 seconds)
- **Advanced Mode** - One factor 1-9, the other 1-20 for extended learning

#### 🕵️ Monster Detective Mode
- Solve multiplication mysteries with 5 different clue types
- Crypto-secure randomization for true variety
- Expanded 0-12 factor range for zero property education
- Manual review of incorrect answers with "Next Question" control
- Dynamic product generation (169 possible combinations)

#### 👥 Multiplayer Classroom Modes
- **Monster Squad Showdown** - Student-led peer battles
- **Quick Clash** - 3-minute speed battle with real-time leaderboards
- **Survival Mode** - Last player standing elimination game
- Real-time teacher monitoring and leaderboards
- Session-based gameplay with unique codes

### 🎨 User Experience
- Clean, card-based design with Hanken Grotesk font
- Instant audio feedback with multiple sound variations
- Streak tracking and score history
- Progressive Web App (PWA) support for offline play
- Mobile-optimized interface

## 🆕 What's New in v3.0.1

### Detective Mode Improvements
- **Enhanced Randomization** - Crypto-secure random generation using `crypto.getRandomValues`
- **Zero Property Education** - Expanded range to 0-12 (previously 1-12)
- **Dynamic Products** - 169 possible combinations (up from 11 fixed products)
- **Smart Zero Logic** - When asking "0 × ? = 0", accepts ANY number 0-12 as correct
- **Manual Dismiss** - Users control when to advance after wrong answers
- **Learning Review** - "Next Question" button appears after incorrect answers
- **Auto-advance** - Correct answers still advance automatically (1.5s)

### Bug Fixes
- Fixed input validation to properly accept 0 as a valid factor
- Fixed HTML input constraints (min changed from 1 to 0)
- Fixed answer checking to handle zero multiplication edge cases
- Improved feedback display for all answer types

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager
- Firebase account (for multiplayer features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fnkdumplin1/multiply-monsters.git
   cd multiply-monsters
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase (optional, for multiplayer)**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database
   - Copy your Firebase config to `src/firebase.js`
   - Deploy Firestore rules from `firestore.rules`

4. **Start the development server**
   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Building for Production

```bash
npm run build
```

Builds the app for production to the `build` folder. The build is optimized and minified.

## 📁 Project Structure

```
multiply-monsters/
├── public/              # Static assets
│   ├── index.html
│   ├── manifest.json
│   └── sounds/         # Audio files
├── src/
│   ├── App.js          # Main application component
│   ├── App.css         # Styling
│   ├── firebase.js     # Firebase configuration
│   └── multiplayerUtils.js  # Multiplayer logic
├── prod/               # Production builds
│   ├── v3.0.1/        # Latest release
│   ├── v3.0.0/
│   └── ...
├── firestore.rules     # Firestore security rules
└── package.json
```

## 🎓 Educational Features

### Skills Practiced
- Multiplication facts (0-12)
- Division preparation (inverse operations)
- Number properties (even/odd, zero property)
- Mental math and speed
- Strategic thinking (in multiplayer modes)

### Classroom Integration
- Teacher monitoring dashboard
- Real-time student progress tracking
- Customizable session durations
- Battle mode for competitive learning
- Comprehensive teacher guide included

## 🔧 Configuration

### Audio Settings
The app includes background music and sound effects. Users can:
- Toggle background music on/off
- Control sound effects independently
- Adjust volume levels

### Game Settings
Teachers can customize:
- Session duration (Quick Clash: 3 minutes, Survival: variable)
- Number of Detective Mode questions (default: 10)
- Time limits for timed challenges (default: 60 seconds)

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run Firestore rules tests:
```bash
npm run test:rules
```

## 📦 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### GitHub Pages
```bash
npm run build
# Configure GitHub Pages to serve from the build folder
```

### Other Platforms
The production build in the `build` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3
- Google Cloud Storage

## 🗺️ Roadmap

- [ ] More game modes (Speed Rounds, Pattern Recognition)
- [ ] Leaderboard persistence across sessions
- [ ] Student progress reports for teachers
- [ ] Division mode
- [ ] Customizable number ranges
- [ ] Achievements and badges system
- [ ] Parent dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Version History

See the in-app version history screen or [CHANGELOG.md](./CHANGELOG.md) for detailed release notes.

### Recent Releases
- **v3.0.1** (Nov 2025) - Detective Mode improvements with enhanced randomization
- **v3.0.0** (Sep 2025) - Monster Squad Showdown multiplayer modes
- **v2.1.2** (Sep 2025) - Smart name validation
- **v2.1.1** (Sep 2025) - Version history screen and UI polish
- **v2.1.0** (Sep 2025) - Monster Detective Mode
- **v2.0.0** (Aug 2025) - Firebase multiplayer classroom battles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Eric Ellis**
- GitHub: [@fnkdumplin1](https://github.com/fnkdumplin1)

## 🙏 Acknowledgments

- Sound effects and music assets
- Firebase for real-time multiplayer functionality
- React team for the amazing framework
- Elementary educators who provided feedback and testing

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/fnkdumplin1/multiply-monsters/issues)
- Check the [Teacher Guide](./prod/v3.0.1/BATTLE_MODE_TEACHER_GUIDE.md) for classroom usage

---

Made with ❤️ for elementary students and teachers
