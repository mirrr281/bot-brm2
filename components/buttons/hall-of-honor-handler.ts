import {
  MessageFlags,
  ButtonInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import { saveHoHReport } from "../../utils/hallOfHonorReportStore";
import {
  buildHoHEmbed,
  buildHoHContainer,
  STATUS_PENDING,
} from "../../utils/hallOfHonorReportRenderer";

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
const MEMBER_CHANNEL_ID = process.env.HALL_OF_HONOR_MEMBER_CHANNEL_ID;

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
      {
        type: 18,
        label: "Nama",
        component: {
          type: 4,
          style: 1,
          custom_id: "nama",
          required: true,
          min_length: 1,
          max_length: 100,
        },
      },
      {
        type: 18,
        label: "Pangkat",
        component: {
          type: 4,
          style: 1,
          custom_id: "pangkat",
          required: true,
          min_length: 1,
          max_length: 100,
        },
      },
      {
        type: 18,
        label: "Divisi",
        component: {
          type: 4,
          style: 1,
          custom_id: "divisi",
          required: true,
          min_length: 1,
          max_length: 100,
        },
      },
      {
        type: 18,
        label: "Bukti",
        component: {
          type: 19,
          custom_id: "bukti",
          required: true,
          min_values: 1,
          max_values: 10,
        },
      },
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
    return interaction.editReply({
      content: "Log channel belum dikonfigurasi. Hubungi Administrator.",
    });
  }

  const { AttachmentBuilder } = await import("discord.js");

  const adminChannel = interaction.guild?.channels.cache.get(ADMIN_CHANNEL_ID);
  if (!adminChannel?.isTextBased()) {
    return interaction.editReply({
      content: "Log channel tidak ditemukan. Hubungi Administrator.",
    });
  }

  const operator = `<@${interaction.user.id}>`;
  const data = { jenis, operator, nama, pangkat, divisi, status: STATUS_PENDING };

  const memberEmbed = buildHoHEmbed(data);

  const files: any[] = [];
  const imageUrls: string[] = [];
  let index = 0;
  for (const [, file] of buktiFiles) {
    try {
      const res = await fetch(file.url);
      if (!res.ok) throw new Error(`Failed to fetch bukti: ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const ext = file.name?.split(".").pop() ?? "png";
      const name = `bukti_${index}.${ext}`;
      files.push(new AttachmentBuilder(buffer, { name }));
      imageUrls.push(`attachment://${name}`);
      index++;
    } catch (err) {
      console.error(`[hall_of_honor] failed to fetch bukti ${file.id}:`, err);
    }
  }

  const adminContainer = buildHoHContainer(data, imageUrls, interaction.user.id);

  await (adminChannel as any).send({
    components: [adminContainer],
    files: files.length > 0 ? files : undefined,
    flags: 1 << 15,
  });

  let memberMsgId = "";
  if (MEMBER_CHANNEL_ID) {
    const memberChannel =
      interaction.guild?.channels.cache.get(MEMBER_CHANNEL_ID);
    if (memberChannel?.isTextBased()) {
      const memberPayload: any = { embeds: [memberEmbed] };
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
