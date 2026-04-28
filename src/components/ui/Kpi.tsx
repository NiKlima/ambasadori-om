type Props = {
  label: string;
  value: React.ReactNode;
  variant?: "default" | "blue" | "ink";
  className?: string;
};

export function Kpi({ label, value, variant = "default", className = "" }: Props) {
  const v = variant === "blue" ? "kpi-blue" : variant === "ink" ? "kpi-ink" : "";
  return (
    <div className={`kpi ${v} ${className}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}
