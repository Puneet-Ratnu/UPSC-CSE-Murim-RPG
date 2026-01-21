import React from 'react';
import { UserStats, Task, GameTabs, BOSS_START_HOUR, BOSS_END_HOUR, Milestone, MoodType, GMPersonality, Theme } from '../types';
import { Book, ScrollText, Feather, Bird, Palette, Anvil, AlertTriangle, PlayCircle, LogOut } from 'lucide-react';
import RadarChart from './RadarChart';
import WorldMap from './WorldMap';

interface DashboardProps {
  user: UserStats;
  tasks: Task[];
  essayCount: number;
  mainsCount: number;
  hobbiesCount: number;
  milestones: Milestone[];
  onNavigate: (tab: GameTabs) => void;
  isBossTime: boolean;
  bossBattlePending: boolean;
  onClockOut: () => void;
  theme: Theme;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, tasks, essayCount, mainsCount, hobbiesCount, milestones, onNavigate, isBossTime, bossBattlePending, onClockOut, theme
}) => {
  const gsTasks = tasks.filter(t => t.category === 'GS' && t.completed).length;
  const optTasks = tasks.filter(t => t.category === 'Optional' && t.completed).length;
  
  const activeGs = tasks.filter(t => t.category === 'GS' && !t.completed).length;
  const activeOpt = tasks.filter(t => t.category === 'Optional' && !t.completed).length;

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-10 space-y-8 animate-slide-up">
      
      {/* Interactive Map (Replaces Welcome Header) */}
      <div className="w-full">
         <h2 className={`text-xl font-bold ${theme.textPrimary} mb-4 px-2 flex items-center gap-2`}>
            <span className="text-2xl">🗺️</span> Path to Ministry
         </h2>
         <div className="transform hover:scale-[1.01] transition-transform duration-500">
            <WorldMap user={user} milestones={milestones} />
         </div>
      </div>

      {/* Action Bar (Clock Out / Mood) */}
      <div className="flex gap-4">
         <button 
            onClick={() => onNavigate(GameTabs.MAINS)} 
            className={`flex-1 ${theme.buttonPrimary} p-4 rounded-2xl shadow-lg font-bold flex items-center justify-center gap-2 transform hover:-translate-y-1 transition-all active:scale-95`}
         >
            <ScrollText /> Write Answers
         </button>
         <button 
            onClick={onClockOut}
            className={`${theme.cardBg} ${theme.textPrimary} ${theme.cardBorder} border p-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm`}
         >
            <LogOut size={20} /> Clock Out
         </button>
      </div>

      {/* Boss Battle Alert */}
      {isBossTime && bossBattlePending && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl animate-pulse-slow flex items-start gap-4 shadow-md">
           <AlertTriangle className="text-red-500 shrink-0" size={32} />
           <div>
             <h3 className="text-red-800 font-bold text-lg">HEAVENLY TRIBULATION ACTIVE</h3>
             <p className="text-red-600 text-sm mb-2 opacity-90">
               It is Wednesday (12PM - 3PM). You must write an Essay to survive the Tribulation.
               Failure will result in <span className="font-bold">-300 XP</span>.
             </p>
             <button 
               onClick={() => onNavigate(GameTabs.ESSAY)}
               className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow"
             >
               Enter Essay Hall
             </button>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Radar Chart Card */}
        <div className={`${theme.cardBg} rounded-3xl p-6 shadow-sm border ${theme.cardBorder} flex-1 flex flex-col items-center justify-center animate-fade-in delay-100`}>
           <h3 className={`font-bold ${theme.textSecondary} mb-4 self-start uppercase tracking-wider text-xs`}>Cultivation Strength</h3>
           <RadarChart stats={{ gs: gsTasks, optional: optTasks, essay: essayCount, mains: mainsCount, hobbies: hobbiesCount }} />
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4 animate-fade-in delay-200">
           <StatCard label="Total Tasks" value={user.totalTasksCompleted} color="bg-blue-50 text-blue-800" labelColor="text-blue-400" />
           <StatCard label="Daily Tasks" value={user.dailyTaskCount} color="bg-purple-50 text-purple-800" labelColor="text-purple-400" />
           <StatCard label="Mains Qs" value={mainsCount} color="bg-green-50 text-green-800" labelColor="text-green-400" />
           <StatCard label="Hobbies" value={hobbiesCount} color="bg-orange-50 text-orange-800" labelColor="text-orange-400" />
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in delay-300">
        <NavCard onClick={() => onNavigate(GameTabs.GS)} icon={<Book size={20} />} title="GS Realm" sub={`${activeGs} active`} theme={theme} color="text-blue-500" bg="bg-blue-50" />
        <NavCard onClick={() => onNavigate(GameTabs.OPTIONAL)} icon={<ScrollText size={20} />} title="Optional" sub={`${activeOpt} active`} theme={theme} color="text-green-500" bg="bg-green-50" />
        <NavCard onClick={() => onNavigate(GameTabs.PETS)} icon={<Bird size={20} />} title="Pets" sub="Sanctuary" theme={theme} color="text-pink-500" bg="bg-pink-50" />
        <NavCard onClick={() => onNavigate(GameTabs.HOBBIES)} icon={<Palette size={20} />} title="Arts" sub="Hobbies" theme={theme} color="text-red-500" bg="bg-red-50" />
        
        <div onClick={() => onNavigate(GameTabs.FORGE)} className={`col-span-2 md:col-span-4 ${theme.sidebarBg} p-5 rounded-3xl shadow-lg hover:shadow-2xl transition-all cursor-pointer group flex items-center justify-between text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center animate-float"><Anvil /></div>
             <div>
                <h3 className="font-bold text-lg text-white">Spirit Forge</h3>
                <p className="text-white/60 text-xs">Craft divine items from completed tasks</p>
             </div>
          </div>
          <div className="bg-white/20 text-white px-4 py-2 rounded-xl font-bold text-sm backdrop-blur-md group-hover:bg-white group-hover:text-slate-900 transition-all">Enter</div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, labelColor }: { label: string, value: number, color: string, labelColor: string }) => (
    <div className={`${color} p-4 rounded-2xl flex flex-col justify-center hover:scale-105 transition-transform duration-300`}>
        <span className={`${labelColor} font-bold text-xs uppercase`}>{label}</span>
        <span className="text-3xl font-black">{value}</span>
    </div>
);

const NavCard = ({ onClick, icon, title, sub, theme, color, bg }: { onClick: () => void, icon: React.ReactNode, title: string, sub: string, theme: Theme, color: string, bg: string }) => (
    <div onClick={onClick} className={`${theme.cardBg} ${theme.cardBorder} p-5 rounded-3xl shadow-sm border hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1`}>
        <div className={`w-10 h-10 rounded-2xl ${bg} ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>{icon}</div>
        <h3 className={`font-bold ${theme.textPrimary}`}>{title}</h3>
        <p className={`${theme.textSecondary} text-xs`}>{sub}</p>
    </div>
);

export default Dashboard;
