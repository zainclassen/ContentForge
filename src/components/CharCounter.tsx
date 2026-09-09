type CharCounterProps = {
  text: string;
  limits?: { platform: string; limit: number }[];
};

const DEFAULT_LIMITS = [
  { platform: 'X (Twitter)', limit: 280 },
  { platform: 'Instagram', limit: 2200 },
  { platform: 'LinkedIn', limit: 3000 },
  { platform: 'Facebook', limit: 63206 },
];

export function CharCounter({ text, limits = DEFAULT_LIMITS }: CharCounterProps) {
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
      <span className="text-xs text-neutral-400">
        {wordCount} words · {charCount} characters
      </span>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {limits.map((l) => {
          const pct = Math.min(100, (charCount / l.limit) * 100);
          const isOver = charCount > l.limit;
          const isNear = pct >= 80 && !isOver;
          const barColor = isOver ? 'bg-red-500' : isNear ? 'bg-amber-400' : 'bg-neutral-300';
          const textColor = isOver ? 'text-red-600' : isNear ? 'text-amber-600' : 'text-neutral-400';
          return (
            <div key={l.platform} className="flex items-center gap-1.5">
              <span className={`text-xs ${textColor}`}>{l.platform}</span>
              <div className="w-16 h-1 rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-xs tabular-nums ${textColor}`}>
                {charCount}/{l.limit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
