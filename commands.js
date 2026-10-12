const { EmbedBuilder, PermissionsBitField } = require('discord.js');

// الرتبتين المسموح لهم بكل الأوامر والصلاحيات المطلقة
const FULL_ACCESS_ROLES = [
    "👑OWNER👑",
    "👑 Game Owner"
];

// دالة التحقق من الرتبة أو الأدمين الأساسي في ديسكورد
function hasFullAccess(member) {
    if (!member) return false;
    const hasRole = member.roles.cache.some(role => FULL_ACCESS_ROLES.includes(role.name));
    const isServerAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
    return hasRole || isServerAdmin;
}

const commands = {
    // --- 1. قفل الرومات العادية (4 صلاحيات زي ما طلبت) ---
    lockrole: {
        description: 'Lock 4 text permissions for a specific role in this channel.',
        execute: async (message, args) => {
            if (!hasFullAccess(message.member)) return message.reply("❌ You don't have permission to use this command.");

            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
            if (!role) return message.reply("❌ Please mention a valid role or provide a Role ID.");

            try {
                await message.channel.permissionOverwrites.edit(role, {
                    SendMessages: false,
                    SendMessagesInThreads: false,
                    CreatePublicThreads: false,
                    CreatePrivateThreads: false
                });
                message.reply(`🔒 Successfully locked 4 text permissions for **${role.name}** in ${message.channel}.`);
            } catch (err) {
                console.error(err);
                message.reply("❌ Failed to update channel permissions.");
            }
        }
    },

    // --- 2. قفل رومات الإعلانات (3 صلاحيات زي ما طلبت) ---
    lockannouncement: {
        description: 'Lock 3 permissions for a specific role in an announcement channel.',
        execute: async (message, args) => {
            if (!hasFullAccess(message.member)) return message.reply("❌ You don't have permission to use this command.");

            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
            if (!role) return message.reply("❌ Please mention a valid role or provide a Role ID.");

            try {
                await message.channel.permissionOverwrites.edit(role, {
                    SendMessages: false,
                    SendMessagesInThreads: false,
                    CreatePublicThreads: false
                });
                message.reply(`📢 Successfully locked 3 announcement permissions for **${role.name}** in ${message.channel}.`);
            } catch (err) {
                console.error(err);
                message.reply("❌ Failed to update announcement permissions.");
            }
        }
    },

    // --- فك القفل عن الرتبة ---
    unlockrole: {
        description: 'Unlock channel permissions for a specific role.',
        execute: async (message, args) => {
            if (!hasFullAccess(message.member)) return message.reply("❌ You don't have permission to use this command.");

            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
            if (!role) return message.reply("❌ Please mention a valid role or provide a Role ID.");

            try {
                await message.channel.permissionOverwrites.edit(role, {
                    SendMessages: null,
                    SendMessagesInThreads: null,
                    CreatePublicThreads: null,
                    CreatePrivateThreads: null
                });
                message.reply(`🔓 Unlocked channel permissions for **${role.name}** in ${message.channel}.`);
            } catch (err) {
                console.error(err);
                message.reply("❌ Failed to reset channel permissions.");
            }
        }
    },

    // --- أوامر الإدارة والتحكم (بالإنجليزية) ---
    timeout: {
        description: 'Timeout a user.',
        execute: async (message, args) => {
            if (!hasFullAccess(message.member)) return message.reply("❌ Permission denied.");
            const user = message.mentions.users.first();
            const mins = parseInt(args[1]) || 10;
            if (!user) return message.reply("❌ Please mention a user.");
            const member = message.guild.members.resolve(user);
            if (member) {
                await member.timeout(mins * 60 * 1000, "Admin timeout");
                message.reply(`⏳ Timed out ${user.tag} for ${mins} minutes.`);
            }
        }
    },

    ban: {
        description: 'Ban a member from the server.',
        execute: async (message) => {
            if (!hasFullAccess(message.member)) return message.reply("❌ Permission denied.");
            const user = message.mentions.users.first();
            if (!user) return message.reply("❌ Mention a user to ban.");
            await message.guild.members.ban(user);
            message.reply(`🔨 Banned ${user.tag}.`);
        }
    },

    kick: {
        description: 'Kick a member from the server.',
        execute: async (message) => {
            if (!hasFullAccess(message.member)) return message.reply("❌ Permission denied.");
            const user = message.mentions.users.first();
            if (!user) return message.reply("❌ Mention a user to kick.");
            const member = message.guild.members.resolve(user);
            if (member) {
                await member.kick();
                message.reply(`🥾 Kicked ${user.tag}.`);
            }
        }
    },

    clear: {
        description: 'Bulk delete messages.',
        execute: async (message, args) => {
            if (!hasFullAccess(message.member)) return message.reply("❌ Permission denied.");
            const amount = parseInt(args[0]) || 10;
            await message.channel.bulkDelete(Math.min(amount, 100), true);
            message.channel.send(`🧹 Deleted ${amount} messages.`).then(m => setTimeout(() => m.delete(), 3000));
        }
    },

    slowmode: {
        description: 'Set channel slowmode.',
        execute: async (message, args) => {
            if (!hasFullAccess(message.member)) return message.reply("❌ Permission denied.");
            const seconds = parseInt(args[0]) || 0;
            await message.channel.setRateLimitPerUser(seconds);
            message.reply(`⏱️ Slowmode set to ${seconds} seconds.`);
        }
    }
};

module.exports = commands;
