const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getLogChannel } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

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
                content: 'You cannot kick yourself!',
                ephemeral: true
            });
        }

        if (member.id === interaction.client.user.id) {
            return interaction.reply({
                content: 'I cannot kick myself!',
                ephemeral: true
            });
        }

        if (!member.kickable) {
            return interaction.reply({
                content: 'I cannot kick this user. They may have a higher role than me.',
                ephemeral: true
            });
        }

        const executorMember = interaction.member;
        if (member.roles.highest.position >= executorMember.roles.highest.position) {
            return interaction.reply({
                content: 'You cannot kick this user as they have an equal or higher role than you.',
                ephemeral: true
            });
        }

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xffa500)
                .setTitle('You have been kicked')
                .setDescription(`You have been kicked from **${interaction.guild.name}**`)
                .addFields({ name: 'Reason', value: reason })
                .setTimestamp();

            try {
                await user.send({ embeds: [dmEmbed] });
            } catch {
                console.log(`Could not DM user ${user.tag}`);
            }

            await member.kick(reason);

            const successEmbed = new EmbedBuilder()
                .setColor(0xffa500)
                .setTitle('Member Kicked')
                .setDescription(`**${user.tag}** has been kicked from the server.`)
                .addFields({ name: 'Reason', value: reason })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });

            const logChannelId = await getLogChannel(interaction.guild.id);
            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(0xffa500)
                        .setTitle('Member Kicked')
                        .setThumbnail(user.displayAvatarURL())
                        .addFields(
                            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                            { name: 'Reason', value: reason }
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error('Error kicking member:', error);
            await interaction.reply({
                content: 'Failed to kick the user. Please try again.',
                ephemeral: true
            });
        }
    },
};
