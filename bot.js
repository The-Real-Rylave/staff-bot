const { Client, Intents, MessageEmbed } = require('discord.js');
const axios = require('axios');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
});

const TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'kick') {
    if (!message.member.permissions.has('KICK_MEMBERS')) return;
    const member = message.mentions.members.first();
    if (member) {
      await member.kick();
      message.reply(`${member.user.tag} has been kicked.`);
    } else {
      message.reply('Please mention a member to kick.');
    }
  } else if (command === 'mute') {
    if (!message.member.permissions.has('MANAGE_ROLES')) return;
    const member = message.mentions.members.first();
    const role = message.guild.roles.cache.find(r => r.name === 'Muted');
    if (member && role) {
      await member.roles.add(role);
      message.reply(`${member.user.tag} has been muted.`);
    } else {
      message.reply('Please mention a member to mute or create a "Muted" role.');
    }
  } else if (command === 'ban') {
    if (!message.member.permissions.has('BAN_MEMBERS')) return;
    const member = message.mentions.members.first();
    if (member) {
      await member.ban();
      message.reply(`${member.user.tag} has been banned.`);
    } else {
      message.reply('Please mention a member to ban.');
    }
  } else if (command === 'unban') {
    if (!message.member.permissions.has('BAN_MEMBERS')) return;
    const userId = args[0];
    try {
      await message.guild.members.unban(userId);
      message.reply(`User with ID ${userId} has been unbanned.`);
    } catch (error) {
      message.reply('Please provide a valid user ID.');
    }
  } else if (command === 'addrole') {
    if (!message.member.permissions.has('MANAGE_ROLES')) return;
    const member = message.mentions.members.first();
    const role = message.guild.roles.cache.find(r => r.name === args[0]);
    if (member && role) {
      await member.roles.add(role);
      message.reply(`${role.name} role has been added to ${member.user.tag}.`);
    } else {
      message.reply('Please mention a member and specify a valid role.');
    }
  } else if (command === 'removerole') {
    if (!message.member.permissions.has('MANAGE_ROLES')) return;
    const member = message.mentions.members.first();
    const role = message.guild.roles.cache.find(r => r.name === args[0]);
    if (member && role) {
      await member.roles.remove(role);
      message.reply(`${role.name} role has been removed from ${member.user.tag}.`);
    } else {
      message.reply('Please mention a member and specify a valid role.');
    }
  } else if (command === 'ai' || message.mentions.has(client.user)) {
    const prompt = message.content.replace('/ai', '').replace(`<@!${client.user.id}>`, '').trim();
    try {
      const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        prompt,
        max_tokens: 150,
        n: 1,
        stop: null,
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const aiResponse = response.data.choices[0].text.trim();
      const embed = new MessageEmbed()
        .setTitle('AI Response')
        .setDescription(aiResponse)
        .setColor('#0099ff');

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      message.reply('Error fetching AI response.');
    }
  }
});

client.login(TOKEN);
