import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  FileUploadBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  LabelBuilder,
  MessageFlags,
} from "discord.js";
import { hasPatrolledToday } from "../../utils/patroliStorage";

module.exports = {
  customId: "patroli:open_modal",
  async execute(interaction: ButtonInteraction) {
    if (hasPatrolledToday(interaction.user.id)) {
      return await interaction.reply({
        content: "❌ Anda sudah melakukan patroli hari ini. Silakan kembali besok.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId("patroli:submit_form")
      .setTitle("Patroli Form");

    const lokasiSelect = new StringSelectMenuBuilder()
      .setCustomId("lokasi")
      .setPlaceholder("Pilih lokasi patroli...")
      .setMinValues(1)
      .setMaxValues(5)
      .setRequired(true)
      .addOptions(
        new StringSelectMenuOptionBuilder().setLabel("Pushkino").setValue("Pushkino"),
        new StringSelectMenuOptionBuilder().setLabel("Depot").setValue("Depot"),
        new StringSelectMenuOptionBuilder().setLabel("Spawn").setValue("Spawn"),
        new StringSelectMenuOptionBuilder().setLabel("Hospital").setValue("Hospital"),
        new StringSelectMenuOptionBuilder().setLabel("Police Station").setValue("Police Station"),
        // 👈 add more here
      );

    modal.addLabelComponents(
      new LabelBuilder()
        .setLabel("Waktu Patroli")
        .setDescription("Format penulisan waktu mulai - waktu selesai (hh:mm - hh:mm)")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("waktu")  
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("contoh: 13:00-14:00 WIB")
            .setRequired(true)
        ),
      new LabelBuilder()
        .setLabel("Lokasi Patroli")
        .setDescription("Pilih satu atau lebih lokasi")
        .setStringSelectMenuComponent(lokasiSelect), // 👈 select menu inside modal
      new LabelBuilder()
        .setLabel("Catatan")
        .setDescription("Ceritakan pengalaman anda")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("catatan")
            .setPlaceholder("Raiding dan stealthing...")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
      new LabelBuilder()
        .setLabel("Foto Bukti")
        .setDescription("Upload screenshot bukti patroli (minimal 2 foto)")
        .setFileUploadComponent(
          new FileUploadBuilder()
            .setCustomId("foto")
            .setRequired(true)
            .setMinValues(2)
            .setMaxValues(10)
        ),
    );

    await interaction.showModal(modal);
  },
};