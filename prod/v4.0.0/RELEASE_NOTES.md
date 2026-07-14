# Multiplication Trainer v4.0.0

**Release Date:** July 14, 2026

## Teacher Portal

This release adds a self-service Teacher Portal: teachers create a real account, students optionally link themselves to a teacher, and every game they play gets logged to a live, downloadable usage dashboard.

### Teacher Accounts

A new **Teacher Portal** link on the main menu leads to `/teacher`, where teachers can create an account (email/password via Firebase Auth) or log in to an existing one. Logging in redirects straight to the dashboard; logging out returns to the student home screen.

### Student Teacher Selection

The student name-entry screen now has an optional "Who's your teacher?" dropdown, populated live from the list of registered teachers. Students can skip it entirely ("No teacher / just practicing") with no change to existing behavior.

### Automatic Usage Logging

Every solo and squad mode is instrumented: Training, Monster Race, Boss Battle, Monster Detective, Two-Digit Multiplication, Division, Squad Battle, and Squad Survival. A play session is logged on natural completion, on early exit back to the menu, or when the student switches away from the tab mid-game (via `visibilitychange`) — whichever happens first, exactly once per session.

### Teacher Dashboard

`/teacher/dashboard` shows a rolling 30 days of usage, one row per day that has at least one logged event, each with a **Download CSV** button. Reports are computed live from Firestore on open — no scheduled jobs or extra infrastructure. CSV columns: student name, session duration, modes attempted, Monster Race best success rate, Boss Battle best success rate. Filename format: `MultiplyMonsters_<teacher name>_<mm-dd-yyyy>.csv`.

### Security

New Firestore rules scope reads so a teacher can only see their own students' usage data — enforced against the real Firebase Auth UID, not a client-supplied name, so it can't be spoofed by guessing a display name. `usageEvents` are an immutable, append-only log (no update/delete).

### Bug Fixes

- Fixed a routing race where signing in on `/teacher` could cause the login and dashboard screens to rapidly flicker back and forth, caused by two effects independently writing the current screen state.
- Fixed the teacher's display name briefly showing as generic "Teacher" instead of their real name immediately after account creation.
- Teacher logout now returns to the student home screen (`/`) instead of the main menu.

### Technical Details

- **New files:** `src/teacherUtils.js` (Auth + Firestore functions), `src/reportUtils.js` (pure CSV/report aggregation, unit-testable in isolation)
- **New collections:** `teachers` (one doc per teacher, keyed by Auth UID), `usageEvents` (append-only play-session log)
- **New routes:** `/teacher`, `/teacher/dashboard`
- **Firestore:** requires a composite index on `usageEvents` (`teacherId` Ascending, `startedAt` Ascending) — see `FIREBASE_SECURITY_DEPLOYMENT.md`
- **Unaffected:** `src/multiplayerUtils.js` is untouched; classroom Battle Mode and Squad Showdown sessions work exactly as before, with or without a teacher selected

### Upgrade Notes

Existing solo and squad gameplay is unaffected whether or not a student selects a teacher. Deploying this version requires two one-time steps in the Firebase Console: pasting the updated `firestore.rules`, and creating the `usageEvents` composite index (Firestore will prompt for this the first time the dashboard is opened if it's missing). See `FIREBASE_SECURITY_DEPLOYMENT.md` for details.
