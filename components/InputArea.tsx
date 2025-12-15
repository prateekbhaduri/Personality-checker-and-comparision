/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

interface UserProfile {
  name: string;
  age: string;
  sex: string;
}

interface ProfileFormProps {
  mode: 'individual' | 'comparison';
  user1: UserProfile;
  user2: UserProfile;
  onChangeUser1: (key: keyof UserProfile, value: string) => void;
  onChangeUser2: (key: keyof UserProfile, value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const UserInputs = ({ 
  label, 
  data, 
  onChange 
}: { 
  label: string; 
  data: UserProfile; 
  onChange: (k: keyof UserProfile, v: string) => void;
}) => (
  <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
    <div className="flex items-center mb-4 text-zinc-400">
      <UserIcon className="w-5 h-5 mr-2" />
      <h3 className="text-sm font-semibold uppercase tracking-wider">{label}</h3>
    </div>
    
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Full Name</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g. Alex Doe"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-zinc-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Age</label>
          <input
            type="number"
            value={data.age}
            onChange={(e) => onChange('age', e.target.value)}
            placeholder="25"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-zinc-700"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Sex</label>
          <select
            value={data.sex}
            onChange={(e) => onChange('sex', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all appearance-none"
          >
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

export const ProfileForm: React.FC<ProfileFormProps> = ({
  mode,
  user1,
  user2,
  onChangeUser1,
  onChangeUser2,
  onSubmit,
  isLoading
}) => {
  const isValid = (u: UserProfile) => u.name.trim().length > 0 && u.age.length > 0 && u.sex.length > 0;
  const canSubmit = mode === 'individual' ? isValid(user1) : (isValid(user1) && isValid(user2));

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`grid gap-6 ${mode === 'comparison' ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
        <UserInputs 
          label={mode === 'comparison' ? "Person One" : "Your Profile"} 
          data={user1} 
          onChange={onChangeUser1} 
        />
        
        {mode === 'comparison' && (
          <UserInputs 
            label="Person Two" 
            data={user2} 
            onChange={onChangeUser2} 
          />
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onSubmit}
          disabled={!canSubmit || isLoading}
          className={`
            relative px-8 py-4 rounded-full font-bold text-sm tracking-wide uppercase transition-all duration-300
            ${canSubmit && !isLoading
              ? 'bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}
          `}
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mr-2"></span>
              Generating Assessment...
            </span>
          ) : (
            <span>Start Analysis</span>
          )}
        </button>
      </div>
    </div>
  );
};
