# Standalone Can't Stop - Execution Plan

## Overview
Create a single HTML file that contains all game logic, AI, probability calculations, and UI - playable by simply opening the file in a browser with no backend required.

## Architecture

### Components to Port from Python to JavaScript:

1. **Game Core** (from game/*.py)
   - `Board` class - column heights, positions, claims
   - `Player` class - player state tracking  
   - `GameState` class - turn management, runners, temp progress
   - `DiceRoller` - dice rolling and combination generation

2. **Probability Engine** (from game/probability.py)
   - Two-dice probability calculations
   - Bust probability calculation (iterates 1296 outcomes)
   - Cached bust probabilities for performance
   - Hint generation with expected value calculations

3. **AI Opponent** (from ai/opponent.py)
   - Three difficulty levels: easy, medium, hard
   - Combination selection logic
   - Continue/stop decision making

4. **Storage Layer** (NEW - replaces Flask sessions)
   - localStorage for game state persistence
   - Statistics tracking across sessions
   - Save/load game functionality

### File Structure
```
standalone/
├── EXECUTION_PLAN.md     (this file)
├── index.html            (single-file game with embedded CSS/JS)
└── README.md             (usage instructions)
```

## Implementation Steps

### Step 1: Create HTML Structure
- Port the HTML from web/templates/index.html
- Add statistics display section
- Add save/load UI elements

### Step 2: Embed CSS
- Port styles from web/static/css/style.css
- Minor adjustments for standalone context

### Step 3: Implement JavaScript Game Engine

#### 3.1 Constants and Utilities
- Column heights (2-12)
- Two-dice probability tables
- Dice face values

#### 3.2 Board Class
```javascript
class Board {
  - columns: Map<number, Column>
  - isColumnAvailable(col)
  - getClaimedColumns(playerId)
  - advancePosition(playerId, col, spaces)
}
```

#### 3.3 GameState Class
```javascript
class GameState {
  - board, players, currentPlayerIdx
  - activeRunners, tempProgress
  - turnNumber, rollsThisTurn
  - canPlaceRunner(col)
  - canMakeMove(combo)
  - applyCombination(combo)
  - commitProgress()
  - bust()
}
```

#### 3.4 Probability Module
```javascript
const Probability = {
  - TWO_DICE_WAYS, TWO_DICE_PROB
  - calculateBustProbability(activeColumns)
  - getBustProbabilityCached(columns)
  - analyzeRollOptions(dice, runners, ...)
  - generateHint(gameState, dice, action)
}
```

#### 3.5 AI Opponent
```javascript
class AIOpponent {
  - difficulty: 'easy' | 'medium' | 'hard'
  - chooseCombination(game, combos)
  - shouldContinue(game)
}
```

#### 3.6 Game Controller
```javascript
class CantStopGame {
  - Manages game flow
  - Handles UI updates
  - Coordinates AI turns
  - Manages localStorage
}
```

### Step 4: localStorage Integration
- Save game state after each action
- Load game on page open
- Track statistics:
  - Games played/won/lost
  - Total busts
  - Columns claimed
  - Win streak

### Step 5: Testing
- Test all difficulty levels
- Test save/load functionality
- Test edge cases (3 runners, bust scenarios)
- Test on different browsers

## Size Estimate
- HTML: ~200 lines
- CSS: ~800 lines  
- JavaScript: ~1200 lines
- **Total: ~2200 lines in single file**

## Features
- [x] Full game logic
- [x] 3 AI difficulty levels
- [x] Probability hints
- [x] Bust probability display
- [x] Animated dice rolling
- [x] localStorage persistence
- [x] Statistics tracking
- [x] Responsive design
- [x] Keyboard shortcuts

## Usage
Simply open `index.html` in any modern browser - no server required!
