// Money is always stored and computed in integer PAISE. Never use floats for money math.

/** Format paise as an Indian-grouped rupee string, e.g. 123456 -> "₹1,234.56". */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  const hasFraction = paise % 100 !== 0;
  const s = rupees.toLocaleString("en-IN", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `₹${s}`;
}

export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);
export const paiseToRupees = (paise: number): number => paise / 100;
