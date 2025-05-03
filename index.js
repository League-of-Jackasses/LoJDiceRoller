// Source configuration from file or environment variables
import 'dotenv/config';

// Config
const PREFIX = process.env.BOT_PREFIX;
const DEFAULT_DIE = process.env.DEFAULT_DIE;

// Instantiate a Revolt client
import { Client } from "revolt.js";
const client = new Client();

// Import the DiceRoller class
import { DiceRoller } from "./lib/diceRoller.js";

// Print bot's username and ID when it connects to Revolt
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.username} (${client.user.id})`);

  // Set bot status to online with custom text
  client.api.patch("/users/@me", { status: { text: `Run ${PREFIX}help for help!`, presence: "Online" } });
});

// TODO: Make commands more modular and better in general.

// Ping command
client.on("messageCreate", (msg) => {
    if(msg.content.toLowerCase() === `${PREFIX}ping`) msg.reply("Pong!");
});

// Help command
client.on("messageCreate", async (msg) => {
    if(msg.content.toLowerCase() === `${PREFIX}help`) {
        const helpMessage = `Hello, ${msg.author.username}! I'm a dice rolling bot that supports complex formulas. Here's how to use me:
        
        Available commands:
        - ${PREFIX}ping: Replies with "Pong!"
        - ${PREFIX}roll (or ${PREFIX}r): Rolls dice using notation like:
          * Simple: "2d6" (two six-sided dice)
          * With modifier: "2d6+3"
          * Multiple dice: "2d6+1d4"
          * Complex: "2d6+1d4+3-1d2"
          
        Examples:
        - "${PREFIX}roll 2d6" - Roll two six-sided dice
        - "${PREFIX}roll 1d20+5" - Roll d20 and add 5
        - "${PREFIX}roll 2d6+1d4+2" - Roll multiple dice with modifiers
        - "${PREFIX}roll" - Roll default die (${DEFAULT_DIE})`;
        msg.reply(helpMessage);
    }
});

// Dice roll command
client.on("messageCreate", async (msg) => {
    if(!msg.content.startsWith(PREFIX)) return;
    const args = msg.content.slice(PREFIX.length).split(/ +/);
    if(args[0] === "roll" || args[0] === "r") {
        // Create a new DiceRoller instance and roll the dice
        const roller = new DiceRoller();

        if (args[1]) {
           try {
            const {components, total} = roller.roll(args[1].toLocaleLowerCase());
            let reply = `**Rolling**: ${args[1].toLocaleLowerCase()}\n\n`;
            
            components.forEach((comp, i) => {
                if (i > 0) reply += `${comp.operator} `;
                if (comp.type === 'dice') {
                    reply += `${comp.formula} (${comp.results.join(", ")}) `;
                } else {
                    reply += `${comp.value} `;
                }
            });
            
            reply += `\n**Total**: ${total}`;
            msg.reply(reply);
           } catch (error) {
            msg.reply(error.message);
           }
        } else {
            // If no arguments are provided, roll the default die by default
            const {components, total} = roller.roll(DEFAULT_DIE);
            const comp = components[0];
            msg.reply(`Hey, I noticed you didn't provide any arguments, so I'll roll a single ${DEFAULT_DIE} for you.\n\n**Result**: ${DEFAULT_DIE} (${comp.results.join(", ")})\n**Total**: ${total}`);
        }
    }
});

// Login to the bot account using the token from .env
client.loginBot(process.env.REVOLT_BOT_TOKEN);
