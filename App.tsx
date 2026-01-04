
import React, { useState, useMemo, useEffect, Suspense, useRef, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { MOCK_STUDENTS } from './data';
import { Student, LeaderboardCategory, StageImages, EVOLUTION_STAGES, LevelInfo } from './types';
import ChampionCard from './components/ChampionCard';
import StudentCard from './components/StudentCard';
// StudentModal lazy load edilecek
import type { User } from 'firebase/auth';
import { throttle } from './utils/helpers'; // Helper import

// Code Splitting
const TeacherPanel = React.lazy(() => import('./components/TeacherPanel'));
const StudentModal = React.lazy(() => import('./components/StudentModal'));

import {
  BookMarked, Search, Trophy, Settings, LayoutDashboard, Sparkles,
  Lock, LogOut, Mail, Key, AlertCircle, Loader2, ShieldX, Database
} from 'lucide-react';

// Lazy Firebase Loader
import { getFirestoreData, getAuthData } from './firebaseConfig';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'teacher'>('home');
  const [category, setCategory] = useState<LeaderboardCategory>('weekly');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [internalAuthChecked, setInternalAuthChecked] = useState(false);

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [isConnectionReady, setIsConnectionReady] = useState(false);
  const [isListReady, setIsListReady] = useState(false);

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [stageImages, setStageImages] = useState<StageImages>({});
  const [stages, setStages] = useState<LevelInfo[]>(EVOLUTION_STAGES);
  const [showPodium, setShowPodium] = useState<boolean>(true);

  // --- SDK REFERANSLARI ---
  const firebaseRefs = useRef<{
    auth: any;
    db: any;
    googleProvider: any;
    authModule: any;
    firestoreModule: any;
  } | null>(null);

  // --- SDK MODÜLLERİNİ ERTELEYEREK YÜKLE ---
  const loadAuthModule = async () => {
    if (firebaseRefs.current?.authModule) return firebaseRefs.current;

    // Auth paketleri (90KB+) sadece öğretmen paneline girerken yüklenir
    const authData = await getAuthData();
    firebaseRefs.current = {
      ...firebaseRefs.current,
      ...authData
    };
    return firebaseRefs.current;
  };

  // --- MEMOIZED HANDLERS (Strict Component Memoization için) ---
  const handleStudentClick = useCallback((student: Student) => {
    setSelectedStudent(student);
  }, []);

  // --- PERFORMANS: Main Thread Blokajını Önleme ---
  useEffect(() => {
    const runOnIdle = (cb: () => void) => {
      if ('requestIdleCallback' in window) {
        // @ts-ignore
        window.requestIdleCallback(cb, { timeout: 3000 });
      } else {
        setTimeout(cb, 1000);
      }
    };

    runOnIdle(async () => {
      try {
        // İlk açılışta SADECE Firestore (Veriler) yüklenir
        const firestoreData = await getFirestoreData();
        firebaseRefs.current = {
          db: firestoreData.db,
          firestoreModule: firestoreData.firestoreModule,
          auth: null,
          authModule: null,
          googleProvider: null
        };

        // Sadece firestore dinleyicilerini başlatmak için yeterli
        setIsConnectionReady(true);

      } catch (e) {
        console.error("Firebase yükleme hatası:", e);
      }
    });

    const listTimer = setTimeout(() => {
      setIsListReady(true);
    }, 200);

    return () => clearTimeout(listTimer);
  }, []);

  // --- FIRESTORE DATA LISTENERS ---
  useEffect(() => {
    if (!isConnectionReady || !firebaseRefs.current) return;

    const { db, firestoreModule } = firebaseRefs.current;
    let unsubStudents: () => void;
    let unsubSettings: () => void;

    // Firestore Listener Throttling: Güncellemeleri saniyede en fazla 1 kez işle
    const throttledSetStudents = throttle((data: Student[]) => {
      setStudents(data);
      setDataLoading(false);
    }, 1000);

    const startListeners = () => {
      try {
        unsubStudents = firestoreModule.onSnapshot(firestoreModule.collection(db, "students"), (snapshot: any) => {
          const studentData = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
          })) as Student[];

          setIsDemoMode(false);
          // Throttle uygulanmış state güncellemesi
          throttledSetStudents(studentData);

        }, (error: any) => {
          console.error("Veri okuma hatası:", error);
          if (error.code === 'permission-denied') {
            setStudents(MOCK_STUDENTS);
            setIsDemoMode(true);
          }
          setDataLoading(false);
        });

        const settingsDocRef = firestoreModule.doc(db, "settings", "global");
        unsubSettings = firestoreModule.onSnapshot(settingsDocRef, (docSnap: any) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.stages) setStages(data.stages);
            if (data.stageImages) setStageImages(data.stageImages);
            if (data.showPodium !== undefined) setShowPodium(data.showPodium);
          } else {
            firestoreModule.setDoc(firestoreModule.doc(db, "settings", "global"), {
              stages: EVOLUTION_STAGES,
              stageImages: {},
              showPodium: true
            }).catch(() => { });
          }
        });
      } catch (err) {
        console.log("Listener error:", err);
      }
    };

    if ('requestIdleCallback' in window) {
      // @ts-ignore
      window.requestIdleCallback(() => setTimeout(startListeners, 300));
    } else {
      setTimeout(startListeners, 500);
    }

    return () => {
      if (unsubStudents) unsubStudents();
      if (unsubSettings) unsubSettings();
    };
  }, [isConnectionReady]);

  // --- ACTION HANDLERS ---
  const addStudent = async (name: string) => {
    if (isDemoMode) { alert("Demo modunda işlem yapılamaz."); return; }
    if (!firebaseRefs.current) return;
    const { db, firestoreModule } = firebaseRefs.current;

    const newStudent = {
      name: name,
      avatarSeed: name,
      booksRead: 0,
      weeklyScore: 0,
      monthlyScore: 0,
      allTimeScore: 0,
      bonusScore: 0,
      accessories: [],
      badges: [],
      isVisible: true
    };
    await firestoreModule.addDoc(firestoreModule.collection(db, "students"), newStudent);
  };

  const removeStudent = async (id: string) => {
    if (isDemoMode) return;
    if (!firebaseRefs.current) return;
    const { db, firestoreModule } = firebaseRefs.current;
    await firestoreModule.deleteDoc(firestoreModule.doc(db, "students", id));
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    if (isDemoMode) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      return;
    }
    if (!firebaseRefs.current) return;
    const { db, firestoreModule } = firebaseRefs.current;
    await firestoreModule.updateDoc(firestoreModule.doc(db, "students", id), updates);
  };

  const resetStudents = async () => {
    if (isDemoMode) return;
    if (!firebaseRefs.current) return;
    const { db, firestoreModule } = firebaseRefs.current;

    const promises = students.map(s => firestoreModule.deleteDoc(firestoreModule.doc(db, "students", s.id)));
    await Promise.all(promises);

    MOCK_STUDENTS.forEach(async (s) => {
      const { id, ...rest } = s;
      await firestoreModule.addDoc(firestoreModule.collection(db, "students"), rest);
    });
  };

  const handleUpdateStageImages = async (newImages: StageImages) => {
    setStageImages(newImages);
    if (!isDemoMode && firebaseRefs.current) {
      const { db, firestoreModule } = firebaseRefs.current;
      try {
        await firestoreModule.updateDoc(firestoreModule.doc(db, "settings", "global"), { stageImages: newImages });
      } catch (e) { }
    }
  };

  const handleUpdateStages = async (newStages: LevelInfo[]) => {
    setStages(newStages);
    if (!isDemoMode && firebaseRefs.current) {
      const { db, firestoreModule } = firebaseRefs.current;
      try {
        await firestoreModule.updateDoc(firestoreModule.doc(db, "settings", "global"), { stages: newStages });
      } catch (e) { }
    }
  };

  const handleUpdateShowPodium = async (show: boolean) => {
    setShowPodium(show);
    if (!isDemoMode && firebaseRefs.current) {
      const { db, firestoreModule } = firebaseRefs.current;
      try {
        await firestoreModule.updateDoc(firestoreModule.doc(db, "settings", "global"), { showPodium: show });
      } catch (e) { }
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    if (!firebaseRefs.current) return;
    const { auth, googleProvider, authModule } = firebaseRefs.current;

    try {
      await authModule.signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        setLoginError(`YETKİSİZ ALAN ADI: ${window.location.hostname}`);
      } else {
        setLoginError(`Giriş hatası: ${error.message}`);
      }
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email || !password) {
      setLoginError('Lütfen e-posta ve şifre giriniz.');
      return;
    }
    if (!firebaseRefs.current) return;
    const { auth, authModule } = firebaseRefs.current;

    try {
      await authModule.signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoginError('Giriş başarısız. Bilgilerinizi kontrol edin.');
    }
  };

  const handleLogout = async () => {
    if (!firebaseRefs.current) return;
    const { auth, authModule } = firebaseRefs.current;
    try {
      await authModule.signOut(auth);
      setEmail('');
      setPassword('');
      setView('home');
      setIsAdmin(false);
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const getCalculatedScore = useCallback((student: Student) => {
    return (student.booksRead * 10) + (student.bonusScore || 0);
  }, []);

  const podiumList = useMemo(() => {
    return [...students]
      .filter(s => s.isVisible)
      .sort((a, b) => b.booksRead - a.booksRead || getCalculatedScore(b) - getCalculatedScore(a));
  }, [students, getCalculatedScore]);

  const top3 = podiumList.slice(0, 3);

  const librarySortedList = useMemo(() => {
    const baseList = [...students].filter(s => s.isVisible);
    const listToProcess = showPodium
      ? baseList.filter(s => !top3.find(t => t.id === s.id))
      : baseList;

    return listToProcess
      .sort((a, b) => getCalculatedScore(b) - getCalculatedScore(a))
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm, showPodium, top3, getCalculatedScore]);


  if (authLoading && !isConnectionReady) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-quicksand selection:bg-indigo-200 selection:text-indigo-900">

      {/* PERFORMANS: Arkaplan elementleri optimize edildi, mix-blend-mode ve noise kaldırıldı */}
      <div className="fixed inset-0 pointer-events-none z-0 transform-gpu overflow-hidden bg-slate-50">
        <div className="absolute -top-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-100/50 blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-indigo-100/50 blur-[100px]" />
      </div>

      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-40 contain-paint">
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-indigo-500/5 rounded-[2rem] px-6 h-20 flex items-center justify-between transition-all hover:bg-white/80">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('home')}>
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-xl" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-inner border border-white/20">
                <BookMarked size={26} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight hidden sm:block">
                Kitap Kurdu
              </h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase hidden sm:block">Okuma Serüveni</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-2xl border border-white/50">
            <button
              onClick={() => setView('home')}
              aria-label="Liderlik Tablosunu Görüntüle"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm ${view === 'home' ? 'bg-white text-indigo-600 shadow-md shadow-indigo-200 ring-1 ring-indigo-50' : 'text-slate-500 hover:bg-white/50 hover:text-indigo-500'}`}
            >
              <LayoutDashboard size={18} />
              <span className="hidden md:inline">Liderlik</span>
            </button>
            <button
              onClick={async () => {
                setView('teacher');
                if (!internalAuthChecked) {
                  const fb = await loadAuthModule();
                  fb.authModule.onAuthStateChanged(fb.auth, async (currentUser: any) => {
                    setUser(currentUser);
                    if (currentUser?.email) {
                      const adminDocRef = fb.firestoreModule.doc(fb.db, "admins", currentUser.email);
                      const adminSnap = await fb.firestoreModule.getDoc(adminDocRef);
                      setIsAdmin(adminSnap.exists());
                    }
                    setAuthLoading(false);
                    setInternalAuthChecked(true);
                  });
                }
              }}
              aria-label="Öğretmen Paneli"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm ${view === 'teacher' ? 'bg-white text-indigo-600 shadow-md shadow-indigo-200 ring-1 ring-indigo-50' : 'text-slate-500 hover:bg-white/50 hover:text-indigo-500'}`}
            >
              <Settings size={18} />
              <span className="hidden md:inline">Öğretmen</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-32 relative z-10 pb-20">

        {isDemoMode && (
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-center justify-center gap-3 shadow-sm mx-auto max-w-2xl"
          >
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <Database size={16} className="text-amber-600" />
            </div>
            <div className="text-sm">
              <span className="font-bold">Demo Modu Aktif:</span> Veritabanı okuma izni yok. Örnek veriler gösteriliyor.
              <br />
              <span className="text-xs opacity-80">Firebase Console {'>'} Firestore Database {'>'} Rules ayarlarını kontrol ediniz.</span>
            </div>
          </m.div>
        )}

        {dataLoading && isConnectionReady && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">Veriler Yükleniyor...</p>
          </div>
        )}

        {dataLoading && !isConnectionReady && (
          <div className="h-64 flex items-center justify-center">
          </div>
        )}

        {(!dataLoading || !isConnectionReady) && (
          <>
            {view === 'home' ? (
              <>
                <div className="text-center mb-16 relative">
                  <m.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-indigo-50/80 backdrop-blur border border-indigo-100 px-4 py-1.5 rounded-full text-indigo-600 text-xs font-black uppercase tracking-widest mb-4 shadow-sm"
                  >
                    <Sparkles size={14} /> Okuma Seviyesi: Efsanevi
                  </m.div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-2 drop-shadow-sm">
                    Macera Seni Bekliyor!
                  </h2>
                  <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                    Kitapların sayfaları arasında kaybol, puanları topla ve efsanevi bir okura dönüş.
                  </p>
                </div>

                {showPodium && (
                  <section className="mb-24 flex flex-col items-center relative content-visibility-auto">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-gradient-to-r from-transparent via-indigo-100/50 to-transparent blur-3xl -z-10 pointer-events-none" />

                    <div className="mb-16 md:mb-24 text-center relative z-30">
                      <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600 inline-flex items-center gap-2">
                        <Trophy className="text-amber-500" fill="currentColor" size={24} /> Zirvedeki Efsaneler
                      </h3>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full px-4">
                      <AnimatePresence mode="wait">
                        <m.div
                          key={students.length}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex flex-col md:flex-row items-center md:items-end justify-center gap-12 md:gap-8 w-full perspective-1000"
                        >
                          {top3[0] && (
                            <div className="order-1 md:order-2 md:scale-110 z-20 md:-translate-y-6 filter drop-shadow-2xl">
                              <ChampionCard
                                student={top3[0]}
                                rank={1}
                                category={category}
                                stages={stages}
                                stageImages={stageImages}
                                onClick={handleStudentClick}
                                displayScore={getCalculatedScore(top3[0])}
                              />
                            </div>
                          )}
                          {top3[1] && (
                            <div className="order-2 md:order-1 z-10 filter drop-shadow-xl">
                              <ChampionCard
                                student={top3[1]}
                                rank={2}
                                category={category}
                                stages={stages}
                                stageImages={stageImages}
                                onClick={handleStudentClick}
                                displayScore={getCalculatedScore(top3[1])}
                              />
                            </div>
                          )}
                          {top3[2] && (
                            <div className="order-3 md:order-3 mt-8 md:mt-0 z-10 filter drop-shadow-xl">
                              <ChampionCard
                                student={top3[2]}
                                rank={3}
                                category={category}
                                stages={stages}
                                stageImages={stageImages}
                                onClick={handleStudentClick}
                                displayScore={getCalculatedScore(top3[2])}
                              />
                            </div>
                          )}
                        </m.div>
                      </AnimatePresence>
                    </div>
                  </section>
                )}

                <section className="relative z-10">
                  <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                          <BookMarked size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-slate-800 leading-tight">
                            {showPodium ? 'Tüm Sınıf Sıralaması' : 'Tüm Kahramanlar'}
                          </h2>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {librarySortedList.length} Öğrenci Listeleniyor
                          </p>
                        </div>
                      </div>

                      <div className="relative group w-full md:w-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                        <div className="relative flex items-center">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                          <input
                            type="text"
                            placeholder="Kahraman ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white border border-indigo-50 rounded-2xl w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold shadow-sm placeholder:text-slate-300 text-slate-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PERFORMANS: Content-Visibility: auto ile ekran dışı render engellendi */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 content-visibility-auto">
                      <AnimatePresence mode="popLayout">
                        {isListReady && librarySortedList.map((student) => (
                          <StudentCard
                            key={student.id}
                            student={student}
                            stages={stages}
                            stageImages={stageImages}
                            onClick={handleStudentClick}
                            score={getCalculatedScore(student)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    {isListReady && librarySortedList.length === 0 && isConnectionReady && (
                      <div className="text-center py-20">
                        <div className="text-6xl mb-4 opacity-30">🔍</div>
                        <h3 className="text-xl font-bold text-slate-400">Kahraman Bulunamadı</h3>
                        <p className="text-slate-300">Aramayı değiştirmeyi deneyin.</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <div className="pt-4">
                {!user ? (
                  <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto"
                  >
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 border border-white relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                      <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-inner">
                          <Lock size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">Öğretmen Girişi</h2>
                        <p className="text-slate-500 mt-2 text-sm font-medium">Lütfen yetkili hesabınızla giriş yapın.</p>
                      </div>

                      {loginError && (
                        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-2 border border-rose-100">
                          <AlertCircle size={18} />
                          {loginError}
                        </div>
                      )}

                      <div className="space-y-4">
                        <button
                          onClick={handleGoogleLogin}
                          className="w-full bg-white text-slate-700 border-2 border-slate-100 hover:border-slate-300 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-slate-50 active:scale-95"
                        >
                          Google ile Giriş Yap
                        </button>

                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">veya e-posta</span></div>
                        </div>

                        <form onSubmit={handleEmailLogin} className="space-y-3">
                          <div className="relative">
                            <label htmlFor="login-email" className="sr-only">E-posta Adresi</label>
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                              id="login-email"
                              name="email"
                              type="email"
                              placeholder="E-posta Adresi"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                            />
                          </div>
                          <div className="relative">
                            <label htmlFor="login-password" className="sr-only">Şifre</label>
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                              id="login-password"
                              name="password"
                              type="password"
                              placeholder="Şifre"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                          >
                            Giriş Yap
                          </button>
                        </form>
                      </div>
                    </div>
                  </m.div>
                ) : !isAdmin ? (
                  <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto text-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-rose-100"
                  >
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                      <ShieldX size={32} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">Yetkisiz Erişim</h2>
                    <p className="text-slate-500 text-sm mb-6">
                      Bu hesaba ({user.email}) yönetici yetkisi verilmemiştir. Lütfen yönetici ile iletişime geçin.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      Çıkış Yap
                    </button>
                  </m.div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-8 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Giriş Yapıldı</p>
                          <p className="text-sm font-black text-slate-700">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all font-bold text-sm"
                      >
                        <LogOut size={16} /> Çıkış
                      </button>
                    </div>
                    <Suspense fallback={<div className="p-10 text-center text-indigo-500"><Loader2 className="animate-spin inline-block mr-2" />Panel Yükleniyor...</div>}>
                      <TeacherPanel
                        students={students}
                        addStudent={addStudent}
                        removeStudent={removeStudent}
                        updateStudent={updateStudent}
                        resetStudents={resetStudents}
                        stageImages={stageImages}
                        setStageImages={handleUpdateStageImages}
                        stages={stages}
                        setStages={handleUpdateStages}
                        showPodium={showPodium}
                        setShowPodium={handleUpdateShowPodium}
                        isDemoMode={isDemoMode}
                      />
                    </Suspense>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Suspense fallback={null}>
        <AnimatePresence>
          {selectedStudent && (
            <StudentModal
              student={selectedStudent}
              stages={stages}
              stageImages={stageImages}
              onClose={() => setSelectedStudent(null)}
              totalScore={getCalculatedScore(selectedStudent)}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default App;


