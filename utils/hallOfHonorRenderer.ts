import {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} from "@discordjs/builders";
import { ButtonBuilder, ButtonStyle } from "discord.js";

export function createHallOfHonorPanel(bannerUrl?: string) {
  const container = new ContainerBuilder();

  if (bannerUrl) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(bannerUrl),
      ),
    );
  }

  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "# KOPASSUS Hall Of Honor\nSelamat datang di **Hall Of Honor** KOPASSUS BRM5.\nDi sini Anda bisa mengajukan Sertifikasi, Brevet dan juga Achievement sesuai dengan sertifikasi yang anda dapatkan dari STAFF.",
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Gunakan tombol **Brevet** untuk mengajukan Brevet",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId("hall_brevet")
            .setLabel("BREVET")
            .setStyle(ButtonStyle.Primary),
        ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Gunakan tombol **Sertifikat** untuk mengajukan Sertifikasi",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId("hall_sertifikat")
            .setLabel("SERTIFIKAT")
            .setStyle(ButtonStyle.Primary),
        ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Gunakan tombol **Achievement** untuk mengajukan Achievement",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId("hall_achievement")
            .setLabel("ACHIEVEMENT")
            .setStyle(ButtonStyle.Primary),
        ),
    );

  return container;
}
