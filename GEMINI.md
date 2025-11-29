# Gemini Code Assist Context: Can't Stop Standalone Game

This document provides context for the "Can't Stop" standalone game project.

## Project Overview

This project is a single-file, zero-dependency implementation of the classic board game "Can't Stop" by Sid Sackson. It runs entirely in the browser.

The game is contained within `index.html`, which includes all necessary HTML, CSS, and JavaScript.

**Key Technologies:**
*   **Frontend:** Plain HTML, CSS, and JavaScript.
*   **Persistence:** `localStorage` is used to store lifetime player statistics.
*   **Dependencies:** None (Google Fonts is used but is optional).

**Architecture:**
The JavaScript code is well-structured and organized into classes:
*   `CantStopGame`: The main controller, handling UI and game flow.
*   `GameState`: Manages the current state of the game, including turns, runners, and temporary progress.
*   `Board`: Represents the game board, tracking player positions and claimed columns.
*   `AIOpponent`: Contains the logic for the computer opponent at three difficulty levels.
*   `Probability`: A module for calculating bust probabilities and generating hints.
*   `DiceRoller`: Handles dice rolling and combination generation.
*   `Storage`: Manages reading from and writing to `localStorage`.

## Building and Running

*   **Running the game:** Open the `index.html` file in any modern web browser.
*   **Building:** There is no build process.

## Development Conventions

*   **Single-File Structure:** All code is contained within `index.html`.
*   **Styling:** The CSS uses modern features like `var()` custom properties for theming and is structured to be readable and maintainable.
*   **No Dependencies:** Changes should not introduce external libraries or dependencies.
*   **Game Rules:** The implementation includes specific "house rules":
    *   **Jump Variant:** When advancing, a player's marker will jump over an opponent's marker if it lands on the same space.
    *   **Claim and Clear:** When a player claims a column, the opponent's progress in that column is removed.
    *   **2-Player Long Game:** The game is set for two players (one human, one AI), and the goal is to claim 5 columns to win.
*   **User Preferences:** The user prefers a quick start to the game. Do not add features like player name input or an explicit "Start Game" button that would slow down the process of starting a new game.
