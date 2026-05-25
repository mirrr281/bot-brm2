import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} from "discord.js";
import fs from "fs";
import path from "path";

const promotionData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../promotion.json"), "utf-8"),
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("promotion")
    .setDescription("Cek informasi pangkat dan promosi"),
  async execute(interaction: any) {
    const embed = new EmbedBuilder()
      .setColor(0x33a3cc)
      .setTitle("📋 Sistem Promosi")
      .setDescription(
        "Klik tombol **Ajukan Kenaikan Pangkat** untuk naik ke pangkat berikutnya jika poinmu mencukupi.\n\n" +
          "**Urutan pangkat dari tertinggi ke terendah:**",
      );

    for (const cat of promotionData) {
      const ranks = cat.LIST_PANGKAT.map(
        (r: any) => `${r.LOGO || ""} **${r.PANGKAT.replace(/_/g, " ")}** — ${r.POINT} poin`,
      ).join("\n");
      embed.addFields({ name: `__${cat.KATEGORI}__`, value: ranks });
    }

    embed.addFields({
      name: "Catatan",
      value:
        "• Poin didapatkan dari patroli.\n• Promosi akan mengurangi poin sesuai biaya pangkat.\n• Nickname akan otomatis diperbarui dengan logo pangkat baru.",
    });

    const button = new ButtonBuilder()
      .setCustomId("promotion:promote")
      .setLabel("Ajukan Kenaikan Pangkat")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
