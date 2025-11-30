# Gemini Code Assist Context: Can't Stop Standalone Game

This document provides context for the "Can't Stop" standalone game project.

## Project Overview

This project is a standalone, zero-dependency implementation of the classic board game "Can't Stop" by Sid Sackson. It runs entirely in the browser from the `public` directory.

The game is contained within `public/index.html`, which loads a stylesheet and multiple JavaScript files.

**Key Technologies:**
*   **Frontend:** Plain HTML, CSS, and JavaScript.
*   **Persistence:** `localStorage` is used to store lifetime player statistics.
*   **Dependencies:** 
    *   `canvas-confetti` is used for the win animation.
    *   Google Fonts (`Poppins`) is used for the UI.

**Architecture:**
The project is structured with separated files for HTML, CSS, and JavaScript. The JavaScript code is well-structured and organized into classes:
*   `CantStopGame` (`game.js`): The main controller, handling UI and game flow.
*   `GameState` (`game-state.js`): Manages the current state of the game, including turns, runners, and temporary progress.
*   `Board` (`board.js`): Represents the game board, tracking player positions and claimed columns.
*   `AIOpponent` (`ai-opponent.js`): Contains the logic for the computer opponent at three difficulty levels.
*   `Probability` (`probability.js`): A module for calculating bust probabilities and generating hints.
*   `DiceRoller` (`dice-roller.js`): Handles dice rolling and combination generation.
*   `Storage` (`storage.js`): Manages reading from and writing to `localStorage`.
*   `constants.js`: Contains shared game constants.
*   `main.js`: Initializes the game on DOMContentLoaded.

## Building and Running

*   **Running the game:** Open the `public/index.html` file in any modern web browser.
*   **Building:** There is no build process.

## Development Conventions

*   **Multi-File Structure:** All code is organized into separate files for HTML, CSS, and JavaScript modules within the `public` directory.
*   **Styling:** The CSS in `styles.css` uses modern features like `var()` custom properties for theming and is structured to be readable and maintainable.
*   **No Dependencies (Build-time):** Changes should not introduce external libraries or dependencies that require a build step.
*   **Game Rules:** The implementation includes specific "house rules":
    *   **Jump Variant:** When advancing, a player's marker will jump over an opponent's marker if it lands on the same space.
    *   **Claim and Clear:** When a player claims a column, the opponent's progress in that column is removed.
    *   **2-Player Long Game:** The game is set for two players (one human, one AI), and the goal is to claim 5 columns to win.
*   **User Preferences:** The user prefers a quick start to the game. The current implementation includes a start screen for difficulty selection.