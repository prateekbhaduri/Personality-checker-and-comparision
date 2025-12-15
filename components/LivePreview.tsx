/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { PersonalityResult, CompatibilityResult } from '../services/gemini';
import { ChartBarIcon, HeartIcon } from '@heroicons/react/24/solid';

interface ResultsDashboardProps {
  mode: 'individual' | 'comparison';
  individualResult?: PersonalityResult;
  compatibilityResult?: CompatibilityResult;
  onReset: () => void;
}

const TraitBar = ({ label, score, description, colorClass = "bg-purple-500" }: { label: string, score: number, description?: string, colorClass?: string }) => (
  <div className="mb-6 group">
    <div className="flex justify-between items-end mb-2">
      <span className="font-medium text-zinc-200">{label}</span>
      <span className="font-mono text-xl font-bold text-white">{score}%</span>
    </div>
    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden relative">
      <div 
        className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${score}%` }}
      />
    </div>
    {description && (
      <p className="mt-2 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors leading-relaxed">
        {description}
      </p>
    )}
  </div>
);

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  mode,
  individualResult,
  compatibilityResult,
  onReset
}) => {
  if (mode === 'individual' && individualResult) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Header Result */}
        <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-zinc-800 rounded-full text-xs font-mono text-purple-400 mb-4 border border-zinc-700">
                Archetype Identified
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                {individualResult.archetype}
            </h2>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed border-l-4 border-purple-500 pl-6 italic bg-zinc-900/30 p-4 rounded-r-lg">
                "{individualResult.summary}"
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Traits Column */}
            <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-8">
                    <ChartBarIcon className="w-5 h-5 text-zinc-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Core Traits</h3>
                </div>
                {individualResult.traits.map((trait, i) => (
                    <TraitBar key={i} {...trait} />
                ))}
            </div>

            {/* Detailed Analysis Column */}
            <div className="space-y-6">
                <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl h-full backdrop-blur-sm">
                     <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6">Deep Analysis</h3>
                     <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 leading-relaxed whitespace-pre-line">
                        {individualResult.detailedAnalysis}
                     </div>
                </div>
            </div>
        </div>
        
        <div className="mt-12 text-center">
            <button onClick={onReset} className="text-zinc-500 hover:text-white underline underline-offset-4 transition-colors">
                Analyze Another Person
            </button>
        </div>
      </div>
    );
  }

  if (mode === 'comparison' && compatibilityResult) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
         {/* Compatibility Score Header */}
         <div className="flex flex-col items-center justify-center mb-12">
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                {/* Glowing ring background */}
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" className="stroke-zinc-800 fill-none" strokeWidth="8" />
                    <circle 
                        cx="96" cy="96" r="88" 
                        className="stroke-purple-500 fill-none transition-all duration-1000 ease-out" 
                        strokeWidth="8" 
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - compatibilityResult.compatibilityScore / 100)}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-white">{compatibilityResult.compatibilityScore}%</span>
                    <span className="text-xs uppercase tracking-widest text-zinc-500 mt-2">Match</span>
                </div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center">
                {compatibilityResult.relationshipArchetype}
            </h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
                <div className="flex items-center space-x-2 mb-4 text-green-400">
                    <HeartIcon className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Why it works</h3>
                </div>
                <p className="text-zinc-300 leading-relaxed text-sm">
                    {compatibilityResult.synergyAnalysis}
                </p>
             </div>
             
             <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
                <div className="flex items-center space-x-2 mb-4 text-orange-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <h3 className="font-bold uppercase tracking-wider text-xs">Friction Points</h3>
                </div>
                <p className="text-zinc-300 leading-relaxed text-sm">
                    {compatibilityResult.challenges}
                </p>
             </div>
         </div>

         {/* Dimension Comparison */}
         <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 md:p-8">
            <h3 className="text-center text-sm font-bold uppercase tracking-widest text-zinc-500 mb-8">Dimensional Breakdown</h3>
            <div className="space-y-8">
                {compatibilityResult.dimensions.map((dim, i) => (
                    <div key={i} className="relative">
                        <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                            <span>User A</span>
                            <span className="text-white">{dim.label}</span>
                            <span>User B</span>
                        </div>
                        <div className="h-4 bg-zinc-800 rounded-full relative overflow-hidden flex">
                            {/* Center Marker */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-700 z-10"></div>
                            
                            {/* Left Bar (User 1) - Fills from center to left */}
                            <div className="flex-1 flex justify-end relative">
                                <div 
                                    className="h-full bg-blue-500 opacity-80 rounded-l-full" 
                                    style={{ width: `${dim.scoreUser1}%` }} 
                                />
                            </div>
                            
                            {/* Right Bar (User 2) - Fills from center to right */}
                            <div className="flex-1 flex justify-start relative">
                                <div 
                                    className="h-full bg-pink-500 opacity-80 rounded-r-full" 
                                    style={{ width: `${dim.scoreUser2}%` }} 
                                />
                            </div>
                        </div>
                        <p className="mt-2 text-center text-xs text-zinc-500 italic">
                            {dim.insight}
                        </p>
                    </div>
                ))}
            </div>
            
            <div className="flex justify-center items-center gap-4 mt-8 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div> Person One
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div> Person Two
                </div>
            </div>
         </div>

         <div className="mt-12 text-center">
            <button onClick={onReset} className="text-zinc-500 hover:text-white underline underline-offset-4 transition-colors">
                Check Another Couple
            </button>
        </div>
      </div>
    );
  }

  return null;
};
