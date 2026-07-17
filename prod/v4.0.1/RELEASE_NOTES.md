# Multiplication Trainer v4.0.1

**Release Date:** July 17, 2026

## Bug Fixes and Polish

A follow-up patch to v4.0.0's Teacher Portal release, focused on gameplay feel, a Teacher Portal UI fix, a visual pass on icons, and a new feedback channel.

### Fixed: Answer input freezing while typing

`playSound()` was creating a brand-new native `AudioContext` on every sound effect (submit, correct, incorrect, countdown, etc.) and never closing any of them. Each leaked context keeps its own audio render thread alive; after a handful of questions the pile-up of leaked contexts caused intermittent jank, felt most as the answer input briefly freezing mid-keystroke. Fixed by creating one shared `AudioContext`, reused for every sound effect instead of a fresh one each time. Background music's context was already being closed correctly and was left untouched.

### Fixed: Stale question flash after a fast answer

In `submitAnswer`, revealing the feedback message (a 150ms delay, to let the submit sound play first) and clearing it to load the next question were two independent timeouts both scheduled from the moment the answer was submitted, rather than chained. On a quickly-answered question, the "load next question" timer could fire before - or right as - the feedback message appeared, which showed up as the just-answered question flashing back with no confirmation for a beat before the next one replaced it. Fixed by nesting the second timeout inside the first one's callback, so the success/error message is now guaranteed to hold on screen for its full intended duration before anything changes underneath it.

### Fixed: Teacher Portal Log In / Create Account control

The Log In / Create Account tabs rendered left-aligned inside a gray box that stretched the full width of the card, rather than reading as a toggle. Rebuilt as a centered, pill-shaped segmented toggle: the gray background block is gone, replaced with a thin border on the pill itself, and the active option is highlighted with a solid color fill instead of relying on the (now absent) gray backdrop for contrast.

### Added: Home link on the main menu

The main menu (`/menu`) had no way back to the name-entry screen (`/`) other than the browser back button - notably affecting a teacher who clicks "Back to menu" from their dashboard and then has no path back to the Teacher Portal. Added a Home link to the menu screen's footer that navigates to `/` without touching the teacher's Firebase Auth session, so an already-logged-in teacher stays logged in.

### Changed: Icon system

Replaced the emoji used on every interactive button and link (Back, Home, Attack!, Download CSV, Start/Join Squad Battle, Ready toggle, Next Question, confirm/cancel dialogs, and more) with a consistent set of Iconic Pro stroke icons, sized relative to each button's own font and colored via `currentColor` so they automatically match existing button text colors and hover states. Left untouched: the floating background decoration, the large `/menu` mode-card icons, flavor text inside encouragement/error messages, and non-clickable HUD badges (streak, lives, host crown, medal ranks) - the last of which rely on gold/silver/bronze color to convey rank, which a monochrome icon can't reproduce.

### Added: Feedback button

Added a round, floating Feedback button in the lower-right corner of the main menu screen only, linking out (in a new tab) to the public Featurebase board at [mathmonsters.featurebase.app](https://mathmonsters.featurebase.app/) for bug reports and feature requests.

### Technical Details

- **Files changed:** `src/App.js`, `src/App.css`
- **New files:** `src/icons/*.svg` (22 stroke icons bundled via Create React App's built-in SVGR support)
- **Unaffected:** Firestore rules, `teacherUtils.js`, `multiplayerUtils.js`, `reportUtils.js` - no data model or backend changes in this release

### Upgrade Notes

No Firebase Console steps required for this release - it is a client-only patch.
