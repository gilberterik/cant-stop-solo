# Can't Stop - Standalone Web Game

A complete, single-file implementation of the classic push-your-luck dice game "Can't Stop" that runs entirely in your browser with no backend required.

## How to Play

1. **Open `index.html`** in any modern web browser
2. Enter your name and select AI difficulty
3. Click "Start Game"

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

- **Single HTML file** (~1500 lines) with embedded CSS and JavaScript
- **No dependencies** except Google Fonts (optional, works without)
- **localStorage** for statistics persistence
- **Full probability calculations** for accurate bust percentages

## Files

```
standalone/
├── index.html         # The complete game (just open this!)
├── README.md          # This file
└── EXECUTION_PLAN.md  # Development notes
```

## Browser Compatibility

Tested and works in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Credits

Based on the board game "Can't Stop" by Sid Sackson (1980).
