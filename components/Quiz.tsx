import React, { useState } from 'react';
import type { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
}

export const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (option: string) => {
    if (showResults) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: option
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmit = () => {
    setShowResults(true);
  };
  
  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  if (showResults) {
    const score = questions.reduce((acc, question, index) => {
        return acc + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    return (
        <div className="bg-slate-50 p-6 rounded-lg border">
            <h4 className="text-lg font-bold">Résultats du Quiz</h4>
            <p className="my-2">Votre score est de {score} sur {questions.length}</p>
            <ul className="space-y-4 mt-4">
                {questions.map((q, index) => {
                    const selected = selectedAnswers[index];
                    const isCorrect = selected === q.correctAnswer;
                    return (
                        <li key={index} className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
                            <p className="font-semibold">{q.question}</p>
                            <p className="text-sm">Votre réponse : <span className={isCorrect ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>{selected || 'Pas de réponse'}</span></p>
                            {!isCorrect && <p className="text-sm text-green-800">Bonne réponse : {q.correctAnswer}</p>}
                        </li>
                    );
                })}
            </ul>
            <button onClick={handleReset} className="mt-6 bg-lime-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-lime-700 transition-colors">
                Recommencer
            </button>
        </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
      <p className="text-sm text-slate-500 mb-2">
        Question {currentQuestionIndex + 1} sur {questions.length}
      </p>
      <h4 className="font-semibold mb-4">{currentQuestion.question}</h4>
      <div className="space-y-2">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswers[currentQuestionIndex] === option;
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                isSelected ? 'bg-lime-200 border-lime-500 font-bold' : 'bg-white border-slate-300 hover:border-lime-400'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 disabled:opacity-50"
        >
          Précédent
        </button>
        {currentQuestionIndex === questions.length - 1 ? (
             <button onClick={handleSubmit} disabled={!selectedAnswers[currentQuestionIndex]} className="bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-fuchsia-700 disabled:bg-slate-400">
                Valider le Quiz
             </button>
        ) : (
             <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestionIndex]}
              className="bg-lime-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-lime-700 disabled:bg-slate-400"
            >
              Suivant
            </button>
        )}
      </div>
    </div>
  );
};