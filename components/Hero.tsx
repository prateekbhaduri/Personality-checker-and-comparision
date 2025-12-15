/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';

export const Header: React.FC = () => {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="inline-flex items-center justify-center p-2 mb-4 bg-zinc-800/50 rounded-full border border-zinc-700/50 backdrop-blur-sm">
        <SparklesIcon className="w-4 h-4 text-purple-400 mr-2" />
        <span className="text-xs font-medium text-zinc-300 uppercase tracking-widest">AI Powered Psychology</span>
      </div>
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 mb-4">
        Personality Checker
      </h1>
      <p className="text-zinc-400 max-w-lg mx-auto text-lg font-light">
        Discover your true self or evaluate compatibility with others through our advanced AI analysis engine.
      </p>
    </div>
  );
};
