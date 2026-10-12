const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { token, prefix } = require('./config.json');
const commands = require('./commands');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel],
});

client.commands = new Collection();

Object.keys(commands).forEach(cmd => {
    client.commands.set(cmd, commands[cmd]);
});

client.once('ready', () => {
    console.log(`SBS BOT is online as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix) || !message.guild) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args, prefix);
    } catch (error) {
        console.error(error);
        message.reply('❌ There was an error executing that command!');
    }
});

client.login(token);
