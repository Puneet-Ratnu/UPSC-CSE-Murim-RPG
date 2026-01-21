import React, { useState, useMemo } from 'react';
import { Milestone, UserStats, MAX_LEVEL } from '../types';
import { Castle, Mountain, Tent, Trees, Landmark, Cloud, Sparkles, Heart } from 'lucide-react';

interface WorldMapProps {
  user: UserStats;
  milestones: Milestone[];
}

const WorldMap: React.FC<WorldMapProps> = ({ user, milestones }) => {
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [clickEffects, setClickEffects] = useState<{x: number, y: number, id: number, type: 'sparkle' | 'heart'}[]>([]);

  // Calculate avatar position based on level interpolation between milestones
  const avatarPos = useMemo(() => {
    // Sort milestones by level just in case
    const sorted = [...milestones].sort((a,b) => a.levelReq - b.levelReq);
    
    // Find current segment
    let start = sorted[0];
    let end = sorted[sorted.length - 1];
    let progress = 0;
    
    // If max level, stay at end
    if (user.level >= sorted[sorted.length - 1].levelReq) {
       return { x: sorted[sorted.length - 1].x, y: sorted[sorted.length - 1].y };
    }

    for (let i = 0; i < sorted.length - 1; i++) {
        if (user.level >= sorted[i].levelReq && user.level < sorted[i+1].levelReq) {
            start = sorted[i];
            end = sorted[i+1];
            const range = end.levelReq - start.levelReq;
            progress = (user.level - start.levelReq) / range;
            break;
        }
    }
    
    return {
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress
    };
  }, [user.level, milestones]);

  // Icon mapper
  const getIcon = (type: string, size = 20) => {
    switch (type) {
      case 'Village': return <Tent size={size} />;
      case 'Forest': return <Trees size={size} />;
      case 'Mountain': return <Mountain size={size} />;
      case 'Castle': return <Castle size={size} />;
      case 'Temple': return <Landmark size={size} />;
      default: return <Tent size={size} />;
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Spawn a particle
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    const type = Math.random() > 0.7 ? 'heart' : 'sparkle';
    
    setClickEffects(prev => [...prev, { x, y, id, type }]);
    
    // Cleanup particle after animation
    setTimeout(() => {
        setClickEffects(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  return (
    <div 
      className="relative w-full aspect-[4/3] bg-[#fdf6e3] rounded-3xl overflow-hidden shadow-inner border-4 border-[#e6dcc3] group select-none cursor-crosshair"
      onClick={handleMapClick}
    >
      
      {/* Paper Texture Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}>
      </div>

      {/* Decorative Compass */}
      <div className="absolute top-4 right-4 text-[#d4c5a0] opacity-50 pointer-events-none">
         <div className="w-16 h-16 border-2 border-current rounded-full flex items-center justify-center text-xs font-serif font-bold relative animate-spin-slow">
            <span className="absolute top-1">N</span>
            <div className="w-10 h-0.5 bg-current rotate-45"></div>
            <div className="w-10 h-0.5 bg-current -rotate-45"></div>
         </div>
      </div>

      {/* Path Line (Dynamic SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
         <polyline 
            points={milestones.map(m => `${m.x}%,${m.y}%`).join(' ')}
            fill="none" 
            stroke="#dccfb2" 
            strokeWidth="6" 
            strokeDasharray="8 4"
            strokeLinecap="round"
         />
      </svg>

      {/* Decorative Interactables (Trees/Mountains) */}
      <div className="absolute top-1/4 left-10 text-[#8d6e63] opacity-60 hover:scale-125 hover:rotate-6 transition-transform duration-300 cursor-pointer">
         <Trees size={40} />
      </div>
      <div className="absolute bottom-1/3 right-20 text-[#8d6e63] opacity-40 hover:scale-125 hover:-rotate-6 transition-transform duration-300 cursor-pointer">
         <Mountain size={60} />
      </div>

      {/* Milestones */}
      {milestones.map((m) => {
        const isUnlocked = user.level >= m.levelReq;
        return (
          <div 
            key={m.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 cursor-pointer z-10
              ${isUnlocked ? 'scale-100' : 'scale-90 opacity-80'}
            `}
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            onClick={(e) => { e.stopPropagation(); isUnlocked && setActiveMilestone(m); }}
          >
             <div className={`
               p-3 rounded-full border-4 shadow-sm relative transition-transform hover:scale-110 active:scale-95
               ${isUnlocked ? 'bg-[#fffdf5] border-orange-300 text-orange-600' : 'bg-slate-200 border-slate-300 text-slate-400 grayscale'}
             `}>
                {getIcon(m.icon, 24)}
                
                {/* Level Badge */}
                <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow-sm
                   ${isUnlocked ? 'bg-[#5d4037] text-[#fdf6e3]' : 'bg-slate-400 text-white'}
                `}>
                   Lv.{m.levelReq}
                </div>
             </div>
          </div>
        );
      })}

      {/* Avatar (The Player) */}
      <div 
         className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 ease-out"
         style={{ left: `${avatarPos.x}%`, top: `${avatarPos.y}%` }}
      >
         <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white animate-bounce-slow">
               <img src={`https://picsum.photos/seed/${user.avatarId}/50/50`} className="w-full h-full object-cover" alt="Me" />
            </div>
            {/* Pulsing Aura */}
            <div className="absolute inset-0 rounded-full border-2 border-orange-400 opacity-0 animate-ping"></div>
            
            {/* Speech Bubble */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow text-[10px] font-bold whitespace-nowrap animate-fade-in">
               Lvl {user.level}
            </div>
         </div>
      </div>

      {/* Drifting Clouds (Fog of War Replacement) */}
      {/* We use CSS animations for clouds drifting across the screen */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-80">
         {/* Cloud 1 */}
         <div className="absolute top-10 -left-20 animate-float-right text-white opacity-80" style={{ animationDuration: '20s' }}>
            <Cloud size={80} fill="white" />
         </div>
         {/* Cloud 2 */}
         <div className="absolute top-1/2 -left-20 animate-float-right text-white opacity-60" style={{ animationDuration: '35s', animationDelay: '5s' }}>
            <Cloud size={60} fill="white" />
         </div>
         {/* Cloud 3 */}
         <div className="absolute bottom-20 -left-20 animate-float-right text-white opacity-70" style={{ animationDuration: '28s', animationDelay: '12s' }}>
            <Cloud size={100} fill="white" />
         </div>
      </div>

      {/* Click Particles */}
      {clickEffects.map(p => (
         <div 
            key={p.id}
            className="absolute pointer-events-none animate-ping-once text-yellow-400"
            style={{ left: p.x, top: p.y }}
         >
            {p.type === 'heart' ? <Heart fill="pink" className="text-pink-400" size={20} /> : <Sparkles size={24} />}
         </div>
      ))}

      {/* Milestone Modal/Tooltip */}
      {activeMilestone && (
        <div className="absolute bottom-4 left-4 right-4 bg-[#fffbf0] p-4 rounded-xl shadow-lg border-2 border-[#e6dcc3] z-30 animate-in slide-in-from-bottom-2">
           <div className="flex justify-between items-start">
             <div className="flex gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600 h-fit">
                   {getIcon(activeMilestone.icon)}
                </div>
                <div>
                   <h4 className="font-bold text-[#5d4037] text-lg font-serif">{activeMilestone.title}</h4>
                   <p className="text-[#8d6e63] text-sm leading-tight">{activeMilestone.description}</p>
                </div>
             </div>
             <button 
               onClick={(e) => { e.stopPropagation(); setActiveMilestone(null); }}
               className="text-[#a1887f] hover:text-[#5d4037] font-bold bg-[#efebe0] w-8 h-8 rounded-full flex items-center justify-center"
             >✕</button>
           </div>
        </div>
      )}

      <style>{`
        @keyframes float-right {
           from { transform: translateX(-100%); }
           to { transform: translateX(800px); } 
        }
        .animate-float-right {
           animation-name: float-right;
           animation-timing-function: linear;
           animation-iteration-count: infinite;
        }
        @keyframes bounce-slow {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
           animation: bounce-slow 2s infinite ease-in-out;
        }
        @keyframes ping-once {
           0% { transform: scale(0.5); opacity: 1; }
           100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-once {
           animation: ping-once 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WorldMap;