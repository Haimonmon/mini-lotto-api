import { connection } from '../core/database.js';

class Pot {
    constructor() {
        this.db = connection;
    }

    async getPotAmount() {
        try {
            const [result] = await this.db.execute(
                "SELECT pot_amount FROM pot_money"
            );
            return result?.[0] || 0;
        } catch (err) {
            console.error("<error> pot.getPotAmount", err);
            throw err;
        }
    }

    async updatesPot(amount) {
        try {
            // ✅ Get the current pot amount
            const [potData] = await this.db.execute(
                "SELECT pot_amount FROM pot_money ORDER BY pot_id DESC LIMIT 1"
            );
    
            let currentPot = potData.length > 0 ? potData[0].pot_amount : 1000;
            let updatedPot = currentPot + amount;
    
            // ✅ Update the existing pot instead of inserting a new one
            await this.db.execute(
                "UPDATE pot_money SET pot_amount = ? WHERE pot_id = (SELECT MAX(pot_id) FROM pot_money)",
                [updatedPot]
            );
    
            return updatedPot; // ✅ Return updated amount
        } catch (err) {
            console.error("<error> Pot.updatePot", err);
            throw err;
        }
    }

    async rollOverPot(userBets) {
        try {
            const [result] = await this.db.execute(
                "UPDATE pot_money SET pot_amount = pot_amount + ? WHERE pot_id = 1",
                [userBets]
            );
            return result;
        } catch (err) {
            console.error("<error> pot.rollOverPot", err);
            throw err;
        }
    }
}

export default Pot;