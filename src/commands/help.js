const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows a list of available commands'),
    async execute(interaction) {
        const commands = interaction.client.commands;
        
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Available Commands')
            .setDescription('Here are all the commands you can use:')
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        commands.forEach(command => {
            embed.addFields({
                name: `/${command.data.name}`,
                value: command.data.description || 'No description provided',
                inline: true
            });
        });

        await interaction.reply({ embeds: [embed] });
    },
};
