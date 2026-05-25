import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("patroli")
    .setDescription("Pendataan patroli"),
  async execute(interaction: any) {
    const embed = new EmbedBuilder()
      .setColor(0x33a3cc)
      .setTitle("🚓 Sistem Patroli")
      .setDescription("Klik tombol di bawah untuk membuka formulir pendataan patroli.")
      .addFields(
        { name: "ℹ️ Informasi", value: "• 1 kali patroli mendapatkan **5 poin**.\n• Patroli hanya bisa dilakukan **sehari sekali**." },
        { name: "📸 Persyaratan", value: "• Wajib menyertakan **2 bukti foto** saat mengisi formulir." }
      );

    const button = new ButtonBuilder()
      .setCustomId("patroli:open_modal")
      .setLabel("Open Form")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
