import React, { useState } from 'react';
import { MoodType, GMPersonality, CultivationPath } from '../types';
import { generateMoodAdvice } from '../services/geminiService';
import { Smile, Frown, Meh, Zap, CloudRain, Loader2, PlayCircle, LogOut } from 'lucide-react';

interface MoodTrackerProps {
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  userPath?: CultivationPath;
  onLogMood: (mood: MoodType, advice: string, personality: GMPersonality) => void;
  onCancel?: () => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ type, userPath, onLogMood, onCancel }) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [personality, setPersonality] = useState<GMPersonality>(GMPersonality.ORTHODOX);

  const moods: { type: MoodType; icon: React.ReactNode; color: string }[] = [
    { type: 'Motivated', icon: <Zap />, color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    { type: 'Confident', icon: <Smile />, color: 'bg-green-100 text-green-600 border-green-200' },
    { type: 'Tired', icon: <Meh />, color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { type: 'Anxious', icon: <CloudRain />, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { type: 'Lost', icon: <Frown />, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  ];

  const handleMoodSelect = async (mood: MoodType) => {
    setSelectedMood(mood);
    setLoading(true);
    
    // Pick a random personality for the response
    const personas = Object.values(GMPersonality);
    const randomPersona = personas[Math.floor(Math.random() * personas.length)];
    setPersonality(randomPersona);

    const generatedAdvice = await generateMoodAdvice(mood, randomPersona, userPath);
    setAdvice(generatedAdvice);
    setLoading(false);
  };

  const handleConfirm = () => {
    if (selectedMood && advice) {
      onLogMood(selectedMood, advice, personality);
    }
  };

  const getPersonaName = () => {
    switch (personality) {
      case GMPersonality.ORTHODOX: return "The Hermit";
      case GMPersonality.UNORTHODOX: return "Unorthodox Leader";
      case GMPersonality.HEAVENLY_DEMON: return "Heavenly Demon";
      case GMPersonality.COMMANDER: return "Grand Commander";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-indigo-50 w-full max-w-md mx-auto animate-in zoom-in duration-300">
      {!advice ? (
        <>
          <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
            {type === 'CLOCK_IN' ? 'Morning Roll Call' : 'Evening Report'}
          </h3>
          <p className="text-slate-500 text-center text-sm mb-6">
            {type === 'CLOCK_IN' ? 'How is your Dao Heart feeling today?' : 'What is the state of your spirit after today\'s cultivation?'}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
             {moods.map((m) => (
               <button
                 key={m.type}
                 disabled={loading}
                 onClick={() => handleMoodSelect(m.type)}
                 className={`
                    flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all
                    ${loading ? 'opacity-50' : 'hover:scale-105'}
                    ${m.color}
                 `}
               >
                 {m.icon}
                 <span className="text-xs font-bold mt-2">{m.type}</span>
               </button>
             ))}
          </div>
          
          {loading && (
             <div className="flex items-center justify-center gap-2 text-indigo-500 font-bold animate-pulse">
               <Loader2 className="animate-spin" /> Divining celestial guidance...
             </div>
          )}
          
          {onCancel && !loading && (
            <button onClick={onCancel} className="w-full py-3 text-slate-400 font-bold hover:text-slate-600">Skip for now</button>
          )}
        </>
      ) : (
        <div className="text-center">
           <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
             {personality === GMPersonality.ORTHODOX && '📜'}
             {personality === GMPersonality.UNORTHODOX && '👹'}
             {personality === GMPersonality.HEAVENLY_DEMON && '⚔️'}
             {personality === GMPersonality.COMMANDER && '🛡️'}
           </div>
           
           <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs mb-4">{getPersonaName()} Says:</h3>
           
           <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-indigo-500 mb-6 italic text-slate-700">
             "{advice}"
           </div>

           <button 
             onClick={handleConfirm}
             className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
           >
             {type === 'CLOCK_IN' ? <PlayCircle /> : <LogOut />}
             {type === 'CLOCK_IN' ? 'Begin Cultivation' : 'End Session'}
           </button>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
