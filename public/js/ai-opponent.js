/* ============ AI OPPONENT ============ */
class AIOpponent {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
    }
    
    columnProbScore(col) {
        return TWO_DICE_WAYS[col] || 0;
    }
    
    chooseCombination(game, combos) {
        const validCombos = combos
            .map((combo, idx) => ({combo, idx}))
            .filter(({combo}) => game.state.canMakeMove(combo));
        
        if (validCombos.length === 0) return 0;
        if (this.difficulty === 'easy') {
            return validCombos[Math.floor(Math.random() * validCombos.length)].idx;
        }
        
        const scores = validCombos.map(({combo, idx}) => {
            const [col1, col2] = combo;
            let score = 0;
            
            if (game.state.activeRunners.has(col1)) score += 15;
            if (game.state.activeRunners.has(col2)) score += 15;
            
            score += this.columnProbScore(col1) + this.columnProbScore(col2);
            
            if (col1 === col2) score += 5;
            
            // Check for near-completion
            for (const col of [col1, col2]) {
                const pos = game.state.board.getPosition('ai', col);
                const temp = game.state.tempProgress.get(col) || 0;
                if (pos + temp + 1 >= COLUMN_HEIGHTS[col]) score += 40;
            }
            
            if (this.difficulty === 'hard') {
                // Calculate bust probability
                const newRunners = new Set(game.state.activeRunners);
                if (game.state.canPlaceRunner(col1)) newRunners.add(col1);
                if (game.state.canPlaceRunner(col2)) newRunners.add(col2);
                
                let usable;
                if (newRunners.size >= 3) {
                    usable = newRunners;
                } else {
                    usable = new Set();
                    for (let c = 2; c <= 12; c++) {
                        if (game.state.canPlaceRunner(c) || newRunners.has(c)) usable.add(c);
                    }
                }
                const bustProb = Probability.calculateBustProbability(usable);
                score += (1 - bustProb) * 30;
            }
            
            return {idx, score};
        });
        
        scores.sort((a, b) => b.score - a.score);
        
        // Add slight randomness for medium
        if (this.difficulty === 'medium' && scores.length > 1 && Math.random() < 0.3) {
            return scores[1].idx;
        }
        
        return scores[0].idx;
    }
    
    shouldContinue(game) {
        if (game.state.rollsThisTurn === 0) return true;
        
        const numRunners = game.state.activeRunners.size;
        
        // Check if stopping would claim columns (use proper jump calculation)
        let wouldClaim = game.getPendingClaims().length;
        
        // If claiming would win, stop!
        if (game.state.players[1].columnsClaimed + wouldClaim >= COLUMNS_TO_WIN) {
            return false;
        }
        
        // If would claim any column, usually stop
        if (wouldClaim > 0) {
            return Math.random() < 0.2;
        }
        
        if (this.difficulty === 'easy') {
            return game.state.rollsThisTurn < (2 + Math.floor(Math.random() * 2));
        }
        
        // Medium/Hard: based on runners and probability
        let maxRolls = numRunners === 1 ? 4 : numRunners === 2 ? 3 : 2;
        
        // Check for near-completion
        for (const col of game.state.activeRunners) {
            const temp = game.state.tempProgress.get(col) || 0;
            const effectivePos = game.calcEffectivePos(game.state.currentPlayer.id, col, temp);
            const remaining = COLUMN_HEIGHTS[col] - effectivePos;
            if (remaining <= 2) maxRolls += 2;
        }
        
        if (game.state.rollsThisTurn >= maxRolls) {
            return Math.random() < 0.15;
        }
        
        return true;
    }
}
