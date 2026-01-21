import React, { useState, useEffect, useRef } from 'react';
import { UserStats, ChatMessage, CultivationPath, GMPersonality } from '../types';
import { chatWithMentor } from '../services/geminiService';
import { Send, Scroll, Skull, Sword, Shield, Loader2, Lock, Sparkles } from 'lucide-react';

interface GrandHallProps {
  user: UserStats;
  chatHistory: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
}

const GrandHall: React.FC<GrandHallProps> = ({ user, chatHistory, onAddMessage }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Logic to determine available mentor
  const getPrimaryMentor = (): GMPersonality | null => {
    switch (user.cultivationPath) {
      case CultivationPath.ORTHODOX: return GMPersonality.ORTHODOX;
      case CultivationPath.UNORTHODOX: return GMPersonality.UNORTHODOX;
      case CultivationPath.DEMONIC: return GMPersonality.HEAVENLY_DEMON;
      case CultivationPath.SECULAR: return GMPersonality.COMMANDER;
      default: return null;
    }
  };

  const [activeMentor, setActiveMentor] = useState<GMPersonality | null>(getPrimaryMentor());
  
  // Hidden Trigger State (Mocked)
  const [guestMentor, setGuestMentor] = useState<GMPersonality | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const getGreeting = (persona: GMPersonality) => {
    switch (persona) {
      case GMPersonality.ORTHODOX: return "Welcome, Daoist. The path of righteousness is steep. How weighs your heart today?";
      case GMPersonality.UNORTHODOX: return "So you're here, brat. Don't waste my time. What's blocking your power?";
      case GMPersonality.HEAVENLY_DEMON: return "You dare enter my presence? Speak, Ant. Why have you not conquered your syllabus yet?";
      case GMPersonality.COMMANDER: return "At ease, Soldier! Report your status. Are you winning the war against executive dysfunction?";
      default: return "Greetings.";
    }
  };

  // Initial Greeting (Only if history is empty)
  useEffect(() => {
    if (chatHistory.length === 0 && activeMentor) {
      const greeting = getGreeting(activeMentor);
      onAddMessage({
        id: 'init',
        sender: activeMentor,
        text: greeting,
        timestamp: Date.now()
      });
    }
  }, [activeMentor, chatHistory.length, onAddMessage]);

  // Check for Hidden Triggers (Simulated Logic)
  useEffect(() => {
    // Example: If user has extremely high XP or specific milestone, a guest might appear
    // For demo, we can just say if level > 5 and no guest yet, try to trigger randomly
    if (user.level > 5 && !guestMentor && Math.random() > 0.8) {
        const others = Object.values(GMPersonality).filter(p => p !== activeMentor);
        const randomGuest = others[Math.floor(Math.random() * others.length)];
        setGuestMentor(randomGuest);
    }
  }, [user.level, activeMentor, guestMentor]);


  const getTheme = (persona: GMPersonality) => {
    switch (persona) {
      case GMPersonality.ORTHODOX: return 'bg-blue-50 border-blue-200 text-blue-900';
      case GMPersonality.UNORTHODOX: return 'bg-red-50 border-red-900 text-red-900';
      case GMPersonality.HEAVENLY_DEMON: return 'bg-purple-900 border-yellow-500 text-yellow-100';
      case GMPersonality.COMMANDER: return 'bg-green-100 border-green-800 text-green-900';
      default: return 'bg-white';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeMentor) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: Date.now()
    };

    onAddMessage(userMsg);
    setInput('');
    setLoading(true);

    // Pass last 20 messages for context to save tokens, plus the new user message
    // Note: 'userMsg' is not in chatHistory yet during this render cycle usually, 
    // but geminiService takes the history context + new message separately.
    const recentHistory = chatHistory.slice(-20);
    const responseText = await chatWithMentor(recentHistory, input, activeMentor, user.cultivationPath);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: activeMentor,
      text: responseText,
      timestamp: Date.now()
    };

    onAddMessage(aiMsg);
    setLoading(false);
  };

  const switchToGuest = () => {
    if (guestMentor) {
      setActiveMentor(guestMentor);
      // Don't clear history, just announce the new guest
      const greeting = getGreeting(guestMentor);
      onAddMessage({
          id: Date.now().toString(),
          sender: guestMentor,
          text: `[SYSTEM: ${guestMentor} has entered the Hall]\n\n${greeting}`,
          timestamp: Date.now()
      });
      setGuestMentor(null);
    }
  };

  if (!user.cultivationPath) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-3xl">
        <Lock size={64} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">Grand Hall Locked</h2>
        <p className="text-slate-500 max-w-xs mx-auto mt-2">
          You must choose a Cultivation Path in your Profile (Sign in with Apple) to enter the Grand Hall.
        </p>
      </div>
    );
  }

  if (!activeMentor) return null;

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
      
      {/* Header */}
      <div className={`p-4 border-b flex justify-between items-center transition-colors duration-500 ${getTheme(activeMentor)} bg-opacity-20`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-white/50 backdrop-blur-sm`}>
            {activeMentor === GMPersonality.ORTHODOX && <Scroll size={24} className="text-blue-700" />}
            {activeMentor === GMPersonality.UNORTHODOX && <Skull size={24} className="text-red-700" />}
            {activeMentor === GMPersonality.HEAVENLY_DEMON && <Sword size={24} className="text-purple-700" />}
            {activeMentor === GMPersonality.COMMANDER && <Shield size={24} className="text-green-700" />}
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none">Grand Hall</h2>
            <p className="text-xs opacity-70 uppercase tracking-widest">{activeMentor.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Hidden Reward Trigger */}
        {guestMentor && (
          <button 
            onClick={switchToGuest}
            className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold animate-bounce shadow-lg"
          >
            <Sparkles size={12} />
            {guestMentor} Approaches!
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
        {chatHistory.map((msg) => {
          const isUser = msg.sender === 'user';
          // Determine theme for specific message if it was from a different mentor in history
          const msgTheme = !isUser && msg.sender !== activeMentor 
             ? getTheme(msg.sender as GMPersonality) 
             : getTheme(activeMentor);

          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`
                  max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${isUser 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : `${msgTheme} rounded-tl-none border`
                  }
                `}
              >
                {!isUser && <p className="text-[10px] font-bold opacity-50 mb-1 uppercase">{(msg.sender as string).replace('_', ' ')}</p>}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className={`p-4 rounded-2xl rounded-tl-none bg-white border border-slate-200 flex items-center gap-2 text-slate-400 text-sm`}>
              <Loader2 className="animate-spin" size={16} /> The Master is pondering...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Seek guidance on your cultivation..."
            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-slate-900 text-white p-3 rounded-xl hover:bg-black disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrandHall;