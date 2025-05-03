// Import configuration from file or environment variables
import 'dotenv/config';

// Config
const MAX_DIESIDE = process.env.MAX_DIESIDE;
const MAX_ROLLS = process.env.MAX_ROLLS;

export class DiceRoller {

    /**
     * Rolls dice based on a formula string (e.g. "2d6" or "1d6+1")
     * @param {string} formula - Dice formula (e.g. "2d6" or "1d6+1")
     * @returns {Object} Object containing:
     *   results: {number[]} Array of dice roll results
     *   operator: {string} [optional] The arithmetic operator
     *   operand: {number} [optional] The arithmetic operand
     *   total: {number} Final result after applying arithmetic operation
     * @throws {Error} If formula is invalid or exceeds limits
     */
    roll(formula) {
        // Validate formula format
        const match = formula.match(/^(\d+)d(\d+)(?:([+\-*/])(\d+))?$/);
        if (!match) {
            throw new Error('Invalid dice formula. Use format like "2d6" or "1d6+1". For reference, "2d6" means two six-sided dice, and "1d6+1" means roll one six-sided die and add 1 to the result.');
        }

        const numDice = parseInt(match[1]);
        const dieSides = parseInt(match[2]);
        const operator = match[3] || null;
        const operand = match[4] ? parseInt(match[4]) : null;

        // Validate against environment limits
        if (MAX_ROLLS && numDice > MAX_ROLLS) {
            throw new Error(`Number of dice (${numDice}) exceeds maximum allowed (${MAX_ROLLS}).`);
        }
        if (MAX_DIESIDE && dieSides > MAX_DIESIDE) {
            throw new Error(`Die sides (${dieSides}) exceeds maximum allowed (${MAX_DIESIDE}).`);
        }

        // Roll the dice
        const results = [];
        for (let i = 0; i < numDice; i++) {
            results.push(Math.floor(Math.random() * dieSides) + 1);
        }

        // Calculate total
        let total = results.reduce((sum, val) => sum + val, 0);
        
        // Apply arithmetic operation if specified
        if (operator && operand !== null) {
            switch (operator) {
                case '+': total += operand; break;
                case '-': total -= operand; break;
                case '*': total *= operand; break;
                case '/':
                    if (operand === 0) {
                        throw new Error('Division by zero is not allowed.');
                    }
                    total /= operand;
                    break;
            }
        }

        return {
            results,
            ...(operator && { operator }),
            ...(operand !== null && { operand }),
            total: Math.floor(total) // Floor the total
        };
    }
    
}