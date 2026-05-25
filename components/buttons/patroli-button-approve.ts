import { ButtonInteraction, MessageFlags } from "discord.js";
import { getUserBalance, updateUserBalance } from "../../utils/unbelievaBoatApi";
import { sendDM, logToChannel, fetchMember, hasRole } from "../../utils/helpers";
import { replaceStatus, STATUS_APPROVED } from "../../utils/patroliReportRenderer";
import { getPatrolReport } from "../../utils/patroliReportStore";

const ALLOWED_ROLE_ID = process.env.STAFFSUS_ID!;
const ERROR_CHANNEL_ID = process.env.LOG_BOT_CHANNEL_ID!;
const MEMBER_CHANNEL_ID = process.env.LOG_PATROLI_CHANNEL_ID!;

module.exports = {
  customId: "patroli:approve",
  async execute(interaction: ButtonInteraction) {
    await interaction.deferUpdate();

    const member = await fetchMember(interaction.guild!, interaction.user.id);
    if (!hasRole(member, ALLOWED_ROLE_ID)) {
      return await interaction.followUp({
        content: "❌ Kamu tidak memiliki izin untuk melakukan ini.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const submitterId = interaction.customId.split(":")[2];

    try {
      const initialCash = await getUserBalance(submitterId);
      await updateUserBalance(submitterId, 5, "Patroli Approved");
      const finalCash = await getUserBalance(submitterId);
      if (finalCash !== initialCash + 5) {
        throw new Error(
          `Point verification failed. Expected ${initialCash + 5}, got ${finalCash}`,
        );
      }

      const record = getPatrolReport(submitterId);
      if (!record) {
        return await interaction.followUp({
          content: "❌ Data laporan tidak ditemukan.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const currentContent = interaction.message.content!;
      const updatedContent = replaceStatus(currentContent, STATUS_APPROVED)
        + `\n\n✅ Diapprove oleh <@${interaction.user.id}>`;

      await interaction.message.edit({
        content: updatedContent,
        components: [],
      });

      const memberChannel = await interaction.client.channels.fetch(MEMBER_CHANNEL_ID);
      if (memberChannel?.isTextBased()) {
        try {
          const memberMsg = await memberChannel.messages.fetch(record.memberMsgId);
          const memberContent = replaceStatus(memberMsg.content!, STATUS_APPROVED)
            + `\n\n✅ Diapprove oleh <@${interaction.user.id}>`;
          await memberMsg.edit({ content: memberContent });
        } catch {
          console.error("[patroli:approve] failed to update member message");
        }
      }

      await sendDM(
        interaction.client,
        submitterId,
        "✅ Laporan patroli kamu telah **diapprove**!",
      );
    } catch (err: any) {
      console.error("[patroli:approve] error:", err);

      await logToChannel(
        interaction.client,
        ERROR_CHANNEL_ID,
        `❌ **Error [patroli:approve]**\nSubmitter ID: ${submitterId}\nError: ${err.message}`,
      );

      await interaction.followUp({
        content:
          "❌ Terjadi kesalahan saat memproses approval (poin gagal ditambahkan).",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
