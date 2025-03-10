 import Pot from "../../models/pot.js";

class PotController {
    constructor() {
        this.pot = new Pot();
    }

    /**
     * Get the current pot amount
     * @param {*} req 
     * @param {*} res 
     */
    async getPot(req, res) {
        try {
            const amount = await this.pot.getPotAmount();
            console.log(amount);
            res.send({
                success: true,
                data: { 
                    amount
                 }
            });
        } catch (err) {
            res.send({
                success: false,
                message: "Failed to fetch pot amount",
            });
        }
    }

    /**
     * Update the pot amount and notify clients
     * @param {amount} req - The amount to be added to the pot
     * @param {success, message} res - Response indicating success or failure
     */
    async updatePot(req, res) {
        const { amount } = req.body || {};
        if (!amount || amount <= 0) {
            return res.send({
                success: false,
                message: "Invalid amount",
            });
        }
        try {
            await this.pot.updatesPot(amount);

            res.send({
                success: true,
                message: "Pot updated successfully",
            });
        } catch (err) {
            res.send({
                success: false,
                message: "Failed to update pot",
            });
        }
    }

    /**
     * Roll over the pot if there is no winner and notify clients
     * @param {userBets} req - The total user bets to be added to the pot
     * @param {success, message} res - Response indicating success or failure
     */
    async rollOverPot(req, res) {
        const { userBets } = req.body || {};
        if (!userBets || userBets <= 0) {
            return res.send({
                success: false,
                message: "Invalid bet amount",
            });
        }
        try {
            await this.pot.rollOverPot(userBets);

            res.send({
                success: true,
                message: "Pot rolled over successfully",
            });
        } catch (err) {
            res.send({
                success: false,
                message: "Failed to roll over pot",
            });
        }
    }
}

export default PotController;