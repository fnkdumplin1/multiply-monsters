# Multiplication Trainer v4.0.2

**Release Date:** July 23, 2026

## Bug Fixes

A patch release fixing a reported Squad Showdown bug, the same bug's quieter twin in Battle Mode, and a Firestore rules bug that had been silently blocking Battle Mode session creation entirely.

### Fixed: Violent screen flicker when a Squad Showdown battle starts

Clicking "Start Battle!" in the Squad Showdown lobby caused the screen to flicker continuously - alternating between the lobby and the battle screen, with the start sound replaying - on both the host's and the joining players' screens, until the browser was refreshed.

The app keeps `gameMode` and the browser URL in sync two different ways at once: a custom `setGameMode()` helper writes both together, while a separate "URL-sync" effect watches the URL and corrects `gameMode` if it ever drifts out of sync with it (needed for browser back/forward navigation). The squad-battle-start effect called `setGameMode()` the moment `squadData.isStarted` flipped true. But `navigate()`'s URL update lands one render later than the `gameMode` state update in the same call, so the URL-sync effect would see the URL still pointing at the lobby and revert `gameMode` back - which then made the squad-battle-start effect fire all over again, since `squadData.isStarted` never stops being true. That ping-pong repeated indefinitely. Fixed by having the squad-battle-start effect call `navigate()` directly instead of `setGameMode()`, so the URL-sync effect is the only thing writing `gameMode` for that transition - there's no second writer left to race against.

### Fixed: Same routing race in Battle Mode's game start

Battle Mode's Firestore listener (the one a student uses to detect the teacher starting the battle) had the identical `setGameMode()` call, and so the identical race - guarded here by a one-time "have I already started" flag, so it could only ever cause a single stray flicker rather than an infinite loop, but a real bug nonetheless. Fixed the same way, by calling `navigate()` directly.

### Fixed: Battle Mode classroom sessions could not be created

Reported by a user as "anyone should be able to start Battle Mode" after it looked like session creation required a signed-in teacher account - it didn't, and never has. The actual cause was in `firestore.rules`: the `sessions` collection's `create` rule validated the incoming document with `resource.data.teacherName` / `resource.data.code`, but `resource` refers to a document's *existing* state, which doesn't exist yet during a `create` - it should have been `request.resource.data`, exactly like the `squadBattles` rule right below it already does correctly. Every attempt to create a Battle Mode session was therefore rejected by Firestore with a `permission-denied` error, regardless of login state, since the rules file was first introduced (v3.0.1). Squad Showdown was unaffected because its rules were written correctly from the start. Fixed the `sessions` create rule to check `request.resource.data` and deployed the corrected rules to the `multiply-monsters-classroom` Firebase project.

### Technical Details

- **Files changed:** `src/App.js`, `firestore.rules`
- **New files:** `firebase.json`, `.firebaserc` (minimal config so `firestore:rules` can be deployed from this repo)
- **Unaffected:** `teacherUtils.js`, `multiplayerUtils.js`, `reportUtils.js` - no data model changes in this release

### Upgrade Notes

The Firestore rules fix was already deployed live to production ahead of this release, so no further Firebase Console steps are required.
