# Can't Stop - Standalone Web Game

A browser-based implementation of the classic push-your-luck dice game "Can't Stop" that runs entirely in your browser with no backend required.

> **Note:** This project was primarily generated using AI as an exercise in AI-assisted development.

## How to Play

1. **Open `public/index.html`** in any modern web browser
2. Select AI difficulty to start playing immediately

## Game Rules

- Roll 4 dice and pair them into two sums (2-12)
- Advance runners on matching columns
- You can have at most 3 active runners per turn
- **Stop** to bank your progress, or **push your luck** and roll again!
- If you can't make a valid move, you **bust** and lose all progress this turn
- First to claim **5 columns** wins!

## Features

- 🎲 **3 AI Difficulty Levels**: Easy, Medium, Hard
- 💡 **Hints**: Press H or click the hint button for strategic advice
- 📊 **Probability Display**: See your bust probability before deciding
- 💾 **Persistent Stats**: Your game history is saved in localStorage
- 📱 **Responsive Design**: Works on desktop and mobile
- ⌨️ **Keyboard Shortcuts**:
  - `H` - Toggle hint panel
  - `Space` - Roll dice (when available)
  - `1-3` - Quick select combination

## Technical Details

- **Pure HTML/CSS/JavaScript** with modular JS files
- **External dependencies**: Google Fonts (optional) and canvas-confetti for win celebration
- **localStorage** for statistics persistence
- **Full probability calculations** for accurate bust percentages

## Credits

Based on the board game "Can't Stop" by Sid Sackson (1980).
