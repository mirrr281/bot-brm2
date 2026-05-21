import {
  ModalSubmitInteraction,
  TextChannel,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";

module.exports = {
  customId: "patroli:submit_form",
  async execute(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ flags: 64 });
    const waktu = interaction.fields.getTextInputValue("waktu");
    const lokasi = interaction.fields.getTextInputValue("lokasi") || "-";
    const catatan = interaction.fields.getTextInputValue("catatan") || "-";

    const uploadedFiles = interaction.fields.getUploadedFiles("foto");
    const foto = uploadedFiles?.first() ?? null;

    let fotoAttachment: AttachmentBuilder | null = null;
    if (foto) {
      try {
        const res = await fetch(foto.url);
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        const ext = foto.name?.split(".").pop() ?? "png";
        fotoAttachment = new AttachmentBuilder(buffer, {
          name: `bukti.${ext}`,
        });
      } catch (err) {
        console.error("[patroli:submit_form] failed to fetch foto:", err);
      }
    }

    const logChannel = await interaction.client.channels.fetch(
      "1497461736691728496",
    );
    if (!logChannel?.isTextBased()) {
      await interaction.editReply({ content: "❌ Channel tidak ditemukan." });
      return;
    }

    const approveButton = new ButtonBuilder()
      .setCustomId(`patroli:approve:${interaction.user.id}`)
      .setLabel("✅ Approve")
      .setStyle(ButtonStyle.Success);

    const rejectButton = new ButtonBuilder()
      .setCustomId(`patroli:reject:${interaction.user.id}`)
      .setLabel("❌ Reject")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      approveButton,
      rejectButton,
    );

    await (logChannel as TextChannel).send({
      content:
        `**📋 Laporan Patroli Baru**\n` +
        `**Submitted by**: <@${interaction.user.id}>\n\n` +
        `**Waktu**: ${waktu}\n` +
        `**Lokasi**: ${lokasi}\n` +
        `**Catatan**: ${catatan}\n` +
        `-# 🔒 Tombol approve/reject hanya untuk admin.`,
      files: fotoAttachment ? [fotoAttachment] : [],
      components: [row],
    });

    await interaction.editReply({ content: "✅ Laporan berhasil dikirim!" });
  },
};
