import React, { useState, useEffect } from 'react';
import { generateWelcomeImage } from '../services/geminiService';

// Fallback component in case image generation fails
const FallbackSplash: React.FC = () => (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <div className="bg-lime-100 p-6 rounded-full mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.455L12.5 18l1.178-.398a3.375 3.375 0 002.455-2.455l.398-1.178.398 1.178a3.375 3.375 0 002.455 2.455l1.178.398-1.178.398a3.375 3.375 0 00-2.455 2.455z" />
            </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-700">Prêt(e) à réviser ?</h3>
        <p className="text-slate-500 mt-2 max-w-md">
            Uploadez votre cours (et un TD si vous le souhaitez), et laissez l'IA créer une fiche de synthèse structurée avec les concepts clés et un quiz pour booster votre apprentissage.
        </p>
    </div>
);

export const WelcomeSplash: React.FC = () => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const createImage = async () => {
            try {
                const url = await generateWelcomeImage();
                setImageUrl(url);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : 'Failed to load image.');
            } finally {
                setIsLoading(false);
            }
        };

        createImage();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                 <svg className="animate-spin h-12 w-12 text-lime-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-600 mt-4 text-lg">Création de votre illustration de bienvenue...</p>
            </div>
        );
    }

    if (error || !imageUrl) {
        return <FallbackSplash />;
    }

    return (
        <div className="flex-grow flex flex-col items-center justify-center w-full h-full animate-fade-in">
            <img 
                src={imageUrl} 
                alt="Illustration d'un étudiant en train de réviser" 
                className="w-full h-auto max-h-[450px] object-contain rounded-lg" 
            />
        </div>
    );
};