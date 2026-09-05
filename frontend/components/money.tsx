export function Money({ minor }: { minor: number }) {
  const rupees = (minor / 100).toFixed(0);
  return (
    <span className="tabular-nums">
      ₹{parseInt(rupees).toLocaleString("en-IN")}
    </span>
  );
}
