# Multiplication Trainer v4.0.3

**Release Date:** July 26, 2026

## Bug Fixes

A patch release fixing a reported Squad Showdown restart bug, plus the same class of bug in Battle Mode.

### Fixed: Squad Showdown didn't refresh the game when a new battle started

Reported behavior: when a Squad Showdown battle finished, the player who created the game (and anyone who stayed connected) would see the *previous* battle's stats instead of a fresh start when a new one began. The join-code input field also kept whatever code was last typed into it, even though a new game always requires a new code.

Root cause: `timeLeft` and `gameActive` were never reset once a battle ended - `timeLeft` in particular was left sitting at `0`. The "Auto-start squad battle" effect that initializes a new round guards itself with `if (timeLeft !== 0)`, a check meant only to stop the timer from re-triggering itself after it naturally counts down to zero. With `timeLeft` still `0` from the previous battle, that same guard silently blocked the *next* battle from initializing too - the screen just kept showing the old score and timer. Neither the "Play Another Battle" button nor `handleReturnToMenu` cleared this (or several other) piece of squad state, and nothing cleared the join-code field either.

Fixed by introducing a single `resetSquadBattleState()` helper that clears every piece of squad state (code, roster, score, streak, timer, lives, elimination flag, join-code input) and unsubscribes the Firestore listener, wired into all three exit points: "Play Another Battle," `handleReturnToMenu`, and the lobby's "Leave Battle."

### Fixed: Battle Mode's "New Battle" restart could leave a connected student stuck

Battle Mode's "New Battle" button intentionally reuses the same classroom session code (so students don't have to re-enter it), but the student-side listener that detects the teacher starting a battle used a boolean latch (`hasStartedSession`) that, once tripped by round 1, never reset. When a teacher started round 2 on the same session, any student who was still viewing round 1's results screen never received the signal to move on - they were permanently stuck there while the teacher and any freshly-rejoining students proceeded without them. Round restarts also didn't reset student scores or streaks, so if a student did rejoin, their tally could start pre-populated with a previous round's numbers.

Fixed by replacing the boolean latch with a ref that tracks the last `startedAt` timestamp that already triggered an auto-start, so each new (distinct) restart timestamp fires the listener again - while unrelated Firestore updates carrying the same `startedAt` (e.g., another student joining) correctly do not. When a restart is detected, the student's local score, streak, timer, and feedback are reset before the new round begins. `startSession()` (`multiplayerUtils.js`) now also resets every connected student's score/streak to zero server-side, since a restart reuses the same session document rather than creating a new one. The teacher's "New Battle" button resets local round state the same way, while deliberately leaving the session code/roster intact.

### Technical Details

- **Files changed:** `src/App.js`, `src/multiplayerUtils.js`
- **Unaffected:** `firestore.rules`, `teacherUtils.js`, `reportUtils.js` - no rules or data-model shape changes in this release

### Upgrade Notes

No Firebase Console or Firestore rules changes required for this release.
