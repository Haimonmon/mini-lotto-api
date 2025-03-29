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
    
        // ✅ Check if bet amount is at least 20
        if (bet_amount < 20) {
            return res.send({ 
                success: false, 
                message: "Minimum bet amount is ₱20" 
            });
        }
    
        // ✅ Validate bet_number format "XX-XX-XX-XX-XX-XX"
        const betNumberPattern = /^(\d{1,2}-){5}\d{1,2}$/;
        if (!betNumberPattern.test(bet_number)) {
            return res.send({
                success: false,
                message: "Invalid bet number format. Use XX-XX-XX-XX-XX-XX"
            });
        }
    
        try {
            // ✅ Check user's current balance
            const [userData] = await this.bet.checkBalance(user_id);
            console.log(userData)
    
            if (userData.length === 0) {
                return res.send({ success: false, message: "User not found" });
            }
    
            const userMoney = userData.user_money || 0; // Ensure NULL is treated as 0
    
            // ✅ Prevent placing bet if balance is 0 or less than bet amount
            if (userMoney === 0) {
                return res.send({
                    success: false,
                    message: "You have no balance. Please deposit to play."
                });
            }
    
            if (userMoney < bet_amount) {
                return res.send({
                    success: false,
                    message: "Insufficient balance to place this bet."
                });
            }
            
            // deduct money
            await this.bet.deductMoney(user_id,bet_amount);
    
            // ✅ Place the bet with the latest round_id
            const result = await this.bet.placeBet(user_id, bet_amount, bet_number);
    
            // ✅ Immediately add bet amount to the pot
            await this.pot.updatesPot(bet_amount);
    
            res.send({
                success: true,
                message: "Bet placed successfully",
                bet_id: result.insertId
            });
        } catch (err) {
            res.send({
                success: false,
                message: err.toString()
            });
        }
    }
    
    async getLatestBets(req, res){
        try {
            const bets = await this.bet.getBetsForLatestRound();
            res.send({ 
                success: true, 
                bet: bets 
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

    async getuserbetsround(req, res){
        try{
            const userId = res.locals.user_id;
            const bets = await this.bet.getUserBetsRound(userId); 
            res.send({
                success: true,
                bet: bets
            })
        } catch (err){

        }
    }
    
}

export default BetController;
