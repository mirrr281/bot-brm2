import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reset-patroli")
    .setDescription("Reset data patroli pengguna")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("Pengguna yang ingin direset data patrolinya")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction: any) {
    const user = interaction.options.getUser("user");
    const PATROLI_FILE = path.join(__dirname, "../../patroli.json");

    if (!fs.existsSync(PATROLI_FILE)) {
      return await interaction.reply({ content: "❌ Data patroli belum ada.", ephemeral: true });
    }

    const records = JSON.parse(fs.readFileSync(PATROLI_FILE, "utf-8"));

    if (!records[user.id]) {
      return await interaction.reply({ content: `❌ Pengguna ${user.tag} tidak memiliki catatan patroli hari ini.`, ephemeral: true });
    }

    delete records[user.id];
    fs.writeFileSync(PATROLI_FILE, JSON.stringify(records, null, 2));

    await interaction.reply({ content: `✅ Data patroli untuk ${user.tag} telah direset.`, ephemeral: true });
  },
};
