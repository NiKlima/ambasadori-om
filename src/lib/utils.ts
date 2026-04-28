export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const avatarColors = [
  "#4aa7d0",
  "#2e7fa3",
  "#5a8c6b",
  "#e07a5f",
  "#6b7d89",
  "#b08968",
  "#8d99ae",
  "#70a9a1",
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function formatPoints(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-MD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ageFromBirthdate(iso: string | null): number | null {
  if (!iso) return null;
  const b = new Date(iso);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age >= 0 && age < 120 ? age : null;
}

export function pluralRu(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export function socialUrl(kind: string, value: string): string | null {
  const v = value.trim().replace(/^@/, "");
  if (!v) return null;
  if (/^https?:\/\//i.test(value)) return value;
  switch (kind) {
    case "instagram":
      return `https://instagram.com/${v}`;
    case "tiktok":
      return `https://tiktok.com/@${v}`;
    case "telegram":
      return `https://t.me/${v}`;
    case "youtube":
      return `https://youtube.com/@${v}`;
    default:
      return null;
  }
}
