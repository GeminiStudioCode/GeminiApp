
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Quiz } from './components/Quiz';
import { CollectionMenu } from './components/CollectionMenu';
import { QuestionCategory, AppState } from './types';
import { getQuestions } from './services/questionService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    view: 'HOME',
    activeCategory: null
  });

  const handleSelectCategory = (category: QuestionCategory) => {
    setAppState({
      view: 'QUIZ',
      activeCategory: category
    });
  };

  const handleOpenCollectionMenu = () => {
    setAppState({
        view: 'COLLECTION_MENU',
        activeCategory: null
    });
  };

  const handleBackToHome = () => {
    setAppState({
      view: 'HOME',
      activeCategory: null
    });
  };

  const handleFinishQuiz = (score: number, total: number) => {
    // Simple alert for now, could be a dedicated results screen
    alert(`练习完成！\n你的得分: ${score} / ${total}`);
    handleBackToHome();
  };

  // Always re-fetch questions when rendering quiz to ensure Collection is up to date
  const currentQuestions = appState.activeCategory 
    ? getQuestions(appState.activeCategory) 
    : [];

  return (
    <Layout>
      {appState.view === 'HOME' && (
        <Home 
            onSelectCategory={handleSelectCategory} 
            onOpenCollectionMenu={handleOpenCollectionMenu}
        />
      )}

      {appState.view === 'COLLECTION_MENU' && (
          <CollectionMenu 
            onSelectCategory={handleSelectCategory}
            onBack={handleBackToHome}
          />
      )}

      {appState.view === 'QUIZ' && appState.activeCategory && (
        <Quiz 
          questions={currentQuestions} 
          category={appState.activeCategory}
          onFinish={handleFinishQuiz}
          onBack={appState.activeCategory.toString().startsWith('COLLECTION') ? handleOpenCollectionMenu : handleBackToHome}
        />
      )}
    </Layout>
  );
};

export default App;
