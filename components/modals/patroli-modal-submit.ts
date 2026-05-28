import { ModalSubmitInteraction, MessageFlags } from "discord.js";
import { updatePatrolRecord } from "../../utils/patroliStorage";
import { createPatroliReportPanel, STATUS_PENDING } from "../../utils/patroliReportRenderer";
import { savePatrolReport } from "../../utils/patroliReportStore";

const MEMBER_CHANNEL_ID = process.env.LOG_PATROLI_CHANNEL_ID!;
const ADMIN_CHANNEL_ID = process.env.LOG_PATROLI_ADMIN_CHANNEL_ID!;

module.exports = {
  customId: "patroli:submit_form",
  async execute(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const waktu = interaction.fields.getTextInputValue("waktu");
    const lokasiValues = interaction.fields.getStringSelectValues("lokasi");
    const lokasi = lokasiValues.length > 0 ? lokasiValues.join(", ") : "-";
    const catatan = interaction.fields.getTextInputValue("catatan") || "-";
    const { AttachmentBuilder } = await import("discord.js");

    const uploadedFiles = interaction.fields.getUploadedFiles("foto");
    const fotoAttachments: any[] = [];
    const imageUrls: string[] = [];

    if (uploadedFiles && uploadedFiles.size > 0) {
      let index = 0;
      for (const [, foto] of uploadedFiles) {
        try {
          const res = await fetch(foto.url);
          if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
          const buffer = Buffer.from(await res.arrayBuffer());
          const ext = foto.name?.split(".").pop() ?? "png";
          const name = `bukti_${index}.${ext}`;
          fotoAttachments.push(
            new AttachmentBuilder(buffer, { name }),
          );
          imageUrls.push(`attachment://${name}`);
          index++;
        } catch (err) {
          console.error(`[patroli:submit_form] failed to fetch foto:`, err);
        }
      }
    }

    const adminChannel = await interaction.client.channels.fetch(ADMIN_CHANNEL_ID);
    if (!adminChannel?.isTextBased()) {
      return await interaction.editReply({ content: "❌ Admin channel tidak ditemukan." });
    }

    const memberChannel = await interaction.client.channels.fetch(MEMBER_CHANNEL_ID);
    if (!memberChannel?.isTextBased()) {
      return await interaction.editReply({ content: "❌ Member channel tidak ditemukan." });
    }

    const operator = `<@${interaction.user.id}>`;
    const adminPanel = createPatroliReportPanel(
      { operator, waktu, lokasi, catatan, status: STATUS_PENDING },
      imageUrls,
      true,
      interaction.user.id,
    );
    const memberPanel = createPatroliReportPanel(
      { operator, waktu, lokasi, catatan, status: STATUS_PENDING },
      imageUrls,
    );

    const COMPONENTS_V2_FLAG = 1 << 15;

    const memberMsg = await (memberChannel as any).send({
      components: [memberPanel],
      files: fotoAttachments.length > 0 ? fotoAttachments : undefined,
      flags: COMPONENTS_V2_FLAG,
    });

    savePatrolReport(interaction.user.id, {
      memberMsgId: memberMsg.id,
      operator,
      waktu,
      lokasi,
      catatan,
    });

    await (adminChannel as any).send({
      components: [adminPanel],
      files: fotoAttachments.length > 0 ? fotoAttachments : undefined,
      flags: COMPONENTS_V2_FLAG,
    });

    updatePatrolRecord(interaction.user.id);
    await interaction.editReply({ content: "✅ Laporan berhasil dikirim!" });
  },
};
