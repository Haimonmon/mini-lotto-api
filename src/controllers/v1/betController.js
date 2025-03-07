import Bet from "../../models/bet.js";
import Pot from "../../models/pot.js";

class BetController {
    constructor() {
        this.bet = new Bet();
        this.pot = new Pot();
        this.currentRoundId = Date.now(); // ✅ Track the current round
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
            return res.send({ success: false, message: "Invalid bet number format. Use XX-XX-XX-XX-XX-XX" });
        }

        try {
            // ✅ Associate the bet with the current round
            const result = await this.bet.placeBet(user_id, bet_amount, bet_number, this.currentRoundId);

            res.send({ success: true, message: "Bet placed successfully", bet_id: result.insertId });
        } catch (err) {
            res.send({ success: false, message: err.message });
        }
    }

    /**
     * Process bets - Check winners and update the pot
     * @param {*} req - winning_number (array of 6 numbers)
     * @param {*} res - success or failure response
     */
    async processBets(req, res) {
        const { winning_number } = req.body || {};

        if (!winning_number || !Array.isArray(winning_number) || winning_number.length !== 6) {
            return res.send({ success: false, message: "Winning number must be an array of 6 numbers" });
        }

        try {
            // ✅ Fetch bets for the current round only
            const allBets = await this.bet.getBetsByRound(this.currentRoundId);
            let totalLostAmount = 0;
            let winningUsers = [];

            for (const bet of allBets) {
                const betNumbersArray = bet.bet_number.split("-").map(Number);
                
                // ✅ Check if bet matches the winning numbers
                if (JSON.stringify(betNumbersArray.sort()) === JSON.stringify(winning_number.sort())) {
                    winningUsers.push(bet.user_id);
                } else {
                    totalLostAmount += bet.bet_amount;
                }
            }

            // ✅ Update pot only if there's lost money
            let updatedPotAmount = await this.pot.getPotAmount();
            if (totalLostAmount > 0) {
                updatedPotAmount = await this.pot.updatesPot(totalLostAmount);
            }

            // ✅ Start a new round
            this.currentRoundId = Date.now();

            res.send({ 
                success: true, 
                message: "Bets processed successfully", 
                lostAmountAddedToPot: totalLostAmount, 
                updatedPotAmount 
            });
        } catch (err) {
            res.send({ success: false, message: err.message });
        }
    }
}

export default BetController;
