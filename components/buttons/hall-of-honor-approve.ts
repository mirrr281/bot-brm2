import { MessageFlags, PermissionsBitField } from "discord.js";
import { getHoHReport } from "../../utils/hallOfHonorReportStore";

const STATUS_PENDING = "⏳ MENUNGGU";
const STATUS_APPROVED = "✅ DISETUJUI";
const STATUS_REJECTED = "❌ DITOLAK";

module.exports = {
  customId: "approve_",
  async execute(interaction: any) {
    const targetUserId = interaction.customId.split("_")[1];

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "Hanya Administrator yang dapat melakukan approve/reject.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const record = getHoHReport(targetUserId);
    if (!record) {
      return interaction.reply({
        content: "Data pengajuan tidak ditemukan.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const currentContent = interaction.message.content!;
    const updatedContent = currentContent
      .replace(`**STATUS**: ${STATUS_PENDING}`, `**STATUS**: ${STATUS_APPROVED}`)
      .replace(`**STATUS**: ${STATUS_REJECTED}`, `**STATUS**: ${STATUS_APPROVED}`)
      + `\n\n✅ Disetujui oleh <@${interaction.user.id}>`;

    await interaction.update({
      content: updatedContent,
      components: [],
    });

    if (record.memberMsgId && record.memberChannelId) {
      try {
        const memberChannel = interaction.guild?.channels.cache.get(record.memberChannelId);
        if (memberChannel?.isTextBased()) {
          const memberMsg = await memberChannel.messages.fetch(record.memberMsgId);
          const memberContent = memberMsg.content
            .replace(`**STATUS**: ${STATUS_PENDING}`, `**STATUS**: ${STATUS_APPROVED}`)
            .replace(`**STATUS**: ${STATUS_REJECTED}`, `**STATUS**: ${STATUS_APPROVED}`)
            + `\n\n✅ Disetujui oleh <@${interaction.user.id}>`;
          await memberMsg.edit({ content: memberContent });
        }
      } catch {
        console.error("[hall:approve] failed to update member message");
      }
    }

    const targetUser = interaction.guild?.members.cache.get(targetUserId)?.user;
    if (targetUser) {
      await interaction.followUp({
        content: `Pengajuan **${record.jenis}** dari **${targetUser.tag}** telah disetujui.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
