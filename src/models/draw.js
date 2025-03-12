import { connection } from "../core/database.js";

class DrawResult {
    constructor() {
        this.db = connection;
    }

    async createNewRound() {
        try {
            const [result] = await connection.execute(
                "INSERT INTO game_rounds (created_at) VALUES (NOW())"
            );
            return result.insertId;
        } catch (err) {
            console.error("<error> DrawResult.createNewRound", err);
            throw err;
        }
    }

    async getLatestRoundId() {
        const [round] = await connection.execute(
            "SELECT * FROM game_rounds ORDER BY created_at DESC LIMIT 1"
        );
        return round.length ? round[0].round_id : await this.createNewRound();
    }


    /**
     * Store draw result in the database
     * @param {Array} winningNumbers - The 6 winning numbers
     * @returns {Object} Insert result
     */
    async storeDrawResult(winningNumbers) {
        try {
            console.log("Winning Numbers:", winningNumbers);

            // Convert array to string
            const winningNumbersStr = Array.isArray(winningNumbers)
                ? winningNumbers.join('-')
                : winningNumbers;

            console.log("Formatted Winning Numbers:", winningNumbersStr);

            const currentRoundId = await this.getLatestRoundId();

            // ✅ Fetch the latest pot_id
            const [potData] = await this.db.execute(
                "SELECT pot_id FROM pot_money ORDER BY pot_id DESC LIMIT 1"
            );

            const currentPotId = potData.length > 0 ? potData[0].pot_id : null;

            // ✅ Insert draw result
            const [drawResult] = await this.db.execute(
                "INSERT INTO draw_result (winning_no, created_at, round_id, pot_id) VALUES (?, NOW(), ?, ?)",
                [winningNumbersStr, currentRoundId, currentPotId]
            );

            const drawId = drawResult.insertId;
            console.log("✅ Draw result inserted:", drawId);

            // ✅ Find winning bets, ensuring NO DUPLICATE ENTRIES
            const [winningBets] = await this.db.execute(
                `SELECT user_id, MIN(bet_id) AS bet_id 
                 FROM bet 
                 WHERE round_id = ? AND FIND_IN_SET(bet_number, ?) 
                 GROUP BY user_id`,
                [currentRoundId, winningNumbersStr]
            );

            if (winningBets.length > 0) {
                console.log("🎉 Winners Found:", winningBets);

                for (const winner of winningBets) {
                    // ✅ Insert only the first winning bet per user
                    await this.db.execute(
                        "INSERT INTO win_result (user_id, draw_id, bet_id) VALUES (?, ?, ?)",
                        [winner.user_id, drawId, winner.bet_id]
                    );
                }
            }
            // new round 
            await this.createNewRound();

            return drawResult;
        } catch (err) {
            console.error("<error> DrawResult.storeDrawResult", err);
            throw err;
        }
    }

    /**
     * Get winners with their usernames
     * @returns {Array} List of winners with usernames
     */
    async getWinningUsersByLatestDraw() {
        try {
            // Get the latest draw result
            const [latestDraw] = await connection.execute(
                "SELECT draw_id, round_id, winning_no FROM draw_result ORDER BY created_at DESC LIMIT 1"
            );
    
            if (latestDraw.length === 0) {
                return []; // No draw results found
            }
    
            const { draw_id, round_id, winning_no } = latestDraw[0];
    
            // Fetch winners for the latest draw
            const [winners] = await connection.execute(
                `SELECT 
                    wr.win_id, 
                    wr.draw_id, 
                    wr.bet_id, 
                    u.username, 
                    b.bet_amount, 
                    b.bet_number, 
                    dr.winning_no 
                 FROM win_result wr
                 JOIN users u ON wr.user_id = u.user_id
                 JOIN bet b ON wr.bet_id = b.bet_id
                 JOIN draw_result dr ON wr.draw_id = dr.draw_id
                 WHERE dr.round_id = ?
                 ORDER BY wr.win_id DESC`,
                [round_id]
            );
    
            return winners.length > 0 ? winners : [];
        } catch (err) {
            console.error("<error> DrawResult.getWinningUsersByLatestDraw", err);
            throw err;
        }
    }
    
    
    
    

    /**
     * Get the latest draw result
     * @returns {Object} Draw result
     */
    async getLatestDraw() {
        try {
            const [result] = await this.db.execute(
                'SELECT * FROM draw_result ORDER BY created_at DESC LIMIT 1'
            );
            return result[0] || null;
        } catch (err) {
            console.error("<error> DrawResult.getLatestDraw", err);
            throw err;
        }
    }
}

export default DrawResult;