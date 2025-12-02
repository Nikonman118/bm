const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const { setLogChannel, getLogChannel, removeLogChannel, setBanAppealLink, getBanAppealLink, removeBanAppealLink, getGuildSettings } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configure the moderation settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('logs')
                .setDescription('Set the channel for moderation logs')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('The channel to send moderation logs to')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('appeal')
                .setDescription('Set a ban appeal link (sent to banned users)')
                .addStringOption(option =>
                    option
                        .setName('link')
                        .setDescription('The ban appeal form link (e.g., Google Form, Discord server invite)')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View the current moderation settings')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a moderation setting')
                .addStringOption(option =>
                    option
                        .setName('setting')
                        .setDescription('Which setting to remove')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Log Channel', value: 'logs' },
                            { name: 'Ban Appeal Link', value: 'appeal' }
                        )
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        // 🔒 Administrator permission check
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "❌ You must be an **Administrator** to use this command.",
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'logs') {
            const channel = interaction.options.getChannel('channel');

            const permissions = channel.permissionsFor(interaction.guild.members.me);

            if (!permissions) {
                return interaction.reply({
                    content: 'I don\'t have access to view that channel!',
                    ephemeral: true
                });
            }

            if (!permissions.has('SendMessages') || !permissions.has('EmbedLinks')) {
                return interaction.reply({
                    content: 'I don\'t have permission to send messages or embeds in that channel!',
                    ephemeral: true
                });
            }

            const success = await setLogChannel(interaction.guild.id, channel.id);

            if (success) {
                const embed = new EmbedBuilder()
                    .setColor(0x43b581)
                    .setTitle('Log Channel Set')
                    .setDescription(`Moderation logs will now be sent to ${channel}`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({
                    content: 'Failed to set the log channel. Please try again.',
                    ephemeral: true
                });
            }
        } 
        else if (subcommand === 'appeal') {
            const link = interaction.options.getString('link');

            if (!link.startsWith('http://') && !link.startsWith('https://')) {
                return interaction.reply({
                    content: 'Please provide a valid URL starting with http:// or https://',
                    ephemeral: true
                });
            }

            const success = await setBanAppealLink(interaction.guild.id, link);

            if (success) {
                const embed = new EmbedBuilder()
                    .setColor(0x43b581)
                    .setTitle('Ban Appeal Link Set')
                    .setDescription(`Banned users will receive this link: ${link}`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({
                    content: 'Failed to set the ban appeal link. Please try again.',
                    ephemeral: true
                });
            }
        } 
        else if (subcommand === 'view') {
            const settings = await getGuildSettings(interaction.guild.id);

            const logChannel = settings.log_channel_id 
                ? interaction.guild.channels.cache.get(settings.log_channel_id)
                : null;

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('Moderation Settings')
                .addFields(
                    { 
                        name: 'Log Channel', 
                        value: logChannel ? `${logChannel}` : 'Not set',
                        inline: true 
                    },
                    { 
                        name: 'Ban Appeal Link', 
                        value: settings.ban_appeal_link || 'Not set',
                        inline: true 
                    }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } 
        else if (subcommand === 'remove') {
            const setting = interaction.options.getString('setting');

            let success;
            let settingName;

            if (setting === 'logs') {
                success = await removeLogChannel(interaction.guild.id);
                settingName = 'Log Channel';
            } else if (setting === 'appeal') {
                success = await removeBanAppealLink(interaction.guild.id);
                settingName = 'Ban Appeal Link';
            }

            if (success) {
                const embed = new EmbedBuilder()
                    .setColor(0xf04747)
                    .setTitle(`${settingName} Removed`)
                    .setDescription(`The ${settingName.toLowerCase()} has been removed.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({
                    content: `Failed to remove the ${settingName.toLowerCase()}. Please try again.`,
                    ephemeral: true
                });
            }
        }
    },
};
