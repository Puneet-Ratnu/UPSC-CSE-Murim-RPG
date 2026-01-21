import React, { useState, useEffect } from 'react';
import { GameTabs, Task, UserStats, StoryChapter, MAX_LEVEL, XP_PER_LEVEL, MainsLog, Pet, HobbyLog, HobbyType, Material, CraftedItem, ItemRarity, BOSS_START_HOUR, BOSS_END_HOUR, Potion, Milestone, MoodEntry, MoodType, GMPersonality, CultivationPath, ChatMessage, Theme } from './types';
import { LayoutDashboard, Book, ScrollText, Feather, UserCircle, Bird, Palette, Anvil, Swords, MessageCircle, Library } from 'lucide-react';
import TaskView from './components/TaskView';
import EssayView from './components/EssayView';
import StoryView from './components/StoryView';
import Profile from './components/Profile';
import MainsView from './components/MainsView';
import PetSanctuary from './components/PetSanctuary';
import Dashboard from './components/Dashboard';
import HobbiesView from './components/HobbiesView';
import ForgeView from './components/ForgeView';
import GameMasterHall from './components/GameMasterHall';
import GrandHall from './components/GrandHall';
import RevisionView from './components/RevisionView';
import MoodTracker from './components/MoodTracker';
import { getMotivationalQuote } from './services/geminiService';

// --- THEME DEFINITIONS ---
const DEFAULT_THEME: Theme = {
  name: 'Default',
  font: 'font-sans',
  bg: 'bg-pastel-bg',
  textPrimary: 'text-slate-700',
  textSecondary: 'text-slate-500',
  accent: 'text-pastel-purple',
  sidebarBg: 'bg-white',
  sidebarText: 'text-slate-400',
  sidebarActive: 'bg-pastel-blue text-blue-600',
  cardBg: 'bg-white',
  cardBorder: 'border-slate-100',
  buttonPrimary: 'bg-slate-800 text-white',
  avatarBorder: 'border-4 border-pastel-pink',
  iconColor: 'text-blue-500'
};

const THEMES: Record<CultivationPath, Theme> = {
  [CultivationPath.ORTHODOX]: {
    name: 'Orthodox',
    font: 'font-serif', // Playfair Display
    bg: 'bg-slate-50',
    textPrimary: 'text-blue-950',
    textSecondary: 'text-slate-600',
    accent: 'text-amber-600',
    sidebarBg: 'bg-slate-900',
    sidebarText: 'text-slate-400',
    sidebarActive: 'bg-blue-800 text-amber-100 ring-2 ring-amber-500',
    cardBg: 'bg-white',
    cardBorder: 'border-blue-100',
    buttonPrimary: 'bg-blue-900 text-amber-50 hover:bg-blue-800 border border-amber-500',
    avatarBorder: 'border-4 border-double border-amber-500',
    iconColor: 'text-blue-700'
  },
  [CultivationPath.UNORTHODOX]: {
    name: 'Unorthodox',
    font: 'font-montserrat',
    bg: 'bg-stone-100',
    textPrimary: 'text-red-950',
    textSecondary: 'text-stone-600',
    accent: 'text-red-700',
    sidebarBg: 'bg-stone-900',
    sidebarText: 'text-stone-500',
    sidebarActive: 'bg-red-900 text-white border-l-4 border-red-500',
    cardBg: 'bg-[#fafafa]',
    cardBorder: 'border-red-200',
    buttonPrimary: 'bg-red-900 text-white hover:bg-red-800',
    avatarBorder: 'border-4 border-dashed border-red-800',
    iconColor: 'text-red-700'
  },
  [CultivationPath.DEMONIC]: {
    name: 'Demonic',
    font: 'font-cinzel',
    bg: 'bg-purple-50', // Light mode with tint
    textPrimary: 'text-purple-950',
    textSecondary: 'text-purple-700/70',
    accent: 'text-fuchsia-600',
    sidebarBg: 'bg-indigo-950',
    sidebarText: 'text-indigo-400',
    sidebarActive: 'bg-fuchsia-900 text-fuchsia-100 shadow-[0_0_15px_rgba(192,38,211,0.5)]',
    cardBg: 'bg-white',
    cardBorder: 'border-purple-200',
    buttonPrimary: 'bg-purple-950 text-purple-100 hover:bg-purple-900 border border-purple-500',
    avatarBorder: 'border-[3px] border-purple-600 ring-4 ring-purple-200',
    iconColor: 'text-purple-600'
  },
  [CultivationPath.SECULAR]: {
    name: 'Secular',
    font: 'font-mono', // Roboto Slab
    bg: 'bg-emerald-50',
    textPrimary: 'text-emerald-950',
    textSecondary: 'text-emerald-700/80',
    accent: 'text-yellow-700',
    sidebarBg: 'bg-emerald-950',
    sidebarText: 'text-emerald-400',
    sidebarActive: 'bg-emerald-800 text-white border-b-4 border-yellow-600',
    cardBg: 'bg-[#fdfbf7]', // Paper feel
    cardBorder: 'border-emerald-200',
    buttonPrimary: 'bg-emerald-900 text-white hover:bg-emerald-800 shadow-md',
    avatarBorder: 'border-4 border-emerald-800 rounded-lg', // Square for discipline
    iconColor: 'text-emerald-700'
  }
};

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<GameTabs>(GameTabs.DASHBOARD);
  
  const [user, setUser] = useState<UserStats>(() => {
    const saved = localStorage.getItem('upsc_user');
    return saved ? JSON.parse(saved) : {
      name: 'Aspirant Puneet',
      level: 1,
      xp: 0,
      spendableXp: 0,
      gold: 0,
      streak: 0,
      lastLoginDate: new Date().toISOString().split('T')[0],
      joinedDate: Date.now(),
      appleLinked: false,
      avatarId: 101,
      skinId: 1,
      totalTasksCompleted: 0,
      dailyTaskCount: 0,
      weeklyTaskCount: 0,
      lastBossBattleDate: '',
      masteredCategories: []
    };
  });

  const currentTheme = user.cultivationPath ? THEMES[user.cultivationPath] : DEFAULT_THEME;

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('upsc_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [stories, setStories] = useState<StoryChapter[]>(() => {
    const saved = localStorage.getItem('upsc_stories');
    return saved ? JSON.parse(saved) : [];
  });

  const [mainsLogs, setMainsLogs] = useState<MainsLog[]>(() => {
    const saved = localStorage.getItem('upsc_mains');
    return saved ? JSON.parse(saved) : [];
  });

  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem('upsc_pets');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePetId, setActivePetId] = useState<string | null>(() => {
    return localStorage.getItem('upsc_active_pet');
  });

  const [hobbiesLogs, setHobbiesLogs] = useState<HobbyLog[]>(() => {
    const saved = localStorage.getItem('upsc_hobbies');
    return saved ? JSON.parse(saved) : [];
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('upsc_materials');
    return saved ? JSON.parse(saved) : [
      { id: 'iron', name: 'Iron Ingot', count: 0, source: 'GS' },
      { id: 'fire', name: 'Fire Essence', count: 0, source: 'Essay' },
      { id: 'wood', name: 'Spirit Wood', count: 0, source: 'Optional' }
    ];
  });

  const [items, setItems] = useState<CraftedItem[]>(() => {
    const saved = localStorage.getItem('upsc_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('upsc_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Hardcoded Milestones for the Map
  const [milestones] = useState<Milestone[]>([
    { id: '1', levelReq: 1, title: 'The Village', description: 'Begin your journey.', x: 10, y: 90, unlocked: true, icon: 'Village' },
    { id: '2', levelReq: 50, title: 'Bamboo Forest', description: 'First step into the wild.', x: 30, y: 80, unlocked: false, icon: 'Forest' },
    { id: '3', levelReq: 150, title: 'Iron Peaks', description: 'A test of resilience.', x: 25, y: 60, unlocked: false, icon: 'Mountain' },
    { id: '4', levelReq: 300, title: 'Cloud Temple', description: 'Higher learning awaits.', x: 50, y: 50, unlocked: false, icon: 'Temple' },
    { id: '5', levelReq: 500, title: 'Imperial Capital', description: 'The Minister\'s Seat.', x: 80, y: 30, unlocked: false, icon: 'Castle' }
  ]);

  const [moodLogs, setMoodLogs] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem('upsc_moods');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePotion, setActivePotion] = useState<Potion | null>(null);

  const [quote, setQuote] = useState<string>("Embark on your journey.");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState<{title: string, msg: string} | null>(null);
  const [showMoodTracker, setShowMoodTracker] = useState<'CLOCK_IN' | 'CLOCK_OUT' | null>(null);

  // --- Effects ---

  // Persistence
  useEffect(() => { localStorage.setItem('upsc_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('upsc_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('upsc_stories', JSON.stringify(stories)); }, [stories]);
  useEffect(() => { localStorage.setItem('upsc_mains', JSON.stringify(mainsLogs)); }, [mainsLogs]);
  useEffect(() => { localStorage.setItem('upsc_pets', JSON.stringify(pets)); }, [pets]);
  useEffect(() => { if(activePetId) localStorage.setItem('upsc_active_pet', activePetId); }, [activePetId]);
  useEffect(() => { localStorage.setItem('upsc_hobbies', JSON.stringify(hobbiesLogs)); }, [hobbiesLogs]);
  useEffect(() => { localStorage.setItem('upsc_materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('upsc_items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('upsc_moods', JSON.stringify(moodLogs)); }, [moodLogs]);
  useEffect(() => { localStorage.setItem('upsc_chat_history', JSON.stringify(chatHistory)); }, [chatHistory]);

  // Potion Timer Check
  useEffect(() => {
    const interval = setInterval(() => {
      if (activePotion && activePotion.activeUntil && Date.now() > activePotion.activeUntil) {
        setActivePotion(null);
        setOverlayMessage({ title: "Potion Expired", msg: "The effects of the elixir have faded." });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [activePotion]);

  // Logic Loop (Time Checks, Streaks)
  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check for Clock In Mood
    const hasClockedIn = moodLogs.some(m => m.date === today && m.type === 'CLOCK_IN');
    if (!hasClockedIn) {
      setTimeout(() => setShowMoodTracker('CLOCK_IN'), 1000); // Small delay for UX
    }

    // Daily Reset / Streak
    if (user.lastLoginDate !== today) {
      const last = new Date(user.lastLoginDate);
      const curr = new Date(today);
      const diffTime = Math.abs(curr.getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        const newStreak = user.streak + 1;
        setUser(u => ({ 
          ...u, streak: newStreak, lastLoginDate: today, 
          dailyTaskCount: 0 // Reset daily count
        }));
        if (now.getDay() === 1) { // Monday resets weekly
           setUser(u => ({ ...u, weeklyTaskCount: 0 }));
        }
        checkStreakRewards(newStreak);
        getMotivationalQuote(newStreak).then(setQuote);
      } else if (diffDays > 1) {
        setUser(u => ({ 
           ...u, streak: 1, lastLoginDate: today, 
           dailyTaskCount: 0, weeklyTaskCount: 0 
        }));
      } else {
        // Same day (re-open app)
        setUser(u => ({ ...u, lastLoginDate: today }));
      }
    } else {
       getMotivationalQuote(user.streak).then(setQuote);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // --- Helpers ---

  const checkStreakRewards = (streak: number) => {
    const milestones = [7, 14, 30, 60, 100];
    if (milestones.includes(streak)) {
      setOverlayMessage({ title: `${streak} Day Streak!`, msg: "You have earned a reward!" });
      addXP(500 * (streak/7));
    }
  };

  const addXP = (amount: number) => {
    const multiplier = activePotion ? activePotion.multiplier : 1;
    const finalAmount = Math.floor(amount * multiplier);

    setUser(prev => {
      let newXP = prev.xp + finalAmount;
      let newSpendable = (prev.spendableXp || 0) + finalAmount;
      let newLevel = prev.level;
      let leveledUp = false;

      while (newXP >= newLevel * XP_PER_LEVEL && newLevel < MAX_LEVEL) {
        newXP -= newLevel * XP_PER_LEVEL;
        newLevel++;
        leveledUp = true;
      }

      if (leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      return { ...prev, xp: newXP, spendableXp: newSpendable, level: newLevel };
    });
  };

  const addGold = (amount: number) => {
     setUser(u => ({ ...u, gold: (u.gold || 0) + amount }));
  };

  const checkSpecialRewards = (total: number, daily: number, weekly: number) => {
     if (total > 0 && total % 150 === 0) {
        setOverlayMessage({ title: "Milestone Reached!", msg: "150 Tasks Completed! You found a forgotten Scroll of Wisdom (Skin Unlocked)." });
     }
     if (daily === 50) {
        setOverlayMessage({ title: "Frenzy!", msg: "50 Tasks in one day! You are possessed by the Spirit of Diligence." });
        addMaterial('iron', 10);
     }
     if (weekly === 200) {
        setOverlayMessage({ title: "Weekly Warlord", msg: "200 Tasks this week! The Sect Elders are impressed." });
        addMaterial('fire', 10);
     }
  };

  const addMaterial = (id: string, amount: number) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, count: m.count + amount } : m));
  };

  const feedPet = (xpAmount: number) => {
    const multiplier = activePotion ? activePotion.multiplier : 1;
    const finalXp = Math.floor(xpAmount * multiplier);

    if (!activePetId) return;
    setPets(prev => prev.map(p => {
      if (p.id === activePetId) {
        let newXp = p.xp + finalXp;
        let newLevel = p.level;
        let newStage = p.stage;
        let newMax = p.maxXp;

        if (newXp >= p.maxXp) {
           newXp = newXp - p.maxXp;
           newLevel += 1;
           newMax = Math.floor(p.maxXp * 1.5);
           if (newLevel === 5) newStage = 'Hatchling';
           if (newLevel === 20) newStage = 'Adult';
           if (newLevel === 50) newStage = 'Mythic';
        }
        return { ...p, xp: newXp, level: newLevel, maxXp: newMax, stage: newStage };
      }
      return p;
    }));
  };

  // --- Handlers ---

  const handleLogMood = (mood: MoodType, advice: string, personality: GMPersonality) => {
    if (showMoodTracker) {
      setMoodLogs(prev => [...prev, {
        date: new Date().toISOString().split('T')[0],
        type: showMoodTracker,
        mood,
        aiResponse: advice,
        personality
      }]);
      setShowMoodTracker(null);
    }
  };

  const handleAddTask = (title: string, subCategory: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      category: activeTab === GameTabs.GS ? 'GS' : 'Optional',
      subCategory,
      completed: false,
      dateAdded: Date.now()
    };
    setTasks([...tasks, newTask]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed;
        if (isCompleting) {
           addXP(100);
           
           // Stats Update
           setUser(u => {
             const newTotal = (u.totalTasksCompleted || 0) + 1;
             const newDaily = (u.dailyTaskCount || 0) + 1;
             const newWeekly = (u.weeklyTaskCount || 0) + 1;
             checkSpecialRewards(newTotal, newDaily, newWeekly);
             return { ...u, totalTasksCompleted: newTotal, dailyTaskCount: newDaily, weeklyTaskCount: newWeekly };
           });

           // Material Drops
           if (t.category === 'GS') addMaterial('iron', 1);
           if (t.category === 'Optional') addMaterial('wood', 1);
        }
        return { ...t, completed: isCompleting, dateCompleted: isCompleting ? Date.now() : undefined };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleEssaySubmit = (count: number, topics: any[]) => {
    const totalMarks = topics.reduce((acc, t) => acc + (t.marks || 0), 0);
    const xp = (count * 500) + (totalMarks * 2);
    addXP(xp);
    addMaterial('fire', count); // Essays give Fire

    // Boss Battle Check
    const now = new Date();
    const isWednesday = now.getDay() === 3;
    const hour = now.getHours();
    if (isWednesday && hour >= BOSS_START_HOUR && hour < BOSS_END_HOUR) {
        const today = now.toISOString().split('T')[0];
        if (user.lastBossBattleDate !== today) {
            setUser(u => ({ ...u, lastBossBattleDate: today }));
            setOverlayMessage({ title: "Tribulation Survived!", msg: "You have withstood the Heavenly Tribulation." });
        }
    }

    setTimeout(() => setActiveTab(GameTabs.DASHBOARD), 2000);
  };

  const handleMainsLog = (count: number) => {
     const today = new Date().toISOString().split('T')[0];
     const existingLogIndex = mainsLogs.findIndex(l => l.date === today);
     if (existingLogIndex > -1) {
        const newLogs = [...mainsLogs];
        newLogs[existingLogIndex].count += count;
        setMainsLogs(newLogs);
     } else {
        setMainsLogs([...mainsLogs, { date: today, count }]);
     }
     addXP(count * 50);
     feedPet(count * 50);
  };

  const handleAddHobby = (type: HobbyType, title: string, content?: string) => {
     const newLog: HobbyLog = {
       id: Date.now().toString(),
       type,
       title,
       content,
       date: Date.now()
     };
     setHobbiesLogs([...hobbiesLogs, newLog]);
     addXP(50);
  };

  const handleForge = () => {
    const costIron = 5;
    const costFire = 5;
    const iron = materials.find(m => m.id === 'iron')?.count || 0;
    const fire = materials.find(m => m.id === 'fire')?.count || 0;

    if (iron >= costIron && fire >= costFire) {
       addMaterial('iron', -costIron);
       addMaterial('fire', -costFire);
       const newItem: CraftedItem = {
         id: Date.now().toString(),
         name: `Iron Sword ${items.length + 1}`,
         rarity: 'Human',
         dateAcquired: Date.now(),
         isEquipped: false
       };
       setItems([...items, newItem]);
       setOverlayMessage({ title: "Forging Successful!", msg: "You created a Human Class weapon." });
    }
  };

  const handleAscend = () => {
    const humanItems = items.filter(i => i.rarity === 'Human');
    if (humanItems.length >= 50) {
       const toRemove = humanItems.slice(0, 50).map(i => i.id);
       setItems(prev => prev.filter(i => !toRemove.includes(i.id)));
       
       const newEpic: CraftedItem = {
         id: Date.now().toString(),
         name: "Azure Dragon Blade",
         rarity: 'Epic',
         dateAcquired: Date.now(),
         isEquipped: false
       };
       setItems(prev => [...prev, newEpic]);
       setOverlayMessage({ title: "Ascension Complete!", msg: "50 Weapons merged into an Epic Artifact!" });
       
       const divineCount = items.filter(i => i.rarity === 'Divine' || i.rarity === 'Transcendental').length;
       if (divineCount >= 50) {
          setOverlayMessage({ title: "HEAVENLY REVELATION", msg: "You have pierced the veil. Hidden Reward Unlocked: The Administrator's Key." });
       }
    }
  };

  const handleBuyItem = (cost: number, itemName: string, type: 'food' | 'gear' | 'decor' | 'potion', potionData?: Partial<Potion>) => {
      // Check currency type based on item
      if (type === 'potion') {
         if (user.gold >= cost) {
            setUser(u => ({ ...u, gold: u.gold - cost }));
            if (potionData) {
               const newPotion: Potion = {
                   id: Date.now().toString(),
                   name: itemName,
                   costGold: cost,
                   multiplier: potionData.multiplier || 1,
                   durationMinutes: potionData.durationMinutes || 10,
                   activeUntil: Date.now() + (potionData.durationMinutes || 10) * 60000
               };
               setActivePotion(newPotion);
               setOverlayMessage({ title: "Potion Consumed", msg: `${itemName} is active for ${potionData.durationMinutes} minutes!` });
            }
         } else {
            alert("Not enough Gold!");
         }
      } else {
         if (user.spendableXp >= cost) {
            setUser(u => ({ ...u, spendableXp: u.spendableXp - cost }));
            if (type === 'food') {
                feedPet(cost === 100 ? 200 : 800);
            } else {
                if (activePetId) {
                    setPets(prev => prev.map(p => {
                        if (p.id === activePetId && !p.accessories.includes(itemName)) {
                            return { ...p, accessories: [...p.accessories, itemName] };
                        }
                        return p;
                    }));
                }
            }
            alert(`Bought ${itemName}!`);
         } else {
             alert("Not enough XP!");
         }
      }
  };

  const handleLinkApple = (path: CultivationPath) => {
    setUser(u => ({ ...u, appleLinked: true, cultivationPath: path }));
  };

  const handleBossReward = (xp: number, gold: number) => {
    addXP(xp);
    addGold(gold);
  };
  
  const handleAddChatMessage = (msg: ChatMessage) => {
    setChatHistory(prev => [...prev, msg]);
  };
  
  const handleToggleMastery = (category: string) => {
    setUser(u => {
      const isMastered = u.masteredCategories.includes(category);
      if (isMastered) {
        return { ...u, masteredCategories: u.masteredCategories.filter(c => c !== category) };
      } else {
        return { ...u, masteredCategories: [...u.masteredCategories, category] };
      }
    });
  };

  const handleRevisionCheckIn = (taskId: string) => {
    // 1. Update Task History
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          revisionHistory: [...(t.revisionHistory || []), Date.now()]
        };
      }
      return t;
    }));

    // 2. Gacha Reward Logic
    const rand = Math.random();
    let reward = { type: 'XP', amount: 100, label: 'Small Spirit Orb' };

    if (rand > 0.95) {
       reward = { type: 'GOLD', amount: 50, label: 'Pot of Gold' };
       addGold(50);
    } else if (rand > 0.8) {
       reward = { type: 'ITEM', amount: 1, label: 'Iron Ingot' };
       addMaterial('iron', 1);
    } else if (rand > 0.6) {
       reward = { type: 'XP', amount: 500, label: 'Ancient Scripture' };
       addXP(500);
    } else {
       addXP(100); // Default
    }

    return reward;
  };

  // --- Render Props ---
  const isBossTime = new Date().getDay() === 3 && new Date().getHours() >= BOSS_START_HOUR && new Date().getHours() < BOSS_END_HOUR;
  const bossPending = user.lastBossBattleDate !== new Date().toISOString().split('T')[0];

  return (
    <div className={`flex h-screen ${currentTheme.font} ${currentTheme.bg} ${currentTheme.textPrimary} overflow-hidden relative transition-colors duration-500`}>
      
      {/* Sidebar Navigation */}
      <nav className={`w-24 ${currentTheme.sidebarBg} flex flex-col items-center py-8 gap-4 border-r border-slate-700/10 shadow-sm z-20 h-full overflow-y-auto no-scrollbar transition-colors duration-500`}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white font-black text-xl mb-4 shrink-0 shadow-lg">P</div>
        <NavButton active={activeTab === GameTabs.DASHBOARD} onClick={() => setActiveTab(GameTabs.DASHBOARD)} icon={<LayoutDashboard />} label="Home" theme={currentTheme} />
        <NavButton active={activeTab === GameTabs.GRAND_HALL} onClick={() => setActiveTab(GameTabs.GRAND_HALL)} icon={<MessageCircle />} label="Hall" theme={currentTheme} />
        <NavButton active={activeTab === GameTabs.REVISION} onClick={() => setActiveTab(GameTabs.REVISION)} icon={<Library />} label="Revision" theme={currentTheme} />
        <NavButton active={activeTab === GameTabs.GS} onClick={() => setActiveTab(GameTabs.GS)} icon={<Book />} label="GS" theme={currentTheme} />
        <NavButton active={activeTab === GameTabs.OPTIONAL} onClick={() => setActiveTab(GameTabs.OPTIONAL)} icon={<ScrollText />} label="Opt." theme={currentTheme} />
        <NavButton active={activeTab === GameTabs.ESSAY} onClick={() => setActiveTab(GameTabs.ESSAY)} icon={<Feather />} label="Essay" theme={currentTheme} />
        <NavButton active={activeTab === GameTabs.MAINS} onClick={() => setActiveTab(GameTabs.MAINS)} icon={<ScrollText className="rotate-90" />} label="Mains" theme={currentTheme} />
        <NavButton active={activeTab === GameTabs.TRAINING} onClick={() => setActiveTab(GameTabs.TRAINING)} icon={<Swords />} label="Training" theme={currentTheme} />
        <NavButton active={activeTab === GameTabs.PETS} onClick={() => setActiveTab(GameTabs.PETS)} icon={<Bird />} label="Pets" theme={currentTheme} />
        <NavButton active={activeTab === GameTabs.HOBBIES} onClick={() => setActiveTab(GameTabs.HOBBIES)} icon={<Palette />} label="Arts" theme={currentTheme} />
        <NavButton active={activeTab === GameTabs.FORGE} onClick={() => setActiveTab(GameTabs.FORGE)} icon={<Anvil />} label="Forge" theme={currentTheme} />
        <div className="mt-auto">
          <NavButton active={activeTab === GameTabs.PROFILE} onClick={() => setActiveTab(GameTabs.PROFILE)} icon={<UserCircle />} label="Profile" theme={currentTheme} />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10 shrink-0 border-b border-white/20">
          <div>
            <h1 className="text-2xl font-bold opacity-90 tracking-tight">
               {activeTab === GameTabs.FORGE ? 'Spirit Forge' : 
                activeTab === GameTabs.HOBBIES ? 'Pavilion of Arts' : 
                activeTab === GameTabs.TRAINING ? 'Game Master Hall' :
                activeTab === GameTabs.GRAND_HALL ? 'Grand Hall' :
                activeTab === GameTabs.REVISION ? 'Memory Palace' :
                'Murim Dashboard'}
            </h1>
            <p className={`text-xs ${currentTheme.accent} mt-1 italic hidden md:block`}>"{quote}"</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className={`text-xs font-bold ${currentTheme.textSecondary} uppercase tracking-wider`}>Lvl {user.level}</span>
              <div className="w-32 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500`} style={{ width: `${(user.xp / (user.level * XP_PER_LEVEL)) * 100}%` }} />
              </div>
            </div>
            <div className="bg-orange-100/50 text-orange-600 px-3 py-1 rounded-lg font-bold text-sm whitespace-nowrap border border-orange-200">🔥 {user.streak}</div>
            <img 
               src={`https://picsum.photos/seed/${user.avatarId}/50/50`} 
               className={`w-10 h-10 object-cover shadow-md cursor-pointer ${currentTheme.avatarBorder} hover:scale-110 transition-transform`} 
               onClick={() => setActiveTab(GameTabs.PROFILE)} 
               alt="Profile" 
            />
          </div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 p-6 overflow-hidden relative animate-fade-in">
          {activeTab === GameTabs.DASHBOARD && (
            <Dashboard 
              user={user} 
              tasks={tasks} 
              essayCount={mainsLogs.length} 
              mainsCount={mainsLogs.reduce((a, b) => a + b.count, 0)}
              hobbiesCount={hobbiesLogs.length}
              milestones={milestones}
              onNavigate={setActiveTab} 
              isBossTime={isBossTime}
              bossBattlePending={bossPending}
              onClockOut={() => setShowMoodTracker('CLOCK_OUT')}
              theme={currentTheme}
            />
          )}
          {activeTab === GameTabs.GRAND_HALL && (
            <GrandHall 
              user={user} 
              chatHistory={chatHistory} 
              onAddMessage={handleAddChatMessage} 
            />
          )}
          {activeTab === GameTabs.REVISION && (
            <RevisionView 
              tasks={tasks}
              onCheckIn={handleRevisionCheckIn}
              theme={currentTheme}
            />
          )}
          {activeTab === GameTabs.GS && (
            <TaskView 
              type="GS" 
              tasks={tasks} 
              masteredCategories={user.masteredCategories || []}
              onAddTask={handleAddTask} 
              onToggleTask={handleToggleTask} 
              onDeleteTask={handleDeleteTask} 
              onToggleMastery={handleToggleMastery}
              theme={currentTheme} 
            />
          )}
          {activeTab === GameTabs.OPTIONAL && (
            <TaskView 
              type="Optional" 
              tasks={tasks} 
              masteredCategories={user.masteredCategories || []}
              onAddTask={handleAddTask} 
              onToggleTask={handleToggleTask} 
              onDeleteTask={handleDeleteTask} 
              onToggleMastery={handleToggleMastery}
              theme={currentTheme} 
            />
          )}
          {activeTab === GameTabs.ESSAY && <EssayView onSubmit={handleEssaySubmit} />}
          {activeTab === GameTabs.MAINS && <MainsView logs={mainsLogs} onAddLog={handleMainsLog} userName={user.name} weeklyStats={{tasks: user.weeklyTaskCount, essays: 0, questions: 0}} />}
          {activeTab === GameTabs.TRAINING && <GameMasterHall user={user} tasks={tasks} onReward={handleBossReward} />}
          {activeTab === GameTabs.PETS && <PetSanctuary pets={pets} activePetId={activePetId} userStats={user} onSetActivePet={setActivePetId} onBuyItem={handleBuyItem} activePotion={activePotion} />}
          {activeTab === GameTabs.HOBBIES && <HobbiesView logs={hobbiesLogs} onAddLog={handleAddHobby} />}
          {activeTab === GameTabs.FORGE && <ForgeView materials={materials} items={items} onForge={handleForge} onAscend={handleAscend} />}
          {activeTab === GameTabs.STORY && <StoryView user={user} stories={stories} onAddStory={() => {}} />}
          {activeTab === GameTabs.PROFILE && <Profile user={user} onLinkApple={handleLinkApple} theme={currentTheme} />}
        </div>

        {/* Mood Tracker Modal */}
        {showMoodTracker && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
             <MoodTracker 
               type={showMoodTracker} 
               userPath={user.cultivationPath}
               onLogMood={handleLogMood} 
               onCancel={showMoodTracker === 'CLOCK_IN' ? () => setShowMoodTracker(null) : undefined} 
             />
          </div>
        )}

        {/* Level Up Overlay */}
        {showLevelUp && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white p-12 rounded-[2rem] shadow-2xl text-center transform scale-110 animate-slide-up border-4 border-yellow-400">
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-4 tracking-tighter drop-shadow-sm">LEVEL UP!</h2>
                <p className="text-4xl text-slate-800 font-bold mb-6 flex items-center justify-center gap-4">
                  <span className="opacity-50">{user.level - 1}</span> 
                  <span className="text-2xl">➔</span> 
                  <span className="text-6xl text-indigo-600">{user.level}</span>
                </p>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Cultivation Base Increased</div>
             </div>
          </div>
        )}
        
        {/* Messages Overlay */}
        {overlayMessage && (
          <div className="absolute top-24 right-8 z-50 animate-in slide-in-from-right fade-in duration-500">
             <div className={`${currentTheme.cardBg} p-6 rounded-2xl shadow-xl border-l-4 border-l-indigo-500 max-w-sm flex flex-col gap-2`}>
                <h2 className={`text-lg font-bold ${currentTheme.textPrimary}`}>{overlayMessage.title}</h2>
                <p className={`${currentTheme.textSecondary} text-sm`}>{overlayMessage.msg}</p>
                <button onClick={() => setOverlayMessage(null)} className="self-end text-xs font-bold opacity-50 hover:opacity-100">DISMISS</button>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; theme: Theme }> = ({ active, onClick, icon, label, theme }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 w-16 shrink-0 
      ${active ? `${theme.sidebarActive} shadow-lg scale-110` : `${theme.sidebarText} hover:bg-white/10 hover:text-white`}
    `}
  >
    <div className="text-xl">{icon}</div>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
