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
        // Split formula into components (dice rolls and numbers with operators)
        const components = formula.split(/([+\-*/])/);
        if (components.length < 1 || (components.length > 1 && components.length % 2 === 0)) {
            throw new Error('Invalid dice formula. Use format like "2d6+1d4+2". Operators must be between components.');
        }

        let total = 0;
        const rollComponents = [];
        let currentOperator = '+';

        for (let i = 0; i < components.length; i++) {
            const component = components[i].trim();
            if (!component) continue;

            // Handle operators
            if (['+', '-', '*', '/'].includes(component)) {
                currentOperator = component;
                continue;
            }

            // Handle dice rolls (NdM)
            if (component.includes('d')) {
                const diceMatch = component.match(/^(\d+)d(\d+)$/);
                if (!diceMatch) {
                    // Sanitize input to prevent injection attacks since we are taking user input. Replace any non-alphanumeric characters with an empty string.
                    throw new Error(`Invalid dice component: ${component.replace(/([^a-zA-Z0-9])/g, "")}. Use format like "2d6".`);
                }

                const numDice = parseInt(diceMatch[1]);
                const dieSides = parseInt(diceMatch[2]);

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
                const componentTotal = results.reduce((sum, val) => sum + val, 0);

                rollComponents.push({
                    type: 'dice',
                    formula: component,
                    results,
                    operator: currentOperator,
                    componentTotal
                });

                // Apply to running total
                switch (currentOperator) {
                    case '+': total += componentTotal; break;
                    case '-': total -= componentTotal; break;
                    case '*': total *= componentTotal; break;
                    case '/':
                        if (componentTotal === 0) {
                            throw new Error('Division by zero is not allowed.');
                        }
                        total /= componentTotal;
                        break;
                }
            }
            // Handle plain numbers
            else if (!isNaN(component)) {
                const value = parseInt(component);
                rollComponents.push({
                    type: 'number',
                    value,
                    operator: currentOperator
                });

                // Apply to running total
                switch (currentOperator) {
                    case '+': total += value; break;
                    case '-': total -= value; break;
                    case '*': total *= value; break;
                    case '/':
                        if (value === 0) {
                            throw new Error('Division by zero is not allowed.');
                        }
                        total /= value;
                        break;
                }
            }
            else {
                // Sanitize
                throw new Error(`Invalid component: ${component.replace(/([^a-zA-Z0-9])/g, "")}. Must be dice notation (NdM) or number.`);
            }

            // Reset operator for next component
            currentOperator = '+';
        }

        return {
            components: rollComponents,
            total: Math.floor(total)
        };
    }
    
}
