import React, { useState } from 'react';
import { UserStats, CultivationPath, Theme } from '../types';
import { User, Apple, Trophy, Sparkles, Coins, Scroll, Flame, Skull, Shield } from 'lucide-react';

interface ProfileProps {
  user: UserStats;
  onLinkApple: (path: CultivationPath) => void;
  theme: Theme;
}

const Profile: React.FC<ProfileProps> = ({ user, onLinkApple, theme }) => {
  const [showPathSelection, setShowPathSelection] = useState(false);
  const [selectedPath, setSelectedPath] = useState<CultivationPath | null>(null);

  // Simple avatar generation based on ID
  const getAvatarUrl = (id: number) => `https://picsum.photos/seed/${id}/200/200`;

  const handleAppleClick = () => {
    if (user.appleLinked) return;
    setShowPathSelection(true);
  };

  const confirmPath = () => {
    if (selectedPath) {
      onLinkApple(selectedPath);
      setShowPathSelection(false);
    }
  };

  if (showPathSelection) {
    return (
      <div className="h-full overflow-y-auto no-scrollbar p-6 bg-slate-900 text-white rounded-3xl animate-in zoom-in duration-300">
        <h2 className="text-3xl font-bold text-center mb-2 font-cinzel text-amber-500">Choose Your Destiny</h2>
        <p className="text-center text-slate-400 mb-8 text-sm">
          Once chosen, this path cannot be changed. It will shape your interactions with the Masters.
        </p>

        <div className="grid grid-cols-1 gap-4 mb-8">
          
          {/* Orthodox */}
          <div 
            onClick={() => setSelectedPath(CultivationPath.ORTHODOX)}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden group
              ${selectedPath === CultivationPath.ORTHODOX ? 'bg-blue-900/40 border-blue-400 scale-[1.02]' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}
            `}
          >
            <div className="bg-blue-100 text-blue-800 p-3 rounded-full"><Scroll size={24} /></div>
            <div>
              <h3 className="font-bold text-lg text-blue-200 font-serif">Orthodox Path</h3>
              <p className="text-xs text-slate-400">Order, Tradition, Righteousness. The steady path of the Scholar.</p>
            </div>
            {selectedPath === CultivationPath.ORTHODOX && <div className="absolute inset-0 bg-blue-400/10 animate-pulse"></div>}
          </div>

          {/* Unorthodox */}
          <div 
            onClick={() => setSelectedPath(CultivationPath.UNORTHODOX)}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden group
              ${selectedPath === CultivationPath.UNORTHODOX ? 'bg-red-900/40 border-red-400 scale-[1.02]' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}
            `}
          >
            <div className="bg-red-100 text-red-800 p-3 rounded-full"><Flame size={24} /></div>
            <div>
              <h3 className="font-bold text-lg text-red-200 font-sans">Unorthodox Path</h3>
              <p className="text-xs text-slate-400">Freedom, Chaos, Strength. The wild path of the Mercenary.</p>
            </div>
          </div>

          {/* Demonic */}
          <div 
            onClick={() => setSelectedPath(CultivationPath.DEMONIC)}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden group
              ${selectedPath === CultivationPath.DEMONIC ? 'bg-purple-900/40 border-purple-400 scale-[1.02]' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}
            `}
          >
            <div className="bg-purple-100 text-purple-800 p-3 rounded-full"><Skull size={24} /></div>
            <div>
              <h3 className="font-bold text-lg text-purple-200 font-cinzel">Demonic Path</h3>
              <p className="text-xs text-slate-400">Power at all costs. The ruthless path of the Conqueror.</p>
            </div>
          </div>

          {/* Secular */}
          <div 
            onClick={() => setSelectedPath(CultivationPath.SECULAR)}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden group
              ${selectedPath === CultivationPath.SECULAR ? 'bg-green-900/40 border-green-400 scale-[1.02]' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}
            `}
          >
            <div className="bg-green-100 text-green-800 p-3 rounded-full"><Shield size={24} /></div>
            <div>
              <h3 className="font-bold text-lg text-green-200 font-mono">Secular Path</h3>
              <p className="text-xs text-slate-400">Bureaucracy, State Power. The disciplined path of the Commander.</p>
            </div>
          </div>

        </div>

        <div className="flex gap-4">
           <button 
             onClick={() => setShowPathSelection(false)}
             className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={confirmPath}
             disabled={!selectedPath}
             className="flex-1 bg-white text-slate-900 py-4 rounded-xl font-bold hover:bg-amber-100 disabled:opacity-50 transition-colors shadow-lg"
           >
             Confirm Destiny
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 animate-slide-up">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className={`${theme.cardBg} rounded-3xl p-8 shadow-sm border ${theme.cardBorder} flex flex-col items-center text-center relative overflow-hidden`}>
          {/* Background Decorative Element based on theme */}
          <div className={`absolute top-0 w-full h-32 opacity-5 ${theme.sidebarBg}`}></div>

          <div className="relative mb-4 group cursor-pointer z-10">
            <img 
              src={getAvatarUrl(user.avatarId)} 
              alt="Avatar" 
              className={`w-36 h-36 object-cover shadow-xl ${theme.avatarBorder} bg-white`}
            />
            <div className={`absolute bottom-0 right-0 ${theme.sidebarBg} text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform`}>
              <Sparkles size={16} />
            </div>
          </div>
          <h2 className={`text-3xl font-bold ${theme.textPrimary}`}>{user.name}</h2>
          <p className={`${theme.accent} font-bold mt-1 uppercase tracking-wide text-sm`}>
            Level {user.level} {user.level > 450 ? 'Minister' : user.level > 200 ? 'Sect Elder' : 'Disciple'}
          </p>
          
          {user.cultivationPath && (
             <div className={`mt-4 text-xs font-black tracking-widest uppercase ${theme.textSecondary} bg-slate-100/50 px-4 py-1.5 rounded-full border border-slate-200 inline-block`}>
               Path: {user.cultivationPath}
             </div>
          )}

          <div className="mt-8 flex gap-4 text-sm w-full justify-center">
             <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl flex flex-col items-center min-w-[100px]">
               <span className={`font-black text-xl ${theme.textPrimary}`}>{user.streak}</span>
               <span className="text-xs text-slate-400 font-bold uppercase">Day Streak</span>
             </div>
             <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl flex flex-col items-center min-w-[100px]">
               <div className="flex items-center gap-1 font-black text-xl text-yellow-600">
                  <Coins size={16} />
                  <span>{user.spendableXp}</span>
               </div>
               <span className="text-xs text-slate-400 font-bold uppercase">XP Balance</span>
             </div>
          </div>
        </div>

        {/* Apple Integration */}
        <div className={`${theme.cardBg} rounded-3xl p-6 shadow-sm border ${theme.cardBorder}`}>
          <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center gap-2`}>
            <User size={20} /> Account Security
          </h3>
          
          {user.appleLinked ? (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-2xl border border-green-100">
              <Apple size={24} />
              <div>
                <span className="font-bold block">Linked with Apple ID</span>
                <span className="text-xs opacity-75">{user.email || 'user@icloud.com'}</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className={`${theme.textSecondary} mb-4 text-sm`}>Sign in to secure your progress, <span className={`font-bold ${theme.accent}`}>Choose your Cultivation Path</span>, and unlock a Mythic Pet!</p>
              <button 
                onClick={handleAppleClick}
                className="bg-black text-white w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md active:scale-95"
              >
                <Apple size={20} />
                Sign in with Apple
              </button>
            </div>
          )}
        </div>

        {/* Skin & Themes (Mock) */}
        <div className={`${theme.cardBg} rounded-3xl p-6 shadow-sm border ${theme.cardBorder}`}>
          <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center gap-2`}>
            <Trophy size={20} className="text-yellow-500" /> Wardrobe & Skins
          </h3>
          <div className="grid grid-cols-3 gap-4">
             {[1, 2, 3].map((i) => (
               <div key={i} className={`aspect-square rounded-2xl bg-slate-50 flex items-center justify-center border-2 ${i === 1 ? 'border-blue-400 shadow-sm' : 'border-transparent opacity-50'}`}>
                  {i === 1 ? <User className="text-blue-400" /> : <Lock className="text-slate-300" />}
               </div>
             ))}
          </div>
          <p className={`${theme.textSecondary} text-xs mt-4 text-center`}>Unlock new skins every 50 levels!</p>
        </div>

      </div>
    </div>
  );
};

// Helper for lock icon since it wasn't imported
const Lock = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

export default Profile;
