
import { LevelInfo } from '../types';

export const getLevelInfo = (booksCount: number, stages: LevelInfo[]): LevelInfo => {
  // Seviyeleri minBooks değerine göre büyükten küçüğe sıralayıp kontrol ediyoruz
  const sortedStages = [...stages].sort((a, b) => b.minBooks - a.minBooks);
  const stage = sortedStages.find(s => booksCount >= s.minBooks);
  return stage || stages[0];
};

export const getProgressToNextLevel = (booksCount: number, stages: LevelInfo[]) => {
  if (!stages || stages.length === 0) return 0;

  const currentLevel = getLevelInfo(booksCount, stages);
  const sortedStages = [...stages].sort((a, b) => a.minBooks - b.minBooks);
  const currentIndex = sortedStages.findIndex(s => s.id === currentLevel.id);
  
  // Son seviyedeyse %100 döndür
  if (currentIndex >= sortedStages.length - 1) return 100;
  
  const nextLevel = sortedStages[currentIndex + 1];
  const currentLevelMin = currentLevel.minBooks;
  const nextLevelMin = nextLevel.minBooks;
  
  const range = nextLevelMin - currentLevelMin;
  
  // Hata koruması: Range 0 veya negatifse
  if (range <= 0) return 100;

  const currentInRange = booksCount - currentLevelMin;
  
  const progress = (currentInRange / range) * 100;
  return Math.min(Math.max(progress, 0), 100);
};
