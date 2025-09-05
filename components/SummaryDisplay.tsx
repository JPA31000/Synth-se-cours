import React from 'react';
import type { SummaryData } from '../types';
import { Quiz } from './Quiz';

interface SummaryDisplayProps {
  data: SummaryData;
}

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-700 mb-3 flex items-center">
            <span className="mr-2 text-lime-600">{icon}</span>
            {title}
        </h3>
        {children}
    </div>
);


export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ data }) => {
  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-3xl font-extrabold text-lime-800 tracking-tight">{data.title}</h2>

      <Section title="Points Clés" icon={<CheckIcon />}>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          {data.summaryPoints.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </Section>

      <Section title="Concepts & Définitions" icon={<BookOpenIcon />}>
        <div className="space-y-4">
          {data.keyConcepts.map((concept, index) => (
            <div key={index} className="p-4 bg-lime-50 rounded-lg border border-lime-200">
              <h4 className="font-bold text-lime-900">{concept.term}</h4>
              <p className="text-slate-600 mt-1">{concept.definition}</p>
            </div>
          ))}
        </div>
      </Section>
      
      {data.activityFlow && data.activityFlow.length > 0 && (
        <Section title="Déroulement de l'Activité" icon={<ClipboardListIcon />}>
          <ol className="list-decimal list-inside space-y-2 text-slate-600">
            {data.activityFlow.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </Section>
      )}

      <Section title="Testez vos connaissances" icon={<QuestionMarkCircleIcon />}>
        <Quiz questions={data.quiz} />
      </Section>
    </div>
  );
};

// Helper Icon Components
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-5.253-11.494v11.494l5.253-2.626 5.253 2.626V6.253L12 3.627 6.747 6.253z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 18h16" />
    </svg>
);

const QuestionMarkCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ClipboardListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);