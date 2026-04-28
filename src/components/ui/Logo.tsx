import Image from "next/image";

type Variant = "blue" | "black" | "white";

const SRC: Record<Variant, string> = {
  blue: "/brand/logo/om-logo-blue.png",
  black: "/brand/logo/om-logo-black.png",
  white: "/brand/logo/om-logo-white.png",
};

export function Logo({
  variant = "blue",
  size = 36,
  className = "",
}: {
  variant?: Variant;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={SRC[variant]}
      alt="OM"
      width={size * 2}
      height={size}
      priority
      className={className}
      style={{ height: size, width: "auto" }}
    />
  );
}
