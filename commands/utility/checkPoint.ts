import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserBalance } from "../../utils/unbelievaBoatApi";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("points")
    .setDescription("Cek poin pengguna")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("Pengguna yang ingin dicek poinnya (kosongkan untuk diri sendiri)")),
  async execute(interaction: any) {
    const user = interaction.options.getUser("user") || interaction.user;
    
    await interaction.deferReply({ ephemeral: true });

    try {
      const balance = await getUserBalance(user.id);
      
      const embed = new EmbedBuilder()
        .setColor(0x33a3cc)
        .setTitle("💰 Informasi Poin")
        .setDescription(`Poin dari **${user.tag}** saat ini adalah **${balance}** poin.`);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: "❌ Gagal mengambil data poin." });
    }
  },
};
