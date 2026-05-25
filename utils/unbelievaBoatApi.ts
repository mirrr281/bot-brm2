export async function getUserBalance(userId: string): Promise<number> {
  const res = await fetch(
    `${process.env.UNBELIEVABOAT_URL}/guilds/${process.env.GUILD_ID}/users/${userId}`,
    { headers: { Authorization: `${process.env.UNBELIEVABOAT_TOKEN}` } },
  );
  if (!res.ok) throw new Error(`Failed to fetch balance: ${res.statusText}`);
  const { cash } = await res.json();
  return cash;
}

export async function updateUserBalance(
  userId: string,
  amount: number,
  reason: string,
): Promise<void> {
  const res = await fetch(
    `${process.env.UNBELIEVABOAT_URL}/guilds/${process.env.GUILD_ID}/users/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${process.env.UNBELIEVABOAT_TOKEN}`,
      },
      body: JSON.stringify({ cash: amount, reason }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Failed to update balance: ${res.status} ${res.statusText} — ${body}`,
    );
  }
}
