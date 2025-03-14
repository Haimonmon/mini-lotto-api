import { connection } from "../core/database.js";
import Notification from "./notification.js";

class Bet {
    constructor() {
        this.db = connection;
        this.Notification = new Notification();
    }

    async createNewRound(){
        try{
            const [result] = await connection.execute("INSERT INTO game_rounds (created_at) VALUES (NOW())");
            return result.insertId;
        } catch(err){

        }
    }

    async getLatestRoundId() {
        const [round] = await connection.execute("SELECT * FROM game_rounds ORDER BY created_at DESC LIMIT 1");
        return round.length ? round[0].round_id : await this.createNewRound();
    }

    /**
     * Place a new bet
     * @param {number} user_id - The ID of the user placing the bet
     * @param {number} bet_amount - The amount being bet
     * @param {string} bet_number - The numbers the user is betting on (formatted as "XX-XX-XX-XX-XX-XX")
     * @param {number} round_id - The ID of the current round
     */
    async placeBet(user_id, bet_amount, bet_number) {
        try {
            const currentRoundId = await this.getLatestRoundId();
            console.log(currentRoundId)
            // Ensure the user does not exceed 20 bets per round
            const [betCount] = await this.db.execute(
                "SELECT COUNT(*) as count FROM bet WHERE user_id = ? AND round_id = ?", 
                [user_id, currentRoundId]
            );
            
            if (betCount[0].count >= 20) {
                throw new Error("Maximum of 20 bets per round reached.");
            }
            
            // Insert new bet with round_id
            const [result] = await this.db.execute(
                "INSERT INTO bet (user_id, bet_amount, bet_number, round_id, created_at) VALUES (?, ?, ?, ?, NOW())", 
                [user_id, bet_amount, bet_number, currentRoundId]
            );
            console.log(result)
            return result;
        } catch (err) {
            console.error("<error> bet.placeBet", err);
            throw err;
        }
    }

    async checkBalance(user_id){
        try{
            // ✅ Check user's current balance
            const [userData] = await this.db.execute(
                "SELECT user_money FROM user WHERE user_id = ?",
                [user_id]
            );

            return userData;
        } catch (err){
            console.error("<error> bet.checkBalance", err);
            throw err;
        }
    }

    async deductMoney(user_id,bet_amount){
        try{
            // ✅ Deduct bet amount from user's balance
            const [result] = await this.db.execute(
                "UPDATE user SET user_money = user_money - ? WHERE user_id = ?",
                [bet_amount, user_id]
            );
            // ✅ Send wallet deduction notification
            if (result.affectedRows > 0) {
                const message = `💸 ₱${bet_amount} has been deducted from your wallet for your bet.`;
                await this.Notification.addNotification(user_id, "wallet_deduct", message);
            }
            return result;
        } catch (err){
            console.error("<error> bet.deductMoney", err);
            throw err;
        }
    }

    /**
     * Get all bets for a specific round
     * @param {number} round_id - The ID of the round
     */
    async getBetsByRound(round_id) {
        try {
            const [bets] = await this.db.execute(
                "SELECT * FROM bet WHERE round_id = ?", 
                [round_id]
            );
            return bets;
        } catch (err) {
            console.error("<error> bet.getBetsByRound", err);
            throw err;
        }
    }
    
    /**
     * Get all bets for a user (without filtering by round)
     * @param {number} user_id - The ID of the user
     */
    async getUserBets(user_id) {
        try {
            const [bets] = await this.db.execute(
                "SELECT * FROM bet WHERE user_id = ?", 
                [user_id]
            );
            return bets;
        } catch (err) {
            console.error("<error> bet.getUserBets", err);
            throw err;
        }
    }
}

export default Bet;
