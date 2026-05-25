import {
  ModalSubmitInteraction,
  MessageFlags,
  TextChannel,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import { updatePatrolRecord } from "../../utils/patroliStorage";

const LOG_CHANNEL_ID = process.env.LOG_PATROLI_CHANNEL_ID!;

module.exports = {
  customId: "patroli:submit_form",
  async execute(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const waktu = interaction.fields.getTextInputValue("waktu");
    const lokasiValues = interaction.fields.getStringSelectValues("lokasi");
    const lokasi = lokasiValues.length > 0 ? lokasiValues.join(", ") : "-";
    const catatan = interaction.fields.getTextInputValue("catatan") || "-";

    const uploadedFiles = interaction.fields.getUploadedFiles("foto");
    const fotoAttachments: AttachmentBuilder[] = [];

    if (uploadedFiles && uploadedFiles.size > 0) {
      for (const [id, foto] of uploadedFiles) {
        try {
          const res = await fetch(foto.url);
          if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
          const buffer = Buffer.from(await res.arrayBuffer());
          const ext = foto.name?.split(".").pop() ?? "png";
          fotoAttachments.push(
            new AttachmentBuilder(buffer, { name: `bukti_${id}.${ext}` }),
          );
        } catch (err) {
          console.error(`[patroli:submit_form] failed to fetch foto ${id}:`, err);
        }
      }
    }

    const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID);
    if (!logChannel?.isTextBased()) {
      return await interaction.editReply({
        content: "❌ Channel tidak ditemukan.",
      });
    }

    const approveButton = new ButtonBuilder()
      .setCustomId(`patroli:approve:${interaction.user.id}`)
      .setLabel("Approve")
      .setStyle(ButtonStyle.Success);

    const rejectButton = new ButtonBuilder()
      .setCustomId(`patroli:reject:${interaction.user.id}`)
      .setLabel("Reject")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      approveButton,
      rejectButton,
    );

    await (logChannel as TextChannel).send({
      content:
        `**Laporan Patroli Baru**\n\n` +
        `**Submitted by**: <@${interaction.user.id}>\n` +
        `**Waktu Patroli**: ${waktu}\n` +
        `**Lokasi**: ${lokasi}\n` +
        `**Catatan**: ${catatan}\n\n` +
        `-# Tombol approve/reject hanya untuk admin.`,
      files: fotoAttachments,
      components: [row],
    });

    updatePatrolRecord(interaction.user.id);
    await interaction.editReply({ content: "✅ Laporan berhasil dikirim!" });
  },
};
