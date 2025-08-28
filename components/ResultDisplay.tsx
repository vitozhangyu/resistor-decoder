
import React from 'react';
import type { ResistorAnalysisResult, ResistorBand } from '../types';

interface ResultDisplayProps {
  result: ResistorAnalysisResult;
}

const colorToClassMap: { [key: string]: string } = {
  black: 'bg-black',
  brown: 'bg-amber-800',
  red: 'bg-red-600',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-600',
  blue: 'bg-blue-600',
  violet: 'bg-violet-600',
  purple: 'bg-purple-600',
  grey: 'bg-gray-500',
  gray: 'bg-gray-500',
  white: 'bg-white',
  gold: 'bg-yellow-500',
  silver: 'bg-slate-400',
};

const ResistorBandPill: React.FC<{ band: ResistorBand }> = ({ band }) => {
  const colorClass = colorToClassMap[band.color.toLowerCase()] || 'bg-gray-700';
  return (
    <div className="flex items-center gap-3 bg-gray-800/70 p-3 rounded-lg border border-gray-700">
      <div className={`w-8 h-8 rounded-full ${colorClass} border-2 border-gray-600`}></div>
      <div className="flex-1">
        <p className="font-semibold text-white capitalize">{band.color}</p>
        <p className="text-sm text-gray-400">{band.meaning}</p>
      </div>
    </div>
  );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-gray-800/50 rounded-lg p-6 border border-gray-700 backdrop-blur-sm animate-fade-in">
      <div className="text-center mb-6">
        <p className="text-lg text-gray-400">Resistance Value</p>
        <p className="text-5xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-blue-400">
          {result.resistance}
        </p>
        <p className="mt-1 text-2xl text-gray-300">{result.tolerance}</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-md font-semibold text-gray-300 mb-3">Detected Color Bands</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.bands.map((band, index) => (
              <ResistorBandPill key={index} band={band} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-300 mb-2">AI Explanation</h3>
          <p className="text-sm text-gray-400 bg-gray-900/60 p-4 rounded-lg border border-gray-700">
            {result.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
