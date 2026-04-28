export function ProgressBar({
  value,
  onBlue = false,
  className = "",
}: {
  value: number;
  onBlue?: boolean;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`bar ${onBlue ? "bar-on-blue" : ""} ${className}`}>
      <i style={{ width: `${v}%` }} />
    </div>
  );
}
