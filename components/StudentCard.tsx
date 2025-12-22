
import React from 'react';
import { motion } from 'framer-motion';
import { Student, LevelInfo, StageImages } from '../types';
import { getLevelInfo } from '../utils/levelCalculator';
import Avatar from './Avatar';

interface StudentCardProps {
  student: Student;
  stages: LevelInfo[];
  stageImages: StageImages;
  onClick: (student: Student) => void;
  score: number;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, stages, stageImages, onClick, score }) => {
  const level = getLevelInfo(student.booksRead, stages);
  const profileImage = stageImages[level.id];

  return (
    <motion.div
      // PERFORMANS: layout propu kaldırıldı (Pahalı Reflow)
      // initial={false} ile sayfa açılışında animasyon çalışmaz, CPU'yu yormaz
      initial={false}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(student)}
      className="bg-white rounded-[2.8rem] p-6 shadow-sm hover:shadow-2xl cursor-pointer border border-slate-100 flex flex-col items-center transition-shadow group relative overflow-hidden"
    >
      <div className="absolute top-4 right-4 bg-indigo-600 px-4 py-1.5 rounded-2xl shadow-lg neon-box z-10">
        <span className="text-xs font-black neon-score uppercase tracking-tighter">
          {score} XP
        </span>
      </div>

      <div className="relative mb-6 mt-4">
        <div className="w-28 h-28 relative">
           <Avatar 
             name={student.name} 
             src={profileImage}
             className="w-full h-full rounded-[2.5rem] transition-transform group-hover:rotate-3 shadow-xl" 
             fontSize="text-4xl" 
           />
        </div>
        <div className={`absolute -bottom-3 -right-3 w-12 h-12 rounded-[1.2rem] bg-white shadow-2xl flex items-center justify-center text-2xl border-2 border-slate-50 z-20`}>
          {level.icon}
        </div>
      </div>
      
      <div className="text-center w-full">
        <h4 className="font-black text-slate-900 text-lg truncate w-full mb-3">{student.name}</h4>
        
        <div className="flex flex-col gap-2 items-center">
          <div className="bg-indigo-50/80 backdrop-blur px-5 py-2 rounded-[1.5rem] border border-indigo-100 flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <span className="text-2xl font-black text-indigo-700 tracking-tight leading-none">
              {student.booksRead}
            </span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Kitap</span>
          </div>
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${level.color} opacity-80`}>
            {level.title}
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};

// Strict Memoization: Sadece gerekli props değişirse render et
export default React.memo(StudentCard);
