import Bet from "../../models/bet.js";
import Pot from "../../models/pot.js";

class BetController {
    constructor() {
        this.bet = new Bet();
        this.pot = new Pot();
    }

    /**
     * Place a bet
     * @param {*} req - user_id, bet_amount, bet_number
     * @param {*} res - success or failure response
     */
    async placeBet(req, res) {
        const { bet_amount, bet_number } = req.body || {};
        const user_id = res.locals.user_id;
    
        if (!user_id || !bet_amount || !bet_number) {
            return res.send({ success: false, message: "Invalid bet details" });
        }
    
        // Validate bet_number format "XX-XX-XX-XX-XX-XX"
        const betNumberPattern = /^(\d{1,2}-){5}\d{1,2}$/;
        if (!betNumberPattern.test(bet_number)) {
            return res.send({ 
                success: false, 
                message: "Invalid bet number format. Use XX-XX-XX-XX-XX-XX" 
            });
        }
    
        try {
            // ✅ Get the latest round_id
            const round_id = await this.bet.getLatestRoundId();
    
            // ✅ Place the bet with the latest round_id
            const result = await this.bet.placeBet(user_id, bet_amount, bet_number, round_id);
    
            // ✅ Immediately add bet amount to the pot
            await this.pot.updatesPot(bet_amount);
    
            res.send({ 
                success: true, 
                message: "Bet placed successfully", 
                bet_id: result.insertId, 
                round_id 
            });
        } catch (err) {
            res.send({ 
                success: false, 
                message: err.message 
            });
        }
    }
    

    /**
     * Process bets - Check winners
     * @param {*} req - winning_number (array of 6 numbers)
     * @param {*} res - success or failure response
     */
    async processBets(req, res) {
        const { winning_number } = req.body || {};
    
        if (!winning_number || !Array.isArray(winning_number) || winning_number.length !== 6) {
            return res.send({ success: false, message: "Winning number must be an array of 6 numbers" });
        }
    
        try {
            // ✅ Fetch bets for the current round
            const round_id = await this.bet.getLatestRoundId();
            const allBets = await this.bet.getBetsByRound(round_id);
            let winningUsers = [];
    
            for (const bet of allBets) {
                const betNumbersArray = bet.bet_number.split("-").map(Number);
    
                // ✅ Check if bet matches the winning numbers
                if (betNumbersArray.every((num, index) => num === winning_number[index])) {
                    winningUsers.push(bet.user_id);
                }
            }
    
            // ✅ Increment round_id (start a new round)
            await this.bet.incrementRoundId();
    
            res.send({ 
                success: true, 
                message: "Bets processed successfully",
                winningUsers,
                newRoundId: round_id + 1
            });
        } catch (err) {
            res.send({ success: false, message: err.message });
        }
    }
    
}

export default BetController;
