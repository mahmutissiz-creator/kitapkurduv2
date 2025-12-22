
import React, { useState } from 'react';
import { Student, LevelInfo, StageImages } from '../types';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon, 
  Award, 
  Layout,
  RefreshCcw,
  FileText,
  Star,
  Smile,
  ShieldAlert,
  MessageSquareX,
  Edit3,
  PlusCircle,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import Avatar from './Avatar';
// Storage importlarını kaldırdık, çünkü veritabanına kaydedeceğiz.

interface TeacherPanelProps {
  students: Student[];
  addStudent: (name: string) => void;
  removeStudent: (id: string) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  resetStudents: () => void;
  stageImages: StageImages;
  setStageImages: (images: StageImages) => void;
  stages: LevelInfo[];
  setStages: (stages: LevelInfo[]) => void;
  showPodium: boolean;
  setShowPodium: (show: boolean) => void;
  isDemoMode: boolean;
}

const TeacherPanel: React.FC<TeacherPanelProps> = ({ 
  students, 
  addStudent,
  removeStudent,
  updateStudent,
  resetStudents,
  stageImages, 
  setStageImages,
  stages,
  setStages,
  showPodium,
  setShowPodium,
  isDemoMode
}) => {
  const [newStudentName, setNewStudentName] = useState('');
  const [uploadingStageId, setUploadingStageId] = useState<number | null>(null);
  const [urlInputs, setUrlInputs] = useState<{[key: number]: string}>({});

  const onAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newStudentName.trim();
    if (name) {
      addStudent(name);
      setNewStudentName('');
    }
  };

  const onRemoveClick = (id: string, name: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`${name} isimli öğrenciyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      removeStudent(id);
    }
  };

  // Resmi sıkıştırıp Base64 string'e çeviren yardımcı fonksiyon
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400; // Maksimum genişlik
          const MAX_HEIGHT = 400; // Maksimum yükseklik
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // JPEG formatında ve 0.7 kalitesinde sıkıştır
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (stageId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Lütfen sadece resim dosyası yükleyin.");
      return;
    }

    setUploadingStageId(stageId);

    try {
      // Resmi sıkıştır ve Base64 string'e çevir
      const base64String = await compressImage(file);
      
      // State'i güncelle (Bu işlem App.tsx üzerinden Firestore'a da kaydeder)
      setStageImages({ ...stageImages, [stageId]: base64String });
      
    } catch (error: any) {
      console.error("Resim işleme hatası:", error);
      alert("Resim işlenirken bir hata oluştu.");
    } finally {
      setUploadingStageId(null);
      e.target.value = '';
    }
  };

  // Manuel URL girişi için
  const handleUrlSubmit = (stageId: number) => {
    const url = urlInputs[stageId];
    if (!url) return;
    
    setStageImages({ ...stageImages, [stageId]: url });
    setUrlInputs({ ...urlInputs, [stageId]: '' });
  };

  // Seviye ayarlarını güncelleme fonksiyonu
  const handleStageUpdate = (id: number, field: keyof LevelInfo, value: any) => {
    const newStages = stages.map(stage => 
      stage.id === id ? { ...stage, [field]: value } : stage
    );
    setStages(newStages);
  };

  // Yeni seviye ekleme fonksiyonu
  const handleAddStage = () => {
    const lastStage = stages[stages.length - 1];
    const newId = stages.length > 0 ? Math.max(...stages.map(s => s.id)) + 1 : 1;
    const startBook = lastStage ? lastStage.maxBooks + 1 : 0;
    
    const newStage: LevelInfo = {
      id: newId,
      title: 'YENİ SEVİYE',
      minBooks: startBook,
      maxBooks: startBook + 20,
      message: 'Yeni bir seviyeye ulaştın!',
      icon: '⭐',
      color: 'text-slate-500',
      bgClass: 'bg-slate-100'
    };

    setStages([...stages, newStage]);
  };

  // Seviye silme fonksiyonu
  const handleRemoveStage = (id: number) => {
    if (stages.length <= 1) {
      alert("En az bir seviye kalmalıdır!");
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Bu seviyeyi silmek istediğinize emin misiniz?")) {
      setStages(stages.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Üst Ayarlar */}
      <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Layout className="text-indigo-500" /> Ayarlar
          </h3>
          <button 
            type="button"
            onClick={() => window.confirm("Tüm verileri sıfırlamak istediğinize emin misiniz?") && resetStudents()}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all font-bold text-xs"
          >
            <RefreshCcw size={14} /> Sistemi Sıfırla
          </button>
        </div>
        
        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <h4 className="font-bold text-slate-800">Podyumu Göster</h4>
            <p className="text-xs text-slate-500">İlk 3 kişiyi özel kartlarla vurgular.</p>
          </div>
          <button 
            type="button"
            onClick={() => setShowPodium(!showPodium)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${showPodium ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <span className={`${showPodium ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform`} />
          </button>
        </div>
      </section>

      {/* Öğrenci Yönetimi */}
      <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Award className="text-amber-500" /> Kahramanlar
          </h3>
          
          <form onSubmit={onAddSubmit} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Yeni İsim..."
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold w-full md:w-64 outline-none focus:ring-2 ring-indigo-500/20"
            />
            <button 
              type="submit"
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 shadow-lg flex items-center gap-2 active:scale-95 transition-all"
            >
              <Plus size={20} />
              <span className="text-sm font-black uppercase">Ekle</span>
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="p-5">Kahraman</th>
                <th className="p-5 text-center">Kitap (10P)</th>
                <th className="p-5 text-center">RPG Bonusları</th>
                <th className="p-5 text-center">Ekstra</th>
                <th className="p-5 text-right">Yönet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.length > 0 ? students.map(student => (
                <tr key={student.id} className="hover:bg-slate-50/30">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={student.name} className="w-10 h-10 rounded-xl" fontSize="text-xs" />
                      <span className="font-bold text-slate-700">{student.name}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-3 bg-white border border-slate-100 rounded-xl p-1 w-32 mx-auto">
                      <button type="button" onClick={() => updateStudent(student.id, { booksRead: Math.max(0, student.booksRead - 1) })} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 font-black hover:bg-rose-50">-</button>
                      <span className="font-black text-indigo-600 text-lg w-8 text-center">{student.booksRead}</span>
                      <button type="button" onClick={() => updateStudent(student.id, { booksRead: student.booksRead + 1 })} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-black hover:bg-indigo-600 hover:text-white">+</button>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => updateStudent(student.id, { bonusScore: (student.bonusScore || 0) + 5 })} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"><FileText size={18} /></button>
                      <button type="button" onClick={() => updateStudent(student.id, { bonusScore: (student.bonusScore || 0) + 5 })} className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 hover:bg-amber-600 hover:text-white transition-all"><Star size={18} /></button>
                      <button type="button" onClick={() => updateStudent(student.id, { bonusScore: (student.bonusScore || 0) + 3 })} className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 hover:bg-sky-600 hover:text-white transition-all"><Smile size={18} /></button>
                      <div className="w-px h-6 bg-slate-200 mx-1" />
                      <button type="button" onClick={() => updateStudent(student.id, { bonusScore: (student.bonusScore || 0) - 3 })} className="p-2.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 hover:bg-orange-600 hover:text-white transition-all"><ShieldAlert size={18} /></button>
                      <button type="button" onClick={() => updateStudent(student.id, { bonusScore: (student.bonusScore || 0) - 5 })} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"><MessageSquareX size={18} /></button>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <input 
                      type="number"
                      value={student.bonusScore || 0}
                      onChange={(e) => updateStudent(student.id, { bonusScore: parseInt(e.target.value) || 0 })}
                      className="w-16 bg-purple-50 rounded-xl p-2 text-center font-black text-purple-700 outline-none border border-purple-100"
                    />
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        type="button"
                        onClick={() => updateStudent(student.id, { isVisible: !student.isVisible })} 
                        className={`p-2.5 rounded-xl border transition-all ${student.isVisible ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-slate-400 bg-slate-100 border-slate-200'}`}
                        title={student.isVisible ? "Gizle" : "Göster"}
                      >
                        {student.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveClick(student.id, student.name);
                        }}
                        className="p-2.5 text-rose-500 bg-rose-50 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white active:scale-90 transition-all cursor-pointer"
                        title="Öğrenciyi Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic">Henüz kahraman yok...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Evrim Görselleri ve Ayarları */}
      <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <ImageIcon className="text-indigo-500" /> Evrim Seviyeleri & Kuralları
        </h3>
        <p className="text-sm text-slate-500 mb-6 -mt-4">
          Resim yükleyebilir veya internetten bulduğunuz bir resmin adresini (URL) yapıştırabilirsiniz.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {stages.map((stage) => (
            <div key={stage.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative group">
              
              <button 
                type="button"
                onClick={() => handleRemoveStage(stage.id)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-rose-50 text-rose-500 rounded-full border border-rose-100 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-rose-500 hover:text-white cursor-pointer"
                title="Seviyeyi Sil"
              >
                <Trash2 size={14} />
              </button>

              {/* Görsel Alanı */}
              <div className="relative group aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden mb-4">
                {uploadingStageId === stage.id ? (
                  <div className="flex flex-col items-center gap-2 text-indigo-600">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-xs font-bold">İşleniyor...</span>
                  </div>
                ) : stageImages[stage.id] ? (
                  <img src={stageImages[stage.id]} className="w-full h-full object-cover" alt="Stage" />
                ) : (
                  <div className="text-center"><div className="text-3xl">{stage.icon}</div></div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold pointer-events-none p-2 text-center">
                  <span>Değiştirmek için tıkla</span>
                </div>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => handleFileUpload(stage.id, e)}
                  disabled={uploadingStageId !== null}
                />
              </div>

              {/* URL Input (Alternatif Yükleme) */}
              <div className="mb-3 flex gap-1">
                 <input 
                    type="text" 
                    placeholder="veya resim linki..." 
                    className="w-full text-[9px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
                    value={urlInputs[stage.id] || ''}
                    onChange={(e) => setUrlInputs({...urlInputs, [stage.id]: e.target.value})}
                 />
                 <button 
                    onClick={() => handleUrlSubmit(stage.id)}
                    disabled={!urlInputs[stage.id]}
                    className="bg-indigo-100 text-indigo-600 rounded-lg px-2 hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50"
                 >
                    <LinkIcon size={10} />
                 </button>
              </div>

              {/* Ayar Alanları */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={stage.title}
                    onChange={(e) => handleStageUpdate(stage.id, 'title', e.target.value)}
                    className="w-full text-center text-[10px] font-black uppercase text-slate-700 bg-transparent outline-none border-b border-dashed border-slate-200 focus:border-indigo-500 transition-colors py-1"
                    placeholder="Seviye Adı"
                  />
                  <Edit3 size={10} className="absolute right-0 top-1.5 text-slate-300 pointer-events-none" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-lg p-1.5 text-center border border-slate-100">
                    <label className="block text-[8px] font-bold text-slate-400 mb-0.5">MİN</label>
                    <input 
                      type="number" 
                      value={stage.minBooks}
                      onChange={(e) => handleStageUpdate(stage.id, 'minBooks', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-center font-black text-xs text-indigo-600 outline-none"
                    />
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1.5 text-center border border-slate-100">
                    <label className="block text-[8px] font-bold text-slate-400 mb-0.5">MAX</label>
                    <input 
                      type="number" 
                      value={stage.maxBooks}
                      onChange={(e) => handleStageUpdate(stage.id, 'maxBooks', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-center font-black text-xs text-indigo-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button 
            type="button"
            onClick={handleAddStage}
            className="group relative aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-500 shadow-sm transition-colors">
              <PlusCircle size={24} />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Yeni Ekle</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default TeacherPanel;
