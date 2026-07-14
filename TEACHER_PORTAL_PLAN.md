# Teacher Portal — Implementation Plan

## Context

Teachers using Multiply Monsters currently have no way to see how their students are actually using the app — there's no persistent tracking of who played, for how long, which modes, or how well they did. The app is 100% client-side today except for ephemeral Firestore-backed multiplayer/squad session coordination (`src/multiplayerUtils.js`); nothing about a student's play history survives past the current browser tab, and "teacher" is just a free-text name typed into a session-creation flow, with no real account or login behind it.

This feature adds a lightweight, self-service **Teacher Portal**: teachers create a real (Firebase Auth-backed) account on a dedicated screen, students optionally pick their teacher from a dropdown when they enter their name, and every solo/squad game they play gets logged. The teacher's dashboard then shows a rolling 30 days of daily usage, downloadable as CSV, computed live from Firestore — no new server infrastructure (no Cloud Functions, no scheduler, no Storage, no Blaze billing plan) required.

This is explicitly an approximate, best-effort system, not a precise attendance/analytics product: students have no authentication, so "student name" is just whatever string they typed (duplicates/typos possible), and a hard-killed browser tab can drop the last few seconds of an in-progress attempt. Both limitations are accepted tradeoffs in exchange for zero added infrastructure cost and no change to the student login experience.

**Decisions locked in with the user before this plan:**
- CSV reports are generated **on-demand** when the teacher opens the dashboard (computed live from Firestore), not via a midnight Cloud Function batch job.
- Teacher accounts are **self-service sign-up** (email/password via Firebase Auth) on a new screen, separate from the student home page.
- CSV columns: `student name, session duration, modes attempted, monster race best success rate, boss battle best success rate`. "Session duration" = **total active time summed across every mode played that calendar day**.
- Filename: `MultiplyMonsters_<teacher name>_<mm-dd-yyyy>.csv`, one per calendar day that has at least one logged event for that teacher.
- **Squad Battle and Squad Survival** (student-initiated multiplayer-adjacent modes) count toward usage logging alongside the 6 solo modes. Teacher-run classroom multiplayer sessions (`sessions` collection) are out of scope — those are teacher-driven, not student-initiated play.
- The tab-close undercount gap is **accepted as-is** (no heartbeat writes) — log on natural completion or on `visibilitychange` (tab backgrounded), nothing more.
- `firestore.rules` changes are deployed by **pasting into the Firebase Console** (as done today) — no `firebase init`/CLI setup, no new `firebase.json`/`.firebaserc`.

---

## 1. Data model (Firestore)

### Collection: `teachers`
One doc per registered teacher, **doc ID = Firebase Auth UID** (not the display name — this is what makes the security rules unspoofable later).

- `displayName` (string, 2–50 chars) — shown in the student dropdown and dashboard header.
- `email` (string) — from Firebase Auth.
- `createdAt` (serverTimestamp).

### Collection: `usageEvents`
One doc per completed (or best-effort-flushed) play attempt. Auto-generated doc ID.

- `teacherId` (string, nullable) — selected teacher's UID, or `null` if the student skipped the dropdown.
- `studentName` (string) — as typed, same validation as today's `userName`.
- `gameMode` (string) — one of `'unlimited', 'timed', 'advanced', 'detective', 'twoDigit', 'division', 'squadBattle', 'squadSurvival'`.
- `score` (map `{correct, total}`) — omitted/zeroed for modes without a natural score.
- `startedAt` / `endedAt` (Timestamps).
- `durationSeconds` (number) — precomputed client-side (`endedAt - startedAt`), so downstream aggregation is a straight sum, no timestamp math needed at read time.
- `dayKey` (string `YYYY-MM-DD`, local calendar day at `endedAt`) — denormalized for convenience; the actual read path queries by `teacherId` + a `startedAt >=` lower bound and groups by `dayKey` client-side (Firestore has no native "group by day" and this avoids the 30-value cap on `in` queries).
- `flushReason` (string: `'completed' | 'visibilitychange'`) — diagnostic only, not shown in CSV.

### Event lifecycle
Confirmed function names in `src/App.js`: start functions `startUnlimited`, `startTimed`, `startAdvanced`, `startDetective`, `startTwoDigit`, `startDivision`; end via `endGame` (only reached today by the timer-driven `timed`/`advanced` paths) and `backToMenu` (the actual exit path for untimed modes and any early exit). Squad modes enter via `joinSquadBattle`/the squad lobby → `squadBattle`/`squadSurvival` transition, and exit via `handleLeaveSquadBattle`/`handleLeaveSurvival` or the natural `timeLeft === 0` / `gameOver` completion that routes to `squadResults`.

1. **On start** (each `startX` function, plus the squad-lobby → active-battle transition): capture `Date.now()` into a new `useRef` (e.g. `sessionStartTimeRef`) alongside which mode is active. No Firestore write yet.
2. **On natural completion** (`endGame`, and the squad completion paths): compute `durationSeconds`, call `logUsageEvent(...)`.
3. **On early exit** (`backToMenu`, `handleLeaveSquadBattle`, `handleLeaveSurvival`): if a mode was active and not already logged (guard with a `loggedRef` boolean to avoid double-logging when `endGame` already fired), flush the same way using elapsed time so far.
4. **On tab backgrounding** (`visibilitychange` listener, new): if a mode is active and unlogged, fire the same best-effort flush. `beforeunload` is not relied on for the actual write (unreliable for async work); this is the documented, accepted gap.
5. Untimed modes (`unlimited`, `detective`, `twoDigit`, `division`) have no natural "end" screen distinct from leaving — for these, `backToMenu`/navigating away *is* the primary completion signal, not just a fallback. Worth knowing: a student who never navigates away won't have that attempt logged until they do.

---

## 2. Firestore security rules (`firestore.rules`)

Add two new `match` blocks (existing `sessions`/`squadBattles` blocks and the catch-all deny stay unchanged):

```
match /teachers/{teacherId} {
  allow read: if true;  // student dropdown needs to list all teachers, unauthenticated

  allow create: if request.auth != null
                && request.auth.uid == teacherId
                && request.resource.data.displayName is string
                && request.resource.data.displayName.size() > 0
                && request.resource.data.displayName.size() <= 50;

  allow update: if request.auth != null && request.auth.uid == teacherId;
  allow delete: if false;
}

match /usageEvents/{eventId} {
  allow create: if request.resource.data.studentName is string
                && request.resource.data.studentName.size() > 0
                && request.resource.data.studentName.size() <= 30
                && request.resource.data.gameMode in
                     ['unlimited','timed','advanced','detective','twoDigit','division','squadBattle','squadSurvival']
                && request.resource.data.durationSeconds is number
                && request.resource.data.durationSeconds >= 0
                && request.resource.data.durationSeconds <= 3600
                && (request.resource.data.teacherId == null ||
                    exists(/databases/$(database)/documents/teachers/$(request.resource.data.teacherId)));

  allow update, delete: if false;  // immutable log

  allow read: if request.auth != null && request.auth.uid == resource.data.teacherId;
}
```

The **UID-as-linking-key** design is what makes `allow read: if request.auth.uid == resource.data.teacherId` safe — a student can't gain read access to a teacher's data by typing/guessing a display name, because the field actually checked is the real Auth UID, and the dropdown only ever offers UIDs of teachers that genuinely exist.

Deployment: paste the updated rules into the Firebase Console's Rules tab for the `multiply-monsters-classroom` project, same as documented in `FIREBASE_SECURITY_DEPLOYMENT.md` today. Update that doc to describe the two new collections.

---

## 3. New UI screens

Follows the app's existing convention: add a `pathToMode`/`modeToPath` entry pair (`src/App.js` lines ~22–74) plus a corresponding `if (gameMode === 'x') return (...)` block.

### 3a. Teacher-select dropdown (student name-entry screen)
Inside the existing `gameMode === 'nameInput'` block (lines ~1960–2009), placed inside `.name-input-container`, directly after the name `<input>` (after line 1992) and before the error/submit elements — preserving the existing visual order: label → guidelines → name input → **teacher select** → error → submit.

- New state near `userName`: `teacherId`, `teacherList` (populated via a new `subscribeToTeachers` listener).
- First `<select>` in the app — style it to match `.name-input-container` conventions (not the radio-button `.mode-option` pattern used for battle-mode choice, which is visually a different affordance).
- Label: "Who's your teacher? (optional)"; default blank option = no teacher selected; one `<option>` per teacher, sorted alphabetically by `displayName` client-side after the snapshot.
- The chosen `teacherId` is stored in top-level state so it persists across mode changes for the whole visit (same lifetime as `userName`).

### 3b. Teacher-auth screen — `gameMode === 'teacherAuth'`, path `/teacher`
- Toggle between "Log In" / "Create Account" (email, password, + display name on create).
- Uses new `teacherUtils.js` functions `signUpTeacher` / `logInTeacher`.
- Reachable via a new "Teacher Portal" link on the `menu` screen, separate from the student mode cards (satisfies "not on the same screen as the student login" — the student's entry point is `nameInput`, distinct from this).
- On success, navigate to `/teacher/dashboard`.

### 3c. Teacher-dashboard screen — `gameMode === 'teacherDashboard'`, path `/teacher/dashboard`
- Guarded by a new auth-state listener (`onAuthStateChanged`, wired via a new top-level `useEffect`); redirects to `teacherAuth` if not logged in.
- Shows the teacher's `displayName` at top, a "Log Out" button, and a list of calendar days (most recent first, up to 30) that have at least one usage event for this teacher — each row = date + "Download CSV" button. Days with zero data simply don't appear (avoids 30 empty rows for a brand-new teacher).
- On mount, fetches this teacher's `usageEvents` (via `fetchUsageEventsForTeacher`) and runs them through `reportUtils.js` to build the day list and each day's downloadable CSV.

---

## 4. New utility modules

### `src/firebase.js` (small addition)
Add `import { getAuth } from 'firebase/auth'` and `export const auth = getAuth(app)` alongside the existing `db` export. Confirmed: `firebase` is already `^12.1.0` and includes the modular `firebase/auth` SDK — **no new npm dependency needed**.

### `src/teacherUtils.js` (new file, mirrors `multiplayerUtils.js`'s style: plain exported async functions, `setDoc`/`getDoc`/`getDocs`/`onSnapshot`/`query`/`where`)
- `signUpTeacher(email, password, displayName)` — creates the Auth user, `updateProfile` for displayName, `setDoc` into `teachers/{uid}`.
- `logInTeacher(email, password)`, `logOutTeacher()`, `subscribeToAuthState(callback)`.
- `subscribeToTeachers(callback)` — `onSnapshot(collection(db,'teachers'))` for the student dropdown.
- `logUsageEvent({teacherId, studentName, gameMode, score, startedAt, endedAt, durationSeconds})` — computes `dayKey`, writes to `usageEvents`. Called fire-and-forget (never blocks gameplay UI).
- `fetchUsageEventsForTeacher(teacherId, sinceDate)` — `getDocs(query(collection(db,'usageEvents'), where('teacherId','==',teacherId), where('startedAt','>=',sinceDate)))`.

### `src/reportUtils.js` (new file, pure functions, no Firestore imports — unit-testable in isolation)
- `MODE_LABELS` — map from internal `gameMode` values to human-readable labels for the CSV (`timed` → "Monster Race", `advanced` → "Boss Battle", etc.). This is a new, CSV-only source of truth; existing inline label strings elsewhere in `App.js` are left untouched.
- `groupEventsByDay(events)` → map keyed by `dayKey`.
- `buildDailyReportRows(eventsForDay)` — groups by `studentName`; computes summed `durationSeconds` (formatted e.g. "18m"), the unique sorted `modes attempted` list joined with ", ", and the best `correct/total` % for `timed` and `advanced` respectively that day (blank if not attempted).
- `rowsToCsv(rows)` — builds the CSV string, header row `student name,session duration,modes attempted,monster race best success rate,boss battle best success rate`, quoting the modes-attempted field since it contains commas.
- `buildReportFilename(teacherDisplayName, date)` — `MultiplyMonsters_<teacher name>_<mm-dd-yyyy>.csv`, sanitizing the name for filesystem safety.

### CSV download (in the `teacherDashboard` JSX)
Standard client-side Blob + temporary `<a download>` click — no library needed. Confirmed: no existing CSV/export code anywhere in `src/` to reuse; this is net-new.

---

## 5. File-by-file change list

| File | Change |
|---|---|
| `src/firebase.js` | Add `getAuth` import + `export const auth` |
| `src/teacherUtils.js` | **New** — Auth + usage-event Firestore functions |
| `src/reportUtils.js` | **New** — pure aggregation + CSV builders |
| `src/App.js` | New `pathToMode`/`modeToPath` entries for `/teacher`, `/teacher/dashboard`; new state (`teacherId`, `teacherList`, `currentTeacher`); new auth-state + teacher-list subscription `useEffect`s; new `sessionStartTimeRef` + `loggedRef`; instrumentation added to `startUnlimited`, `startTimed`, `startAdvanced`, `startDetective`, `startTwoDigit`, `startDivision`, the squad-battle/survival start transitions, `endGame`, `backToMenu`, `handleLeaveSquadBattle`, `handleLeaveSurvival`; new `visibilitychange` listener; new teacher-select JSX in `nameInput` block; new `teacherAuth` and `teacherDashboard` screen blocks; new "Teacher Portal" link in the `menu` block |
| `src/App.css` | New rules for the teacher-select control, teacher-auth form, teacher-dashboard list |
| `firestore.rules` | Add `teachers` and `usageEvents` match blocks |
| `FIREBASE_SECURITY_DEPLOYMENT.md` | Document the two new collections' rules for manual console deployment |

`src/multiplayerUtils.js` is untouched — it stays scoped to ephemeral session/squad coordination; the new persistent usage log lives in its own module since it has a different lifecycle (append-only historical log) and different auth model (Auth-gated reads vs. fully open).

---

## 6. Verification

No local Firebase emulator exists today and this plan doesn't add one — local dev already talks to the live `multiply-monsters-classroom` Firestore project via the hardcoded config, so testing happens against that same project:

1. Paste the updated `firestore.rules` into the Firebase Console.
2. `npm start`; go to `/teacher`, create a teacher account (e.g. "Ms. Test"); confirm redirect to `/teacher/dashboard` with zero reports shown.
3. In a second window, go to `/`, enter a student name, confirm "Ms. Test" appears in the dropdown (validates the `teachers` listener + open read rule).
4. Select "Ms. Test," play a full Monster Race round, a full Boss Battle round, and a Squad Battle round to completion; abandon a Training round by switching tabs partway through (tests the `visibilitychange` flush).
5. Back in the teacher window, refresh `/teacher/dashboard`, confirm today's date appears, download the CSV, and confirm: student name present; session duration ≈ sum of the rounds played; modes attempted lists all 4 modes played; Monster Race / Boss Battle success-rate columns match the scores achieved.
6. Log in as a second teacher account and confirm their dashboard shows none of the first teacher's data (validates the UID-scoped read rule).
7. Regression-check existing flows unaffected: multiplayer classroom session creation/join, squad battle/survival without picking a teacher (`teacherId: null`), and all solo modes still play normally.
