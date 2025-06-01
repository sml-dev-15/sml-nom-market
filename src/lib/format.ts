export function formatNumber(value: number | string): string {
  const number = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(number)) return String(value);

  return number.toLocaleString("en-US", {
    minimumFractionDigits: number < 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export function formatGold(value: number | string): string {
  const number = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(number)) return String(value);

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
