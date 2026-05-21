import { ButtonInteraction, MessageFlags } from "discord.js";

const ALLOWED_ROLE_ID = process.env.STAFFSUS_ID!;

module.exports = {
  customId: "patroli:approve",
  async execute(interaction: ButtonInteraction) {
    // Check role
    const member =
      interaction.guild?.members.cache.get(interaction.user.id) ??
      (await interaction.guild?.members.fetch(interaction.user.id));

    if (!member?.roles.cache.has(ALLOWED_ROLE_ID)) {
      await interaction.reply({
        content: "❌ Kamu tidak memiliki izin untuk melakukan ini.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const submitterId = interaction.customId.split(":")[2];

    await interaction.update({
      content:
        interaction.message.content +
        `\n\n✅ **Diapprove oleh** <@${interaction.user.id}>`,
      components: [],
    });

    try {
      const submitter = await interaction.client.users.fetch(submitterId);
      await submitter.send("✅ Laporan patroli kamu telah **diapprove**!");
    } catch {
      console.warn("[patroli:approve] could not DM submitter");
    }
  },
};
