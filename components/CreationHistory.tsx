/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Question } from '../services/gemini';

interface QuestionnaireProps {
  questions: Question[];
  answers: Record<number, number>;
  onAnswer: (questionId: number, value: number) => void;
  onComplete: () => void;
  userName: string;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({
  questions,
  answers,
  onAnswer,
  onComplete,
  userName
}) => {
  // Find the first unanswered question index
  const firstUnansweredIndex = questions.findIndex(q => !answers[q.id]);
  // If all answered, show review or complete. For simplicity, if all answered, we are ready.
  // We'll track current index in local state to allow going back if needed, but default to first unanswered.
  const [currentIndex, setCurrentIndex] = React.useState(firstUnansweredIndex === -1 ? 0 : firstUnansweredIndex);

  React.useEffect(() => {
    // Auto advance when answered
    if (answers[questions[currentIndex]?.id]) {
       const next = currentIndex + 1;
       if (next < questions.length) {
         const timer = setTimeout(() => setCurrentIndex(next), 250); // slight delay for visual feedback
         return () => clearTimeout(timer);
       }
    }
  }, [answers, currentIndex, questions]);

  const progress = ((Object.keys(answers).length) / questions.length) * 100;
  const currentQ = questions[currentIndex];
  const isComplete = Object.keys(answers).length === questions.length;

  const options = [
    { value: 1, label: "Strongly Disagree", color: "bg-red-500" },
    { value: 2, label: "Disagree", color: "bg-orange-500" },
    { value: 3, label: "Neutral", color: "bg-zinc-500" },
    { value: 4, label: "Agree", color: "bg-blue-500" },
    { value: 5, label: "Strongly Agree", color: "bg-green-500" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-zinc-500 mb-2 uppercase tracking-wider font-mono">
          <span>Assessment for {userName}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 md:p-12 min-h-[400px] flex flex-col justify-center relative overflow-hidden transition-all duration-300">
        
        <div className="absolute top-6 left-8 text-zinc-600 font-mono text-sm">
          {currentIndex + 1} / {questions.length}
        </div>

        <h2 className="text-2xl md:text-3xl font-light text-center mb-12 text-zinc-100 leading-snug">
          {currentQ.text}
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
           {options.map((opt) => {
             const isSelected = answers[currentQ.id] === opt.value;
             return (
               <button
                 key={opt.value}
                 onClick={() => {
                   onAnswer(currentQ.id, opt.value);
                   // Manual advance logic is handled by effect, but click sets state
                 }}
                 className={`
                    w-full sm:w-auto flex-1 py-3 sm:py-4 px-2 rounded-lg border transition-all duration-200
                    flex flex-col items-center justify-center gap-2 group
                    ${isSelected 
                      ? 'bg-zinc-800 border-zinc-500 scale-105 z-10' 
                      : 'bg-zinc-950/50 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600'}
                 `}
               >
                 <div className={`w-3 h-3 rounded-full ${opt.color} ${isSelected ? 'opacity-100 ring-4 ring-white/10' : 'opacity-40 group-hover:opacity-100'}`} />
                 <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                    {opt.label}
                 </span>
               </button>
             );
           })}
        </div>

        {/* Navigation for manual control if needed */}
        <div className="absolute bottom-6 w-full left-0 px-8 flex justify-between pointer-events-none">
           <button 
             onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
             disabled={currentIndex === 0}
             className="pointer-events-auto text-zinc-600 hover:text-white disabled:opacity-0 transition-colors"
           >
             ← Back
           </button>
           
           {isComplete && (
             <button
                onClick={onComplete}
                className="pointer-events-auto bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors shadow-lg animate-pulse"
             >
                See Results →
             </button>
           )}
        </div>
      </div>
    </div>
  );
};
