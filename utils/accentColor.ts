export function getAccentColor(): number {
  const hex = process.env.ACCENT_COLOR || "#6C0D1B";
  return parseInt(hex.replace("#", ""), 16);
}
