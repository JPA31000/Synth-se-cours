import React from 'react';

interface HeaderProps {
  logoUrl: string | null;
}

export const Header: React.FC<HeaderProps> = ({ logoUrl }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
           {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded-full" />
          ) : (
            <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Synthèse de Cours <span className="text-lime-600">AI</span>
          </h1>
        </div>
      </div>
    </header>
  );
};