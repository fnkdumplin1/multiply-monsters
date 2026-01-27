# Multiplication Trainer v3.4.0

**Release Date:** January 27, 2026

## Division Support

This release adds division across the entire game, both as a standalone practice mode and as a toggle that mixes division into existing game modes.

### New Solo Adventures Mode: Division

A new **Division** card in Solo Adventures provides unlimited division practice. Questions are the inverse of multiplication facts (e.g., 56 / 7 = 8) with clean integer answers only -- no remainders. All division questions are rendered in classic long division bracket notation.

### Include Division Toggle

A new **Include Division** toggle is available on:
- **Timed Challenges** (Monster Race and Boss Battle)
- **Battle Mode** (teacher-led classroom sessions)
- **Squad Showdown** (student-led peer battles)

When enabled, multiplication and division questions are randomly intermixed at a 50/50 ratio. When disabled, behavior is identical to v3.3.1. The toggle defaults to OFF, preserving all existing behavior.

### Long Division Bracket Format

Division questions are displayed in a classic textbook long division layout:

```
      [?]
      ____
  7  ) 56
```

- SVG-drawn bracket curve connecting the divisor to the vinculum
- CSS Grid layout for precise alignment of divisor, dividend, and quotient
- Quotient answer input centered directly above the dividend
- Styling matches multiplication question appearance (font size, weight, color)
- Responsive scaling at 768px and 480px breakpoints

### Multiplayer Division Support

The `includeDivision` setting is persisted in Firebase for both classroom sessions and squad battles:
- Teachers and squad hosts set the toggle before starting
- All players in the session receive mixed questions when enabled
- Toggle state is displayed in lobby screens

### Technical Details

- **Files modified:** `App.js`, `App.css`, `multiplayerUtils.js`
- **New state:** `includeDivision` (boolean, defaults to `false`)
- **New functions:** `generateDivisionQuestion()`, `getCorrectAnswer()`, `getQuestionDisplay()`, `startDivision()`
- **New route:** `/division`
- **Firebase schema:** Added `includeDivision` field to `sessions` and `squadBattles` collections
- **Layout:** CSS Grid (`inline-grid`, 3 columns x 2 rows) for long division rendering
- **Answer validation:** Updated in `submitAnswer()`, `handleSquadSubmitAnswer()`, and `handleSurvivalSubmitAnswer()`

### Upgrade Notes

This version maintains full backward compatibility with v3.3.1. The division toggle defaults to OFF, so all existing game modes behave identically unless the toggle is explicitly enabled. No migration is required for existing Firebase sessions.
