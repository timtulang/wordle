interface VerseProgressProps {
  unlockedFragments: string[];
  totalDays: number; // This will be 15
}

export function VerseProgress({ unlockedFragments, totalDays }: VerseProgressProps) {
  // Create an array of exactly 15 slots (or however many totalDays is)
  const slots = Array.from({ length: totalDays });

  return (
    <div className="w-full max-w-lg mb-4 md:mb-6 p-4 md:p-6 bg-white border-4 border-[#064E3B] shadow-[4px_4px_0px_0px_#064E3B] animate-fade-in font-['Inter',_sans-serif]">
      <div className="flex justify-between items-center mb-3 border-b-2 border-[#064E3B] pb-2">
        <h3 className="text-xs font-black text-[#57534E] uppercase tracking-widest">
          The Message
        </h3>
        <span className="text-xs font-bold text-[#FB923C] uppercase tracking-widest">
          {unlockedFragments.length} / {totalDays}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-x-2 gap-y-3 leading-loose">
        {slots.map((_, index) => {
          const word = unlockedFragments[index];
          const isUnlocked = !!word;
          
          // Identify the most recently unlocked word to highlight it
          const isLatest = isUnlocked && index === unlockedFragments.length - 1;

          return (
            <span 
              key={index}
              className={`
                font-['Anton',_sans-serif] text-xl md:text-2xl uppercase tracking-wide px-1 transition-all duration-500
                ${isUnlocked ? 'text-[#064E3B]' : 'text-[#E5E7EB] border-b-4 border-[#E5E7EB]'}
                ${isLatest ? 'bg-[#FB923C] text-[#064E3B] shadow-[2px_2px_0px_0px_#064E3B] -translate-y-1' : ''}
              `}
            >
              {isUnlocked ? word : '???'}
            </span>
          );
        })}
      </div>
    </div>
  );
}