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
        const helpMessage = `Hello, ${msg.author.username}! I'm a simple bot that can roll dice, I will be able to do more in the future, but for now, that's it. Here's how to use me:
        
        Available commands:
        - ping: Replies with "Pong!"
        - roll (or r): Rolls dice. Use notation like "2d6". For example, to roll two six-sided dice, the full command you would use is  "${PREFIX}roll 2d6". The command also supports arithmetic operations. For example, to roll two six-sided dice and add 3, the full command you would use is "${PREFIX}roll 2d6+3" (just make sure that there are no spaces between the die notation and the operator). You can also use the default die (${DEFAULT_DIE}) by just typing "${PREFIX}roll".`;
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
        let result;

        if (args[1]) {
           try {
            const {results, total} = roller.roll(args[1].toLocaleLowerCase());
            msg.reply(`**Result**: ${args[1].toLocaleLowerCase()} (${results.join(", ")})\n**Total**: ${total}`);
           } catch (error) {
            msg.reply(error.message);
           }
        } else {
            // If no arguments are provided, roll a single six-sided die by default
            const {results, total} = roller.roll(DEFAULT_DIE);
            msg.reply(`Hey, I noticed you didn't provide any arguments, so I'll roll a single ${DEFAULT_DIE} for you.\n\n**Result**: ${DEFAULT_DIE} (${results.join(", ")})\n**Total**: ${total}`);
        }
    }
});

// Login to the bot account using the token from .env
client.loginBot(process.env.REVOLT_BOT_TOKEN);
