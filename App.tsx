/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { Header } from './components/Hero'; // Renamed Hero to Header conceptually
import { ProfileForm } from './components/InputArea'; // Repurposed
import { Questionnaire } from './components/CreationHistory'; // Repurposed
import { ResultsDashboard } from './components/LivePreview'; // Repurposed
import { 
  generateQuestions, 
  analyzePersonality, 
  analyzeCompatibility, 
  Question, 
  PersonalityResult, 
  CompatibilityResult 
} from './services/gemini';

// Initial States
const emptyUser = { name: '', age: '', sex: '' };

const App: React.FC = () => {
  // Navigation State
  const [tab, setTab] = useState<'individual' | 'comparison'>('individual');
  const [step, setStep] = useState<'form' | 'loading_questions' | 'quiz' | 'analyzing' | 'results'>('form');
  
  // Data State
  const [user1, setUser1] = useState(emptyUser);
  const [user2, setUser2] = useState(emptyUser);
  
  // Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [user1Answers, setUser1Answers] = useState<Record<number, number>>({});
  const [user2Answers, setUser2Answers] = useState<Record<number, number>>({});
  
  // Which user is currently taking the quiz?
  const [currentUserForQuiz, setCurrentUserForQuiz] = useState<1 | 2>(1);

  // Results State
  const [individualResult, setIndividualResult] = useState<PersonalityResult | undefined>();
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | undefined>();

  const resetAll = () => {
    setUser1(emptyUser);
    setUser2(emptyUser);
    setQuestions([]);
    setUser1Answers({});
    setUser2Answers({});
    setIndividualResult(undefined);
    setCompatibilityResult(undefined);
    setStep('form');
    setCurrentUserForQuiz(1);
  };

  const handleTabChange = (t: 'individual' | 'comparison') => {
    resetAll();
    setTab(t);
  };

  const startQuiz = async () => {
    setStep('loading_questions');
    try {
      // Generate questions based on User 1. 
      // In comparison mode, we'll use the same set for fairness, or we could generate two sets.
      // For simplicity and comparability, we generate one set tailored to User 1's demographic 
      // but generic enough, or strictly based on User 1.
      // Let's generate tailored questions for User 1 first.
      
      const q = await generateQuestions(user1.name, user1.age, user1.sex);
      setQuestions(q);
      setCurrentUserForQuiz(1);
      setStep('quiz');
    } catch (e) {
      console.error(e);
      alert("Failed to generate questions. Please try again.");
      setStep('form');
    }
  };

  const handleAnswer = (qId: number, val: number) => {
    if (currentUserForQuiz === 1) {
      setUser1Answers(prev => ({ ...prev, [qId]: val }));
    } else {
      setUser2Answers(prev => ({ ...prev, [qId]: val }));
    }
  };

  const handleQuizComplete = async () => {
    if (tab === 'individual') {
      setStep('analyzing');
      try {
        const result = await analyzePersonality(user1.name, user1.age, user1.sex, questions, user1Answers);
        setIndividualResult(result);
        setStep('results');
      } catch (e) {
        console.error(e);
        alert("Analysis failed.");
        setStep('form');
      }
    } else {
      // Comparison Mode Logic
      if (currentUserForQuiz === 1) {
        // Switch to User 2
        // Ideally we should generate questions for User 2 if they are vastly different age?
        // But for comparison validity, same questions are usually better. 
        // Let's stick to the same questions generated initially to allow direct comparison of responses.
        setCurrentUserForQuiz(2);
        window.scrollTo(0,0);
        // We keep step as 'quiz'
      } else {
        // Both done
        setStep('analyzing');
        try {
          const result = await analyzeCompatibility(
            user1, { questions, answers: user1Answers },
            user2, { questions, answers: user2Answers }
          );
          setCompatibilityResult(result);
          setStep('results');
        } catch (e) {
          console.error(e);
          alert("Compatibility Analysis failed.");
          setStep('form');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 bg-dot-grid overflow-x-hidden selection:bg-purple-500/30">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative min-h-screen flex flex-col">
        
        {/* Top Header */}
        <Header />

        {/* Navigation Tabs */}
        {step === 'form' && (
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="bg-zinc-900/80 p-1 rounded-full border border-zinc-800 backdrop-blur-md">
              <button
                onClick={() => handleTabChange('individual')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${tab === 'individual' ? 'bg-zinc-100 text-zinc-900 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Personality Checker
              </button>
              <button
                onClick={() => handleTabChange('comparison')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${tab === 'comparison' ? 'bg-zinc-100 text-zinc-900 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Comparison
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          
          {step === 'form' && (
            <ProfileForm 
              mode={tab}
              user1={user1}
              user2={user2}
              onChangeUser1={(k, v) => setUser1(prev => ({ ...prev, [k]: v }))}
              onChangeUser2={(k, v) => setUser2(prev => ({ ...prev, [k]: v }))}
              onSubmit={startQuiz}
              isLoading={false}
            />
          )}

          {step === 'loading_questions' && (
             <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-8"></div>
                <h2 className="text-xl text-zinc-400 font-light">Consulting AI Psychologist...</h2>
             </div>
          )}

          {step === 'quiz' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
               {tab === 'comparison' && (
                 <div className="text-center mb-6">
                    <span className="bg-zinc-800 text-zinc-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-zinc-700">
                      Answering as: <span className="text-white">{currentUserForQuiz === 1 ? user1.name : user2.name}</span>
                    </span>
                 </div>
               )}
               <Questionnaire
                 questions={questions}
                 answers={currentUserForQuiz === 1 ? user1Answers : user2Answers}
                 onAnswer={handleAnswer}
                 onComplete={handleQuizComplete}
                 userName={currentUserForQuiz === 1 ? user1.name : user2.name}
               />
            </div>
          )}

          {step === 'analyzing' && (
             <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-64 h-2 bg-zinc-800 rounded-full overflow-hidden mb-8">
                   <div className="absolute top-0 left-0 h-full w-1/3 bg-purple-500 animate-[slide_2s_infinite_ease-in-out]"></div>
                </div>
                <h2 className="text-xl text-zinc-300 font-light">
                    {tab === 'individual' ? 'Constructing Personality Profile...' : 'Evaluating Compatibility Dynamics...'}
                </h2>
                <p className="text-zinc-500 mt-2 text-sm">Analyzing traits and patterns</p>
                <style>{`
                  @keyframes slide {
                    0% { left: -33%; width: 33%; }
                    50% { left: 100%; width: 33%; }
                    100% { left: -33%; width: 33%; }
                  }
                `}</style>
             </div>
          )}

          {step === 'results' && (
            <ResultsDashboard
              mode={tab}
              individualResult={individualResult}
              compatibilityResult={compatibilityResult}
              onReset={resetAll}
            />
          )}

        </div>

        {/* Footer */}
        <div className="py-6 text-center text-zinc-700 text-xs">
           AI results are for entertainment and self-reflection. Not a medical diagnosis.
        </div>

      </div>
    </div>
  );
};

export default App;
