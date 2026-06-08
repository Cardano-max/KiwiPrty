// Indian-rupee formatting from integer paise, without Intl (Hermes-safe).
export function inr(paise: number): string {
  const rupees = Math.round((paise ?? 0) / 100);
  const s = String(Math.abs(rupees));
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3 : last3;
  return `${rupees < 0 ? "-" : ""}₹${grouped}`;
}
