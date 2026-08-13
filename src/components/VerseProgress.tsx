interface VerseProgressProps {
  unlockedFragments: string[]; // e.g., ["Do", "not", "merely"]
  totalDays: number; // 15
}

export function VerseProgress({ unlockedFragments, totalDays }: VerseProgressProps) {
  // Pad the rest of the verse with blank lines
  const placeholders = Array.from({ length: totalDays - unlockedFragments.length });

  return (
    <div className="w-full max-w-md mx-auto mb-6 p-4 bg-white border-4 border-[#064E3B] shadow-[6px_6px_0px_0px_#064E3B]">
      <h3 className="text-xs font-bold text-[#FB923C] uppercase tracking-widest mb-2">
        James 1:22 — The Bigger Picture
      </h3>
      <div className="flex flex-wrap gap-2 text-[#064E3B] font-medium text-lg leading-relaxed">
        {unlockedFragments.map((word, i) => (
          <span key={`word-${i}`} className="animate-fade-in">{word}</span>
        ))}
        {placeholders.map((_, i) => (
          <span key={`blank-${i}`} className="inline-block w-8 border-b-2 border-gray-300"></span>
        ))}
      </div>
      <div className="mt-3 text-right text-sm font-bold text-gray-400">
        {unlockedFragments.length} / {totalDays} Steps
      </div>
    </div>
  );
}