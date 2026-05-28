import { EmbedBuilder } from "discord.js";
import { getAccentColor } from "./accentColor";

export const STATUS_PENDING = "⏳ MENUNGGU";
export const STATUS_APPROVED = "✅ DISETUJUI";
export const STATUS_REJECTED = "❌ DITOLAK";

const STATUS_COLORS: Record<string, number> = {
  [STATUS_PENDING]: 0xf1c40f,
  [STATUS_APPROVED]: 0x2ecc71,
  [STATUS_REJECTED]: 0xe74c3c,
};

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
    .setFooter({ text: "Status: " + statusText })
    


    
  return embed;
}
