
import React, { useState, useCallback } from 'react';
import { ImageInput } from './components/ImageInput';
import { ResultDisplay } from './components/ResultDisplay';
import { analyzeResistorImage } from './services/geminiService';
import type { ResistorAnalysisResult } from './types';

const Spinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-4 text-center">
    <div className="w-12 h-12 border-4 border-t-indigo-500 border-gray-700 rounded-full animate-spin"></div>
    <p className="text-gray-400 font-medium">AI is analyzing the image...</p>
    <p className="text-sm text-gray-500">This may take a few moments.</p>
  </div>
);

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
        <line x1="6" y1="7" x2="6" y2="17"></line>
        <line x1="10" y1="7" x2="10" y2="17"></line>
        <line x1="14" y1="7" x2="14" y2="17"></line>
        <line x1="18" y1="7" x2="18" y2="17"></line>
    </svg>
);


export default function App() {
  const [image, setImage] = useState<{ base64: string; mimeType: string; dataUrl: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResistorAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearState = () => {
    setImage(null);
    setAnalysisResult(null);
    setError(null);
  };
  
  const handleImageReady = useCallback((base64: string, mimeType: string) => {
    clearState();
    const dataUrl = `data:${mimeType};base64,${base64}`;
    setImage({ base64, mimeType, dataUrl });
  }, []);

  const handleAnalyze = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeResistorImage(image.base64, image.mimeType);
      if (result.error && result.error.trim() !== "") {
        setError(result.error);
      } else if (!result.resistance || result.resistance.trim() === "") {
        setError("Could not determine resistance. The image might be unclear or doesn't contain a standard resistor.");
      }
      else {
        setAnalysisResult(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900/30"></div>
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 z-10">
        <header className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
                <LogoIcon className="w-10 h-10 text-indigo-400"/>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400">
                    Resistor ID
                </h1>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl">
                Upload or snap a photo of a resistor, and let AI decode its color bands to find the resistance value instantly.
            </p>
        </header>

        {!analysisResult && !isLoading && (
            <ImageInput onImageReady={handleImageReady} onClear={clearState} disabled={isLoading} />
        )}
        
        {image && (
          <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6">
            <div className="w-full relative">
                <img src={image.dataUrl} alt="Selected Resistor" className="rounded-xl shadow-lg border-2 border-gray-700 w-full h-auto object-contain max-h-80" />
                <button onClick={clearState} className="absolute -top-3 -right-3 bg-gray-700 hover:bg-red-500 text-white rounded-full p-2" aria-label="Clear image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
                </button>
            </div>
            
            {!analysisResult && !isLoading && (
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
              >
                Analyze Resistor
              </button>
            )}
          </div>
        )}

        <div className="w-full max-w-lg mx-auto min-h-[150px] flex items-center justify-center">
            {isLoading && <Spinner />}
            {error && !isLoading && (
              <div className="text-center bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg w-full">
                <h3 className="font-bold text-lg mb-1">Analysis Failed</h3>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {analysisResult && !isLoading && <ResultDisplay result={analysisResult} />}
        </div>
      </main>
    </div>
  );
}
