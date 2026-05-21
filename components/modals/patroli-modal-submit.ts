import {
  ModalSubmitInteraction,
  TextChannel,
  AttachmentBuilder,
} from "discord.js";

module.exports = {
  customId: "patroli:submit_form",
  async execute(interaction: ModalSubmitInteraction) {
    // Defer immediately — fetching the image buffer can take a moment
    await interaction.deferReply({ flags: 64 });

    const operator = interaction.fields.getTextInputValue("operator");
    const waktu = interaction.fields.getTextInputValue("waktu");
    const lokasi = interaction.fields.getTextInputValue("lokasi") || "-";
    const catatan = interaction.fields.getTextInputValue("catatan") || "-";

    const uploadedFiles = interaction.fields.getUploadedFiles("foto");
    const foto = uploadedFiles?.first() ?? null;

    console.log("[patroli:submit_form] foto url:", foto?.url ?? "none");

    // ✅ Fetch the image as a buffer IMMEDIATELY before the CDN URL expires
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
      process.env.CHANNEL_ID!,
    );

    if (logChannel?.isTextBased()) {
      await (logChannel as TextChannel).send({
        content:
          `**📋 Laporan Patroli Baru**\n` +
          `👤 **Operator**: ${operator}\n` +
          `⏰ **Waktu**: ${waktu}\n` +
          `📍 **Lokasi**: ${lokasi}\n` +
          `📝 **Catatan**: ${catatan}`,
        files: fotoAttachment ? [fotoAttachment] : [],
      });
    }

    await interaction.editReply({
      content: "✅ Laporan berhasil dikirim!",
    });
  },
};
