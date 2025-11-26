
import React, { useState, useEffect, useRef } from 'react';
import { Question, QuestionCategory } from '../types';
import { getCategoryTitle } from '../services/questionService';
import { isFavorite, toggleFavorite, addFavorite, removeFavorite } from '../services/storageService';

interface QuizProps {
  questions: Question[];
  category: QuestionCategory;
  onFinish: (score: number, total: number) => void;
  onBack: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ questions, category, onFinish, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCurrentFavorite, setIsCurrentFavorite] = useState(false);
  const [showJumpGrid, setShowJumpGrid] = useState(false);
  
  // Ref for scroll container to reset scroll on new question
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Ref for auto-advance timer
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const clearAutoAdvance = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  // Handle empty collection case
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <div className="mb-4 text-white/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">暂无题目</h3>
        <p className="text-white/70 mb-6">该分类下还没有收藏任何题目。</p>
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-colors border border-white/20"
        >
          返回
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMulti = currentQuestion.category === QuestionCategory.MULTI;
  const isBoolean = currentQuestion.category === QuestionCategory.BOOLEAN;
  const isCollectionMode = category.toString().startsWith('COLLECTION');

  // Sync state when index changes
  useEffect(() => {
    clearAutoAdvance();
    setSelectedOptions([]);
    setIsSubmitted(false);
    setIsCurrentFavorite(isFavorite(currentQuestion.id));
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentIndex, currentQuestion]);

  const handleFavoriteClick = () => {
    // Special logic for Collection Mode: Removing favorite jumps to next
    if (isCollectionMode) {
        if (isCurrentFavorite) {
            removeFavorite(currentQuestion.id);
            setIsCurrentFavorite(false);
            
            // Auto jump to next question in collection after removal
            clearAutoAdvance();
            autoAdvanceTimerRef.current = setTimeout(() => {
                handleNext(score);
            }, 300);
        } else {
            // Re-adding it (unlikely usage in collection mode but possible)
            addFavorite(currentQuestion.id);
            setIsCurrentFavorite(true);
        }
    } else {
        // Normal mode: just toggle
        const newVal = toggleFavorite(currentQuestion.id);
        setIsCurrentFavorite(newVal);
    }
  };

  const handleOptionClick = (optionIndex: string) => {
    if (isSubmitted) return;

    if (isMulti) {
      setSelectedOptions(prev => {
        if (prev.includes(optionIndex)) {
          return prev.filter(id => id !== optionIndex);
        } else {
          return [...prev, optionIndex];
        }
      });
    } else {
      // Single choice or boolean auto-submits
      const newSelection = [optionIndex];
      setSelectedOptions(newSelection);
      submitAnswer(newSelection);
    }
  };

  const submitAnswer = (finalSelection: string[]) => {
    setIsSubmitted(true);
    
    const correctSet = new Set(currentQuestion.correctAnswers);
    const selectedSet = new Set(finalSelection);
    
    const isCorrect = correctSet.size === selectedSet.size && 
      [...selectedSet].every(value => correctSet.has(value));

    const newScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(prev => prev + 1);
      // Auto advance for ALL question types if correct, including Multi-choice
      autoAdvanceTimerRef.current = setTimeout(() => {
        handleNext(newScore);
      }, 300); // 0.3 seconds delay
    } else {
        // Auto-add to favorites (Wrong Answer Collection) if incorrect
        addFavorite(currentQuestion.id);
        setIsCurrentFavorite(true);
    }
  };

  const handleManualSubmit = () => {
    if (selectedOptions.length === 0) return;
    submitAnswer(selectedOptions);
  };

  const handleNext = (overrideScore?: number | object) => {
    clearAutoAdvance();
    
    // Use overrideScore if it's a number (passed from timeout), otherwise use current state score
    const finalScore = typeof overrideScore === 'number' ? overrideScore : score;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish(finalScore, questions.length);
    }
  };

  const handlePrev = () => {
    clearAutoAdvance();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleJumpTo = (index: number) => {
      clearAutoAdvance();
      setCurrentIndex(index);
      setShowJumpGrid(false);
  };

  const handleBackWithClear = () => {
      clearAutoAdvance();
      onBack();
  };

  const isAnswerCorrect = () => {
    const correctSet = new Set(currentQuestion.correctAnswers);
    const selectedSet = new Set(selectedOptions);
    return correctSet.size === selectedSet.size && 
      [...selectedSet].every(value => correctSet.has(value));
  };

  const getOptionStyle = (optionValue: string) => {
    const isSelected = selectedOptions.includes(optionValue);
    const isCorrect = currentQuestion.correctAnswers.includes(optionValue);
    
    // Reduced padding from p-4 to p-3 for smaller height
    let baseStyle = "w-full p-3 rounded-xl border text-left transition-all duration-200 relative ";
    
    if (isSubmitted) {
      if (isCorrect) {
        return baseStyle + "bg-green-500/20 border-green-400 text-green-900 font-semibold";
      }
      if (isSelected && !isCorrect) {
        return baseStyle + "bg-red-500/20 border-red-400 text-red-900";
      }
      return baseStyle + "bg-white/10 border-white/10 text-gray-400 opacity-60";
    } else {
      if (isSelected) {
        return baseStyle + "bg-blue-500/30 border-blue-400 text-blue-900 font-medium scale-[1.01] shadow-md";
      }
      // Removed hover effects as requested: "cancel mouse placement on options, option highlight page effect"
      return baseStyle + "bg-white/20 border-white/20 text-gray-800 active:scale-[0.99]";
    }
  };

  let displayOptions: { value: string, label: string }[] = [];
  if (isBoolean) {
    displayOptions = [
      { value: "true", label: "正确" },
      { value: "false", label: "错误" }
    ];
  } else if (currentQuestion.options) {
    displayOptions = currentQuestion.options.map((text, idx) => ({
      value: idx.toString(),
      label: text
    }));
  }

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const title = getCategoryTitle(category);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Integrated Header */}
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md p-4 border-b border-white/10 shrink-0 z-20">
        <button 
          onClick={handleBackWithClear}
          className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h1 className="text-lg font-bold text-white tracking-wide truncate max-w-[150px]">{title}</h1>
        
        <div className="flex items-center space-x-1">
            <button 
                onClick={() => setShowJumpGrid(true)}
                className="p-2 rounded-full text-white/60 hover:text-white transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            </button>
            <button 
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full transition-all active:scale-90 ${isCurrentFavorite ? 'text-yellow-300' : 'text-white/60 hover:text-white'}`}
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={isCurrentFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363 1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-black/10 shrink-0">
        <div 
          className="h-full bg-gradient-to-r from-blue-300 to-green-300 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 pt-4 pb-24 no-scrollbar"
      >
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white 
              ${isMulti ? 'bg-purple-500/50' : (isBoolean ? 'bg-pink-500/50' : 'bg-blue-500/50')}`}>
              {isMulti ? '多选' : (isBoolean ? '判断' : '单选')}
            </span>
            <span className="text-xs text-white/60 font-mono">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          {/* Reduced font size from text-xl to text-lg */}
          <h2 className="text-lg font-bold text-gray-900 leading-relaxed drop-shadow-sm">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Space-y-3 provides consistent spacing without double margins */}
        <div className="space-y-3 pb-6">
          {displayOptions.map((opt, idx) => (
            <button
              key={opt.value}
              onClick={() => handleOptionClick(opt.value)}
              disabled={isSubmitted && !isMulti} 
              className={getOptionStyle(opt.value)}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold border shrink-0
                  ${selectedOptions.includes(opt.value) ? 'border-current' : 'border-gray-500/40 text-gray-500'}`}>
                  {isBoolean ? (idx === 0 ? '✓' : '✗') : String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1 leading-snug">{opt.label}</span>
                {isSubmitted && currentQuestion.correctAnswers.includes(opt.value) && (
                  <svg className="w-6 h-6 text-green-600 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {isSubmitted && (
          <div className={`p-4 rounded-xl border backdrop-blur-md mb-6 animate-fade-in-up ${isAnswerCorrect() ? 'bg-green-100/60 border-green-200' : 'bg-red-100/60 border-red-200'}`}>
            <div className="flex justify-between items-center">
              <span className={`font-bold ${isAnswerCorrect() ? 'text-green-800' : 'text-red-800'}`}>
                {isAnswerCorrect() ? '回答正确! 🎉' : '回答错误'}
              </span>
              {!isAnswerCorrect() && (
                <span className="text-sm font-bold text-red-700 bg-red-200/50 px-3 py-1.5 rounded-lg border border-red-200">
                  正确答案: {isBoolean 
                    ? (currentQuestion.correctAnswers[0] === 'true' ? '正确' : '错误') 
                    : currentQuestion.correctAnswers.map(i => String.fromCharCode(65 + parseInt(i))).join(', ')}
                </span>
              )}
            </div>
            {/* Show "Collected" message if it was wrong */}
            {!isAnswerCorrect() && (
                 <div className="mt-2 text-xs text-red-700/80 font-medium">
                     已自动加入错题集
                 </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-white/30 backdrop-blur-md border-t border-white/20 flex gap-3 justify-between items-center z-30 shadow-2xl">
        <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                currentIndex === 0 
                ? 'bg-white/10 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-indigo-600 shadow-md hover:bg-gray-50 active:scale-95'
            }`}
        >
            上一题
        </button>

        {isMulti && !isSubmitted && (
            <button 
            onClick={handleManualSubmit}
            disabled={selectedOptions.length === 0}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
            提交
            </button>
        )}

         <button 
            onClick={() => handleNext()}
            className={`flex-1 bg-white/40 text-indigo-900 border border-indigo-200/30 py-2.5 rounded-xl font-bold shadow-sm hover:bg-white/50 active:scale-95 transition-all ${!isSubmitted && isMulti ? 'w-24 flex-none' : ''}`}
        >
            {currentIndex === questions.length - 1 ? '完成' : '下一题'}
        </button>
      </div>

        {/* Jump Grid Overlay */}
        {showJumpGrid && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white/90 rounded-2xl w-full h-[70vh] flex flex-col shadow-2xl overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">跳转至...</h3>
                        <button onClick={() => setShowJumpGrid(false)} className="text-gray-500 p-1 rounded-full hover:bg-gray-200">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-5 gap-3 content-start">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleJumpTo(idx)}
                                className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all
                                    ${idx === currentIndex 
                                        ? 'bg-indigo-600 text-white shadow-lg scale-110' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
