const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getLogChannel } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member (prevent them from sending messages)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to timeout')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {

        // 🔒 Administrator permission check
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "❌ You must be an **Administrator** to use this command.",
                ephemeral: true
            });
        }

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        let member = interaction.options.getMember('user');

        if (!member) {
            try {
                member = await interaction.guild.members.fetch(user.id);
            } catch {
                return interaction.reply({
                    content: 'That user is not in this server.',
                    ephemeral: true
                });
            }
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                content: 'You cannot timeout yourself!',
                ephemeral: true
            });
        }

        if (member.id === interaction.client.user.id) {
            return interaction.reply({
                content: 'I cannot timeout myself!',
                ephemeral: true
            });
        }

        if (!member.moderatable) {
            return interaction.reply({
                content: 'I cannot timeout this user. They may have a higher role than me or have administrator permissions.',
                ephemeral: true
            });
        }

        const executorMember = interaction.member;
        if (member.roles.highest.position >= executorMember.roles.highest.position) {
            return interaction.reply({
                content: 'You cannot timeout this user as they have an equal or higher role than you.',
                ephemeral: true
            });
        }

        const durationMs = duration * 60 * 1000;
        const durationText = formatDuration(duration);

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xffcc00)
                .setTitle('You have been timed out')
                .setDescription(`You have been timed out in **${interaction.guild.name}**`)
                .addFields(
                    { name: 'Duration', value: durationText, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            try {
                await user.send({ embeds: [dmEmbed] });
            } catch {
                console.log(`Could not DM user ${user.tag}`);
            }

            await member.timeout(durationMs, reason);

            const successEmbed = new EmbedBuilder()
                .setColor(0xffcc00)
                .setTitle('Member Timed Out')
                .setDescription(`**${user.tag}** has been timed out.`)
                .addFields(
                    { name: 'Duration', value: durationText, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });

            const logChannelId = await getLogChannel(interaction.guild.id);
            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(0xffcc00)
                        .setTitle('Member Timed Out')
                        .setThumbnail(user.displayAvatarURL())
                        .addFields(
                            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                            { name: 'Duration', value: durationText, inline: true },
                            { name: 'Reason', value: reason }
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error('Error timing out member:', error);
            await interaction.reply({
                content: 'Failed to timeout the user. Please try again.',
                ephemeral: true
            });
        }
    },
};

function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 24) {
        if (remainingMinutes === 0) {
            return `${hours} hour${hours === 1 ? '' : 's'}`;
        }
        return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
        return `${days} day${days === 1 ? '' : 's'}`;
    }
    return `${days} day${days === 1 ? '' : 's'} ${remainingHours} hour${remainingHours === 1 ? '' : 's'}`;
}
