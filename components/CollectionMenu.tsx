
import React from 'react';
import { QuestionCategory } from '../types';
import { CategoryButton } from './Home';

interface CollectionMenuProps {
  onSelectCategory: (category: QuestionCategory) => void;
  onBack: () => void;
}

export const CollectionMenu: React.FC<CollectionMenuProps> = ({ onSelectCategory, onBack }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-white/10 shrink-0">
         <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/20 transition-colors text-white mr-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white">错题集</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 flex flex-col justify-center">
         <CategoryButton 
          title="单项选择题"
          category={QuestionCategory.COLLECTION_SINGLE} 
          onClick={() => onSelectCategory(QuestionCategory.COLLECTION_SINGLE)}
          colorClass="bg-gradient-to-r from-blue-400/60 to-blue-600/60 hover:bg-blue-500/70"
        />
        
        <CategoryButton 
          title="多项选择题"
          category={QuestionCategory.COLLECTION_MULTI} 
          onClick={() => onSelectCategory(QuestionCategory.COLLECTION_MULTI)}
          colorClass="bg-gradient-to-r from-purple-400/60 to-purple-600/60 hover:bg-purple-500/70"
        />
        
        <CategoryButton 
          title="判断题"
          category={QuestionCategory.COLLECTION_BOOLEAN} 
          onClick={() => onSelectCategory(QuestionCategory.COLLECTION_BOOLEAN)}
          colorClass="bg-gradient-to-r from-pink-400/60 to-pink-600/60 hover:bg-pink-500/70"
        />
      </div>
    </div>
  );
};
