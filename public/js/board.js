/* ============ BOARD CLASS ============ */
class Board {
    constructor() {
        this.positions = new Map(); // "playerId:col" -> position
        this.claimedBy = new Map(); // col -> playerId
    }
    
    getPosition(playerId, col) {
        return this.positions.get(`${playerId}:${col}`) || 0;
    }
    
    setPosition(playerId, col, pos) {
        if (pos > COLUMN_HEIGHTS[col]) pos = COLUMN_HEIGHTS[col];
        this.positions.set(`${playerId}:${col}`, pos);
        if (pos >= COLUMN_HEIGHTS[col] && !this.claimedBy.has(col)) {
            this.claimedBy.set(col, playerId);
            return true; // claimed
        }
        return false;
    }
    
    advancePosition(playerId, col, steps, opponentId) {
        let pos = this.getPosition(playerId, col);
        const oppPos = this.getPosition(opponentId, col);
        const height = COLUMN_HEIGHTS[col];
        
        for (let i = 0; i < steps; i++) {
            pos++;
            if (pos > height) { pos = height; break; }
            // Jump over opponent
            while (pos === oppPos && pos < height) pos++;
        }
        
        return this.setPosition(playerId, col, pos);
    }
    
    isColumnAvailable(col) {
        return !this.claimedBy.has(col);
    }
    
    getClaimedColumns(playerId) {
        return [...this.claimedBy.entries()]
            .filter(([col, pid]) => pid === playerId)
            .map(([col]) => col);
    }
    
    clone() {
        const b = new Board();
        b.positions = new Map(this.positions);
        b.claimedBy = new Map(this.claimedBy);
        return b;
    }
}
