type Variant =
  | "blue-on-white"
  | "white-on-blue"
  | "blue-soft"
  | "white-soft"
  | "band";

const cls: Record<Variant, string> = {
  "blue-on-white": "om-stripes-blue-on-white",
  "white-on-blue": "om-stripes-white-on-blue",
  "blue-soft": "om-stripes-blue-soft",
  "white-soft": "om-stripes-white-soft",
  band: "om-stripes-band",
};

export function Stripes({
  variant,
  className = "",
  style,
}: {
  variant: Variant;
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div aria-hidden className={`${cls[variant]} ${className}`} style={style} />;
}
