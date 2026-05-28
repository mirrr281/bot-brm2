import { MessageFlags, ButtonInteraction, ModalSubmitInteraction, EmbedBuilder } from "discord.js";
import { saveHoHReport } from "../../utils/hallOfHonorReportStore";
import { buildHoHEmbed, STATUS_PENDING } from "../../utils/hallOfHonorReportRenderer";

const MODAL_TITLES: Record<string, string> = {
  hall_brevet: "Form Pengajuan Brevet",
  hall_sertifikat: "Form Pengajuan Sertifikat",
  hall_achievement: "Form Pengajuan Achievement",
};

const TYPE_LABELS: Record<string, string> = {
  hall_brevet: "Brevet",
  hall_sertifikat: "Sertifikat",
  hall_achievement: "Achievement",
};

const ADMIN_CHANNEL_ID = process.env.HALL_OF_HONOR_APPROVAL_CHANNEL_ID!;
const MEMBER_CHANNEL_ID =
  process.env.HALL_OF_HONOR_MEMBER_CHANNEL_ID;

module.exports = {
  customId: "hall_",
  async execute(interaction: ButtonInteraction | ModalSubmitInteraction) {
    if (interaction.isButton()) return showModal(interaction);
    if (interaction.isModalSubmit()) return submitForm(interaction);
  },
};

async function showModal(interaction: ButtonInteraction) {
  const title = MODAL_TITLES[interaction.customId];
  if (!title) return;

  await interaction.showModal({
    title,
    custom_id: interaction.customId,
    components: [
      { type: 18, label: "Nama", component: { type: 4, style: 1, custom_id: "nama", required: true, min_length: 1, max_length: 100 } },
      { type: 18, label: "Pangkat", component: { type: 4, style: 1, custom_id: "pangkat", required: true, min_length: 1, max_length: 100 } },
      { type: 18, label: "Divisi", component: { type: 4, style: 1, custom_id: "divisi", required: true, min_length: 1, max_length: 100 } },
      { type: 18, label: "Bukti", component: { type: 19, custom_id: "bukti", required: true } },
    ],
  });
}

async function submitForm(interaction: ModalSubmitInteraction) {
  const jenis = TYPE_LABELS[interaction.customId] || "Sertifikat";

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const nama = interaction.fields.getTextInputValue("nama");
  const pangkat = interaction.fields.getTextInputValue("pangkat");
  const divisi = interaction.fields.getTextInputValue("divisi");
  const buktiFiles = interaction.fields.getUploadedFiles("bukti", true);

  if (!ADMIN_CHANNEL_ID) {
    return interaction.editReply({ content: "Log channel belum dikonfigurasi. Hubungi Administrator." });
  }

  const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = await import("discord.js");

  const adminChannel = interaction.guild?.channels.cache.get(ADMIN_CHANNEL_ID);
  if (!adminChannel?.isTextBased()) {
    return interaction.editReply({ content: "Log channel tidak ditemukan. Hubungi Administrator." });
  }

  const operator = `<@${interaction.user.id}>`;
  const embed = buildHoHEmbed({ jenis, operator, nama, pangkat, divisi, status: STATUS_PENDING });

  let buktiAttachment: any = null;
  const files: any[] = [];
  const firstFile = buktiFiles.first();
  if (firstFile) {
    const res = await fetch(firstFile.url);
    const buffer = Buffer.from(await res.arrayBuffer());
    buktiAttachment = new AttachmentBuilder(buffer, { name: firstFile.name });
    files.push(buktiAttachment);
    embed.setImage(`attachment://${firstFile.name}`);
  }

  const adminButtons = new ActionRowBuilder<any>().addComponents(
    new ButtonBuilder()
      .setCustomId(`approve_${interaction.user.id}`)
      .setLabel("APPROVE")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`reject_${interaction.user.id}`)
      .setLabel("REJECT")
      .setStyle(ButtonStyle.Danger),
  );

  const adminPayload: any = {
    embeds: [embed],
    components: [adminButtons],
  };
  if (files.length > 0) adminPayload.files = files;

  await (adminChannel as any).send(adminPayload);

  let memberMsgId = "";
  if (MEMBER_CHANNEL_ID) {
    const memberChannel = interaction.guild?.channels.cache.get(MEMBER_CHANNEL_ID);
    if (memberChannel?.isTextBased()) {
      const memberPayload: any = { embeds: [embed] };
      if (files.length > 0) memberPayload.files = files;
      const memberMsg = await (memberChannel as any).send(memberPayload);
      memberMsgId = memberMsg.id;
    }
  }

  saveHoHReport(interaction.user.id, {
    memberMsgId,
    memberChannelId: MEMBER_CHANNEL_ID || "",
    jenis,
    nama,
    pangkat,
    divisi,
  });

  return interaction.editReply({
    content: `Pengajuan **${jenis}** berhasil dikirim! Menunggu persetujuan Staff.`,
  });
}
