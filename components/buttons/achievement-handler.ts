import { ButtonInteraction, MessageFlags } from "discord.js";
import {
  ContainerBuilder,
  TextDisplayBuilder,
} from "@discordjs/builders";
import {
  renderAchievementHome,
  renderAchievementCategory,
  renderAchievementDetail,
} from "../../utils/achievementRenderer";

module.exports = {
  customId: "ach_",
  async execute(interaction: ButtonInteraction) {
    const id = interaction.customId;
    const flags = MessageFlags.Ephemeral | (1 << 15);

    if (id === "ach_open") {
      const panel = renderAchievementHome();
      return interaction.reply({ components: [panel as any], flags });
    }

    if (id === "ach_close") {
      const container = new ContainerBuilder()
        .setAccentColor(0x1a1a2e)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "# SESI DITUTUP\n\nKembali ke hub publik untuk memulai sesi baru.\n\n_Semua data browsing telah dibersihkan._",
          ),
        );
      return interaction.update({ components: [container as any] });
    }

    if (id === "ach_back_home") {
      const panel = renderAchievementHome();
      return interaction.update({ components: [panel as any] });
    }

    if (id.startsWith("ach_cat_")) {
      const catKey = id.replace("ach_cat_", "");
      const panel = renderAchievementCategory(catKey, 0);
      if (!panel)
        return interaction.reply({
          content: "Kategori tidak ditemukan.",
          flags: MessageFlags.Ephemeral,
        });
      return interaction.update({ components: [panel as any] });
    }

    if (id.startsWith("ach_detail_")) {
      const parts = id.split("_");
      const catKey = parts[2];
      const achId = parts.slice(3).join("_");
      const panel = renderAchievementDetail(catKey, achId);
      if (!panel)
        return interaction.reply({
          content: "Achievement tidak ditemukan.",
          flags: MessageFlags.Ephemeral,
        });
      return interaction.update({ components: [panel as any] });
    }

    if (id.startsWith("ach_page_")) {
      const parts = id.split("_");
      const catKey = parts[2];
      const page = parseInt(parts[3], 10);
      const panel = renderAchievementCategory(catKey, page);
      if (!panel)
        return interaction.reply({
          content: "Halaman tidak ditemukan.",
          flags: MessageFlags.Ephemeral,
        });
      return interaction.update({ components: [panel as any] });
    }

    if (id.startsWith("ach_back_cat_")) {
      const catKey = id.replace("ach_back_cat_", "");
      const panel = renderAchievementCategory(catKey, 0);
      if (!panel)
        return interaction.reply({
          content: "Kategori tidak ditemukan.",
          flags: MessageFlags.Ephemeral,
        });
      return interaction.update({ components: [panel as any] });
    }
  },
};
