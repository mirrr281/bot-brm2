import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
} from "@discordjs/builders";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export function createPromotionPanel() {
  const container = new ContainerBuilder().setAccentColor(0x33a3cc);

  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "# Sistem Promosi\nAjukan kenaikan pangkat jika poinmu mencukupi.",
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "**Catatan**\n• Poin didapatkan dari patroli.\n• Promosi akan mengurangi poin sesuai biaya pangkat.\n• Nickname akan otomatis diperbarui dengan logo pangkat baru.",
      ),
    )
    .addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("promotion:promote")
          .setLabel("Ajukan Kenaikan Pangkat")
          .setStyle(ButtonStyle.Primary),
      ),
    );

  return container;
}
