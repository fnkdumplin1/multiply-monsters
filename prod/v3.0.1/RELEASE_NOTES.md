# Multiplication Trainer v3.0.1

**Release Date:** November 4, 2025

## 🎯 Monster Detective Mode Improvements

This release focuses on enhancing the Monster Detective Mode with better randomization, expanded educational scope, and improved user experience.

### ✨ New Features

#### Enhanced Randomization
- **Crypto-secure random generation** - Uses `crypto.getRandomValues` for true randomness
- **Dynamic product generation** - 169 possible combinations (up from only 11 fixed products)
- **Better distribution** - All numbers 0-12 have equal probability of appearing

#### Zero Property Education
- **Expanded range to 0-12** - Previously only covered 1-12
- **Special zero logic** - When asking "0 × ? = 0", accepts ANY number 0-12 as correct
- **Educational hints** - Clear messaging when products involve zero

#### Improved Learning Experience
- **Manual dismiss for wrong answers** - Users control when to advance to next question
- **"Next Question" button** - Appears after wrong answers, allowing time to study correct answers
- **Auto-advance for correct answers** - Keeps the flow smooth (1.5s delay)

### 🐛 Bug Fixes

- Fixed input validation to properly accept 0 as a valid factor
- Fixed HTML input constraints (min changed from 1 to 0)
- Fixed answer checking to handle zero multiplication correctly
- Fixed feedback display for all answer types

### 📊 Technical Improvements

- Improved random factor generation with better entropy
- Enhanced factor range variety (0-8 start, 2-6 number ranges)
- Added special case handling for zero multiplication
- Updated input validation from `< 1` to `< 0`

### 📦 Files Included

- Optimized production build (157.64 kB main bundle)
- All static assets (images, sounds, PDFs)
- Service worker for offline functionality
- Updated manifest and metadata

### 🔄 Upgrade Notes

This version maintains full backward compatibility with v3.0.0. No database migrations or configuration changes required.

---

For more information, see the version history screen in the app or visit the changelog.
