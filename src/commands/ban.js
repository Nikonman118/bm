const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getLogChannel, getBanAppealLink } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('delete_days')
                .setDescription('Number of days of messages to delete (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {

        // 🔒 Administrator permission check
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "❌ You must be an **Administrator** to use this command.",
                ephemeral: true
            });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete_days') || 0;
        const member = interaction.options.getMember('user');

        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: 'You cannot ban yourself!',
                ephemeral: true
            });
        }

        if (user.id === interaction.client.user.id) {
            return interaction.reply({
                content: 'I cannot ban myself!',
                ephemeral: true
            });
        }

        if (member) {
            if (!member.bannable) {
                return interaction.reply({
                    content: 'I cannot ban this user. They may have a higher role than me.',
                    ephemeral: true
                });
            }

            const executorMember = interaction.member;
            if (member.roles.highest.position >= executorMember.roles.highest.position) {
                return interaction.reply({
                    content: 'You cannot ban this user as they have an equal or higher role than you.',
                    ephemeral: true
                });
            }
        }

        try {
            const banAppealLink = await getBanAppealLink(interaction.guild.id);

            const dmEmbed = new EmbedBuilder()
                .setColor(0xf04747)
                .setTitle('You have been banned')
                .setDescription(`You have been banned from **${interaction.guild.name}**`)
                .addFields({ name: 'Reason', value: reason })
                .setTimestamp();

            if (banAppealLink) {
                dmEmbed.addFields({ name: 'Ban Appeal', value: `You can appeal your ban here: ${banAppealLink}` });
            }

            try {
                await user.send({ embeds: [dmEmbed] });
            } catch {
                console.log(`Could not DM user ${user.tag}`);
            }

            await interaction.guild.members.ban(user, {
                reason: reason,
                deleteMessageSeconds: deleteDays * 24 * 60 * 60
            });

            const successEmbed = new EmbedBuilder()
                .setColor(0xf04747)
                .setTitle('Member Banned')
                .setDescription(`**${user.tag}** has been banned from the server.`)
                .addFields({ name: 'Reason', value: reason })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });

            const logChannelId = await getLogChannel(interaction.guild.id);
            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(0xf04747)
                        .setTitle('Member Banned')
                        .setThumbnail(user.displayAvatarURL())
                        .addFields(
                            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                            { name: 'Reason', value: reason },
                            { name: 'Messages Deleted', value: `${deleteDays} day(s)`, inline: true }
                        )
                        .setTimestamp();

                    if (banAppealLink) {
                        logEmbed.addFields({ name: 'Ban Appeal Link', value: banAppealLink });
                    }

                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error('Error banning member:', error);
            await interaction.reply({
                content: 'Failed to ban the user. Please try again.',
                ephemeral: true
            });
        }
    }
};
