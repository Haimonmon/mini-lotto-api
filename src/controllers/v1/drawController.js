import DrawResult from "../../models/draw.js";
import Bet from "../../models/bet.js";
import Pot from "../../models/pot.js";

class DrawResultController {
    constructor() {
        this.drawResult = new DrawResult();
        this.bet = new Bet();
        this.pot = new Pot();
        // ✅ Start with a round ID
        this.currentRoundId = Date.now(); 
    }

    generateWinningNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    async createDraw() {;
        try {
            const winningNumbers = this.generateWinningNumbers();
            const response = await this.drawResult.storeDrawResult(winningNumbers);

            console.log("🎉 Winning Numbers:", winningNumbers);

            // ✅ Fetch only bets for the current round
            const allBets = await this.bet.getBetsByRound(this.currentRoundId);
            let totalLostAmount = 0;
            let winningUsers = [];

            for (const bet of allBets) {
                // ✅ Convert bet_number "XX-XX-XX-XX-XX-XX" into an array
                const betNumbersArray = bet.bet_number.split("-").map(Number);

                // ✅ Compare sorted arrays for an exact match
                if (JSON.stringify(betNumbersArray.sort()) === JSON.stringify(winningNumbers)) {
                    winningUsers.push(bet.user_id);
                } else {
                    totalLostAmount += bet.bet_amount;
                }
            }

            // ✅ Add lost bets to the pot
            if (totalLostAmount > 0) {
                await this.pot.updatesPot(totalLostAmount);
            }

            // ✅ Start a new round
            this.currentRoundId = Date.now();

            return {
                success: true,
                message: "Draw result stored and bets processed successfully.",
                data: drawResult,
            };
        } catch (err) {
            console.error("❌ Error in createDraw:", err);
            return {
                success: false,
                message: err.toString(),
            };
        }
    }
}

export default DrawResultController;
