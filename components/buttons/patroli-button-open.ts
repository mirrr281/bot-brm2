import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  FileUploadBuilder,
  LabelBuilder,
} from "discord.js";


module.exports = {
  customId: "patroli:open_modal",
  async execute(interaction: ButtonInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("patroli:submit_form")
      .setTitle("Patroli Form");

    modal.addLabelComponents(
      new LabelBuilder()
        .setLabel("Waktu Patroli")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("waktu")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("cth.. 13.00-14.00 WIB")
            .setRequired(true)
        ),
      new LabelBuilder()
        .setLabel("Lokasi Patroli")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("lokasi")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("cth.. Pushkino, Depot")
            .setRequired(false)
        ),
      new LabelBuilder()
        .setLabel("Catatan")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("catatan")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
      new LabelBuilder()
        .setLabel("Foto Bukti")
        .setDescription("Upload screenshot bukti patroli (opsional)")
        .setFileUploadComponent(
          new FileUploadBuilder()
            .setCustomId("foto")
            .setRequired(false)
        ),
    );

    await interaction.showModal(modal);
  },
};