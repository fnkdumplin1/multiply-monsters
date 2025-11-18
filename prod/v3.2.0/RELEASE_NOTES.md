# Multiplication Trainer v3.2.0

**Release Date:** November 17, 2025

## 🔢 Two-Digit Multiplication Mode

This release introduces a new educational game mode focused on teaching students the traditional algorithm for two-digit multiplication through step-by-step practice.

### ✨ New Features

#### Two-Digit Multiplication Mode
- **10-question practice session** - No timer, focused on accuracy and understanding
- **Traditional vertical layout** - Numbers displayed in proper column alignment just like on paper
- **Step-by-step working space** - Students work through the problem digit-by-digit

#### Interactive Carry Digit Inputs
- **Multiplication carry inputs** - Small boxes above the multiplicand for carries during multiplication
- **Addition carry inputs** - Small boxes above partial products for carries during addition
- **Visual separation** - Different sizes help distinguish multiplication vs addition carries

#### Comprehensive Validation
- **Row-by-row checking** - Validates first partial product, second partial product, and final sum independently
- **Detailed feedback** - Shows exactly which row(s) need correction and the correct values
- **Smart progression** - Auto-advances after correct answers, gives choice after incorrect answers

#### Student-Centered Learning
- **"Try Again" option** - Students can review the correct answer and fix their work
- **"Next Question" option** - Students can move forward when ready
- **Pedagogical design** - Encourages learning from mistakes with manual control

### 🎯 Technical Improvements

- **Crypto-secure randomization** - Uses `crypto.getRandomValues` for true random number generation
- **Two-digit range** - Problems use numbers from 10-99 for age-appropriate challenge
- **Proper alignment** - Grid-based layout ensures vertical alignment of all digits
- **Responsive design** - Mobile-optimized with scaled inputs for different screen sizes

### 📊 How It Works

For a problem like 85 × 14:

1. **Multiplication carries** - Student enters carries above the problem (e.g., 4×5=20, carry the 2)
2. **First partial product** - 85 × 4 = 340 (multiply by ones digit)
3. **Second partial product** - 85 × 1 = 85, displayed as 850 (multiply by tens digit, shifted)
4. **Addition carries** - Student enters carries for adding the partial products
5. **Final sum** - 340 + 850 = 1190

### 📦 Files Included

- Optimized production build (159.22 kB main bundle, +1.59 kB from v3.0.1)
- Enhanced CSS with grid-based layouts (11.08 kB, +705 B from v3.0.1)
- All static assets (images, sounds, PDFs)
- Service worker for offline functionality
- Updated manifest and metadata

### 🔄 Upgrade Notes

This version maintains full backward compatibility with v3.0.1. All existing game modes (Training, Detective, Monster Race, Boss Battle, Classroom Battles) remain unchanged.

### 🎮 Accessing the New Mode

1. Select your name on the home screen
2. Choose "Two-Digit" from the Solo Adventures section
3. Work through 10 two-digit multiplication problems
4. Use carry digit boxes to show your work
5. Get immediate feedback on each step

---

For more information, see the version history screen in the app or visit the changelog.
