/* ============ DICE ROLLER ============ */
const DiceRoller = {
    roll() {
        return [1,2,3,4].map(() => Math.floor(Math.random() * 6) + 1);
    },
    
    getCombinations(dice) {
        const [d1, d2, d3, d4] = dice;
        const combos = [
            [d1+d2, d3+d4],
            [d1+d3, d2+d4],
            [d1+d4, d2+d3]
        ];
        
        // Remove duplicates
        const seen = new Set();
        const unique = [];
        for (const combo of combos) {
            const key = combo.slice().sort().join(',');
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(combo);
            }
        }
        return unique;
    }
};
