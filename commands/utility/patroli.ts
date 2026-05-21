import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("patroli")
    .setDescription("Pendataan patroli"),
  async execute(interaction: any) {
    const button = new ButtonBuilder()
      .setCustomId("patroli:open_modal")
      .setLabel("Open Form")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await interaction.reply({
      content: "Click the button below to open the form:",
      components: [row],
    });
  },
};
