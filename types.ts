
export type LeaderboardCategory = 'weekly' | 'monthly' | 'allTime';

export interface Student {
  id: string;
  name: string;
  avatarSeed: string;
  booksRead: number;
  weeklyScore: number;
  monthlyScore: number;
  allTimeScore: number;
  bonusScore: number; // Öğretmenin eklediği ekstra puanlar
  accessories: string[];
  badges: string[];
  isVisible: boolean;
}

export interface LevelInfo {
  id: number;
  title: string;
  minBooks: number;
  maxBooks: number;
  message: string;
  icon: string;
  color: string;
  bgClass: string;
}

export const EVOLUTION_STAGES: LevelInfo[] = [
  { 
    id: 1,
    title: 'Gizemli Yumurta', 
    minBooks: 0, 
    maxBooks: 5, 
    message: 'Maceran başlamak üzere! İlk kitaplarını oku ve içindeki gücü uyandır.',
    icon: '🥚',
    color: 'text-slate-400',
    bgClass: 'bg-slate-100'
  },
  { 
    id: 2,
    title: 'Çatlayan Yumurta', 
    minBooks: 6, 
    maxBooks: 15, 
    message: 'Dünyayı keşfetmeye başladın! Merakın kabuklarını kırıyor.',
    icon: '🐣',
    color: 'text-amber-500',
    bgClass: 'bg-amber-100'
  },
  { 
    id: 3,
    title: 'Meraklı Yavru Ejderha', 
    minBooks: 16, 
    maxBooks: 30, 
    message: 'Artık bir ejderhasın! Ama daha çok öğrenmen gereken şey var.',
    icon: '🐲',
    color: 'text-emerald-500',
    bgClass: 'bg-emerald-100'
  },
  { 
    id: 4,
    title: 'Kanatlanan Bilge', 
    minBooks: 31, 
    maxBooks: 50, 
    message: 'Kanatların güçleniyor! Bilgi seni göklere taşıyor.',
    icon: '🦅',
    color: 'text-indigo-500',
    bgClass: 'bg-indigo-100'
  },
  { 
    id: 5,
    title: 'Efsanevi Kitap Ejderhası', 
    minBooks: 51, 
    maxBooks: 9999, 
    message: 'Sen bir efsanesin! Bilginin efendisi, kütüphanelerin koruyucusu.',
    icon: '👑',
    color: 'text-rose-500',
    bgClass: 'bg-rose-100'
  }
];

export interface StageImages {
  [key: number]: string;
}
