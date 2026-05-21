import {
  ActionRowBuilder,
} from "discord.js";

module.exports = {
  customId: "my-modal",
  async execute(interaction: any) {
    const reportDetails = interaction.fields.getTextInputValue("user-input");
    
    // Find the channel
    const channel = await interaction.client.channels.fetch(
        process.env.CHANNEL_ID!,
      );

      if (channel && channel.isTextBased()) {
        await channel.send(
          `New Patroli Report from ${interaction.user.tag}:\n\n${reportDetails}`,
        );
      }
    
    await interaction.reply({ content: "Laporan berhasil dikirim!", ephemeral: true });
  },
};
