import { avatarColor, initials } from "@/lib/utils";

type Props = {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-20 h-20 text-lg",
  xl: "w-32 h-32 text-3xl",
};

export function Avatar({ name, photoUrl, size = "md", className = "" }: Props) {
  const sz = sizes[size];
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={`rounded-full object-cover ${sz} ${className}`}
      />
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${sz} ${className}`}
      style={{ backgroundColor: avatarColor(name) }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
