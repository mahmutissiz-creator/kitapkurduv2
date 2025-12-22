
import React from 'react';
import { motion } from 'framer-motion';
import { Student, LeaderboardCategory, LevelInfo, StageImages } from '../types';
import { getLevelInfo } from '../utils/levelCalculator';
import Avatar from './Avatar';

interface ChampionCardProps {
  student: Student;
  rank: 1 | 2 | 3;
  category: LeaderboardCategory;
  stages: LevelInfo[];
  stageImages: StageImages;
  onClick: (student: Student) => void;
  displayScore: number;
}

const ChampionCard: React.FC<ChampionCardProps> = ({ student, rank, category, stages, stageImages, onClick, displayScore }) => {
  const level = getLevelInfo(student.booksRead, stages);
  const profileImage = stageImages[level.id];
  
  const isLCP = rank === 1;

  const rankConfig = {
    1: { 
      borderColor: 'border-amber-400', 
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      glow: 'gold-glow',
      icon: '👑',
      height: 'h-72',
      badgeColor: 'bg-indigo-600'
    },
    2: { 
      borderColor: 'border-slate-300', 
      bgColor: 'bg-gradient-to-br from-slate-50 to-slate-200',
      glow: 'silver-glow',
      icon: '🥈',
      height: 'h-64',
      badgeColor: 'bg-indigo-600'
    },
    3: { 
      borderColor: 'border-orange-300', 
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      glow: 'bronze-glow',
      icon: '🥉',
      height: 'h-56',
      badgeColor: 'bg-indigo-600'
    }
  };

  const config = rankConfig[rank];

  return (
    <motion.div
      // PERFORMANS: layout ve spring animasyonları kaldırıldı
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(student)}
      className={`relative flex flex-col items-center justify-end ${config.height} w-60 p-6 rounded-[3rem] border-4 ${config.borderColor} ${config.bgColor} ${config.glow} shadow-2xl cursor-pointer transition-shadow`}
    >
      <div className="absolute -top-12 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="w-28 h-28">
             <Avatar 
                name={student.name} 
                src={profileImage}
                className="w-full h-full rounded-[2rem] border-4 border-white shadow-2xl"
                fontSize="text-4xl"
                fetchPriority={isLCP ? "high" : "auto"}
                loading={isLCP ? "eager" : "lazy"}
             />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-[1rem] px-3 py-1.5 shadow-xl border-2 border-white flex items-center gap-2">
             <span className="text-base leading-none">📚</span>
             <span className="text-lg font-black text-white leading-none">{student.booksRead}</span>
          </div>
        </motion.div>
      </div>

      <div className="text-center mb-4 w-full px-2">
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${level.color} mb-1 drop-shadow-sm`}>
          {level.icon} {level.title}
        </p>
        <h3 className="font-black text-slate-900 text-xl truncate mb-1">{student.name}</h3>
      </div>

      <div className={`${config.badgeColor} px-5 py-2 rounded-2xl shadow-lg mb-4 neon-box`}>
        <span className="text-sm font-black neon-score tracking-wider">{displayScore} XP</span>
      </div>

      <div className="absolute -bottom-5 bg-white border-2 border-inherit px-5 py-1.5 rounded-full font-black text-slate-800 shadow-2xl text-base flex items-center gap-2">
        <span>{config.icon}</span>
        <span>#{rank}</span>
      </div>
    </motion.div>
  );
};

export default React.memo(ChampionCard);
