import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { getAccentColor } from "./accentColor";

export const STATUS_PENDING = "⏳ MENUNGGU";
export const STATUS_APPROVED = "✅ DISETUJUI";
export const STATUS_REJECTED = "❌ DITOLAK";

export function buildHoHEmbed(data: {
  jenis: string;
  operator: string;
  nama: string;
  pangkat: string;
  divisi: string;
  status: string;
  approvedBy?: string;
  rejectReason?: string;
}) {
  const statusText =
    data.status === STATUS_APPROVED && data.approvedBy
      ? `${data.status} — Disetujui oleh ${data.approvedBy}`
      : data.status === STATUS_REJECTED && data.rejectReason
        ? `${data.status} — ${data.rejectReason}`
        : data.status;

  const embed = new EmbedBuilder()
    .setColor(getAccentColor())
    .setTitle(`Pengajuan ${data.jenis} Baru`)
    .setDescription(`Pengajuan **${data.jenis}** dari **${data.operator}**`)
    .addFields(
      { name: "Nama", value: data.nama, inline: true },
      { name: "Pangkat", value: data.pangkat, inline: true },
      { name: "Divisi", value: data.divisi, inline: true },
    )
    .setFooter({ text: "Status: " + statusText });

  return embed;
}

export function buildHoHContainer(
  data: {
    jenis: string;
    operator: string;
    nama: string;
    pangkat: string;
    divisi: string;
    status: string;
    approvedBy?: string;
    rejectReason?: string;
  },
  imageUrls: string[],
  submitterId?: string,
) {
  const container = new ContainerBuilder().setAccentColor(getAccentColor());

  const statusMap: Record<string, string> = {
    [STATUS_APPROVED]: `✅ DISETUJUI${data.approvedBy ? ` — ${data.approvedBy}` : ""}`,
    [STATUS_REJECTED]: `❌ DITOLAK${data.rejectReason ? ` — ${data.rejectReason}` : ""}`,
    [STATUS_PENDING]: "⏳ MENUNGGU",
  };

  const text = [
    `# Pengajuan ${data.jenis} Baru`,
    ``,
    `**Pengaju**: ${data.operator}`,
    `**Nama**: ${data.nama}`,
    `**Pangkat**: ${data.pangkat}`,
    `**Divisi**: ${data.divisi}`,
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

  if (submitterId) {
    container.addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_${submitterId}`)
          .setLabel("Approve")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_${submitterId}`)
          .setLabel("Reject")
          .setStyle(ButtonStyle.Danger),
      ),
    );
  }

  return container;
}
