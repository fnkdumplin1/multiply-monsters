# Multiplication Trainer v3.3.0

**Release Date:** November 18, 2025

## 🧭 URL-Based Navigation

This release implements comprehensive URL-based routing for improved web navigation and user experience.

### ✨ New Features

#### React Router Integration
- **Complete routing system** - All game modes and screens now have dedicated URLs
- **Browser navigation support** - Back and forward buttons work seamlessly
- **Direct URL access** - Bookmark and share links to specific game modes
- **Clean URL structure** - Intuitive paths that reflect the app hierarchy

#### URL Routes

**Solo Adventures:**
- `/` - Home screen (name input)
- `/menu` - Main menu
- `/training` - Unlimited training mode
- `/timed` - Timed mode
- `/advanced` - Advanced mode
- `/detective` - Monster Detective mode
- `/two-digit` - Two-digit multiplication mode

**Multiplayer:**
- `/multiplayer` - Multiplayer selection
- `/multiplayer/create` - Teacher creates session
- `/multiplayer/join` - Student joins session
- `/multiplayer/lobby/teacher` - Teacher lobby
- `/multiplayer/lobby/student` - Student lobby
- `/multiplayer/monitor` - Teacher monitor view
- `/multiplayer/results` - Multiplayer results

**Monster Squad Showdown:**
- `/squad` - Squad selection
- `/squad/create` - Create squad battle
- `/squad/join` - Join squad battle
- `/squad/lobby` - Squad lobby
- `/squad/battle` - Quick Clash battle
- `/squad/survival` - Survival mode
- `/squad/results` - Squad results

**Other:**
- `/results` - Solo results screen
- `/changelog` - Version history

### 🎯 Technical Improvements

- **Automatic URL synchronization** - Game mode state syncs with browser URL
- **Browser history integration** - Proper back/forward button behavior
- **Route mapping** - Bidirectional mapping between game modes and URL paths
- **Performance optimized** - Routing maps defined outside components to prevent re-renders
- **No breaking changes** - All existing functionality preserved

### 📊 Benefits

1. **Better User Experience** - Users can navigate using browser controls
2. **Shareable Links** - Direct links to specific modes for teachers and students
3. **Browser History** - Navigate through game modes using back/forward buttons
4. **Bookmarking** - Save favorite modes as browser bookmarks
5. **Professional Feel** - Modern web app behavior expected by users

### 📦 Files Included

- Optimized production build (173.31 kB main bundle, +14.08 kB from v3.2.0)
- Enhanced CSS (11.08 kB, unchanged from v3.2.0)
- All static assets (images, sounds, PDFs)
- Service worker for offline functionality
- Updated manifest and metadata

### 🔄 Upgrade Notes

This version maintains full backward compatibility with v3.2.0. All existing game modes and features remain unchanged. The additional 14 kB in bundle size is due to React Router library inclusion.

### 🎮 How It Works

Users can now:
1. Use browser back/forward buttons to navigate between screens
2. Bookmark specific game modes (e.g., `/detective` or `/two-digit`)
3. Share direct links to game modes with students
4. Refresh the page without losing current game mode context (for non-active games)

**Example workflows:**
- Teacher can share `yoursite.com/multiplayer/create` to guide teachers to session creation
- Student can bookmark `yoursite.com/training` for quick access to training mode
- Browser back button returns from results to menu, then to name input

---

For more information, see the version history screen in the app or visit the changelog.
