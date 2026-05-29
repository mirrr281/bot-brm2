import { MessageFlags, PermissionsBitField } from "discord.js";
import { getHoHReport } from "../../utils/hallOfHonorReportStore";
import { buildHoHEmbed, buildHoHContainer, STATUS_PENDING, STATUS_REJECTED, STATUS_APPROVED } from "../../utils/hallOfHonorReportRenderer";

const COMPONENTS_V2_FLAG = 1 << 15;

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

    const imageUrls = interaction.message.attachments.map((a: any) => a.url);
    const data = {
      jenis: record.jenis,
      operator: `<@${targetUserId}>`,
      nama: record.nama,
      pangkat: record.pangkat,
      divisi: record.divisi,
      status: STATUS_APPROVED,
      approvedBy: `<@${interaction.user.id}>`,
    };

    const updatedContainer = buildHoHContainer(data, imageUrls);
    await interaction.update({ components: [updatedContainer], flags: COMPONENTS_V2_FLAG });

    if (record.memberMsgId && record.memberChannelId) {
      try {
        const memberChannel = interaction.guild?.channels.cache.get(record.memberChannelId);
        if (memberChannel?.isTextBased()) {
          const memberMsg = await memberChannel.messages.fetch(record.memberMsgId);
          const memberEmbed = buildHoHEmbed({
            jenis: record.jenis,
            operator: memberMsg.embeds[0]?.fields?.[0]?.value || "",
            nama: record.nama,
            pangkat: record.pangkat,
            divisi: record.divisi,
            status: STATUS_APPROVED,
          });
          await memberMsg.edit({ embeds: [memberEmbed] });
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
