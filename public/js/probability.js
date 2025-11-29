/* ============ PROBABILITY MODULE ============ */
const Probability = {
    cache: new Map(),
    
    getColumnProbability(col) {
        return TWO_DICE_WAYS[col] / 36;
    },
    
    calculateBustProbability(activeColumns) {
        if (activeColumns.size === 0) return 1.0;
        const key = [...activeColumns].sort().join(',');
        if (this.cache.has(key)) return this.cache.get(key);
        
        let bustOutcomes = 0;
        const total = 1296; // 6^4
        
        for (let d1 = 1; d1 <= 6; d1++) {
            for (let d2 = 1; d2 <= 6; d2++) {
                for (let d3 = 1; d3 <= 6; d3++) {
                    for (let d4 = 1; d4 <= 6; d4++) {
                        const pairs = [
                            [d1+d2, d3+d4],
                            [d1+d3, d2+d4],
                            [d1+d4, d2+d3]
                        ];
                        let canMove = false;
                        for (const [a, b] of pairs) {
                            if (activeColumns.has(a) || activeColumns.has(b)) {
                                canMove = true;
                                break;
                            }
                        }
                        if (!canMove) bustOutcomes++;
                    }
                }
            }
        }
        const prob = bustOutcomes / total;
        this.cache.set(key, prob);
        return prob;
    },
    
    generateHint(game, action) {
        if (action === 'combo') {
            return this.generateComboHint(game);
        } else {
            return this.generateContinueHint(game);
        }
    },
    
    generateComboHint(game) {
        if (!game.currentCombos) return { message: 'Roll the dice first!' };
        
        const validCombos = game.currentCombos
            .map((combo, idx) => ({combo, idx, valid: game.currentValid[idx]}))
            .filter(c => c.valid);
        
        if (validCombos.length === 0) {
            return { type: 'bust', message: 'No valid moves - you will bust!' };
        }
        
        const analyses = validCombos.map(({combo, idx}) => {
            const [col1, col2] = combo;
            let score = 0;
            const newRunners = new Set(game.state.activeRunners);
            
            if (game.state.canPlaceRunner(col1)) newRunners.add(col1);
            if (game.state.canPlaceRunner(col2)) newRunners.add(col2);
            
            let usableAfter;
            if (newRunners.size >= 3) {
                usableAfter = newRunners;
            } else {
                usableAfter = new Set();
                for (let c = 2; c <= 12; c++) {
                    if (game.state.canPlaceRunner(c) || newRunners.has(c)) {
                        usableAfter.add(c);
                    }
                }
            }
            
            const bustProb = Probability.calculateBustProbability(usableAfter);
            
            // Score calculation
            score += (1 - bustProb) * 30;
            if (game.state.activeRunners.has(col1)) score += 15;
            if (game.state.activeRunners.has(col2)) score += 15;
            
            const wouldClaim = [];
            for (const col of [col1, col2]) {
                if (!game.state.canPlaceRunner(col)) continue;
                const currentTemp = game.state.tempProgress.get(col) || 0;
                const steps = (col1 === col2) ? 2 : 1;
                const playerId = game.state.currentPlayer.id;
                const effectivePos = game.calcEffectivePos(playerId, col, currentTemp + steps);
                if (effectivePos >= COLUMN_HEIGHTS[col]) {
                    wouldClaim.push(col);
                    score += 50;
                }
            }
            
            score += (Probability.getColumnProbability(col1) + Probability.getColumnProbability(col2)) * 50;
            if (col1 === col2) score += 10;
            
            return {combo, idx, bustProb, score, wouldClaim};
        });
        
        analyses.sort((a, b) => b.score - a.score);
        const best = analyses[0];
        
        let msg = `Best: Columns ${best.combo[0]} & ${best.combo[1]}`;
        if (best.wouldClaim.length) {
            msg += ` - would claim column(s) ${best.wouldClaim.join(', ')}!`;
        }
        msg += ` (EV: ${best.score.toFixed(1)})`;
        
        if (best.bustProb > 0.5) {
            msg += `\n⚠️ Warning: ${Math.round(best.bustProb * 100)}% chance to bust next roll!`;
        }
        
        return {
            type: 'combo',
            message: msg,
            analyses: analyses.map(a => ({
                combo: a.combo,
                expected_value: a.score,
                bust_prob_after: a.bustProb,
                would_claim: a.wouldClaim
            }))
        };
    },
    
    generateContinueHint(game) {
        const bustProb = game.getBustProbability();
        const progressAtRisk = [...game.state.tempProgress.values()].reduce((a,b) => a+b, 0);
        
        const wouldClaim = game.getPendingClaims();
        
        const factors = [];
        let recommendation = 'roll';
        
        if (bustProb < 0.15) {
            factors.push(`✅ Low bust risk (${Math.round(bustProb * 100)}%)`);
        } else if (bustProb < 0.35) {
            factors.push(`⚡ Moderate bust risk (${Math.round(bustProb * 100)}%)`);
        } else {
            factors.push(`⚠️ High bust risk (${Math.round(bustProb * 100)}%)`);
            recommendation = 'stop';
        }
        
        if (wouldClaim.length) {
            factors.push(`🏆 Would claim column(s) ${wouldClaim.join(', ')} if you stop!`);
            recommendation = 'stop';
        }
        
        if (progressAtRisk >= 6) {
            factors.push(`📊 ${progressAtRisk} steps at risk - significant progress!`);
        } else {
            factors.push(`📊 Only ${progressAtRisk} steps at risk`);
        }
        
        const msg = recommendation === 'stop' 
            ? '💡 Recommendation: STOP and bank your progress'
            : '💡 Recommendation: Roll again';
        
        return {
            type: 'continue',
            message: msg,
            recommendation,
            bust_probability: bustProb,
            factors,
            would_claim: wouldClaim
        };
    }
};
