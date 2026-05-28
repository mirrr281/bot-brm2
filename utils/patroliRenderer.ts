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
import { getAccentColor } from "./accentColor";

export function createPatroliPanel() {
  const container = new ContainerBuilder().setAccentColor(getAccentColor());

  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "# Sistem Patroli\nPendataan patroli harian operator KOPASSUS BRM5.",
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "**Informasi**\n• 1 kali patroli mendapatkan **5 poin**.\n• Patroli hanya bisa dilakukan **sehari sekali**.\n\n**Persyaratan**\n• Wajib menyertakan **2 bukti foto** saat mengisi formulir.\n• Durasi patroli minimal 1 jam.",
      ),
    )
    .addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("patroli:open_modal")
          .setLabel("Submit Patroli")
          .setStyle(ButtonStyle.Primary),
      ),
    );

  return container;
}
