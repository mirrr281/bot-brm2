import {
  ButtonInteraction,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import { sendDM, fetchMember, hasRole } from "../../utils/helpers";
import { replaceStatus, STATUS_REJECTED } from "../../utils/patroliReportRenderer";
import { getPatrolReport } from "../../utils/patroliReportStore";

const ALLOWED_ROLE_ID = process.env.STAFFSUS_ID!;
const MEMBER_CHANNEL_ID = process.env.LOG_PATROLI_CHANNEL_ID!;

module.exports = {
  customId: "patroli:reject",
  async execute(interaction: ButtonInteraction | ModalSubmitInteraction) {
    const member = await fetchMember(interaction.guild!, interaction.user.id);
    if (!hasRole(member, ALLOWED_ROLE_ID)) {
      return await interaction.reply({
        content: "❌ Kamu tidak memiliki izin untuk melakukan ini.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (interaction.isButton()) {
      const submitterId = interaction.customId.split(":")[2];
      const modal = new ModalBuilder()
        .setCustomId(`patroli:reject_modal:${submitterId}`)
        .setTitle("Alasan Penolakan");

      const reasonInput = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Berikan alasan penolakan:")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput),
      );

      await interaction.showModal(modal);
    } else if (interaction.isModalSubmit()) {
      await interaction.deferUpdate();

      const reason = interaction.fields.getTextInputValue("reason");
      const submitterId = interaction.customId.split(":")[2];
      const message = interaction.message;

      if (!message) return;

      const record = getPatrolReport(submitterId);
      if (!record) {
        return await interaction.followUp({
          content: "❌ Data laporan tidak ditemukan.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const currentContent = message.content!;
      const updatedContent = replaceStatus(currentContent, STATUS_REJECTED)
        + `\n\n❌ Direject oleh <@${interaction.user.id}>\n**Alasan:** ${reason}`;

      await message.edit({
        content: updatedContent,
        components: [],
      });

      const memberChannel = await interaction.client.channels.fetch(MEMBER_CHANNEL_ID);
      if (memberChannel?.isTextBased()) {
        try {
          const memberMsg = await memberChannel.messages.fetch(record.memberMsgId);
          const memberContent = replaceStatus(memberMsg.content!, STATUS_REJECTED)
            + `\n\n❌ Direject oleh <@${interaction.user.id}>\n**Alasan:** ${reason}`;
          await memberMsg.edit({ content: memberContent });
        } catch {
          console.error("[patroli:reject] failed to update member message");
        }
      }

      await sendDM(
        interaction.client,
        submitterId,
        `❌ Laporan patroli kamu telah **direject**.\n**Alasan:** ${reason}`,
      );
    }
  },
};
