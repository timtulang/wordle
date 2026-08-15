// src/components/InstructionModal.tsx
import { useState } from 'react';

interface InstructionModalProps {
  onClose: () => void;
}

export function InstructionModal({ onClose }: InstructionModalProps) {
  const [dontShow, setDontShow] = useState(false);

  const handleClose = () => {
    if (dontShow) {
      // Save their preference so we don't bother them again tomorrow
      localStorage.setItem('hideInstructions', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#E5E7EB]/90 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 bg-white border-4 border-[#064E3B] shadow-[8px_8px_0px_0px_#064E3B] font-['Inter',_sans-serif]">
        
        <h2 className="font-['Anton',_sans-serif] text-4xl text-[#064E3B] uppercase mb-4 leading-none">
          How To Play
        </h2>
        
        <div className="space-y-4 text-sm font-medium text-[#57534E] mb-6 leading-relaxed">
          <p>Guess the daily word in 6 tries to unlock a piece of the hidden message.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Each guess must be a valid 5-letter word.</li>
            <li>The color of the tiles will change to show how close your guess was to the word.</li>
          </ul>
          
          {/* Visual Examples */}
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t-2 border-[#064E3B] shrink-0">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-[#4ADE80] border-2 border-[#4ADE80] text-[#064E3B] flex items-center justify-center font-bold text-xl shrink-0">W</div>
              <span>Correct letter, correct spot.</span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-[#EAB308] border-2 border-[#EAB308] text-[#064E3B] flex items-center justify-center font-bold text-xl shrink-0">O</div>
              <span>Correct letter, wrong spot.</span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-[#57534E] border-2 border-[#57534E] text-white flex items-center justify-center font-bold text-xl shrink-0">R</div>
              <span>Letter not in the word.</span>
            </div>
          </div>
        </div>

        {/* Checkbox Area */}
        <div 
          className="flex items-center gap-3 mb-6 cursor-pointer group" 
          onClick={() => setDontShow(!dontShow)}
        >
          <div className={`w-6 h-6 border-2 border-[#064E3B] flex items-center justify-center transition-colors shadow-[2px_2px_0px_0px_#064E3B] ${dontShow ? 'bg-[#064E3B]' : 'bg-white'}`}>
            {dontShow && <span className="text-white font-bold text-lg leading-none">✓</span>}
          </div>
          <span className="text-sm font-bold text-[#064E3B] uppercase tracking-wider select-none group-hover:text-[#FB923C] transition-colors">
            Don't show this again
          </span>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleClose}
          className="w-full py-3 bg-[#FB923C] text-[#064E3B] font-['Anton',_sans-serif] text-2xl uppercase tracking-wider border-4 border-[#064E3B] shadow-[4px_4px_0px_0px_#064E3B] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
        >
          START PLAYING
        </button>
      </div>
    </div>
  );
}