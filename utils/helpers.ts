import { Client, Guild, GuildMember, TextChannel } from "discord.js";

export async function sendDM(
  client: Client,
  userId: string,
  content: string,
): Promise<void> {
  try {
    const user = await client.users.fetch(userId);
    await user.send(content);
  } catch {
    console.warn(`[sendDM] Could not DM user ${userId}`);
  }
}

export async function logToChannel(
  client: Client,
  channelId: string,
  content: string,
): Promise<void> {
  try {
    const channel = await client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      await (channel as TextChannel).send(content);
    }
  } catch (err) {
    console.error(`[logToChannel] Failed to send to ${channelId}:`, err);
  }
}

export async function fetchMember(
  guild: Guild,
  userId: string,
): Promise<GuildMember | null> {
  return (
    guild.members.cache.get(userId) ??
    (await guild.members.fetch(userId).catch(() => null))
  );
}

export function hasRole(
  member: GuildMember | null | undefined,
  roleId: string,
) {
  return member?.roles.cache.has(roleId) ?? false;
}
