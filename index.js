const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const SPAM_LIMIT = 5;     // messages
const TIME_LIMIT = 7000; // ms
const users = new Map();

client.once("ready", () => {
  console.log(`✅ Security Bot Online: ${client.user.tag}`);
});

// ❌ Block bot joins
client.on("guildMemberAdd", async member => {
  if (member.user.bot) {
    await member.kick("Bot join blocked");
  }
});

// 🔗 Anti-link + 🚫 Anti-spam
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  if (
    message.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    )
  ) return;

  // Anti-link
  const blocked = ["http://", "https://", "discord.gg"];
  if (blocked.some(w => message.content.toLowerCase().includes(w))) {
    await message.delete();
    return message.channel.send({
      content: `❌ ${message.author}, links allowed nahi`,
      deleteAfter: 5000
    });
  }

  // Anti-spam
  const now = Date.now();
  const data = users.get(message.author.id) || [];
  data.push(now);

  const filtered = data.filter(t => now - t < TIME_LIMIT);
  users.set(message.author.id, filtered);

  if (filtered.length > SPAM_LIMIT) {
    await message.member.timeout(5 * 60 * 1000, "Spam detected");
    users.set(message.author.id, []);
    message.channel.send({
      content: `🚫 ${message.author} spam ke liye mute`,
      deleteAfter: 5000
    });
  }
});

client.login(process.env.TOKEN);
