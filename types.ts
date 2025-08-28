
export interface ResistorBand {
  color: string;
  meaning: string;
}

export interface ResistorAnalysisResult {
  resistance: string;
  tolerance: string;
  bands: ResistorBand[];
  explanation: string;
  error?: string;
}
