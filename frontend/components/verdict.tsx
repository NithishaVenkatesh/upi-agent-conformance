type VerdictType = "ALLOWED" | "REFUSED" | "UNDETERMINED";

const VERDICT_STYLE: Record<VerdictType, { text: string; color: string; bg: string }> = {
  ALLOWED: {
    text: "Allowed",
    color: "text-[--color-pass]",
    bg: "bg-[--color-pass-bg]",
  },
  REFUSED: {
    text: "Refused",
    color: "text-[--color-fail]",
    bg: "bg-[--color-fail-bg]",
  },
  UNDETERMINED: {
    text: "Undetermined",
    color: "text-[--color-undet]",
    bg: "bg-[--color-undet-bg]",
  },
};

export function Verdict({ status }: { status: VerdictType }) {
  const style = VERDICT_STYLE[status];
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-md text-12px font-500 min-h-[32px] ${style.color} ${style.bg}`}
    >
      {style.text}
    </span>
  );
}
