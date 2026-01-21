import React, { useState } from 'react';
import { Task, Theme, GS_GROUPS, OPTIONAL_GROUPS } from '../types';
import { BookOpen, RefreshCw, CheckCircle2, Lock, Gift, Star, Zap, Coins, Box } from 'lucide-react';

interface RevisionViewProps {
  tasks: Task[];
  onCheckIn: (taskId: string) => { type: 'XP' | 'GOLD' | 'ITEM'; amount: number; label: string };
  theme: Theme;
}

const RevisionView: React.FC<RevisionViewProps> = ({ tasks, onCheckIn, theme }) => {
  const [activeTab, setActiveTab] = useState<'GS' | 'OPTIONAL'>('GS');
  const [reward, setReward] = useState<{ type: string; amount: number; label: string } | null>(null);
  const [animatingTask, setAnimatingTask] = useState<string | null>(null);

  const categories = activeTab === 'GS' ? GS_GROUPS : OPTIONAL_GROUPS;

  // --- Logic for Next Revision Date ---
  const getNextRevisionDetails = (task: Task) => {
    if (!task.completed || !task.dateCompleted) return null;
    
    const historyCount = task.revisionHistory ? task.revisionHistory.length : 0;
    const completedDate = new Date(task.dateCompleted);
    completedDate.setHours(0,0,0,0);
    
    // Schedule Logic
    // Rev 1: D+1, Rev 2: D+2, Rev 3: D+3, Rev 4: D+7
    // Rev 5+: Last Check-in + 15 Days
    
    let targetDate = new Date(completedDate);
    
    if (historyCount === 0) targetDate.setDate(targetDate.getDate() + 1);
    else if (historyCount === 1) targetDate.setDate(targetDate.getDate() + 2);
    else if (historyCount === 2) targetDate.setDate(targetDate.getDate() + 3);
    else if (historyCount === 3) targetDate.setDate(targetDate.getDate() + 7);
    else {
      // 5th revision onwards: 15 days after LAST REVISION
      const lastRev = task.revisionHistory ? task.revisionHistory[task.revisionHistory.length - 1] : task.dateCompleted;
      const lastDate = new Date(lastRev);
      lastDate.setHours(0,0,0,0);
      targetDate = new Date(lastDate);
      targetDate.setDate(targetDate.getDate() + 15);
    }
    
    const now = new Date();
    now.setHours(0,0,0,0);
    
    const isDue = now >= targetDate;
    const daysUntil = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      count: historyCount,
      targetDate,
      isDue,
      daysUntil
    };
  };

  const handleCheckIn = (taskId: string) => {
    setAnimatingTask(taskId);
    setTimeout(() => {
        const prize = onCheckIn(taskId);
        setReward(prize);
        setAnimatingTask(null);
    }, 1500); // Animation delay
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 space-y-6 relative">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <RefreshCw className="text-indigo-500" />
          Memory Palace
        </h2>
        <p className="text-slate-500">Review your past conquests to strengthen your foundation.</p>
      </div>

      <div className="flex bg-white p-1 rounded-xl w-fit border border-slate-200 shadow-sm">
        <button 
          onClick={() => setActiveTab('GS')}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'GS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-indigo-600'}`}
        >
          General Studies
        </button>
        <button 
          onClick={() => setActiveTab('OPTIONAL')}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'OPTIONAL' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-indigo-600'}`}
        >
          Optional
        </button>
      </div>

      <div className="space-y-6">
        {categories.map(cat => {
            const categoryTasks = tasks.filter(t => t.category === (activeTab === 'GS' ? 'GS' : 'Optional') && t.subCategory === cat && t.completed);
            
            if (categoryTasks.length === 0) return null;

            return (
                <div key={cat} className={`${theme.cardBg} rounded-2xl p-6 border ${theme.cardBorder}`}>
                    <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center gap-2`}>
                        <BookOpen size={18} /> {cat}
                    </h3>
                    <div className="space-y-3">
                        {categoryTasks.map(task => {
                            const rev = getNextRevisionDetails(task);
                            if (!rev) return null;

                            return (
                                <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-bold text-slate-700 ${task.completed ? '' : 'line-through'}`}>{task.title}</span>
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                                Rev {rev.count}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            {rev.isDue 
                                                ? <span className="text-green-600 font-bold">Revision Due Today!</span> 
                                                : `Next review in ${rev.daysUntil} days`}
                                        </p>
                                    </div>

                                    {rev.isDue ? (
                                        <button 
                                            onClick={() => handleCheckIn(task.id)}
                                            disabled={!!animatingTask}
                                            className={`
                                                relative overflow-hidden px-6 py-2 rounded-xl font-bold text-white shadow-md transition-all
                                                ${animatingTask === task.id ? 'bg-slate-300' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 active:scale-95'}
                                            `}
                                        >
                                            {animatingTask === task.id ? (
                                                <div className="flex items-center gap-2">
                                                    <RefreshCw className="animate-spin" size={16} /> Opening...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Gift size={16} /> Check In & Reward
                                                </div>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-300 text-sm font-bold bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                            <Lock size={14} /> Locked
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })}
        {categories.every(cat => tasks.filter(t => t.category === (activeTab === 'GS' ? 'GS' : 'Optional') && t.subCategory === cat && t.completed).length === 0) && (
            <div className="text-center py-20 text-slate-400 italic">
                Complete tasks in the {activeTab} realm to unlock Revision.
            </div>
        )}
      </div>

      {/* Gacha Reward Modal */}
      {reward && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm animate-in zoom-in slide-in-from-bottom-10 border-4 border-yellow-400 relative overflow-hidden">
               {/* Shine Effect */}
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none"></div>

               <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center text-yellow-600 animate-bounce">
                   {reward.type === 'XP' && <Zap size={40} />}
                   {reward.type === 'GOLD' && <Coins size={40} />}
                   {reward.type === 'ITEM' && <Box size={40} />}
               </div>
               
               <h3 className="text-2xl font-black text-slate-800 mb-1">Gacha Reward!</h3>
               <p className="text-slate-500 mb-6 text-sm">Excellent revision work.</p>
               
               <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100 mb-6">
                   <p className="text-3xl font-black text-indigo-600">+{reward.amount}</p>
                   <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">{reward.label}</p>
               </div>

               <button 
                  onClick={() => setReward(null)}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors"
               >
                  Collect
               </button>
           </div>
        </div>
      )}

    </div>
  );
};

export default RevisionView;
