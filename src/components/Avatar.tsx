import { initials } from "@/lib/utils";

type Props = {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "blue" | "ink";
  className?: string;
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  sm: "w-8 h-8 text-[11px]",
  md: "w-11 h-11 text-sm",
  lg: "w-[72px] h-[72px] text-[22px]",
  xl: "w-32 h-32 text-3xl",
};

export function Avatar({
  name,
  photoUrl,
  size = "md",
  variant = "default",
  className = "",
}: Props) {
  const sz = sizes[size];
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={`object-cover ${sz} ${className}`}
        style={{ border: "1px solid var(--border)" }}
      />
    );
  }
  const variantClass =
    variant === "blue" ? "av-blue" : variant === "ink" ? "av-ink" : "";
  return (
    <div
      className={`av ${variantClass} ${sz} ${className}`}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
