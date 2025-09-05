import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/ImageUploader';
import { SummaryDisplay } from './components/SummaryDisplay';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { WelcomeSplash } from './components/WelcomeSplash';
import { generateSummaryFromFile, generateLogoImage, generateWelcomeImage } from './services/geminiService';
import type { SummaryData } from './types';

const App: React.FC = () => {
  const [courseFile, setCourseFile] = useState<File | null>(null);
  const [tdFile, setTdFile] = useState<File | null>(null);
  const [coursePreviewUrl, setCoursePreviewUrl] = useState<string | null>(null);
  const [tdPreviewUrl, setTdPreviewUrl] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sequenceNumber, setSequenceNumber] = useState<string>('');
  const [activityNumber, setActivityNumber] = useState<string>('');
  
  const [welcomeImageUrl, setWelcomeImageUrl] = useState<string | null>(null);
  const [isWelcomeImageLoading, setIsWelcomeImageLoading] = useState<boolean>(true);
  const [welcomeImageError, setWelcomeImageError] = useState<string | null>(null);

  useEffect(() => {
    const createLogo = async () => {
      try {
        const url = await generateLogoImage();
        setLogoUrl(url);
      } catch (err) {
        console.error("Failed to generate logo:", err);
      }
    };
    const createWelcomeImage = async () => {
      try {
        const url = await generateWelcomeImage();
        setWelcomeImageUrl(url);
      } catch (err) {
        console.error(err);
        setWelcomeImageError(err instanceof Error ? err.message : 'Failed to load image.');
      } finally {
        setIsWelcomeImageLoading(false);
      }
    };

    createLogo();
    createWelcomeImage();
  }, []);


  const handleFileUpload = useCallback((file: File, type: 'course' | 'td') => {
    if (type === 'course') {
      setCourseFile(file);
      setSummaryData(null);
      setError(null);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoursePreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setCoursePreviewUrl(null);
      }
    } else {
      setTdFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setTdPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setTdPreviewUrl(null);
      }
    }
  }, []);

  const handleGenerateSummary = async () => {
    if (!courseFile) {
      setError('Veuillez d\'abord téléverser un fichier de cours.');
      return;
    }

    setIsLoading(true);
    setSummaryData(null);
    setError(null);

    try {
      const data = await generateSummaryFromFile(courseFile, tdFile);
      setSummaryData(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <Header logoUrl={logoUrl} />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold text-slate-700">1. Uploadez votre cours</h2>
            <FileUploader 
              onFileUpload={(file) => handleFileUpload(file, 'course')}
              previewUrl={coursePreviewUrl}
              uploadedFile={courseFile}
              isLoading={isLoading}
            />
            
            {courseFile && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-slate-700">2. Uploadez votre TD ou activité (Optionnel)</h2>
                 <FileUploader 
                  onFileUpload={(file) => handleFileUpload(file, 'td')}
                  previewUrl={tdPreviewUrl}
                  uploadedFile={tdFile}
                  isLoading={isLoading}
                />
                
                <h2 className="text-2xl font-bold text-slate-700">3. Identifiez l'activité (Optionnel)</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="sequence" className="block text-sm font-medium text-slate-600 mb-1">
                            Séquence
                        </label>
                        <input
                            type="text"
                            id="sequence"
                            value={sequenceNumber}
                            onChange={(e) => setSequenceNumber(e.target.value)}
                            placeholder="Ex: 1"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-lime-500 focus:border-lime-500 transition-colors"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="activity" className="block text-sm font-medium text-slate-600 mb-1">
                            Activité
                        </label>
                        <input
                            type="text"
                            id="activity"
                            value={activityNumber}
                            onChange={(e) => setActivityNumber(e.target.value)}
                            placeholder="Ex: 1"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-lime-500 focus:border-lime-500 transition-colors"
                            disabled={isLoading}
                        />
                    </div>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateSummary}
              disabled={!courseFile || isLoading}
              className="w-full bg-lime-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-lime-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center justify-center text-lg"
            >
              {isLoading ? (
                <>
                  <Loader />
                  Génération en cours...
                </>
              ) : (
                'Générer la fiche de synthèse'
              )}
            </button>
          </div>

          {/* Right Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 min-h-[500px] flex flex-col">
             <h2 className="text-2xl font-bold text-slate-700 mb-4 pb-2 border-b-2 border-lime-200">Votre fiche de synthèse</h2>
            {isLoading && (
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                <Loader size="lg" />
                <p className="text-slate-600 mt-4 text-lg">Analyse de vos documents...</p>
                <p className="text-sm text-slate-500">Cela peut prendre un instant.</p>
              </div>
            )}
            {error && <ErrorMessage message={error} />}
            {summaryData && !isLoading && <SummaryDisplay data={summaryData} logoUrl={logoUrl} sequenceNumber={sequenceNumber} activityNumber={activityNumber} welcomeImageUrl={welcomeImageUrl}/>}
            {!summaryData && !isLoading && !error && <WelcomeSplash imageUrl={welcomeImageUrl} isLoading={isWelcomeImageLoading} error={welcomeImageError} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;