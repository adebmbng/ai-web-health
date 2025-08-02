import { useState } from 'react';
import { Camera, Zap, AlertCircle } from 'lucide-react';
import { CameraView } from './components/CameraView';
import { FoodResult } from './components/FoodResult';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Button } from './components/ui/Button';
import { useFoodDetection } from './hooks/useFoodDetection';
import { validateEnvVars, supportsCameraAPI } from './utils/common';
import type { CapturedImage } from './types/camera';

function App() {
  const [showResult, setShowResult] = useState(false);

  const {
    detectionState,
    analyzeImage,
    clearResult,
    clearError
  } = useFoodDetection();

  // Check environment and browser support
  const envValidation = validateEnvVars();
  const cameraSupported = supportsCameraAPI();

  const handleImageCapture = async (image: CapturedImage) => {
    // Start analysis immediately
    const result = await analyzeImage(image);

    if (result) {
      setShowResult(true);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    clearResult();
  };

  const handleNewAnalysis = () => {
    setShowResult(false);
    clearResult();
  };

  // Environment validation error
  if (!envValidation.isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Configuration Error
          </h2>
          <p className="text-gray-600 mb-4">
            Missing required environment variables:
          </p>
          <ul className="text-sm text-red-600 mb-4">
            {envValidation.missing.map(key => (
              <li key={key}>• {key}</li>
            ))}
          </ul>
          <p className="text-xs text-gray-500">
            Please check your .env file and restart the application.
          </p>
        </div>
      </div>
    );
  }

  // Camera not supported
  if (!cameraSupported) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Camera Not Supported
          </h2>
          <p className="text-gray-600 mb-4">
            Your browser doesn't support camera access. Please use a compatible browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  AI Food Detection
                </h1>
                <p className="text-xs text-gray-500">
                  Check processing levels, preservatives & sugar for kids
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-500">
                v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          {/* Instructions */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Comprehensive Food Analysis
            </h2>
            <p className="text-gray-600 text-sm">
              Analyze processing levels, preservatives, and sugar content for children (4-6 years old)
            </p>
          </div>

          {/* Camera View */}
          <div className="relative">
            <div className="aspect-[4/3] mb-4">
              <CameraView
                onCapture={handleImageCapture}
                isCapturing={detectionState.isDetecting}
                className="w-full h-full"
              />
            </div>

            {/* Detection Status */}
            {detectionState.isDetecting && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <LoadingSpinner size="lg" className="text-white mb-3" />
                  <p className="text-lg font-medium">Analyzing Food...</p>
                  <p className="text-sm opacity-75">This may take a few seconds</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {detectionState.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Analysis Failed
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {detectionState.error}
                  </p>
                  <Button
                    onClick={clearError}
                    size="sm"
                    variant="outline"
                    className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-8 space-y-4">
            {/* NOVA Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">NOVA Food Processing</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl mb-1">🥬</div>
                  <h4 className="font-medium text-gray-900 text-xs">Unprocessed</h4>
                  <p className="text-xs text-gray-600 mt-1">Fresh, natural foods</p>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl mb-1">🥫</div>
                  <h4 className="font-medium text-gray-900 text-xs">Minimally Processed</h4>
                  <p className="text-xs text-gray-600 mt-1">Basic preservation</p>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl mb-1">🧀</div>
                  <h4 className="font-medium text-gray-900 text-xs">Processed</h4>
                  <p className="text-xs text-gray-600 mt-1">Added ingredients</p>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl mb-1">🍟</div>
                  <h4 className="font-medium text-gray-900 text-xs">Ultra-Processed</h4>
                  <p className="text-xs text-gray-600 mt-1">Many additives (UPF)</p>
                </div>
              </div>
            </div>

            {/* New Analysis Features */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Analysis</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl mb-1">🛡️</div>
                  <h4 className="font-medium text-gray-900 text-xs">Preservatives</h4>
                  <p className="text-xs text-gray-600 mt-1">Risk level detection</p>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl mb-1">🍭</div>
                  <h4 className="font-medium text-gray-900 text-xs">Sugar Content</h4>
                  <p className="text-xs text-gray-600 mt-1">% of daily limit (4-6yo)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>NOVA classification + preservative & sugar analysis</p>
            <p className="mt-1">
              Helping families make informed food choices - Created by Ade Bambang Kurnia
            </p>
            <p className="mt-1">
              <a
                href="https://www.linkedin.com/in/adebmbng/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Connect on LinkedIn
              </a>
              {' • '}
              Powered by OpenRouter • Built with React & TypeScript
            </p>
          </div>
        </div>
      </main>

      {/* Result Modal */}
      {showResult && detectionState.result && (
        <FoodResult
          result={detectionState.result}
          onClose={handleCloseResult}
          onNewAnalysis={handleNewAnalysis}
          processingTime={detectionState.processingTime ?? undefined}
        />
      )}
    </div>
  );
}

export default App;
