/* ============ STORAGE ============ */
const Storage = {
    STATS_KEY: 'cantstop_stats',
    
    getStats() {
        try {
            const data = localStorage.getItem(this.STATS_KEY);
            return data ? JSON.parse(data) : {
                gamesPlayed: 0, wins: 0, losses: 0,
                totalBusts: 0, columnsWon: 0, winStreak: 0, bestStreak: 0
            };
        } catch { return {gamesPlayed:0, wins:0, losses:0, totalBusts:0, columnsWon:0, winStreak:0, bestStreak:0}; }
    },
    
    saveStats(stats) {
        try { localStorage.setItem(this.STATS_KEY, JSON.stringify(stats)); } catch {}
    },
    
    recordGameEnd(won, busts, columnsWon) {
        const stats = this.getStats();
        stats.gamesPlayed++;
        if (won) {
            stats.wins++;
            stats.winStreak++;
            if (stats.winStreak > stats.bestStreak) stats.bestStreak = stats.winStreak;
        } else {
            stats.losses++;
            stats.winStreak = 0;
        }
        stats.totalBusts += busts;
        stats.columnsWon += columnsWon;
        this.saveStats(stats);
        return stats;
    }
};
