const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const { Database } = require('st.db');
const dotenv = require('dotenv');
dotenv.config();

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
const db = new Database(process.env.DATABASE_FILE);

bot.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        bot.once(event.name, (...args) => event.execute(...args, bot, db));
    } else {
        bot.on(event.name, (...args) => event.execute(...args, bot, db));
    }
}

// INFO: IF YOU LEAVE THIS BLANK IT DEFULTS TO "DISCORD_TOKEN"
bot.login();
