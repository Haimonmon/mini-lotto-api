import { connection } from "../core/database.js";
import Notification from "./notification.js"

class DrawResult {
    constructor() {
        this.db = connection;
        this.Notification = new Notification();
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
    
            const winningNumbersStr = Array.isArray(winningNumbers)
                ? winningNumbers.join('-')
                : winningNumbers;
    
            console.log("Formatted Winning Numbers:", winningNumbersStr);
    
            const currentRoundId = await this.getLatestRoundId();
    
            // ✅ Fetch the latest pot amount and ID
            const [potData] = await this.db.execute(
                "SELECT pot_id, pot_amount FROM pot_money ORDER BY pot_id DESC LIMIT 1"
            );
    
            if (potData.length === 0) {
                throw new Error("No active pot found!");
            }
    
            const { pot_id: currentPotId, pot_amount: currentPotAmount } = potData[0];
    
            // ✅ Insert draw result
            const [drawResult] = await this.db.execute(
                "INSERT INTO draw_result (winning_no, created_at, round_id, pot_id) VALUES (?, NOW(), ?, ?)",
                [winningNumbersStr, currentRoundId, currentPotId]
            );
    
            const drawId = drawResult.insertId;
            console.log("✅ Draw result inserted:", drawId);
    
            // ✅ Get all users who placed a bet in this round
            const [allBets] = await this.db.execute(
                "SELECT user_id, bet_id, bet_number FROM bet WHERE round_id = ?",
                [currentRoundId]
            );
    
            // ✅ Find winning bets (no duplicates per user)
            const [winningBets] = await this.db.execute(
                `SELECT user_id, MIN(bet_id) AS bet_id, bet_number 
                 FROM bet 
                 WHERE round_id = ? AND FIND_IN_SET(bet_number, ?) 
                 GROUP BY user_id`,
                [currentRoundId, winningNumbersStr]
            );
    
            let winners = new Set(winningBets.map(winner => winner.user_id));
    
            if (winningBets.length > 0) {
                console.log("🎉 Winners Found:", winningBets);
    
                const totalWinners = winningBets.length;
                const prizePerWinner = Math.floor(currentPotAmount / totalWinners); // Divide pot
                console.log(prizePerWinner)
    
                for (const winner of winningBets) {
                    // ✅ Insert win result
                    await this.db.execute(
                        "INSERT INTO win_result (user_id, draw_id, bet_id) VALUES (?, ?, ?)",
                        [winner.user_id, drawId, winner.bet_id]
                    );
    
                    // ✅ Update user money
                    await this.db.execute(
                        "UPDATE user SET user_money = COALESCE(user_money, 0) + ? WHERE user_id = ?",
                        [prizePerWinner, winner.user_id]
                    );
                    
                    console.log("weiner id", winner.user_id)
    
                    // ✅ Send win notification
                    const winMessage = `🎉 Congratulations! Your bet ${winner.bet_number} won ₱${prizePerWinner}.`;
                    await this.Notification.addNotification(winner.user_id, "round_won", winMessage);
                }
    
                // ✅ Reset pot money to ₱1,000,000 ONLY IF SOMEONE WINS
                console.log("✅ Winners exist. Resetting pot to ₱1,000,000.");
                await this.db.execute("UPDATE pot_money SET pot_amount = 1000000 WHERE pot_id = ?", [currentPotId]);
    
            } else {
                console.log("🚨 No winners. Keeping the current pot amount:", currentPotAmount);
            }
    
            // ✅ Send loss notifications to users who DID NOT win
            for (const bet of allBets) {
                if (!winners.has(bet.user_id)) {
                    const lossMessage = `😢 Sorry! Your bet ${bet.bet_number} did not win this round.`;
                    await this.Notification.addNotification(bet.user_id, "round_lost", lossMessage);
                }
            }
    
            // ✅ Create a new game round
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