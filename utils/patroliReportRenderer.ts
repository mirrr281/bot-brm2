import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const STATUS_PENDING = "⏳ MENUNGGU";
export const STATUS_APPROVED = "✅ DISETUJUI";
export const STATUS_REJECTED = "❌ DITOLAK";

export function buildReportContent(data: {
  operator: string;
  waktu: string;
  lokasi: string;
  catatan: string;
  status: string;
}) {
  return [
    "🚓 **Laporan Patroli Baru**",
    "",
    `**Operator**: ${data.operator}`,
    `**Waktu**: ${data.waktu}`,
    `**Lokasi**: ${data.lokasi}`,
    `**Catatan**: ${data.catatan}`,
    `**STATUS**: ${data.status}`,
  ].join("\n");
}

export function renderPatrolActions(submitterId: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`patroli:approve:${submitterId}`)
      .setLabel("✅ Approve")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`patroli:reject:${submitterId}`)
      .setLabel("❌ Reject")
      .setStyle(ButtonStyle.Danger),
  );
}

const STATUS_MAP: Record<string, string> = {
  [STATUS_PENDING]: STATUS_PENDING,
  [STATUS_APPROVED]: STATUS_APPROVED,
  [STATUS_REJECTED]: STATUS_REJECTED,
};

export function replaceStatus(content: string, newStatus: string): string {
  const pattern = new RegExp(`\\*\\*STATUS\\*\\*: (${Object.values(STATUS_MAP).join("|")})`);
  return content.replace(pattern, `**STATUS**: ${newStatus}`);
}
