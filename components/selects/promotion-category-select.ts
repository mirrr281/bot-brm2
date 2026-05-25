import { StringSelectMenuInteraction, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

const promotionData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../promotion.json"), "utf-8"),
);

module.exports = {
  customId: "promotion:category",
  async execute(interaction: StringSelectMenuInteraction) {
    const selected = interaction.values[0];

    if (selected === "all") {
      const embeds = promotionData.map((cat: any) => {
        const roleId = cat.LIST_PANGKAT[0]?.ROLE_ID;
        const role = roleId
          ? interaction.guild?.roles.cache.get(roleId)
          : null;
        const color = role?.color ?? 0xa8d8ea;
        const ranks = cat.LIST_PANGKAT.map(
          (r: any) =>
            `${r.LOGO || "✧"} **${r.PANGKAT.replace(/_/g, " ")}** ─ ${r.POINT.toLocaleString()} poin`,
        ).join("\n");
        return new EmbedBuilder().setColor(color).setTitle(cat.KATEGORI).setDescription(ranks);
      });

      await interaction.update({ embeds });
    } else {
      const catIndex = parseInt(selected, 10);
      const cat = promotionData[catIndex];
      const roleId = cat.LIST_PANGKAT[0]?.ROLE_ID;
      const role = roleId
        ? interaction.guild?.roles.cache.get(roleId)
        : null;
      const color = role?.color ?? 0xa8d8ea;
      const ranks = cat.LIST_PANGKAT.map(
        (r: any) =>
          `${r.LOGO || "✧"} **${r.PANGKAT.replace(/_/g, " ")}** ─ ${r.POINT.toLocaleString()} poin`,
      ).join("\n");

      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setTitle(cat.KATEGORI)
            .setDescription(ranks),
        ],
      });
    }
  },
};
