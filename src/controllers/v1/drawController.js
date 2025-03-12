import DrawResult from "../../models/draw.js";
import Bet from "../../models/bet.js";

class DrawResultController {
    constructor() {
        this.drawResult = new DrawResult();
        this.bet = new Bet();
    }

    generateWinningNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }
        return Array.from(numbers);
    }

    async createDraw(req, res) {
        try {
            const winningNumbers = this.generateWinningNumbers();
            const winningNumber = '14-15-16-17-19-20'
            const response = await this.drawResult.storeDrawResult(winningNumbers);
            console.log(response)

            console.log("🎉 Winning Numbers:", winningNumbers);

            // ✅ Fetch only bets for the current round
            const currentRoundId = await this.bet.getLatestRoundId();
            console.log(currentRoundId);
            const allBets = await this.bet.getBetsByRound(currentRoundId);
            console.log(allBets)
            const result = await this.drawResult.getLatestDraw();
            console.log(result);

            let winningUsers = [];
    
            for (const bet of allBets) {
                // ✅ Convert bet_number "XX-XX-XX-XX-XX-XX" into an array
                const betNumbersArray = bet.bet_number.split("-").map(Number);
                console.log("🎟️ Bet Numbers:", betNumbersArray);
    
                // ✅ Compare sorted arrays for an exact match
                if (JSON.stringify(betNumbersArray.sort()) === JSON.stringify(winningNumbers)) {
                    winningUsers.push(bet.user_id);
                }
            }
            res.send({
                success: true,
                message: "Draw result stored and bets processed successfully.",
                data: result,
            });
        } catch (err) {
            console.error("❌ Error in createDraw:", err);
            res.send({
                success: false,
                message: err.toString(),
            });
        }
    }
}

export default DrawResultController;
