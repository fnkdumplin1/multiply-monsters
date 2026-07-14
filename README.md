# 🎯 Multiply Monsters

An engaging, gamified multiplication (and division) practice app designed for elementary school students. Features single-player practice, multiplayer classroom battles, detective-style problem solving, and a self-service teacher portal with usage reporting.

![Version](https://img.shields.io/badge/version-4.0.0-blue)
![React](https://img.shields.io/badge/React-19.1.1-61dafb)
![Firebase](https://img.shields.io/badge/Firebase-12.1.0-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎮 Game Modes

#### Solo Adventures
- **Training** - Unlimited practice at your own pace with instant feedback
- **Monster Detective** - Solve multiplication mysteries with 5 different clue types
- **Two-Digit Multiplication** - Step-by-step practice of the traditional vertical algorithm
- **Division** - Long-division-style practice, the inverse of the multiplication facts

#### Timed Challenges
- **Monster Race** - 60-second sprint against the clock
- **Boss Battle** - Ultimate challenge with an extended factor range
- **Include Division toggle** - Mix division questions in at a 50/50 ratio

#### 🕵️ Monster Detective Mode
- Crypto-secure randomization for true variety
- Expanded 0-12 factor range for zero property education
- Manual review of incorrect answers with "Next Question" control
- Dynamic product generation (169 possible combinations)

#### 👥 Classroom Multiplayer
- **Battle Mode** - Teacher-led classroom sessions with real-time monitoring
- **Squad Showdown** - Student-led peer battles (Quick Clash, Epic Duel, Survival)
- **Survival Mode** - Last player standing elimination game
- Division toggle supported across all multiplayer modes
- Session-based gameplay with unique codes

#### 👩‍🏫 Teacher Portal
- Self-service teacher accounts (email/password via Firebase Auth)
- Students optionally link themselves to a teacher at name entry
- Every solo/squad session is automatically logged (Training, Monster Race, Boss Battle, Detective, Two-Digit, Division, Squad Battle, Squad Survival)
- Rolling 30-day usage dashboard with per-day CSV export
- Firestore security rules scope data so a teacher only sees their own students

### 🎨 User Experience
- Clean, card-based design with Hanken Grotesk font
- Instant audio feedback with multiple sound variations
- Streak tracking and score history
- Progressive Web App (PWA) support for offline play
- Mobile-optimized interface

## 🆕 What's New in v4.0.0

### Teacher Portal
- **Teacher Accounts** - New "Teacher Portal" link on the main menu (`/teacher`) for creating an account or logging in
- **Student Teacher Selection** - Optional "Who's your teacher?" dropdown at name entry; skippable with no change to existing behavior
- **Automatic Usage Logging** - Every solo/squad mode logs a session on completion, early exit, or tab backgrounding
- **Teacher Dashboard** (`/teacher/dashboard`) - Rolling 30-day usage view, one row per active day, with CSV export (student name, session duration, modes attempted, best success rates)
- **Security** - New Firestore rules scope reads to a teacher's own students, enforced against their real Auth UID

### Bug Fixes
- Fixed a routing race causing the login/dashboard screens to flicker on sign-in
- Fixed teacher display name briefly showing as generic "Teacher" right after signup
- Teacher logout now returns to the student home screen instead of the main menu

See [prod/v4.0.0/RELEASE_NOTES.md](./prod/v4.0.0/RELEASE_NOTES.md) for full details.

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
│   ├── App.js           # Main application component
│   ├── App.css          # Styling
│   ├── firebase.js      # Firebase configuration
│   ├── multiplayerUtils.js  # Multiplayer logic
│   ├── teacherUtils.js  # Teacher auth + Firestore functions
│   └── reportUtils.js   # CSV/usage report aggregation
├── prod/                # Production builds
│   ├── v4.0.0/         # Latest release
│   ├── v3.4.0/
│   └── ...
├── firestore.rules      # Firestore security rules
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

- [x] Division mode
- [x] Student progress reports for teachers
- [ ] More game modes (Speed Rounds, Pattern Recognition)
- [ ] Leaderboard persistence across sessions
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
- **v4.0.0** (Jul 2026) - Teacher Portal: self-service accounts and a usage dashboard with CSV export
- **v3.4.0** (Jan 2026) - Division Support: standalone Division mode plus a mix-in toggle for timed/multiplayer modes
- **v3.3.1** (Jan 2026) - Fixed a critical timer bug causing screen flickering and audio overlap
- **v3.3.0** (Nov 2025) - URL-based navigation with React Router
- **v3.2.0** (Nov 2025) - Two-Digit Multiplication mode
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
- Check the [Teacher Guide](<./prod/v4.0.0/Multiplication Trainer - Battle Mode Teacher Guide.pdf>) for classroom usage

---

Made with ❤️ for elementary students and teachers
