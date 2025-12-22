
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Student, StageImages, LevelInfo } from '../types';
import { getLevelInfo, getProgressToNextLevel } from '../utils/levelCalculator';
import Avatar from './Avatar';
import { X, Trophy, Sparkles, BookOpen, Clock, Zap, Star, MessageCircle, ArrowUpCircle } from 'lucide-react';

interface StudentModalProps {
  student: Student | null;
  stageImages: StageImages;
  stages: LevelInfo[];
  onClose: () => void;
  totalScore: number;
}

const StudentModal: React.FC<StudentModalProps> = ({ student, stageImages, stages, onClose, totalScore }) => {
  const [progressWidth, setProgressWidth] = useState(0);

  if (!student) return null;

  const level = getLevelInfo(student.booksRead, stages);
  const rawProgress = getProgressToNextLevel(student.booksRead, stages);
  const progress = isNaN(rawProgress) ? 0 : Math.min(Math.max(rawProgress, 0), 100);

  const customImage = stageImages[level.id];

  const sortedStages = [...stages].sort((a, b) => a.minBooks - b.minBooks);
  const currentIndex = sortedStages.findIndex(s => s.id === level.id);
  const nextLevel = currentIndex < sortedStages.length - 1 ? sortedStages[currentIndex + 1] : null;
  const remainingBooks = nextLevel ? Math.max(0, nextLevel.minBooks - student.booksRead) : 0;

  const accessoryIcons: Record<string, string> = {
    'Gözlük': '👓',
    'Asa': '🪄',
    'Pelerin': '🧥',
    'Taç': '👑',
  };

  const badgeIcons: Record<string, any> = {
    'Gece Kuşu': <Clock className="w-4 h-4 text-indigo-500" />,
    'Hız Motoru': <Zap className="w-4 h-4 text-yellow-500" />,
    'Bilge': <BookOpen className="w-4 h-4 text-emerald-500" />,
    'Kitap Kurdu': <Sparkles className="w-4 h-4 text-purple-500" />,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressWidth(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full transition-colors z-20 shadow-sm"
        >
          <X size={18} />
        </button>

        <div className="h-48 bg-indigo-600 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
          
          {customImage ? (
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={customImage} 
              className="w-full h-full object-cover"
              alt={level.title}
            />
          ) : (
            <div className="text-8xl opacity-40 filter blur-[1px] select-none">
              {level.icon}
            </div>
          )}
          
          <div className="absolute -bottom-8 w-20 h-20 rounded-2xl bg-white p-1 shadow-lg border-2 border-white">
            <Avatar 
              name={student.name} 
              src={customImage}
              className="w-full h-full rounded-xl" 
              fontSize="text-2xl" 
            />
          </div>
        </div>

        <div className="px-6 pt-12 pb-8 text-center">
          <h2 className="text-2xl font-black text-slate-800 mb-1">{student.name}</h2>
          
          <div className="flex flex-col items-center gap-3 mb-6">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${level.bgClass} ${level.color} shadow-sm border border-current/10`}>
              {level.icon} {level.title}
            </span>
            
            <div className="flex gap-4 w-full">
               <div className="flex-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Toplam Puan</p>
                  <p className="text-lg font-black text-indigo-600">{totalScore}</p>
               </div>
               <div className="flex-1 bg-purple-50 p-2 rounded-xl border border-purple-100">
                  <p className="text-[8px] font-black text-purple-400 uppercase tracking-tighter">Bonus/Görev</p>
                  <p className="text-lg font-black text-purple-600">+{student.bonusScore || 0}</p>
               </div>
            </div>
          </div>

          <div className="mb-6 text-left space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <BookOpen size={10} /> İlerleme ({student.booksRead} Kitap)
              </p>
              <p className="text-[10px] font-black text-indigo-600">%{Math.round(progress)}</p>
            </div>
            
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-sm transition-all duration-1000 ease-out"
                style={{ width: `${progressWidth}%` }}
              />
            </div>

            <div className="flex items-center gap-3 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50">
              <ArrowUpCircle size={18} className="text-indigo-600 shrink-0" />
              <div className="flex-1">
                {nextLevel ? (
                  <p className="text-[10px] font-bold text-slate-600 leading-tight">
                    <span className="text-indigo-600 font-black">{remainingBooks} kitap</span> sonra <span className="font-black">{nextLevel.title}</span> aşamasına geçeceksin!
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-slate-600 leading-tight">
                    Maksimum seviye! Kitapların efendisi oldun. 👑
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
              <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Sparkles size={10} className="text-indigo-400" /> ENVANTER
              </h4>
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {student.accessories.length > 0 ? student.accessories.map(acc => (
                  <div key={acc} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm border border-slate-100" title={acc}>
                    {accessoryIcons[acc] || '📦'}
                  </div>
                )) : <span className="text-[9px] font-bold text-slate-300 italic">Boş...</span>}
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
              <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Star size={10} className="text-amber-400" /> ROZETLER
              </h4>
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {student.badges.length > 0 ? student.badges.map(badge => (
                  <div key={badge} className="px-2 py-0.5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 gap-1" title={badge}>
                    {badgeIcons[badge] || <Trophy size={10} className="text-slate-400" />}
                    <span className="text-[7px] font-black uppercase truncate max-w-[30px]">{badge}</span>
                  </div>
                )) : <span className="text-[9px] font-bold text-slate-300 italic">Boş...</span>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentModal;
