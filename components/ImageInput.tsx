
import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageInputProps {
  onImageReady: (base64: string, mimeType: string) => void;
  onClear: () => void;
  disabled: boolean;
}

const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CaptureIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6" fill="currentColor"></circle>
    </svg>
);


export const ImageInput: React.FC<ImageInputProps> = ({ onImageReady, onClear, disabled }) => {
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraError("Could not access camera. Please check permissions.");
      setIsCameraOn(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageReady(base64String, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64String = dataUrl.split(',')[1];
        onImageReady(base64String, 'image/jpeg');
        stopCamera();
      }
    }
  };

  const handleModeChange = (newMode: 'upload' | 'camera') => {
    stopCamera();
    onClear();
    setMode(newMode);
    if(newMode === 'camera'){
        startCamera();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-800/50 rounded-lg p-6 border border-gray-700 backdrop-blur-sm">
      <div className="flex justify-center mb-4 border border-gray-700 rounded-lg p-1 bg-gray-900/60">
        <button 
          onClick={() => handleModeChange('upload')}
          disabled={disabled}
          className={`w-1/2 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${mode === 'upload' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
          <UploadIcon className="w-5 h-5"/> Upload Image
        </button>
        <button 
          onClick={() => handleModeChange('camera')}
          disabled={disabled}
          className={`w-1/2 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${mode === 'camera' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
          <CameraIcon className="w-5 h-5"/> Use Camera
        </button>
      </div>

      {mode === 'upload' && (
        <div 
          className="flex justify-center items-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-gray-800 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
            <p className="mt-2 text-sm text-gray-400">
              <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      )}

      {mode === 'camera' && (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
          {cameraError && <p className="text-red-400 text-center px-4">{cameraError}</p>}
          <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`}/>
          {isCameraOn && (
            <button 
              onClick={handleCapture}
              disabled={disabled}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 bg-white/20 text-white rounded-full backdrop-blur-md hover:bg-white/30 transition-colors"
              aria-label="Capture photo"
            >
              <CaptureIcon className="w-8 h-8"/>
            </button>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};
