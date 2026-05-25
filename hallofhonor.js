const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');
const { ContainerBuilder, TextDisplayBuilder, SectionBuilder, SeparatorBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder } = require('@discordjs/builders');
const { Client, GatewayIntentBits, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, AttachmentBuilder, MessageFlags } = require('discord.js');

const configPath = path.join(__dirname, 'config.json');
const hallOfHonorMessagePath = path.join(__dirname, 'hall-of-honor-message.json');
const achievementCenterMessagePath = path.join(__dirname, 'achievement-center-message.json');

if (!fs.existsSync(configPath)) {
  console.error('config.json not found. Copy config.example.json to config.json and fill in the values.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const loadJson = (filePath, defaultValue) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const saveJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const hallOfHonorMessageData = loadJson(hallOfHonorMessagePath, {});
const achievementCenterMessageData = loadJson(achievementCenterMessagePath, {});

const getChannelFromConfig = (guild, idKey, nameKey) => {
  const channelId = config[idKey];
  if (channelId) return guild.channels.cache.get(channelId);
  const channelName = config[nameKey];
  if (!channelName) return null;
  return guild.channels.cache.find((ch) => ch.name === channelName && ch.isTextBased());
};

const getHallOfHonorChannel = (guild) => {
  return getChannelFromConfig(guild, 'hallOfHonorChannelId', 'hallOfHonorChannelName');
};

const saveHallOfHonorMessageData = () => {
  saveJson(hallOfHonorMessagePath, hallOfHonorMessageData);
};

const createHallOfHonorPanel = (bannerUrl) => {
  const container = new ContainerBuilder();

  if (bannerUrl) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(bannerUrl))
    );
  }

  container
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent('# KOPASSUS Hall Of Honor\nSelamat datang di **Hall Of Honor** KOPASSUS BRM5.\nDi sini Anda bisa mengajukan Sertifikasi, Brevet dan juga Achievement sesuai dengan sertifikasi yang anda dapatkan dari STAFF.')
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('Gunakan tombol **Brevet** untuk mengajukan Brevet'))
        .setButtonAccessory(new ButtonBuilder().setCustomId('hall_brevet').setLabel('BREVET').setStyle(ButtonStyle.Primary))
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('Gunakan tombol **Sertifikat** untuk mengajukan Sertifikasi'))
        .setButtonAccessory(new ButtonBuilder().setCustomId('hall_sertifikat').setLabel('SERTIFIKAT').setStyle(ButtonStyle.Primary))
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('Gunakan tombol **Achievement** untuk mengajukan Achievement'))
        .setButtonAccessory(new ButtonBuilder().setCustomId('hall_achievement').setLabel('ACHIEVEMENT').setStyle(ButtonStyle.Primary))
    );

  return container;
};

const postOrUpdateHallOfHonorPanel = async (guild) => {
  const channel = getHallOfHonorChannel(guild);
  if (!channel?.isTextBased()) return null;

  let message = null;
  if (hallOfHonorMessageData.messageId) {
    try { message = await channel.messages.fetch(hallOfHonorMessageData.messageId); }
    catch { message = null; }
  }

  const bannerFileName = 'hall-of-honor-banner.png';
  const bannerPath = path.join(__dirname, bannerFileName);
  const hasBanner = fs.existsSync(bannerPath);
  let payload;

  if (hasBanner) {
    payload = {
      components: [createHallOfHonorPanel(`attachment://${bannerFileName}`)],
      flags: 1 << 15,
      files: [new AttachmentBuilder(bannerPath)],
    };
    if (message) {
      try { await message.delete(); } catch {}
      message = null;
      hallOfHonorMessageData.messageId = null;
    }
  } else {
    payload = { components: [createHallOfHonorPanel()], flags: 1 << 15 };
  }

  if (message) {
    try { await message.edit(payload); }
    catch (err) {
      if (err.code === 10008) { message = null; }
      else { throw err; }
    }
  }

  if (!message) {
    message = await channel.send(payload);
    hallOfHonorMessageData.messageId = message.id;
    saveHallOfHonorMessageData();
  }
  return message;
};

const submitHallOfHonorForm = async (interaction) => {
  const typeLabels = { hall_brevet: 'Brevet', hall_sertifikat: 'Sertifikat', hall_achievement: 'Achievement' };
  const formType = typeLabels[interaction.customId];

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const nama = interaction.fields.getTextInputValue('nama');
  const pangkat = interaction.fields.getTextInputValue('pangkat');
  const divisi = interaction.fields.getTextInputValue('divisi');
  const buktiFiles = interaction.fields.getUploadedFiles('bukti', true);

  const logChannelId = config.hallOfHonorLogChannelId;
  if (!logChannelId) return interaction.editReply({ content: 'Log channel belum dikonfigurasi. Hubungi Administrator.' });
  const logChannel = interaction.guild?.channels.cache.get(logChannelId);
  if (!logChannel?.isTextBased()) return interaction.editReply({ content: 'Log channel tidak ditemukan. Hubungi Administrator.' });

  const logEmbed = new EmbedBuilder()
    .setColor(0xFFA500)
    .setTitle(`Pengajuan ${formType} Baru`)
    .setDescription(`Pengajuan **${formType}** dari **${interaction.user.tag}**`)
    .addFields(
      { name: 'Nama', value: nama, inline: true },
      { name: 'Pangkat', value: pangkat, inline: true },
      { name: 'Divisi', value: divisi, inline: true },
    )
    .setFooter({ text: `User ID: ${interaction.user.id}` })
    .setTimestamp();

  const logButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`approve_${interaction.user.id}`).setLabel('APPROVE').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`reject_${interaction.user.id}`).setLabel('REJECT').setStyle(ButtonStyle.Danger),
  );

  const logPayload = { embeds: [logEmbed], components: [logButtons], files: [] };
  const buktiAttachment = buktiFiles.first();
  if (buktiAttachment) {
    const response = await fetch(buktiAttachment.url);
    const buffer = Buffer.from(typeof response.buffer === 'function' ? await response.buffer() : await response.arrayBuffer());
    logPayload.files.push(new AttachmentBuilder(buffer, { name: buktiAttachment.name }));
    logEmbed.setImage(`attachment://${buktiAttachment.name}`);
  }

  await logChannel.send(logPayload);
  return interaction.editReply({ content: `Pengajuan **${formType}** berhasil dikirim! Menunggu persetujuan Staff.` });
};

const showHallOfHonorModal = (interaction) => {
  const titles = {
    hall_brevet: 'Form Pengajuan Brevet',
    hall_sertifikat: 'Form Pengajuan Sertifikat',
    hall_achievement: 'Form Pengajuan Achievement',
  };
  return interaction.showModal({
    title: titles[interaction.customId],
    custom_id: interaction.customId,
    components: [
      { type: 18, label: 'Nama', component: { type: 4, style: 1, custom_id: 'nama', required: true, min_length: 1, max_length: 100 } },
      { type: 18, label: 'Pangkat', component: { type: 4, style: 1, custom_id: 'pangkat', required: true, min_length: 1, max_length: 100 } },
      { type: 18, label: 'Divisi', component: { type: 4, style: 1, custom_id: 'divisi', required: true, min_length: 1, max_length: 100 } },
      { type: 18, label: 'Bukti', component: { type: 19, custom_id: 'bukti', required: true } },
    ],
  });
};

const handleApproveReject = async (interaction) => {
  const isApprove = interaction.customId.startsWith('approve_');
  const targetUserId = interaction.customId.split('_')[1];

  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: 'Hanya Administrator yang dapat melakukan approve/reject.', flags: MessageFlags.Ephemeral });
  }

  const targetUser = interaction.guild?.members.cache.get(targetUserId)?.user;
  if (!targetUser) return interaction.reply({ content: 'User tidak ditemukan di server.', flags: MessageFlags.Ephemeral });

  const typeMatch = interaction.message.embeds[0]?.title?.match(/Pengajuan (.+) Baru/);
  const formType = typeMatch ? typeMatch[1] : 'Sertifikat';
  const logEmbed = EmbedBuilder.from(interaction.message.embeds[0]);

  if (isApprove) {
    logEmbed.setColor(0x00FF00).setTitle(`${logEmbed.data.title} (DISETUJUI)`);

    const notifyEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('Pengajuan Disetujui!')
      .setDescription(`Selamat **${targetUser.displayName || targetUser.username}**, kamu mendapatkan **${formType}**!`)
      .setTimestamp()
      .setFooter({ text: 'KOPASSUS BRM' });

    const boardChannel = getHallOfHonorChannel(interaction.guild);
    if (boardChannel?.isTextBased()) {
      await boardChannel.send({ embeds: [notifyEmbed] });
    }
  } else {
    logEmbed.setColor(0xFF0000).setTitle(`${logEmbed.data.title} (DITOLAK)`);
  }

  await interaction.update({ embeds: [logEmbed], components: [] });
  await interaction.followUp({
    content: isApprove ? `Pengajuan **${formType}** dari **${targetUser.tag}** telah disetujui.` : `Pengajuan **${formType}** dari **${targetUser.tag}** telah ditolak.`,
    flags: MessageFlags.Ephemeral,
  });
};

// --- ACHIEVEMENT CENTER ---

const ACHIEVEMENTS_PER_PAGE = 5;

const achievementsData = {
  limited: {
    name: 'LIMITED',
    description: 'Medal Event Langka',
    accent: 0x9b59b6,
    achievements: [
      { id: 'the-liberators', name: 'The Liberators', desc: 'Complete Ronograd Openworld with a 4-player squad.', requirements: ['4-player squad', 'Complete all objectives'], rules: ['Standard rules apply'], squad: '4 Players', difficulty: '🟣 Elite' },
      { id: 'apex', name: 'Apex', desc: 'Obtain all achievements.', requirements: ['All other achievements completed'], rules: ['N/A'], squad: 'N/A', difficulty: '🟠 Legendary' },
    ],
  },
  bunker: {
    name: 'BUNKER',
    description: 'Misi Tantangan',
    accent: 0xe67e22,
    achievements: [
      { id: 'the-hard-ways', name: 'The Hard Ways', desc: 'Complete Bunker with 1-2 players without any vehicles or utilities.', requirements: ['1-2 players', 'No vehicles', 'No utilities'], squad: '1-2 Players', difficulty: '🔵 Advanced' },
      { id: 'vanguard-4', name: 'Vanguard-4', desc: 'Complete Bunker with 4 players without vehicles or utilities.', requirements: ['4 players', 'No vehicles', 'No utilities'], squad: '4 Players', difficulty: '🔵 Advanced' },
      { id: 'carnage', name: 'Carnage', desc: 'Complete Bunker with 1-2 players using melee, grenades, and cargo-only vehicles.', requirements: ['1-2 players', 'Melee only', 'Grenades only', 'Cargo vehicles only'], squad: '1-2 Players', difficulty: '🟣 Elite' },
      { id: 'juggernaut', name: 'Juggernaut', desc: 'Complete Bunker with 1-2 players using LMG only (M249 / PKM).', requirements: ['1-2 players', 'LMG only (M249/PKM)'], squad: '1-2 Players', difficulty: '🔵 Advanced' },
      { id: 'eco-round', name: 'Eco-Round', desc: 'Complete Bunker with 1-2 players using secondary weapon only.', requirements: ['1-2 players', 'Secondary weapon only'], squad: '1-2 Players', difficulty: '🔵 Advanced' },
    ],
  },
  compounds: {
    name: 'COMPOUNDS',
    description: 'Operasi Taktis',
    accent: 0x2ecc71,
    achievements: [
      { id: 'vector', name: 'Vector', desc: 'Complete Depot solo using SMG only. (1 life)', requirements: ['Solo', 'SMG only', '1 life'], squad: '1 Operator', difficulty: '🔵 Advanced' },
      { id: 'coldsteel', name: 'Coldsteel', desc: 'Complete Depot solo using melee only. (1 life)', requirements: ['Solo', 'Melee only', '1 life'], squad: '1 Operator', difficulty: '🟣 Elite' },
      { id: 'undergunned', name: 'Undergunned', desc: 'Complete Kozlovka solo using secondary weapon only. (1 life)', requirements: ['Solo', 'Secondary weapon only', '1 life'], squad: '1 Operator', difficulty: '🔵 Advanced' },
      { id: 'amen', name: 'Amen', desc: 'Complete Kozlovka with 1-2 players within 13 minutes. (1 life)', requirements: ['1-2 players', 'Complete within 13 minutes', '1 life'], squad: '1-2 Operators', difficulty: '🔵 Advanced' },
      { id: 'mayday', name: 'Mayday', desc: 'Complete Pushkino solo within 5 minutes. (1 life)', requirements: ['Solo', 'Complete within 5 minutes', '1 life'], squad: '1 Operator', difficulty: '🟣 Elite' },
      { id: 'overlook', name: 'Overlook', desc: 'Complete Sochraina City solo within 9 minutes. (1 life)', requirements: ['Solo', 'Complete within 9 minutes', '1 life'], squad: '1 Operator', difficulty: '🔵 Advanced' },
      { id: 'horizon', name: 'Horizon', desc: 'Complete Sochraina City with 2-3 players within 7 minutes. (1 life)', requirements: ['2-3 players', 'Complete within 7 minutes', '1 life'], squad: '2-3 Operators', difficulty: '🟣 Elite' },
      { id: 'lone-miner', name: 'Lone Miner', desc: 'Complete Quarry solo within 10 minutes. (1 life)', requirements: ['Solo', 'Complete within 10 minutes', '1 life'], squad: '1 Operator', difficulty: '🔵 Advanced' },
      { id: 'excavators', name: 'Excavators', desc: 'Complete Quarry with 2-3 players within 7 minutes. (1 life)', requirements: ['2-3 players', 'Complete within 7 minutes', '1 life'], squad: '2-3 Operators', difficulty: '🔵 Advanced' },
      { id: 'sunburn', name: 'Sunburn', desc: 'Complete Lesdolina solo during morning/daytime using stealth. (1 life)', requirements: ['Solo', 'Morning/daytime', 'Stealth only', '1 life'], squad: '1 Operator', difficulty: '🟣 Elite' },
      { id: 'blitz', name: 'Blitz', desc: 'Complete Lesdolina solo within 5 minutes. (1 life)', requirements: ['Solo', 'Complete within 5 minutes', '1 life'], squad: '1 Operator', difficulty: '🟣 Elite' },
      { id: 'under-maintenance', name: 'Under Maintenance', desc: 'Complete DOU (Department of Utilities) with 1-2 players. (1 life)', requirements: ['1-2 players', '1 life'], squad: '1-2 Operators', difficulty: '⚪ Standard' },
      { id: 'antenna-down', name: 'Antenna Down', desc: 'Complete Mountain Radar with a 1-4 player squad. (1 life)', requirements: ['1-4 players', '1 life'], squad: '1-4 Operators', difficulty: '⚪ Standard' },
      { id: 'urban-reaper', name: 'Urban Reaper', desc: 'Complete Ronograd City with a 1-4 player squad using stealth. (1 life)', requirements: ['1-4 players', 'Stealth only', '1 life'], squad: '1-4 Operators', difficulty: '🔵 Advanced' },
      { id: 'deep-blue-phantom', name: 'Deep Blue Phantom', desc: 'Complete Naval Base with 1-2 players using stealth. (1 life)', requirements: ['1-2 players', 'Stealth only', '1 life'], squad: '1-2 Operators', difficulty: '🟣 Elite' },
      { id: 'harbor-sweep', name: 'Harbor Sweep', desc: 'Complete Naval Base with 3-4 player squad. (1 life)', requirements: ['3-4 players', '1 life'], squad: '3-4 Operators', difficulty: '⚪ Standard' },
      { id: 'black-ice', name: 'Black Ice', desc: 'Complete Fort Ronograd with 1-2 players using stealth. (1 life)', requirements: ['1-2 players', 'Stealth only', '1 life'], squad: '1-2 Operators', difficulty: '🟣 Elite' },
      { id: 'frostbite', name: 'Frostbite', desc: 'Complete Fort Ronograd with 3-4 player squad. (1 life)', requirements: ['3-4 players', '1 life'], squad: '3-4 Operators', difficulty: '🔵 Advanced' },
      { id: 'claustrophobic', name: 'Claustrophobic', desc: 'Complete Bunker 4 solo using stealth. (1 life)', requirements: ['Solo', 'Stealth only', '1 life'], squad: '1 Operator', difficulty: '🟣 Elite' },
    ],
  },
};

// --- Hub ---
const renderAchievementHub = () => {
  const container = new ContainerBuilder().setAccentColor(0x1a1a2e);
  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# 🏅 PUSAT ACHIEVEMENT OPERATOR\nSelesaikan misi taktis, buka medal, dan bangun rekam jejak operator.')
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            '**DATABASE TERKLASIFIKASI**\nAkses katalog achievement melalui sesi operator privat.\n\n_Semua sesi browsing bersifat pribadi._'
          )
        )
        .setButtonAccessory(
          new ButtonBuilder().setCustomId('ach_open').setLabel('BUKA PUSAT ACHIEVEMENT').setStyle(ButtonStyle.Primary)
        )
    );
  return container;
};

// --- Ephemeral ---
const buildCategoryNavRow = (catKey, page, totalPages) => {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ach_back_home').setLabel('← KEMBALI').setStyle(ButtonStyle.Secondary)
  );
  if (page > 0) {
    row.addComponents(
      new ButtonBuilder().setCustomId(`ach_page_${catKey}_${page - 1}`).setLabel('◀ SEBELUMNYA').setStyle(ButtonStyle.Primary)
    );
  }
  if (page < totalPages - 1) {
    row.addComponents(
      new ButtonBuilder().setCustomId(`ach_page_${catKey}_${page + 1}`).setLabel('BERIKUTNYA ▶').setStyle(ButtonStyle.Primary)
    );
  }
  return row;
};

const renderAchievementHome = () => {
  const container = new ContainerBuilder().setAccentColor(0x1a1a2e);
  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# 🏅 PUSAT ACHIEVEMENT OPERATOR\nJelajahi semua medal operasi taktis dan catatan achievement.')
    )
    .addSeparatorComponents(new SeparatorBuilder());
  for (const [key, cat] of Object.entries(achievementsData)) {
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**${cat.name}**\n${cat.description}\n**${cat.achievements.length}** Achievement`)
        )
        .setButtonAccessory(
          new ButtonBuilder().setCustomId(`ach_cat_${key}`).setLabel('BUKA KATEGORI').setStyle(ButtonStyle.Secondary)
        )
    );
  }
  container.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ach_close').setLabel('TUTUP SESI').setStyle(ButtonStyle.Danger)
    )
  );
  return container;
};

const renderAchievementCategory = (catKey, page = 0) => {
  const cat = achievementsData[catKey];
  if (!cat) return null;
  const totalPages = Math.ceil(cat.achievements.length / ACHIEVEMENTS_PER_PAGE);
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * ACHIEVEMENTS_PER_PAGE;
  const pageItems = cat.achievements.slice(start, start + ACHIEVEMENTS_PER_PAGE);

  const container = new ContainerBuilder().setAccentColor(cat.accent);
  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🎖 ${cat.name}\n${cat.description}\n━━━━━━━━━━━━━━━━━━━━━━\nHalaman ${safePage + 1}/${totalPages}`)
    )
    .addSeparatorComponents(new SeparatorBuilder());

  for (const ach of pageItems) {
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**${ach.name}**\n${ach.desc}\n🟢 Layak`)
        )
        .setButtonAccessory(
          new ButtonBuilder().setCustomId(`ach_detail_${catKey}_${ach.id}`).setLabel('RINCIAN').setStyle(ButtonStyle.Secondary)
        )
    );
  }

  container.addActionRowComponents(buildCategoryNavRow(catKey, safePage, totalPages));
  return container;
};

const renderAchievementDetail = (catKey, achId) => {
  const cat = achievementsData[catKey];
  if (!cat) return null;
  const ach = cat.achievements.find((a) => a.id === achId);
  if (!ach) return null;

  const reqs = ach.requirements.map((r) => `• ${r}`).join('\n');
  const rules = ach.rules ? ach.rules.map((r) => `• ${r}`).join('\n') : '• Aturan standar berlaku';

  const container = new ContainerBuilder().setAccentColor(cat.accent);
  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `━━━━━━━━━━━━━━━━━━━━━━\n# 🎖 ${ach.name}\n━━━━━━━━━━━━━━━━━━━━━━\n\n**Kategori:** ${cat.name}\n\n**Tujuan:**\n${ach.desc}\n\n**Persyaratan:**\n${reqs}\n\n**Aturan:**\n${rules}\n\n**Kebutuhan Regu:**\n${ach.squad}\n\n**Kesulitan:**\n${ach.difficulty}\n\n**Status:**\n🟢 Layak`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('*Pengajuan bukti melalui sistem request achievement.*')
    );

  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ach_back_cat_${catKey}`).setLabel('← KEMBALI').setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(navRow);
  return container;
};

// --- Post ---
const postOrUpdateAchievementCenter = async (guild) => {
  const channel = getHallOfHonorChannel(guild);
  if (!channel?.isTextBased()) return null;

  let message = null;
  if (achievementCenterMessageData.messageId) {
    try { message = await channel.messages.fetch(achievementCenterMessageData.messageId); }
    catch { message = null; }
  }

  const payload = { components: [renderAchievementHub()], flags: 1 << 15 };

  if (message) {
    try { await message.edit(payload); }
    catch (err) {
      if (err.code === 10008) { message = null; }
      else { throw err; }
    }
  }

  if (!message) {
    message = await channel.send(payload);
    achievementCenterMessageData.messageId = message.id;
    saveJson(achievementCenterMessagePath, achievementCenterMessageData);
  }
  return message;
};

const handleAchievementNav = async (interaction) => {
  const id = interaction.customId;
  const flags = MessageFlags.Ephemeral | (1 << 15);

  if (id === 'ach_open') {
    const panel = renderAchievementHome();
    return interaction.reply({ components: [panel], flags });
  }

  if (id === 'ach_close') {
    const container = new ContainerBuilder().setAccentColor(0x1a1a2e)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# SESI DITUTUP\n\nKembali ke hub publik untuk memulai sesi baru.\n\n_Semua data browsing telah dibersihkan._')
      );
    return interaction.update({ components: [container], flags });
  }

  if (id === 'ach_back_home') {
    const panel = renderAchievementHome();
    return interaction.update({ components: [panel], flags });
  }

  if (id.startsWith('ach_cat_')) {
    const catKey = id.replace('ach_cat_', '');
    const panel = renderAchievementCategory(catKey, 0);
    if (!panel) return interaction.reply({ content: 'Kategori tidak ditemukan.', flags: MessageFlags.Ephemeral });
    return interaction.update({ components: [panel], flags });
  }

  if (id.startsWith('ach_detail_')) {
    const parts = id.split('_');
    const catKey = parts[2];
    const achId = parts.slice(3).join('_');
    const panel = renderAchievementDetail(catKey, achId);
    if (!panel) return interaction.reply({ content: 'Achievement tidak ditemukan.', flags: MessageFlags.Ephemeral });
    return interaction.update({ components: [panel], flags });
  }

  if (id.startsWith('ach_page_')) {
    const parts = id.split('_');
    const catKey = parts[2];
    const page = parseInt(parts[3], 10);
    const panel = renderAchievementCategory(catKey, page);
    if (!panel) return interaction.reply({ content: 'Halaman tidak ditemukan.', flags: MessageFlags.Ephemeral });
    return interaction.update({ components: [panel], flags });
  }

  if (id.startsWith('ach_back_cat_')) {
    const catKey = id.replace('ach_back_cat_', '');
    const panel = renderAchievementCategory(catKey, 0);
    if (!panel) return interaction.reply({ content: 'Kategori tidak ditemukan.', flags: MessageFlags.Ephemeral });
    return interaction.update({ components: [panel], flags });
  }
};

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const commands = [
    {
      name: 'hall-of-honor-post',
      description: 'Post atau update panel Hall of Honor',
    },
    {
      name: 'achievement-center-post',
      description: 'Post atau update Achievement Center',
    },
  ];

  try {
    if (config.guildId) {
      const guild = client.guilds.cache.get(config.guildId) || await client.guilds.fetch(config.guildId);
      if (guild) {
        await guild.commands.set(commands);
        await postOrUpdateHallOfHonorPanel(guild);
        await postOrUpdateAchievementCenter(guild);
      }
    } else {
      await client.application.commands.set(commands);
    }
    console.log('Slash commands registered.');
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'hall-of-honor-post') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Kamu tidak punya izin untuk menggunakan perintah ini.', flags: MessageFlags.Ephemeral });
      }
      const message = await postOrUpdateHallOfHonorPanel(interaction.guild);
      if (!message) return interaction.reply({ content: 'Tidak dapat mengirim panel hall of honor. Periksa config dan izin bot.', flags: MessageFlags.Ephemeral });
      return interaction.reply({ content: 'Panel Hall of Honor telah dikirim atau diperbarui.', flags: MessageFlags.Ephemeral });
    }

    if (interaction.commandName === 'achievement-center-post') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Kamu tidak punya izin untuk menggunakan perintah ini.', flags: MessageFlags.Ephemeral });
      }
      const message = await postOrUpdateAchievementCenter(interaction.guild);
      if (!message) return interaction.reply({ content: 'Tidak dapat mengirim Achievement Center. Periksa config dan izin bot.', flags: MessageFlags.Ephemeral });
      return interaction.reply({ content: 'Achievement Center telah dikirim atau diperbarui.', flags: MessageFlags.Ephemeral });
    }
  }

  if (interaction.isModalSubmit() && ['hall_brevet', 'hall_sertifikat', 'hall_achievement'].includes(interaction.customId)) {
    return submitHallOfHonorForm(interaction);
  }

  if (!interaction.isButton()) return;

  if (['hall_brevet', 'hall_sertifikat', 'hall_achievement'].includes(interaction.customId)) {
    return showHallOfHonorModal(interaction);
  }

  if (interaction.customId.startsWith('approve_') || interaction.customId.startsWith('reject_')) {
    return handleApproveReject(interaction);
  }

  if (interaction.customId.startsWith('ach_')) {
    return handleAchievementNav(interaction);
  }
});

client.login(config.token);
