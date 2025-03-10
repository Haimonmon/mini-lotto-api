import { connection } from "../core/database.js";

class DrawResult {
    constructor() {
        this.db = connection;
    }

    /**
     * Store draw result in the database
     * @param {Array} winningNumbers - The 6 winning numbers
     * @returns {Object} Insert result
     */
    async storeDrawResult(winningNumbers) {
        try {
            // Ensure winningNumbers is a string
            console.log(winningNumbers)
            const winningNumbersStr = Array.isArray(winningNumbers) 
                ? winningNumbers.join('-') 
                : winningNumbers;

            console.log('wew', winningNumbersStr)
    
            // ✅ Fetch the latest pot_id
            const [potData] = await this.db.execute(
                'SELECT pot_id FROM pot_money ORDER BY pot_id DESC LIMIT 1'
            );
            console.log("Pot Data:", potData); // Debugging
            const currentPotId = potData.length > 0 ? potData[0].pot_id : null;
    
            // ✅ Check for winning user (fixing bet_number comparison)
            const [winningUsers] = await this.db.execute(
                'SELECT user_id, bet_id FROM bet WHERE FIND_IN_SET(bet_number, ?)',
                [winningNumbersStr]
            );
    
            const winningUserId = winningUsers.length > 0 ? winningUsers[0].user_id : null;
            const winningBetId = winningUsers.length > 0 ? winningUsers[0].bet_id : null;
    
            // Handle NULL values
            const safeWinningUserId = winningUserId ?? null;
            const safeWinningBetId = winningBetId ?? null;
            const safePotId = currentPotId ?? null;
    
            // ✅ Insert draw result
            const result = await this.db.execute(
                'INSERT INTO draw_result (winning_no, created_at, user_id, pot_id, bet_id) VALUES (?, NOW(), ?, ?, ?)',
                [winningNumbersStr, safeWinningUserId, safePotId, safeWinningBetId]
            );
            console.log("nigga",result)
            return result;
        } catch (err) {
            console.error("<error> DrawResult.storeDrawResult", err);
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