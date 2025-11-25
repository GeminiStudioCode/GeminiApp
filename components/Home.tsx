
import React from 'react';
import { QuestionCategory } from '../types';
import { getCategoryTitle, getCategoryCount } from '../services/questionService';

interface HomeProps {
  onSelectCategory: (category: QuestionCategory) => void;
  onOpenCollectionMenu: () => void;
}

export const CategoryButton: React.FC<{
  title?: string;
  subTitle?: string;
  onClick: () => void;
  colorClass: string;
  icon?: React.ReactNode;
  category?: QuestionCategory;
}> = ({ title, subTitle, onClick, colorClass, icon, category }) => {
  const displayTitle = title || (category ? getCategoryTitle(category) : "");
  const count = category ? getCategoryCount(category) : null;

  return (
    <button
      onClick={onClick}
      className={`group w-full relative overflow-hidden p-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 text-left border border-white/20 shadow-lg hover:shadow-xl ${colorClass}`}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
      
      <div className="relative z-10 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-1">{displayTitle}</h2>
        {subTitle ? (
            <span className="text-white/80 text-sm font-medium tracking-wider uppercase">{subTitle}</span>
        ) : (
            count !== null && <span className="text-white/80 text-sm font-medium tracking-wider uppercase">共 {count} 题</span>
        )}
      </div>
      
      <div className="absolute bottom-4 right-4 text-white/60 group-hover:translate-x-1 transition-transform">
        {icon ? icon : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 12h14" />
          </svg>
        )}
      </div>
    </button>
  );
};

export const Home: React.FC<HomeProps> = ({ onSelectCategory, onOpenCollectionMenu }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden justify-center p-6 space-y-4">
        <CategoryButton 
          category={QuestionCategory.SINGLE} 
          onClick={() => onSelectCategory(QuestionCategory.SINGLE)}
          colorClass="bg-gradient-to-r from-blue-400/60 to-blue-600/60 hover:bg-blue-500/70"
        />
        
        <CategoryButton 
          category={QuestionCategory.MULTI} 
          onClick={() => onSelectCategory(QuestionCategory.MULTI)}
          colorClass="bg-gradient-to-r from-purple-400/60 to-purple-600/60 hover:bg-purple-500/70"
        />
        
        <CategoryButton 
          category={QuestionCategory.BOOLEAN} 
          onClick={() => onSelectCategory(QuestionCategory.BOOLEAN)}
          colorClass="bg-gradient-to-r from-pink-400/60 to-pink-600/60 hover:bg-pink-500/70"
        />

        <div className="border-t border-white/20 pt-4 mt-2">
          <CategoryButton 
            title="错题集"
            subTitle="查看收藏的题目"
            onClick={onOpenCollectionMenu}
            colorClass="bg-gradient-to-r from-orange-400/60 to-orange-600/60 hover:bg-orange-500/70"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            }
          />
        </div>
    </div>
  );
};
