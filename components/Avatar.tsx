
import React, { useMemo } from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
  fontSize?: string;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "eager" | "lazy";
}

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  src, 
  className = "w-12 h-12", 
  fontSize = "text-xl",
  fetchPriority = "auto",
  loading = "lazy"
}) => {
  // Hesaplamayı sadece isim değişirse yap (Memoization)
  const initials = useMemo(() => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  }, [name]);

  const bgColor = useMemo(() => {
    const colors = [
      'bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 
      'bg-sky-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [name]);

  if (src) {
    return (
      <div className={`${className} overflow-hidden rounded-3xl border-4 border-white shadow-md bg-slate-100`}>
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover"
          loading={loading}
          // @ts-ignore - React type definitions might miss fetchPriority occasionally
          fetchPriority={fetchPriority}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${className} ${bgColor} rounded-3xl flex items-center justify-center text-white font-black shadow-inner border-4 border-white/20 select-none`}>
      <span className={fontSize}>{initials}</span>
    </div>
  );
};

// Bileşeni memoize ederek, props değişmediği sürece tekrar render olmasını engelle
export default React.memo(Avatar);
