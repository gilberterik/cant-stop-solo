/* ============ MAIN GAME CLASS ============ */
class CantStopGame {
    constructor() {
        this.state = null;
        this.aiOpponent = null;
        this.currentDice = null;
        this.currentCombos = null;
        this.currentValid = null;
        this.isAiTurn = false;
        this.gameStats = { humanBusts: 0, aiBusts: 0, humanRolls: 0, aiRolls: 0 };
        
        this.initElements();
        this.bindEvents();
        this.updateLifetimeStats();
    }
    
    initElements() {
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.difficultyBtns = document.querySelectorAll('.diff-btn');
        this.humanName = document.getElementById('human-name');
        this.humanPips = document.getElementById('human-pips');
        this.aiPips = document.getElementById('ai-pips');
        this.turnNumber = document.getElementById('turn-number');
        this.rollNumber = document.getElementById('roll-number');
        this.gameBoard = document.getElementById('game-board');
        this.diceContainer = document.getElementById('dice-container');
        this.dice = [0,1,2,3].map(i => document.getElementById(`die-${i}`));
        this.comboChoices = document.getElementById('combo-choices');
        this.comboButtons = document.getElementById('combo-buttons');
        this.continueDecision = document.getElementById('continue-decision');
        this.pendingClaims = document.getElementById('pending-claims');
        this.bustProbability = document.getElementById('bust-probability');
        this.rollPrompt = document.getElementById('roll-prompt');
        this.rollBtn = document.getElementById('roll-btn');
        this.rollAgainBtn = document.getElementById('roll-again-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.messageDisplay = document.getElementById('message-display');
        this.hintBtn = document.getElementById('hint-btn');
        this.hintPanel = document.getElementById('hint-panel');
        this.hintContent = document.getElementById('hint-content');
        this.closeHintBtn = document.querySelector('.close-hint');
        this.winnerAnnouncement = document.getElementById('winner-announcement');
        this.finalStats = document.getElementById('final-stats');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.lifetimeStats = document.getElementById('lifetime-stats');
    }
    
    bindEvents() {
        // Difficulty buttons now start the game directly
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => this.startGame(btn.dataset.difficulty));
        });
        this.rollBtn.addEventListener('click', () => this.rollDice());
        this.rollAgainBtn.addEventListener('click', () => this.rollDice());
        this.stopBtn.addEventListener('click', () => this.stopTurn());
        this.hintBtn.addEventListener('click', () => this.toggleHint());
        this.closeHintBtn.addEventListener('click', () => this.hideHint());
        this.playAgainBtn.addEventListener('click', () => this.showScreen('start'));
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    handleKeyboard(e) {
        if (!this.gameScreen.classList.contains('active') || this.isAiTurn) return;
        if (e.key === 'h' || e.key === 'H') this.toggleHint();
        else if (e.key === ' ' && !this.rollPrompt.classList.contains('hidden')) {
            e.preventDefault();
            this.rollDice();
        }
        else if (e.key >= '1' && e.key <= '3') {
            const idx = parseInt(e.key) - 1;
            const btns = this.comboButtons.querySelectorAll('.combo-btn:not(:disabled)');
            if (idx < btns.length) btns[idx].click();
        }
    }
    
    showScreen(screen) {
        this.startScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');
        if (screen === 'start') { this.startScreen.classList.add('active'); this.updateLifetimeStats(); }
        else if (screen === 'game') this.gameScreen.classList.add('active');
        else if (screen === 'gameover') this.gameOverScreen.classList.add('active');
    }
    
    updateLifetimeStats() {
        const stats = Storage.getStats();
        const winRate = stats.gamesPlayed > 0 ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(0) : 0;

        this.lifetimeStats.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">🏆 Wins / Played</div>
                <div class="stat-value">${stats.wins} / ${stats.gamesPlayed}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">📈 Win Rate</div>
                <div class="stat-value">${winRate}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">🔥 Current Streak</div>
                <div class="stat-value">${stats.winStreak}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">🚀 Best Streak</div>
                <div class="stat-value">${stats.bestStreak}</div>
            </div>
        `;
    }
    
    startGame(difficulty) {
        this.state = new GameState('Player');
        this.aiOpponent = new AIOpponent(difficulty);
        this.gameStats = { humanBusts: 0, aiBusts: 0, humanRolls: 0, aiRolls: 0 };
        
        this.humanName.textContent = 'Player';
        
        // Reset all pips to unfilled state
        this.humanPips.querySelectorAll('.pip').forEach(pip => pip.classList.remove('filled'));
        this.aiPips.querySelectorAll('.pip').forEach(pip => pip.classList.remove('filled'));
        
        this.showScreen('game');
        this.renderBoard();
        this.updateUI();
        this.hideAllActions();
        // Auto-roll on first turn
        this.rollDice();
    }
    
    async rollDice() {
        if (this.isAiTurn) return; // Prevent human clicking during AI turn
        await this._doRoll();
    }
    
    async _doRoll() {
        this.hideAllActions();
        this.diceContainer.classList.remove('hidden');
        
        // Rolling animation
        this.dice.forEach(die => { die.textContent = '?'; die.classList.add('rolling'); });
        
        await this.sleep(400);
        
        const dice = DiceRoller.roll();
        const combos = DiceRoller.getCombinations(dice);
        const valid = combos.map(combo => this.state.canMakeMove(combo));
        
        this.currentDice = dice;
        this.currentCombos = combos;
        this.currentValid = valid;
        
        this.dice.forEach((die, i) => { die.classList.remove('rolling'); die.textContent = dice[i]; });
        
        const isBust = !valid.some(v => v);
        
        if (isBust) {
            this.showMessage('💥 BUST! No valid moves available.', 'bust');
            if (!this.state.currentPlayer.isAi) this.gameStats.humanBusts++;
            else this.gameStats.aiBusts++;
            
            this.state.bust();
            this.renderBoard();
            this.updateUI();
            
            await this.sleep(1500);
            
            // Only handle turn transition if NOT in AI turn (AI handles its own)
            if (!this.isAiTurn) {
                const winner = this.state.checkWinner();
                if (winner) {
                    this.showGameOver(winner);
                } else {
                    this.state.nextTurn();
                    this.state.startTurn();
                    this.updateUI();
                    this.checkAiTurn();
                }
            }
        } else {
            if (!this.state.currentPlayer.isAi) this.gameStats.humanRolls++;
            else this.gameStats.aiRolls++;
            if (!this.isAiTurn) {
                this.showComboChoices();
            }
        }
    }
    
    showComboChoices() {
        this.comboButtons.innerHTML = '';
        
        const choices = [];

        this.currentCombos.forEach((combo, idx) => {
            if (!this.currentValid[idx]) return;

            const [col1, col2] = combo;
            const c1Ok = this.state.canPlaceRunner(col1);
            const c2Ok = this.state.canPlaceRunner(col2);
            const hasTwo = this.state.activeRunners.size === 2;
            const c1New = !this.state.activeRunners.has(col1);
            const c2New = !this.state.activeRunners.has(col2);

            // Special case: Player has 2 runners and can start a 3rd on one of two new columns.
            // Instead of a second question, we present these as two separate primary choices.
            if (col1 !== col2 && hasTwo && c1New && c2New && c1Ok && c2Ok) {
                choices.push({ type: 'single', col: col1, originalCombo: combo });
                choices.push({ type: 'single', col: col2, originalCombo: combo });
                return; // Skip the combined combo button
            }

            const advanceable = [];
            if (c1Ok) advanceable.push(col1);
            if (c2Ok && col1 !== col2) advanceable.push(col2);
            
            if (advanceable.length > 0) {
                 choices.push({ type: 'combo', combo, idx, advanceable });
            }
        });

        // If there's only one choice and it's a standard combo, auto-select it.
        if (choices.length === 1 && choices[0].type === 'combo') {
            const combo = this.currentCombos[choices[0].idx];
            this.state.applyCombination(combo);
            this.renderBoard();
            this.updateUI();
            this.showContinueDecision();
            return;
        }

        // Create buttons for all generated choices
        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'combo-btn';

            if (choice.type === 'single') {
                btn.innerHTML = `<span class="combo-cols">Start runner on ${choice.col}</span><span class="combo-info">New 3rd runner</span>`;
                btn.dataset.advanceable = JSON.stringify([choice.col]);
                btn.dataset.combo = JSON.stringify(choice.originalCombo); // For preview calculation
                btn.addEventListener('click', () => this.selectThirdRunner(choice.col));
            } else { // 'combo'
                const { combo, idx, advanceable } = choice;
                const displayCols = advanceable.length === 2 ? `${combo[0]} + ${combo[1]}` : 
                                   (combo[0] === combo[1] ? `${combo[0]} + ${combo[1]}` : `${advanceable[0]} only`);
                
                let willClaim = false;
                for (const col of advanceable) {
                    const temp = this.state.tempProgress.get(col) || 0;
                    const steps = (combo[0] === combo[1] && combo[0] === col) ? 2 : 1;
                    if (this.calcEffectivePos(this.state.currentPlayer.id, col, temp + steps) >= COLUMN_HEIGHTS[col]) {
                        willClaim = true;
                        break;
                    }
                }
                const info = willClaim ? '🏆 Claim!' : '';

                btn.innerHTML = `<span class="combo-cols">${displayCols}</span><span class="combo-info">${info}</span>`;
                btn.dataset.advanceable = JSON.stringify(advanceable);
                btn.dataset.combo = JSON.stringify(combo);
                btn.addEventListener('click', () => this.chooseCombo(idx));
            }

            btn.addEventListener('mouseenter', (e) => this.showMovePreview(e.currentTarget));
            btn.addEventListener('mouseleave', () => this.clearMovePreview());
            this.comboButtons.appendChild(btn);
        });

        if (choices.length > 0) {
            this.comboChoices.classList.remove('hidden');
        }
    }
    
    showMovePreview(button) {
        this.clearMovePreview();
        const combo = JSON.parse(button.dataset.combo);
        const advanceable = JSON.parse(button.dataset.advanceable);
        const playerId = this.state.currentPlayer.id;
        for (const col of advanceable) {
            const tempProgress = this.state.tempProgress.get(col) || 0;
            const steps = (combo[0] === combo[1] && combo[0] === col) ? 2 : 1;
            const previewPos = this.calcEffectivePos(playerId, col, tempProgress + steps);
            const colEl = this.gameBoard.children[col - 2];
            if (colEl && previewPos > 0) {
                const height = COLUMN_HEIGHTS[col];
                const maxHeight = 13;
                const startRow = Math.floor((maxHeight - height) / 2);
                const cellIndex = 1 + startRow + (previewPos - 1);
                if (colEl.children[cellIndex]) {
                    colEl.children[cellIndex].classList.add('preview');
                }
            }
        }
    }
    clearMovePreview() {
        const previews = this.gameBoard.querySelectorAll('.preview');
        previews.forEach(el => el.classList.remove('preview'));
    }
    chooseCombo(index) {
        // Prevent duplicate clicks
        if (this.comboChoices.classList.contains('hidden')) return;
        this.comboChoices.classList.add('hidden');
        
        this.clearMovePreview();
        const combo = this.currentCombos[index];
        this.state.applyCombination(combo);
        this.renderBoard();
        this.updateUI();
        this.showContinueDecision();
    }
    
    selectThirdRunner(col) {
        // Prevent duplicate clicks
        if (this.comboChoices.classList.contains('hidden')) return;
        this.comboChoices.classList.add('hidden');
        
        this.clearMovePreview();
        this.state.advanceRunner(col);
        this.state.rollsThisTurn++;
        this.renderBoard();
        this.updateUI();
        this.showContinueDecision();
    }
    
    getBustProbability() {
        if (this.state.activeRunners.size >= 3) {
            return Probability.calculateBustProbability(this.state.activeRunners);
        }
        const usable = new Set();
        for (let c = 2; c <= 12; c++) {
            if (this.state.canPlaceRunner(c)) usable.add(c);
        }
        return Probability.calculateBustProbability(usable);
    }
    
    getPendingClaims() {
        const pending = [];
        const playerId = this.state.currentPlayer.id;
        
        for (const col of this.state.activeRunners) {
            const temp = this.state.tempProgress.get(col) || 0;
            const effectivePos = this.calcEffectivePos(playerId, col, temp);
            
            if (effectivePos >= COLUMN_HEIGHTS[col]) pending.push(col);
        }
        return pending;
    }
    
    showContinueDecision() {
        this.hideAllActions();
        this.diceContainer.classList.remove('hidden');
        
        const pending = this.getPendingClaims();
        if (pending.length) {
            this.pendingClaims.textContent = `🏆 Column${pending.length > 1 ? 's' : ''} ${pending.join(', ')} will be claimed!`;
        } else {
            this.pendingClaims.textContent = '';
        }
        
        const bustProb = this.getBustProbability();
        const bustPct = Math.round(bustProb * 100);
        this.bustProbability.textContent = `Bust probability: ${bustPct}%`;
        this.bustProbability.className = 'bust-probability';
        if (bustPct >= 40) this.bustProbability.classList.add('high');
        else if (bustPct >= 20) this.bustProbability.classList.add('medium');
        else this.bustProbability.classList.add('low');
        
        this.continueDecision.classList.remove('hidden');
    }
    
    async stopTurn() {
        const claimed = this.state.commitProgress();
        this.renderBoard();
        
        // Animate claimed columns
        if (claimed.length > 0) {
            claimed.forEach(col => {
                const colEl = this.gameBoard.children[col - 2];
                if (colEl) {
                    colEl.classList.add('claiming');
                    setTimeout(() => colEl.classList.remove('claiming'), 800);
                }
            });
        }

        this.updateUI();
        
        const winner = this.state.checkWinner();
        if (winner) {
            this.showGameOver(winner);
        } else {
            this.showMessage('Progress saved!', 'success');
            await this.sleep(500);
            this.state.nextTurn();
            this.state.startTurn();
            this.updateUI();
            this.checkAiTurn();
        }
    }
    
    async checkAiTurn() {
        if (this.state.currentPlayer.isAi) {
            this.isAiTurn = true;
            this.gameScreen.classList.add('ai-turn');
            await this.playAiTurn();
            this.gameScreen.classList.remove('ai-turn');
            this.isAiTurn = false;
            // After AI finishes, check if it's now human's turn
            if (!this.state.currentPlayer.isAi) {
                this.showMessage('Your turn!', 'success');
                this.hideAllActions();
                this.rollDice();
            }
        } else {
            this.showMessage('Your turn - roll the dice!', '');
            this.hideAllActions();
            // Auto-roll when it's the only option
            this.rollDice();
        }
    }
    
    async playAiTurn() {
        this.hideAllActions();
        this.showMessage('🤖 Computer is thinking...', '');
        await this.sleep(800);
        
        while (true) {
            // AI rolls dice (bypasses the isAiTurn check)
            await this._doRoll();
            
            // Check if busted
            if (!this.currentValid || !this.currentValid.some(v => v)) {
                // Handle turn transition after bust
                const winner = this.state.checkWinner();
                if (winner) {
                    this.showGameOver(winner);
                }
                this.state.nextTurn();
                this.state.startTurn();
                this.updateUI();
                return; // Return to checkAiTurn which will handle next turn
            }
            
            await this.sleep(600);
            
            // Choose combination
            const comboIdx = this.aiOpponent.chooseCombination(this, this.currentCombos);
            const combo = this.currentCombos[comboIdx];
            
            // Handle 3rd runner
            const hasTwo = this.state.activeRunners.size === 2;
            const [c1, c2] = combo;
            const c1New = !this.state.activeRunners.has(c1);
            const c2New = !this.state.activeRunners.has(c2);
            const c1Ok = this.state.canPlaceRunner(c1);
            const c2Ok = this.state.canPlaceRunner(c2);
            
            if (c1 !== c2 && hasTwo && c1New && c2New && c1Ok && c2Ok) {
                const prob1 = this.aiOpponent.columnProbScore(c1);
                const prob2 = this.aiOpponent.columnProbScore(c2);
                const chosen = prob1 >= prob2 ? c1 : c2;
                this.state.advanceRunner(chosen);
                this.state.rollsThisTurn++;
            } else {
                this.state.applyCombination(combo);
            }
            
            this.renderBoard();
            this.updateUI();
            
            await this.sleep(600);
            
            // Decide continue or stop
            if (this.aiOpponent.shouldContinue(this)) {
                this.showMessage('🤖 Computer continues...', '');
            } else {
                const claimed = this.state.commitProgress();
                this.renderBoard();
                this.updateUI();
                
                const winner = this.state.checkWinner();
                if (winner) {
                    this.showGameOver(winner);
                    return;
                }
                
                this.showMessage('🤖 Computer stopped', 'success');
                await this.sleep(1000);
                
                this.state.nextTurn();
                this.state.startTurn();
                this.updateUI();
                return; // Return to checkAiTurn which will handle next turn
            }
        }
    }
    
    hideAllActions() {
        this.diceContainer.classList.add('hidden');
        this.comboChoices.classList.add('hidden');
        this.continueDecision.classList.add('hidden');
        this.rollPrompt.classList.add('hidden');
    }
    
    // Calculate effective position accounting for jumps over opponent
    calcEffectivePos(playerId, col, tempSteps) {
        const board = this.state.board;
        const oppId = playerId === 'human' ? 'ai' : 'human';
        const startPos = board.getPosition(playerId, col);
        const oppPos = board.getPosition(oppId, col);
        const height = COLUMN_HEIGHTS[col];
        
        let pos = startPos;
        for (let i = 0; i < tempSteps; i++) {
            pos++;
            if (pos > height) { pos = height; break; }
            // Jump over opponent if landing on them
            while (pos === oppPos && pos < height) pos++;
        }
        return Math.min(pos, height);
    }
    
    renderBoard() {
        const board = this.state.board;
        this.gameBoard.innerHTML = '';
        const maxHeight = 13;
        
        for (let col = 2; col <= 12; col++) {
            const colEl = document.createElement('div');
            colEl.className = 'board-column';
            
            const numEl = document.createElement('div');
            numEl.className = 'column-number';
            numEl.textContent = col;
            colEl.appendChild(numEl);
            
            const height = COLUMN_HEIGHTS[col];
            const startRow = Math.floor((maxHeight - height) / 2);
            
            for (let i = 0; i < startRow; i++) {
                const spacer = document.createElement('div');
                spacer.className = 'board-cell';
                spacer.style.visibility = 'hidden';
                colEl.appendChild(spacer);
            }
            
            const humanPos = board.getPosition('human', col);
            const aiPos = board.getPosition('ai', col);
            const claimedBy = board.claimedBy.get(col);
            const isRunner = this.state.activeRunners.has(col);
            const tempProgress = this.state.tempProgress.get(col) || 0;
            const currentPlayerId = this.state.currentPlayer.id;
            const currentPos = board.getPosition(currentPlayerId, col);
            
            // Calculate effective runner position with jumps
            const effectiveRunnerPos = isRunner 
                ? this.calcEffectivePos(currentPlayerId, col, tempProgress)
                : currentPos;
            
            for (let row = 0; row < height; row++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                
                if (claimedBy) {
                    cell.classList.add(claimedBy);
                    if (row === height - 1) cell.classList.add('claimed');
                } else {
                    const isRunnerHead = isRunner && effectiveRunnerPos > 0 && row === effectiveRunnerPos - 1;
                    const isRunnerTrail = isRunner && row >= currentPos && row < effectiveRunnerPos;
                    const isHumanPermanent = row < humanPos;
                    const isAiPermanent = row < aiPos;

                    if (isRunnerHead) {
                        cell.classList.add('runner');
                    } else {
                        // Set base color. When both players have passed a cell,
                        // color it for the trailing player.
                        if (isHumanPermanent && isAiPermanent) {
                            cell.classList.add(humanPos < aiPos ? 'human' : 'ai');
                        } else if (isHumanPermanent) {
                            cell.classList.add('human');
                        } else if (isAiPermanent) {
                            cell.classList.add('ai');
                        } else if (row === height - 1) {
                            cell.classList.add('finish');
                        } else {
                            cell.classList.add('empty');
                        }

                        // Overlay the trail if needed.
                        if (isRunnerTrail) {
                            cell.classList.add('runner-trail-overlay');
                        }
                    }
                }
                
                colEl.appendChild(cell);
            }
            
            this.gameBoard.appendChild(colEl);
        }
    }
    
    updateUI() {
        const human = this.state.players[0];
        const ai = this.state.players[1];
        
        // Update pip displays
        const humanPipEls = this.humanPips.querySelectorAll('.pip');
        const aiPipEls = this.aiPips.querySelectorAll('.pip');
        
        humanPipEls.forEach((pip, i) => {
            pip.classList.toggle('filled', i < human.columnsClaimed);
        });
        aiPipEls.forEach((pip, i) => {
            pip.classList.toggle('filled', i < ai.columnsClaimed);
        });
        
        this.turnNumber.textContent = `${this.state.turnNumber}`;
        this.rollNumber.textContent = `${this.state.rollsThisTurn + 1}`;
    }
    
    showMessage(msg, type) {
        this.messageDisplay.textContent = msg;
        this.messageDisplay.className = 'message-display';
        if (type) this.messageDisplay.classList.add(type);
    }
    
    toggleHint() {
        if (this.hintPanel.classList.contains('active')) {
            this.hideHint();
            return;
        }
        
        const hintType = this.continueDecision.classList.contains('hidden') ? 'combo' : 'continue';
        const hint = Probability.generateHint(this, hintType);
        this.displayHint(hint);
        this.hintPanel.classList.remove('hidden');
        this.hintPanel.classList.add('active');
    }
    
    displayHint(hint) {
        let html = `<div class="recommendation">${hint.message}</div>`;
        
        const detailsId = 'hint-details-' + Date.now();
        let detailsHtml = '';

        if (hint.factors) {
            detailsHtml += '<div class="factors">';
            hint.factors.forEach(f => detailsHtml += `<div class="factor">${f}</div>`);
            detailsHtml += '</div>';
        }
        
        if (hint.analyses) {
            detailsHtml += '<div class="analyses"><h4>Options Analysis:</h4>';
            hint.analyses.forEach((a, i) => {
                const marker = i === 0 ? '→ ' : '';
                const claim = a.would_claim?.length ? ' 🏆' : '';
                const evText = `EV=${a.expected_value.toFixed(1)}`;
                const bustText = `Bust=${Math.round(a.bust_prob_after*100)}%`;
                detailsHtml += `<div class="factor">${marker}<b>Columns ${a.combo.join(' & ')}:</b> ${evText}, ${bustText}${claim}</div>`;
            });
            detailsHtml += '</div>';
        }

        if (detailsHtml) {
            html += `<button id="toggle-${detailsId}" class="hint-details-btn">Show Details</button>`;
            html += `<div id="${detailsId}" class="hint-details hidden">${detailsHtml}</div>`;
        }
        
        this.hintContent.innerHTML = html;

        const toggleBtn = this.hintContent.querySelector(`#toggle-${detailsId}`);
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const details = this.hintContent.querySelector(`#${detailsId}`);
                const isHidden = details.classList.toggle('hidden');
                toggleBtn.textContent = isHidden ? 'Show Details' : 'Hide Details';
            });
        }
    }
    
    hideHint() {
        this.hintPanel.classList.remove('active');
        setTimeout(() => this.hintPanel.classList.add('hidden'), 300);
    }
    
    showGameOver(winner) {
        const isHumanWin = !winner.isAi;
        this.winnerAnnouncement.textContent = isHumanWin ? `🏆 ${winner.name} Wins! 🏆` : '🤖 Computer Wins!';
        
        // Save stats
        Storage.recordGameEnd(isHumanWin, this.gameStats.humanBusts, this.state.players[0].columnsClaimed);
        
        this.finalStats.innerHTML = `
            <table>
                <tr><td>Total Turns</td><td>${this.state.turnNumber}</td></tr>
                <tr><td>Your Rolls</td><td>${this.gameStats.humanRolls}</td></tr>
                <tr><td>Your Busts</td><td>${this.gameStats.humanBusts}</td></tr>
                <tr><td>AI Rolls</td><td>${this.gameStats.aiRolls}</td></tr>
                <tr><td>AI Busts</td><td>${this.gameStats.aiBusts}</td></tr>
            </table>
        `;
        
        this.showScreen('gameover');
        if (isHumanWin) {
            this.showConfetti();
        }
    }

    showConfetti() {
        var end = Date.now() + (5 * 1000);

        // go Buckeyes!
        var colors = ['#8A2BE2', '#4B0082', '#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000'];

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
    
    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}
