import React, { useState, useEffect } from 'react';
import { UserStats, GMPersonality, Task, BossFightState, MCQ, MainsQuestion } from '../types';
import { generateBossQuest, evaluateBossFight } from '../services/geminiService';
import { Sword, Skull, Scroll, Shield, Loader2, Coins, Star } from 'lucide-react';

interface GameMasterHallProps {
  user: UserStats;
  tasks: Task[];
  onReward: (xp: number, gold: number) => void;
}

const GameMasterHall: React.FC<GameMasterHallProps> = ({ user, tasks, onReward }) => {
  const [personality, setPersonality] = useState<GMPersonality>(GMPersonality.ORTHODOX);
  const [gameState, setGameState] = useState<BossFightState>({
    isActive: false,
    type: null,
    mcqs: [],
    mains: [],
    userAnswers: {},
    mainsDrafts: {},
    submitted: false
  });
  const [loading, setLoading] = useState(false);
  const [intro, setIntro] = useState("");
  const [result, setResult] = useState<{ feedback: string, xp: number, gold: number } | null>(null);

  // Randomize personality on mount or task completion trigger
  useEffect(() => {
    const personalities = Object.values(GMPersonality);
    const random = personalities[Math.floor(Math.random() * personalities.length)];
    setPersonality(random);
  }, [user.totalTasksCompleted]); // Trigger change on task updates

  // Theme Logic
  const getTheme = () => {
    switch (personality) {
      case GMPersonality.ORTHODOX:
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case GMPersonality.UNORTHODOX:
        return 'bg-red-50 border-red-900 text-red-900 font-serif';
      case GMPersonality.HEAVENLY_DEMON:
        return 'bg-purple-900 border-yellow-500 text-yellow-100';
      case GMPersonality.COMMANDER:
        return 'bg-green-100 border-green-800 text-green-900 font-mono';
    }
  };

  const getGMName = () => {
    switch (personality) {
      case GMPersonality.ORTHODOX: return "Alliance Leader (Orthodox)";
      case GMPersonality.UNORTHODOX: return "Blood Sect Leader (Unorthodox)";
      case GMPersonality.HEAVENLY_DEMON: return "Heavenly Demon";
      case GMPersonality.COMMANDER: return "Grand Commander";
    }
  };

  const startQuest = async (type: 'DAILY' | 'WEEKLY') => {
    setLoading(true);
    setResult(null);
    
    // Filter tasks
    const now = new Date();
    let relevantTasks: Task[] = [];
    
    if (type === 'DAILY') {
      // 2 days ago
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - 2);
      const start = new Date(targetDate.setHours(0,0,0,0)).getTime();
      const end = new Date(targetDate.setHours(23,59,59,999)).getTime();
      relevantTasks = tasks.filter(t => t.completed && t.dateCompleted && t.dateCompleted >= start && t.dateCompleted <= end);
    } else {
      // Previous week
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - 7);
      const start = targetDate.getTime();
      relevantTasks = tasks.filter(t => t.completed && t.dateCompleted && t.dateCompleted >= start);
    }

    // Fallback if no tasks
    const topics = relevantTasks.length > 0 
      ? relevantTasks.map(t => t.subCategory) 
      : ['General Polity', 'Basic Economy', 'Ethics'];

    const quest = await generateBossQuest([...new Set(topics)], type, personality);
    
    setIntro(quest.introText);
    setGameState({
      isActive: true,
      type,
      mcqs: quest.mcqs,
      mains: quest.mains,
      userAnswers: {},
      mainsDrafts: {},
      submitted: false
    });
    setLoading(false);
  };

  const submitQuest = async () => {
    setLoading(true);
    let correctCount = 0;
    gameState.mcqs.forEach(q => {
      if (gameState.userAnswers[q.id] === q.correctIndex) correctCount++;
    });

    const mainsSubmissions = gameState.mains.map(q => ({
      question: q.question,
      answer: gameState.mainsDrafts[q.id] || "No answer attempted."
    }));

    const evalResult = await evaluateBossFight(
      personality, 
      correctCount, 
      gameState.mcqs.length, 
      mainsSubmissions,
      user.cultivationPath // Pass User Path Here
    );
    
    setResult({
      feedback: evalResult.feedback,
      xp: evalResult.xpReward,
      gold: evalResult.goldReward
    });
    
    onReward(evalResult.xpReward, evalResult.goldReward);
    setGameState(prev => ({ ...prev, submitted: true }));
    setLoading(false);
  };

  // Locked State
  if (user.streak < 7) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300">
        <Shield size={64} className="text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Training Hall Sealed</h2>
        <p className="text-slate-500">
          The Grand Masters only train disciples who have shown consistency.
          <br />
          <span className="font-bold text-indigo-600">Requirement: 7 Day Streak</span>
        </p>
        <p className="mt-4 text-sm text-slate-400">Current Streak: {user.streak} / 7</p>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto no-scrollbar p-4 transition-colors duration-500 ${getTheme()} bg-opacity-20`}>
      {/* GM Header */}
      <div className={`p-6 rounded-3xl mb-6 shadow-sm border-2 ${getTheme()}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
             {personality === GMPersonality.ORTHODOX && <Scroll size={32} />}
             {personality === GMPersonality.UNORTHODOX && <Skull size={32} />}
             {personality === GMPersonality.HEAVENLY_DEMON && <Sword size={32} />}
             {personality === GMPersonality.COMMANDER && <Shield size={32} />}
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider">{getGMName()}</h2>
            <p className="opacity-80 text-sm">Civil Service Cultivation Master</p>
          </div>
        </div>
        
        {!gameState.isActive && !result && (
          <div className="space-y-4">
             <p className="italic font-bold text-lg">"Show me your resolve, aspirant."</p>
             <div className="flex gap-4">
               <button 
                 onClick={() => startQuest('DAILY')}
                 disabled={loading}
                 className="flex-1 bg-white/20 hover:bg-white/30 border border-current py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
               >
                 {loading ? <Loader2 className="animate-spin" /> : 'Start Daily Drill'}
               </button>
               {new Date().getDay() === 3 && (
                 <button 
                   onClick={() => startQuest('WEEKLY')}
                   disabled={loading}
                   className="flex-1 bg-current text-white/90 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                 >
                   {loading ? <Loader2 className="animate-spin" /> : 'Weekly Boss Raid'}
                 </button>
               )}
             </div>
          </div>
        )}

        {intro && gameState.isActive && !gameState.submitted && (
           <p className="italic mb-4 border-l-4 border-current pl-4 py-2 bg-white/10 rounded-r-lg">
             "{intro}"
           </p>
        )}
      </div>

      {/* Quest Interface */}
      {gameState.isActive && !gameState.submitted && (
        <div className="space-y-8 pb-20">
          {/* MCQs */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Sword size={20} /> Prelims Assault</h3>
            {gameState.mcqs.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="font-bold text-slate-800 mb-4">{idx + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setGameState(prev => ({ ...prev, userAnswers: { ...prev.userAnswers, [q.id]: oIdx } }))}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${gameState.userAnswers[q.id] === oIdx ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'border-slate-100 hover:bg-slate-50'}`}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mains */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Scroll size={20} /> Mains Duel</h3>
            {gameState.mains.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="font-bold text-slate-800 mb-4">Q{idx + 1}. {q.question}</p>
                <textarea 
                  className="w-full h-40 p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Draft your answer..."
                  value={gameState.mainsDrafts[q.id] || ""}
                  onChange={(e) => setGameState(prev => ({ ...prev, mainsDrafts: { ...prev.mainsDrafts, [q.id]: e.target.value } }))}
                />
              </div>
            ))}
          </div>

          <button 
            onClick={submitQuest}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Submit to Judgment'}
          </button>
        </div>
      )}

      {/* Result View */}
      {result && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-yellow-400 text-center animate-in zoom-in duration-300">
          <h3 className="text-3xl font-black text-slate-800 mb-6">Evaluation Complete</h3>
          
          <div className="mb-8 text-left bg-slate-50 p-6 rounded-2xl border-l-4 border-slate-800 italic text-slate-700">
            "{result.feedback}"
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-2xl border border-yellow-200 min-w-[120px]">
              <Coins className="text-yellow-600 mb-2" size={32} />
              <span className="text-3xl font-black text-yellow-800">+{result.gold}</span>
              <span className="text-xs font-bold text-yellow-600 uppercase">Gold Earned</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-2xl border border-purple-200 min-w-[120px]">
              <Star className="text-purple-600 mb-2" size={32} />
              <span className="text-3xl font-black text-purple-800">+{result.xp}</span>
              <span className="text-xs font-bold text-purple-600 uppercase">XP Gained</span>
            </div>
          </div>

          <button 
            onClick={() => {
              setResult(null);
              setGameState(prev => ({ ...prev, isActive: false, submitted: false }));
            }}
            className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700"
          >
            Return to Training
          </button>
        </div>
      )}
    </div>
  );
};

export default GameMasterHall;
