import { ButtonInteraction, MessageFlags, TextChannel } from "discord.js";
import { getUserBalance, updateUserBalance } from "../../utils/unbelievaBoatApi";
import { sendDM, logToChannel, fetchMember, hasRole } from "../../utils/helpers";

const ALLOWED_ROLE_ID = process.env.STAFFSUS_ID!;
const ERROR_CHANNEL_ID = process.env.LOG_BOT_CHANNEL_ID!;

module.exports = {
  customId: "patroli:approve",
  async execute(interaction: ButtonInteraction) {
    const originalContent = interaction.message.content;
    const submitterId = interaction.customId.split(":")[2];

    await interaction.update({ components: [] });

    const member = await fetchMember(interaction.guild!, interaction.user.id);
    if (!hasRole(member, ALLOWED_ROLE_ID)) {
      return await interaction.followUp({
        content: "❌ Kamu tidak memiliki izin untuk melakukan ini.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const initialCash = await getUserBalance(submitterId);
      await updateUserBalance(submitterId, 5, "Patroli Approved");
      const finalCash = await getUserBalance(submitterId);
      if (finalCash !== initialCash + 5) {
        throw new Error(
          `Point verification failed. Expected ${initialCash + 5}, got ${finalCash}`,
        );
      }

      await interaction.message.edit({
        content:
          originalContent +
          `\n\n✅ **Diapprove oleh** <@${interaction.user.id}>`,
      });

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
