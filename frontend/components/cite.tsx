export function Cite({
  circular,
  clause,
}: {
  circular: string;
  clause: string;
}) {
  return (
    <div className="flex items-baseline gap-2 font-[--font-mono] text-13px text-[--color-ink-2]">
      <span>{circular}</span>
      <span>{clause}</span>
    </div>
  );
}
