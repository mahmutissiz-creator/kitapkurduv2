
import { Student } from './types';

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Elif Yılmaz',
    avatarSeed: 'Elif',
    booksRead: 112,
    weeklyScore: 450,
    monthlyScore: 1800,
    allTimeScore: 12500,
    // Fix: Added missing bonusScore
    bonusScore: 0,
    accessories: ['Gözlük', 'Asa', 'Taç'],
    badges: ['Gece Kuşu', 'Hız Motoru', 'Bilge'],
    // Adding required visibility flag
    isVisible: true
  },
  {
    id: '2',
    name: 'Can Demir',
    avatarSeed: 'Can',
    booksRead: 25,
    weeklyScore: 520,
    monthlyScore: 1650,
    allTimeScore: 9800,
    // Fix: Added missing bonusScore
    bonusScore: 0,
    accessories: ['Pelerin', 'Gözlük'],
    badges: ['Hız Motoru'],
    // Adding required visibility flag
    isVisible: true
  },
  {
    id: '3',
    name: 'Zeynep Ak',
    avatarSeed: 'Zeynep',
    booksRead: 75,
    weeklyScore: 310,
    monthlyScore: 2150,
    allTimeScore: 7200,
    // Fix: Added missing bonusScore
    bonusScore: 0,
    accessories: ['Asa'],
    badges: ['Gece Kuşu', 'Bilge'],
    // Adding required visibility flag
    isVisible: true
  },
  {
    id: '4',
    name: 'Mert Soylu',
    avatarSeed: 'Mert',
    booksRead: 15,
    weeklyScore: 120,
    monthlyScore: 500,
    allTimeScore: 2100,
    // Fix: Added missing bonusScore
    bonusScore: 0,
    accessories: [],
    badges: ['Kitap Kurdu'],
    // Adding required visibility flag
    isVisible: true
  },
  {
    id: '5',
    name: 'Selin Yıldız',
    avatarSeed: 'Selin',
    booksRead: 64,
    weeklyScore: 480,
    monthlyScore: 1400,
    allTimeScore: 8400,
    // Fix: Added missing bonusScore
    bonusScore: 0,
    accessories: ['Gözlük', 'Pelerin'],
    badges: ['Hız Motoru', 'Bilge'],
    // Adding required visibility flag
    isVisible: true
  },
  {
    id: '6',
    name: 'Arda Kaya',
    avatarSeed: 'Arda',
    booksRead: 42,
    weeklyScore: 200,
    monthlyScore: 850,
    allTimeScore: 4500,
    // Fix: Added missing bonusScore
    bonusScore: 0,
    accessories: ['Asa'],
    badges: [],
    // Adding required visibility flag
    isVisible: true
  },
  {
    id: '7',
    name: 'Duru Şen',
    avatarSeed: 'Duru',
    booksRead: 8,
    weeklyScore: 90,
    monthlyScore: 320,
    allTimeScore: 1100,
    // Fix: Added missing bonusScore
    bonusScore: 0,
    accessories: [],
    badges: [],
    // Adding required visibility flag
    isVisible: true
  },
  {
    id: '8',
    name: 'Baran Öz',
    avatarSeed: 'Baran',
    booksRead: 55,
    weeklyScore: 350,
    monthlyScore: 1200,
    allTimeScore: 6100,
    // Fix: Added missing bonusScore
    bonusScore: 0,
    accessories: ['Taç'],
    badges: ['Gece Kuşu'],
    // Adding required visibility flag
    isVisible: true
  },
  {
    id: '9',
    name: 'Melis Efe',
    avatarSeed: 'Melis',
    booksRead: 92,
    weeklyScore: 280,
    monthlyScore: 1100,
    allTimeScore: 9200,
    // Fix: Added missing bonusScore
    bonusScore: 0,
    accessories: ['Pelerin', 'Asa'],
    badges: ['Bilge'],
    // Adding required visibility flag
    isVisible: true
  },
  {
    id: '10',
    name: 'Kerem Bulut',
    avatarSeed: 'Kerem',
    booksRead: 12,
    weeklyScore: 150,
    monthlyScore: 600,
    allTimeScore: 1800,
    // Fix: Added missing bonusScore
    bonusScore: 0,
    accessories: [],
    badges: ['Hız Motoru'],
    // Adding required visibility flag
    isVisible: true
  }
];
