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

const ALLOWED_ROLE_ID = process.env.STAFFSUS_ID!;

module.exports = {
  customId: "patroli:reject",
  async execute(interaction: ButtonInteraction | ModalSubmitInteraction) {
    const member = await fetchMember(interaction.guild!, interaction.user.id);
    if (!hasRole(member, ALLOWED_ROLE_ID)) {
      if (interaction.isButton()) {
        return await interaction.reply({
          content: "❌ Kamu tidak memiliki izin untuk melakukan ini.",
          flags: MessageFlags.Ephemeral,
        });
      }
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
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const reason = interaction.fields.getTextInputValue("reason");
      const submitterId = interaction.customId.split(":")[2];
      const message = interaction.message;

      if (message) {
        await message.edit({ components: [] });
      }

      if (!message) return;

      await message.edit({
        content:
          message.content +
          `\n\n❌ **Direject oleh** <@${interaction.user.id}>\n**Alasan:** ${reason}`,
        components: [],
      });

      await interaction.editReply({ content: "Laporan telah direject." });

      await sendDM(
        interaction.client,
        submitterId,
        `❌ Laporan patroli kamu telah **direject**.\n**Alasan:** ${reason}`,
      );
    }
  },
};
