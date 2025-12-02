const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option
                .setName('userid')
                .setDescription('The ID of the user to unban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for unbanning the user')
                .setRequired(false)
        ),

    async execute(interaction) {

        // 🔒 Administrator permission check
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "❌ You must be an **Administrator** to use this command.",
                ephemeral: true
            });
        }

        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await interaction.guild.members.unban(userId, reason);

            await interaction.reply({
                content: `✅ Successfully unbanned <@${userId}>.\n**Reason:** ${reason}`,
                ephemeral: false
            });

        } catch (err) {
            console.error(err);

            await interaction.reply({
                content: `❌ Failed to unban user. Make sure the ID is correct and the user is banned.`,
                ephemeral: true
            });
        }
    }
};
