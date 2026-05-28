import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getAccentColor } from "./accentColor";

export const STATUS_PENDING = "⏳ MENUNGGU";
export const STATUS_APPROVED = "✅ DISETUJUI";
export const STATUS_REJECTED = "❌ DITOLAK";

export function createPatroliReportPanel(
  data: {
    operator: string;
    waktu: string;
    lokasi: string;
    catatan: string;
    status: string;
    approvedBy?: string;
    rejectReason?: string;
  },
  imageUrls: string[],
  admin?: boolean,
  submitterId?: string,
) {
  const container = new ContainerBuilder().setAccentColor(getAccentColor());
  const statusMap: Record<string, string> = {
    [STATUS_APPROVED]: `✅ DISETUJUI${data.approvedBy ? ` — ${data.approvedBy}` : ""}`,
    [STATUS_REJECTED]: `❌ DITOLAK${data.rejectReason ? ` — ${data.rejectReason}` : ""}`,
    [STATUS_PENDING]: "⏳ MENUNGGU",
  };

  const text = [
    `# Laporan Patroli Baru`,
    ``,
    `**Operator**: ${data.operator}`,
    `**Waktu**: ${data.waktu}`,
    `**Lokasi**: ${data.lokasi}`,
    `**Catatan**: ${data.catatan}`,
    // `**Status**: ${statusMap[data.status] || data.status}`,
  ].join("\n");

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));

  if (imageUrls.length > 0) {
    container.addSeparatorComponents(new SeparatorBuilder());
    const gallery = new MediaGalleryBuilder();
    for (const url of imageUrls) {
      gallery.addItems(new MediaGalleryItemBuilder().setURL(url));
    }
    container.addMediaGalleryComponents(gallery);
  }

  const status = `**Status**: ${statusMap[data.status] || data.status}`;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(status),
  );

  if (admin && submitterId) {
    container.addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`patroli:approve:${submitterId}`)
          .setLabel("Approve")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`patroli:reject:${submitterId}`)
          .setLabel("Reject")
          .setStyle(ButtonStyle.Danger),
      ),
    );
  }

  return container;
}
