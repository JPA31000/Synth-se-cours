import React, { useState, useRef, useEffect } from 'react';
import type { SummaryData } from '../types';
import { Quiz } from './Quiz';

interface SummaryDisplayProps {
  data: SummaryData;
  logoUrl: string | null;
  sequenceNumber: string;
  activityNumber: string;
  welcomeImageUrl: string | null;
}

const generateExportHtml = (data: SummaryData, logoUrl: string | null, sequenceNumber: string, activityNumber: string, welcomeImageUrl: string | null): string => {
  const styles = `
    <style>
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page-break { page-break-before: always; }
        #quiz-controls, .accordion-header { display: none; }
        .accordion-panel { max-height: none !important; }
      }
      .quiz-option {
        cursor: pointer;
        padding: 0.75rem;
        border: 2px solid #e2e8f0; /* slate-200 */
        border-radius: 0.5rem;
        transition: all 0.2s ease-in-out;
      }
      .quiz-option:hover {
        border-color: #a3e635; /* lime-400 */
      }
      .quiz-option.selected {
        background-color: #d9f99d; /* lime-200 */
        border-color: #84cc16; /* lime-500 */
        font-weight: bold;
      }
      .quiz-option.correct {
        background-color: #dcfce7; /* green-100 */
        border-color: #22c55e; /* green-500 */
      }
      .quiz-option.incorrect {
        background-color: #fee2e2; /* red-100 */
        border-color: #ef4444; /* red-500 */
      }
      .quiz-btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background-color: #84cc16; /* lime-500 */
        color: white;
        font-weight: bold;
        border-radius: 0.5rem;
        cursor: pointer;
        margin-top: 1.5rem;
        border: none;
        transition: background-color 0.2s;
      }
      .quiz-btn:hover {
        background-color: #65a30d; /* lime-600 */
      }
      #reset-quiz-btn {
        background-color: #a855f7; /* fuchsia-500 */
      }
      #reset-quiz-btn:hover {
         background-color: #9333ea; /* fuchsia-600 */
      }
      .hidden {
        display: none;
      }
      #score {
        font-size: 1.5rem;
        font-weight: bold;
        margin-top: 1rem;
        padding: 1rem;
        background-color: #f1f5f9; /* slate-100 */
        border-radius: 0.5rem;
        text-align: center;
      }
      .accordion-header {
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.2s;
        padding: 0.5rem 0.25rem;
        border-radius: 0.25rem;
      }
      .accordion-header:hover {
        background-color: #f1f5f9; /* slate-100 */
      }
      .accordion-panel {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-in-out;
      }
    </style>
  `;

  const script = `
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        // Accordion logic
        const accordions = document.querySelectorAll('.accordion-header');
        accordions.forEach(acc => {
          acc.addEventListener('click', function() {
            this.classList.toggle('active');
            const icon = this.querySelector('.accordion-icon');
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
              panel.style.maxHeight = null;
              if(icon) icon.textContent = '+';
            } else {
              panel.style.maxHeight = panel.scrollHeight + 'px';
              if(icon) icon.textContent = '−';
            }
          });
        });

        // Open the first accordion by default
        if (accordions.length > 0) {
          setTimeout(() => accordions[0].click(), 100);
        }

        // Quiz logic
        const quizContainer = document.getElementById('quiz-container');
        const submitBtn = document.getElementById('submit-quiz-btn');
        const resetBtn = document.getElementById('reset-quiz-btn');
        const resultsContainer = document.getElementById('quiz-results');
        const scoreEl = document.getElementById('score');
        let isSubmitted = false;

        quizContainer.addEventListener('click', (e) => {
          if (isSubmitted) return;
          const target = e.target.closest('.quiz-option');
          if (target) {
            const optionsContainer = target.parentElement;
            optionsContainer.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            target.classList.add('selected');
          }
        });

        submitBtn.addEventListener('click', () => {
          isSubmitted = true;
          let score = 0;
          const questions = quizContainer.querySelectorAll('.quiz-question');
          
          questions.forEach(question => {
            const correctAnswer = decodeURIComponent(question.dataset.correctAnswer);
            const selectedOption = question.querySelector('.quiz-option.selected');
            const options = question.querySelectorAll('.quiz-option');

            if (selectedOption) {
              if (selectedOption.textContent.trim() === correctAnswer.trim()) {
                score++;
                selectedOption.classList.add('correct');
              } else {
                selectedOption.classList.add('incorrect');
                options.forEach(opt => {
                  if (opt.textContent.trim() === correctAnswer.trim()) {
                    opt.classList.add('correct');
                  }
                });
              }
            } else {
               options.forEach(opt => {
                  if (opt.textContent.trim() === correctAnswer.trim()) {
                    opt.classList.add('correct');
                  }
                });
            }
          });

          scoreEl.textContent = 'Votre score : ' + score + ' / ' + questions.length;
          resultsContainer.classList.remove('hidden');
          submitBtn.classList.add('hidden');
          resetBtn.classList.remove('hidden');
        });

        resetBtn.addEventListener('click', () => {
          isSubmitted = false;
          resultsContainer.classList.add('hidden');
          submitBtn.classList.remove('hidden');
          resetBtn.classList.add('hidden');
          
          quizContainer.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
          });
        });
      });
    <\/script>
  `;

  const listItems = (items: string[]) => items.map(item => `<li class="mb-1">${item}</li>`).join('');

  const conceptItems = (concepts: {term: string, definition: string}[]) => concepts.map(c => `
    <div class="p-4 bg-lime-50 rounded-lg border border-lime-200 mb-3">
        <h4 class="font-bold text-lime-900">${c.term}</h4>
        <p class="text-slate-600 mt-1">${c.definition}</p>
    </div>
  `).join('');

  const activityItems = (steps: string[]) => steps.map((step) => `<li class="mb-1">${step}</li>`).join('');

  const quizItems = (questions: SummaryData['quiz']) => questions.map((q, i) => `
    <div class="mb-6 quiz-question" data-correct-answer="${encodeURIComponent(q.correctAnswer)}">
      <p class="font-semibold">${i + 1}. ${q.question}</p>
      <div class="mt-2 space-y-2 quiz-options">
        ${q.options.map(opt => `<div class="quiz-option">${opt}</div>`).join('')}
      </div>
    </div>
  `).join('');

  const logoImg = logoUrl ? `<img src="${logoUrl}" alt="Logo" class="h-16 w-16 absolute top-8 right-8 rounded-full" />` : '';
  
  const activityTitle = sequenceNumber && activityNumber
    ? `<h2 class="text-xl sm:text-2xl font-semibold text-slate-600 mt-2">Séquence ${sequenceNumber} - Activité ${activityNumber}</h2>`
    : '';

  const bodyStyle = welcomeImageUrl 
    ? `style="background-image: url('${welcomeImageUrl}'); background-size: cover; background-position: center; background-attachment: fixed;"`
    : 'style="background-color: #f8fafc;"'; // bg-slate-50

  const mainStyle = welcomeImageUrl
    ? `style="background-color: rgba(255, 255, 255, 0.97);"`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fiche de Synthèse: ${data.title}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      ${styles}
    </head>
    <body class="font-sans text-slate-800" ${bodyStyle}>
      <main class="max-w-4xl mx-auto p-8 sm:p-12 bg-white my-8 rounded-lg shadow-lg" ${mainStyle}>
        <header class="relative mb-8 text-center border-b-2 pb-4 border-lime-200">
          ${logoImg}
          <h1 class="text-3xl sm:text-4xl font-extrabold text-lime-800 pr-28">${data.title}</h1>
          ${activityTitle}
        </header>

        <section class="mb-4">
          <div class="accordion-header border-b border-slate-200">
            <h2 class="text-2xl font-bold text-slate-700">Points Clés</h2>
            <span class="accordion-icon text-2xl font-bold text-lime-600">+</span>
          </div>
          <div class="accordion-panel pt-4">
            <ul class="list-disc list-inside space-y-2 text-slate-600">${listItems(data.summaryPoints)}</ul>
          </div>
        </section>

        <section class="mb-4">
          <div class="accordion-header border-b border-slate-200">
            <h2 class="text-2xl font-bold text-slate-700">Concepts & Définitions</h2>
            <span class="accordion-icon text-2xl font-bold text-lime-600">+</span>
          </div>
          <div class="accordion-panel pt-4">
            <div class="space-y-4">${conceptItems(data.keyConcepts)}</div>
          </div>
        </section>

        ${data.activityFlow && data.activityFlow.length > 0 ? `
        <section class="mb-4">
          <div class="accordion-header border-b border-slate-200">
            <h2 class="text-2xl font-bold text-slate-700">Déroulement de l'Activité</h2>
            <span class="accordion-icon text-2xl font-bold text-lime-600">+</span>
          </div>
          <div class="accordion-panel pt-4">
            <ol class="list-decimal list-inside space-y-2 text-slate-600">${activityItems(data.activityFlow)}</ol>
          </div>
        </section>
        ` : ''}

        <section class="page-break">
          <div class="accordion-header border-b border-slate-200">
            <h2 class="text-2xl font-bold text-slate-700">Testez vos connaissances</h2>
            <span class="accordion-icon text-2xl font-bold text-lime-600">+</span>
          </div>
          <div class="accordion-panel pt-4">
            <div id="quiz-container">${quizItems(data.quiz)}</div>
            <div id="quiz-results" class="hidden">
                <p id="score"></p>
            </div>
            <div id="quiz-controls" class="text-center">
              <button id="submit-quiz-btn" class="quiz-btn">Valider le Quiz</button>
              <button id="reset-quiz-btn" class="quiz-btn hidden">Recommencer</button>
            </div>
          </div>
        </section>

      </main>
      ${script}
    </body>
    </html>
  `;
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

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ data, logoUrl, sequenceNumber, activityNumber, welcomeImageUrl }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  const handleOpenHTML = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExporting) return;
    setIsExporting(true);
    setIsDropdownOpen(false);
    try {
        const htmlContent = generateExportHtml(data, logoUrl, sequenceNumber, activityNumber, welcomeImageUrl);
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
        } else {
            alert("Veuillez autoriser les pop-ups pour afficher l'export.");
        }
    } catch (error) {
        console.error("Error generating HTML export:", error);
    } finally {
        setTimeout(() => setIsExporting(false), 500);
    }
  };

  const handleDownloadHTML = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExporting) return;
    setIsExporting(true);
    setIsDropdownOpen(false);
    try {
        const htmlContent = generateExportHtml(data, logoUrl, sequenceNumber, activityNumber, welcomeImageUrl);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTitle = data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `fiche-synthese-${safeTitle}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error generating HTML for download:", error);
    } finally {
        setTimeout(() => setIsExporting(false), 500);
    }
  };


  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
        <h2 className="text-3xl font-extrabold text-lime-800 tracking-tight">{data.title}</h2>
         <div className="relative inline-block text-left" ref={dropdownRef}>
          <div>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isExporting}
              className="inline-flex items-center justify-center w-full rounded-lg shadow-md px-4 py-2 bg-fuchsia-600 text-white font-bold hover:bg-fuchsia-700 disabled:bg-slate-400 disabled:cursor-wait transition-all duration-300 ease-in-out"
              id="options-menu"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              {isExporting ? (
                 <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Exportation...</span>
                </>
              ) : (
                <>
                  <ExportIcon />
                  <span className="mx-2">Exporter</span>
                  <ChevronDownIcon />
                </>
              )}
            </button>
          </div>

          {isDropdownOpen && !isExporting && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div className="py-1" role="none">
                <a
                  href="#"
                  onClick={handleOpenHTML}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  role="menuitem"
                >
                  <ExportIcon /> 
                  Ouvrir dans un nouvel onglet
                </a>
                <a
                  href="#"
                  onClick={handleDownloadHTML}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  role="menuitem"
                >
                  <DownloadIcon />
                  Télécharger le fichier HTML
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
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
        </section>
        
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
    </div>
  );
};

// Helper Icon Components
const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

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