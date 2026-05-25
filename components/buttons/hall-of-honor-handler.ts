import { MessageFlags, ButtonInteraction, ModalSubmitInteraction } from "discord.js";

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

module.exports = {
  customId: "hall_",
  async execute(interaction: ButtonInteraction | ModalSubmitInteraction) {
    if (interaction.isButton()) {
      return showModal(interaction);
    }
    if (interaction.isModalSubmit()) {
      return submitForm(interaction);
    }
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
  const formType = TYPE_LABELS[interaction.customId] || "Sertifikat";

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const nama = interaction.fields.getTextInputValue("nama");
  const pangkat = interaction.fields.getTextInputValue("pangkat");
  const divisi = interaction.fields.getTextInputValue("divisi");
  const buktiFiles = interaction.fields.getUploadedFiles("bukti", true);

  const logChannelId = process.env.HALL_OF_HONOR_LOG_CHANNEL_ID;
  if (!logChannelId) {
    return interaction.editReply({
      content: "Log channel belum dikonfigurasi. Hubungi Administrator.",
    });
  }

  const logChannel = interaction.guild?.channels.cache.get(logChannelId);
  if (!logChannel?.isTextBased()) {
    return interaction.editReply({
      content: "Log channel tidak ditemukan. Hubungi Administrator.",
    });
  }

  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = await import("discord.js");

  const logEmbed = new EmbedBuilder()
    .setColor(0xffa500)
    .setTitle(`Pengajuan ${formType} Baru`)
    .setDescription(`Pengajuan **${formType}** dari **${interaction.user.tag}**`)
    .addFields(
      { name: "Nama", value: nama, inline: true },
      { name: "Pangkat", value: pangkat, inline: true },
      { name: "Divisi", value: divisi, inline: true },
    )
    .setFooter({ text: `User ID: ${interaction.user.id}` })
    .setTimestamp();

  const logButtons = new ActionRowBuilder<any>().addComponents(
    new ButtonBuilder()
      .setCustomId(`approve_${interaction.user.id}`)
      .setLabel("APPROVE")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`reject_${interaction.user.id}`)
      .setLabel("REJECT")
      .setStyle(ButtonStyle.Danger),
  );

  const logPayload: any = { embeds: [logEmbed], components: [logButtons], files: [] };
  const buktiAttachment = buktiFiles.first();
  if (buktiAttachment) {
    const response = await fetch(buktiAttachment.url);
    const buffer = Buffer.from(await response.arrayBuffer());
    logPayload.files.push(new AttachmentBuilder(buffer, { name: buktiAttachment.name }));
    logEmbed.setImage(`attachment://${buktiAttachment.name}`);
  }

  await (logChannel as any).send(logPayload);
  return interaction.editReply({
    content: `Pengajuan **${formType}** berhasil dikirim! Menunggu persetujuan Staff.`,
  });
}
