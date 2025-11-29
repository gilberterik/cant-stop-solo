/* ============ GAME STATE CLASS ============ */
class GameState {
    constructor(humanName) {
        this.board = new Board();
        this.players = [
            {id: 'human', name: humanName, isAi: false, columnsClaimed: 0},
            {id: 'ai', name: 'Computer', isAi: true, columnsClaimed: 0}
        ];
        this.currentPlayerIdx = 0;
        this.activeRunners = new Set();
        this.tempProgress = new Map();
        this.turnNumber = 1;
        this.rollsThisTurn = 0;
    }
    
    get currentPlayer() { return this.players[this.currentPlayerIdx]; }
    get opponent() { return this.players[1 - this.currentPlayerIdx]; }
    
    startTurn() {
        this.activeRunners.clear();
        this.tempProgress.clear();
        this.rollsThisTurn = 0;
    }
    
    canPlaceRunner(col) {
        if (!this.board.isColumnAvailable(col)) return false;
        
        const pos = this.board.getPosition(this.currentPlayer.id, col);
        const temp = this.tempProgress.get(col) || 0;
        const oppPos = this.board.getPosition(this.opponent.id, col);
        
        let effectivePos = pos;
        for (let i = 0; i < temp; i++) {
            effectivePos++;
            if (effectivePos > COLUMN_HEIGHTS[col]) { effectivePos = COLUMN_HEIGHTS[col]; break; }
            while (effectivePos === oppPos && effectivePos < COLUMN_HEIGHTS[col]) effectivePos++;
        }
        
        if (effectivePos >= COLUMN_HEIGHTS[col]) return false;
        if (this.activeRunners.has(col)) return true;
        return this.activeRunners.size < 3;
    }
    
    advanceRunner(col, steps = 1) {
        if (!this.canPlaceRunner(col)) return false;
        this.activeRunners.add(col);
        this.tempProgress.set(col, (this.tempProgress.get(col) || 0) + steps);
        return true;
    }
    
    canMakeMove(combo) {
        const [col1, col2] = combo;
        return this.canPlaceRunner(col1) || this.canPlaceRunner(col2);
    }
    
    applyCombination(combo) {
        const [col1, col2] = combo;
        let success = false;
        if (this.canPlaceRunner(col1)) { this.advanceRunner(col1); success = true; }
        if (this.canPlaceRunner(col2)) { this.advanceRunner(col2); success = true; }
        if (success) this.rollsThisTurn++;
        return success;
    }
    
    commitProgress() {
        const playerId = this.currentPlayer.id;
        const opponentId = this.opponent.id;
        const claimed = [];
        
        for (const [col, steps] of this.tempProgress) {
            const wasClaimed = this.board.advancePosition(playerId, col, steps, opponentId);
            if (wasClaimed) {
                this.currentPlayer.columnsClaimed++;
                claimed.push(col);
                // Remove opponent's position
                this.board.positions.delete(`${opponentId}:${col}`);
            }
        }
        
        this.startTurn();
        return claimed;
    }
    
    bust() {
        this.startTurn();
    }
    
    nextTurn() {
        this.currentPlayerIdx = 1 - this.currentPlayerIdx;
        if (this.currentPlayerIdx === 0) this.turnNumber++;
    }
    
    checkWinner() {
        for (const p of this.players) {
            if (p.columnsClaimed >= COLUMNS_TO_WIN) return p;
        }
        return null;
    }
}
