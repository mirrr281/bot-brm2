import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

module.exports = {
    customId: 'open-form',
    async execute(interaction: any) {
        const modal = new ModalBuilder()
            .setCustomId('my-modal')
            .setTitle('Patroli Form');
        
        const input = new TextInputBuilder()
            .setCustomId('user-input')
            .setLabel('Report details')
            .setStyle(TextInputStyle.Paragraph); // Using Paragraph for longer text
            
        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
        await interaction.showModal(modal);
    }
};