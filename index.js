const Discord = require('discord.js');
const random = require('random');
const fs = require('fs');
const jsonfile = require('jsonfile');
require('dotenv').config();

const bot = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ]
});

var stats = {};

if (fs.existsSync('stats.json')) {
    stats = jsonfile.readFileSync('stats.json');
}

bot.on('messageCreate', (message) => {
    if (message.author.id === bot.user.id)
        return;

    if (message.author.bot) return;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    if (!stats[guildId]) {
        stats[guildId] = {};
    }

    const guildstats = stats[guildId];
    
    if (!guildstats[userId]) {
        guildstats[userId] = {
            xp: 0,
            level: 0,
            last_message: 0
        };
    }

    const userstats = guildstats[userId];
    
    userstats.xp += Math.floor(Math.random() * 11) + 15;

    const xpToNextLevel = 5 * Math.pow(userstats.level, 4) + 50 * userstats.level + 100; 
    if (userstats.xp >= xpToNextLevel) {
        userstats.level++;
        userstats.xp = userstats.xp - xpToNextLevel;
        message.channel.send(message.author.username + ' has Reached Level ' + userstats.level);
    } 

    jsonfile.writeFileSync('stats.json', stats);

    console.log(message.author.username + ' now has ' + userstats.xp + ' XP');
    console.log(xpToNextLevel + ' XP Needed For Next Level ');

    const parts = message.content.split(' ');

    if (parts[0] === '!howmuch') {
        const xpToNextLevel = 5 * Math.pow(userstats.level, 4) + 50 * userstats.level + 100;
        const xpNeeded = xpToNextLevel - userstats.xp;
        message.reply(message.author.username + ' needs ' + xpNeeded + ' XP to reach level ' + (userstats.level + 1));
    }
    
    if (parts[0] === '!level') {
        let targetUser = message.author;
        let targetUserId = userId;
        
        // Check if a user was mentioned
        if (parts.length > 1) {
            const userMention = parts[1];
            const mentionedUserId = userMention.replace(/[<@!>]/g, '');
            
            // Check if the mentioned user exists in the guild
            const mentionedMember = message.guild.members.cache.get(mentionedUserId);
            if (mentionedMember) {
                targetUser = mentionedMember.user;
                targetUserId = mentionedUserId;
            }
        }
        
        // Get the target user's stats
        let targetUserstats = guildstats[targetUserId];
        if (!targetUserstats) {
            targetUserstats = {
                xp: 0,
                level: 0,
                last_message: 0
            };
        }
        
        message.reply(`${targetUser.username}'s Level is ${targetUserstats.level}`);
    }
    
    if (parts[0] === '!xp' || parts[0] === '!exp') { 
        let targetUser = message.author;
        let targetUserId = userId;
        
        // Check if a user was mentioned
        if (parts.length > 1) {
            const userMention = parts[1];
            const mentionedUserId = userMention.replace(/[<@!>]/g, '');
            
            // Check if the mentioned user exists in the guild
            const mentionedMember = message.guild.members.cache.get(mentionedUserId);
            if (mentionedMember) {
                targetUser = mentionedMember.user;
                targetUserId = mentionedUserId;
            }
        }
        
        // Get the target user's stats
        let targetUserstats = guildstats[targetUserId];
        if (!targetUserstats) {
            targetUserstats = {
                xp: 0,
                level: 0,
                last_message: 0
            };
        }
        
        let totalXpFromLevels = 0;
        for (let level = 0; level < targetUserstats.level; level++) {
            totalXpFromLevels += 5 * Math.pow(level, 2) + 50 * level + 100;
        }
        
        const overallXp = totalXpFromLevels + targetUserstats.xp;
        message.reply(`${targetUser.username} has ${overallXp} total XP (Level ${targetUserstats.level} + ${targetUserstats.xp} current XP)`);
    }
    
    if (parts[0] === '!addlvl' || parts[0] === '!addlevel') {
        // Check if user has the required role
        const allowedRoleIds = ['1407072581495820338', '1407072904109363294'];
        const hasAllowedRole = message.member.roles.cache.some(role => allowedRoleIds.includes(role.id));
        
        if (!hasAllowedRole) {
            return message.reply('You do not have permission to use this command.');
        }

        if (parts.length < 3) {
            return message.reply('Usage: !addlvl @user <levels>');
        }

        const userMention = parts[1];
        const levelsToAdd = parseInt(parts[2]);

        if (isNaN(levelsToAdd) || levelsToAdd <= 0) {
            return message.reply('Please provide a valid number of levels to add.');
        }

        // Extract user ID from mention
        const userIdToAdd = userMention.replace(/[<@!>]/g, '');
        
        if (!guildstats[userIdToAdd]) {
            guildstats[userIdToAdd] = {
                xp: 0,
                level: 0,
                last_message: 0
            };
        }

        const userstatsToAdd = guildstats[userIdToAdd];
        userstatsToAdd.level += levelsToAdd;

        // Get username for response
        let username = 'Unknown User';
        const member = message.guild.members.cache.get(userIdToAdd);
        if (member) {
            username = member.user.username;
        }

        jsonfile.writeFileSync('stats.json', stats);
        message.reply(`Added ${levelsToAdd} levels to ${username}. They are now level ${userstatsToAdd.level}.`);
    }

    if (parts[0] === '!addxp' || parts[0] === '!addexp') {
        // Check if user has the required role
        const allowedRoleIds = ['1407072581495820338', '1407072904109363294'];
        const hasAllowedRole = message.member.roles.cache.some(role => allowedRoleIds.includes(role.id));
        
        if (!hasAllowedRole) {
            return message.reply('You do not have permission to use this command.');
        }

        if (parts.length < 3) {
            return message.reply('Usage: !addxp @user <xp>');
        }

        const userMention = parts[1];
        const xpToAdd = parseInt(parts[2]);

        if (isNaN(xpToAdd) || xpToAdd <= 0) {
            return message.reply('Please provide a valid amount of XP to add.');
        }

        // Extract user ID from mention
        const userIdToAdd = userMention.replace(/[<@!>]/g, '');
        
        if (!guildstats[userIdToAdd]) {
            guildstats[userIdToAdd] = {
                xp: 0,
                level: 0,
                last_message: 0
            };
        }

        const userstatsToAdd = guildstats[userIdToAdd];
        userstatsToAdd.xp += xpToAdd;

        // Check for level up
        const xpToNextLevel = 5 * Math.pow(userstatsToAdd.level, 4) + 50 * userstatsToAdd.level + 100;
        let levelUpMessage = '';
        
        if (userstatsToAdd.xp >= xpToNextLevel) {
            const levelsGained = Math.floor((userstatsToAdd.xp) / xpToNextLevel);
            userstatsToAdd.level += levelsGained;
            userstatsToAdd.xp = userstatsToAdd.xp % xpToNextLevel;
            levelUpMessage = ` and leveled up ${levelsGained} time(s) to level ${userstatsToAdd.level}`;
        }

        // Get username for response
        let username = 'Unknown User';
        const member = message.guild.members.cache.get(userIdToAdd);
        if (member) {
            username = member.user.username;
        }

        jsonfile.writeFileSync('stats.json', stats);
        message.reply(`Added ${xpToAdd} XP to ${username}${levelUpMessage || '.'}`);
    }
    
    if (parts[0] === '!leaderboard' || parts[0] === '!lb') {
        const page = parts[1] ? parseInt(parts[1]) : 1;
        const usersPerPage = 10;
        
        // Calculate total XP for each user
        const guildUsers = [];
        
        // Create an array of promises to fetch all members
        const fetchPromises = [];
        
        for (const [userId, userData] of Object.entries(guildstats)) {
            let totalXpFromLevels = 0;
            for (let level = 0; level < userData.level; level++) {
                totalXpFromLevels += 5 * Math.pow(level, 2) + 50 * level + 100;
            }
            
            const overallXp = totalXpFromLevels + userData.xp;
            
            // Try to get username from cache first
            const member = message.guild.members.cache.get(userId);
            let username = member ? member.user.username : `User (${userId})`;
            
            guildUsers.push({
                id: userId,
                username: username,
                level: userData.level,
                xp: userData.xp,
                totalXp: overallXp,
                needsFetch: !member // Flag if we need to fetch this user
            });
            
            // If not in cache, add to fetch promises
            if (!member) {
                fetchPromises.push(
                    message.guild.members.fetch(userId)
                        .then(fetchedMember => {
                            const userIndex = guildUsers.findIndex(u => u.id === userId);
                            if (userIndex !== -1) {
                                guildUsers[userIndex].username = fetchedMember.user.username;
                            }
                        })
                        .catch(() => {
                            // If we can't fetch, keep the fallback username
                        })
                );
            }
        }
        
        // Wait for all fetches to complete before building the leaderboard
        Promise.all(fetchPromises).then(() => {
            // Sort by total XP (descending)
            guildUsers.sort((a, b) => b.totalXp - a.totalXp);
            
            const totalPages = Math.ceil(guildUsers.length / usersPerPage);
            const currentPage = Math.max(1, Math.min(page, totalPages));
            const startIndex = (currentPage - 1) * usersPerPage;
            const endIndex = Math.min(startIndex + usersPerPage, guildUsers.length);
            
            if (guildUsers.length === 0) {
                message.reply('No users found in the leaderboard.');
                return;
            }
            
            let leaderboardText = `🏆 Leaderboard - Page ${currentPage}/${totalPages}\n\n`;
            
            for (let i = startIndex; i < endIndex; i++) {
                const user = guildUsers[i];
                const rank = i + 1;
                leaderboardText += `**${rank}.** ${user.username} - Level ${user.level} (${user.totalXp.toLocaleString()} XP)\n`;
            }
            
            const embed = new Discord.EmbedBuilder()
                .setTitle('Server XP Leaderboard')
                .setDescription(leaderboardText)
                .setColor('#0099ff')
                .setFooter({ text: `Use !leaderboard <page> to view more pages` });
            
            message.channel.send({ embeds: [embed] });
        });
    }

    if (parts[0] === '!reload') {
        // Check if user has the required role
        const allowedRoleIds = ['1407072581495820338', '1407072904109363294'];
        const hasAllowedRole = message.member.roles.cache.some(role => allowedRoleIds.includes(role.id));
        
        if (!hasAllowedRole) {
            return message.reply('You do not have permission to use this command.');
        }

        // Save reload information
        const reloadData = {
            requestedBy: message.author.id,
            channelId: message.channel.id,
            timestamp: Date.now()
        };
        jsonfile.writeFileSync('reload.json', reloadData);
        
        message.reply('🔄 Restarting bot...').then(() => {
            // Graceful shutdown
            bot.destroy();
            process.exit(0);
        });
    }
}); // This closes the messageCreate event

// ADD THE READY EVENT HANDLER HERE (outside messageCreate)
let hasSentOnlineMessage = false;

bot.once('ready', () => {
    console.log(`✅ ${bot.user.tag} is now online!`);
    bot.user.setActivity('With the Code', { type: Discord.ActivityType.Playing });
    
    // Check if we just reloaded
    if (fs.existsSync('reload.json')) {
        try {
            const reloadData = jsonfile.readFileSync('reload.json');
            
            // Get the channel and user
            const channel = bot.channels.cache.get(reloadData.channelId);
            const user = bot.users.cache.get(reloadData.requestedBy);
            
            if (channel) {
                const userName = user ? user.username : 'Someone';
                channel.send(`✅ Bot has been successfully reloaded by ${userName}!`);
            }
            
            // Clean up the reload file
            fs.unlinkSync('reload.json');
        } catch (error) {
            console.error('Error handling reload message:', error);
        }
    }
    
    if (!hasSentOnlineMessage) {
        const channel = bot.channels.cache.get('1407070178755215582');
        
        if (channel) {
            channel.send('✅ Bot is now online and ready!');
            hasSentOnlineMessage = true;
        } else {
            console.log('Channel not found. Make sure the channel ID is correct.');
        }
    }
});

bot.login(process.env.DISCORD_TOKEN);