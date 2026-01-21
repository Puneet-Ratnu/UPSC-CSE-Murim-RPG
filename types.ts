export interface Task {
  id: string;
  title: string;
  category: 'GS' | 'Optional' | 'Essay';
  subCategory: string;
  completed: boolean;
  dateAdded: number;
  dateCompleted?: number;
  revisionHistory?: number[]; // Array of timestamps when revision was checked in
}

export enum CultivationPath {
  ORTHODOX = 'ORTHODOX',      // Order, Tradition, Righteousness
  UNORTHODOX = 'UNORTHODOX',  // Freedom, Chaos, Strength
  DEMONIC = 'DEMONIC',        // Power at all costs, Ruthless
  SECULAR = 'SECULAR'         // Bureaucracy, State Power, Discipline
}

export interface Theme {
  name: string;
  font: string;
  bg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarActive: string;
  cardBg: string;
  cardBorder: string;
  buttonPrimary: string;
  avatarBorder: string;
  iconColor: string;
}

export interface UserStats {
  name: string;
  level: number;
  xp: number; // Lifetime XP for leveling
  spendableXp: number; // Currency for basic shop
  gold: number; // Premium currency from Boss Fights
  streak: number;
  lastLoginDate: string; // ISO date string YYYY-MM-DD
  joinedDate: number;
  appleLinked: boolean;
  cultivationPath?: CultivationPath; // The chosen destiny
  avatarId: number;
  skinId: number;
  email?: string;
  
  // Tracking for rewards
  totalTasksCompleted: number;
  dailyTaskCount: number;
  weeklyTaskCount: number;
  lastBossBattleDate: string; // YYYY-MM-DD
  
  // Mastery
  masteredCategories: string[]; // List of subCategories (e.g., 'Polity') that are frozen
}

export interface StoryChapter {
  level: number;
  title: string;
  content: string;
  unlocked: boolean;
}

export interface EssayLog {
  id: string;
  date: number;
  count: number;
  topics: { title: string; marks: number }[];
  totalXpEarned: number;
}

export interface MainsLog {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface Pet {
  id: string;
  name: string;
  type: 'Phoenix' | 'Dragon' | 'Turtle' | 'Tiger' | 'Fox' | 'Qilin';
  stage: 'Egg' | 'Hatchling' | 'Adult' | 'Mythic';
  level: number;
  xp: number;
  maxXp: number;
  accessories: string[];
}

// --- HOBBIES ---
export type HobbyType = 'Language' | 'Painting' | 'Poetry' | 'Manhwa';

export interface HobbyLog {
  id: string;
  type: HobbyType;
  title: string; // Name of language, poem title, painting name, manhwa title
  content?: string; // Poem text, thoughts, or painting description
  date: number;
}

// --- CRAFTING ---
export type ItemRarity = 'Human' | 'Epic' | 'Legend' | 'Divine' | 'Transcendental';

export interface Material {
  id: string;
  name: string;
  count: number;
  source: string; // e.g., "GS Quests"
}

export interface CraftedItem {
  id: string;
  name: string;
  rarity: ItemRarity;
  dateAcquired: number;
  isEquipped: boolean;
}

// --- GAME MASTER & BOSS FIGHTS ---
export enum GMPersonality {
  ORTHODOX = 'ORTHODOX', // Saintly Hermit
  UNORTHODOX = 'UNORTHODOX', // Crass/Brazen
  HEAVENLY_DEMON = 'HEAVENLY_DEMON', // Saintly Violence/Arrogant
  COMMANDER = 'COMMANDER' // Military/Motivational
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface MainsQuestion {
  id: string;
  question: string;
}

export interface BossFightState {
  isActive: boolean;
  type: 'DAILY' | 'WEEKLY' | null;
  mcqs: MCQ[];
  mains: MainsQuestion[];
  userAnswers: { [key: string]: number }; // For MCQs
  mainsDrafts: { [key: string]: string }; // For Mains
  submitted: boolean;
  feedback?: string;
}

export interface Potion {
  id: string;
  name: string;
  multiplier: number;
  durationMinutes: number;
  costGold: number;
  activeUntil?: number; // Timestamp
}

// --- MOOD & MAP ---
export type MoodType = 'Motivated' | 'Tired' | 'Anxious' | 'Confident' | 'Lost';

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  mood: MoodType;
  aiResponse: string;
  personality: GMPersonality;
}

export interface Milestone {
  id: string;
  levelReq: number;
  title: string;
  description: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  unlocked: boolean;
  icon: 'Village' | 'Forest' | 'Mountain' | 'Castle' | 'Temple';
}

// --- GRAND HALL CHAT ---
export interface ChatMessage {
  id: string;
  sender: 'user' | GMPersonality;
  text: string;
  timestamp: number;
}

export enum GameTabs {
  DASHBOARD = 'DASHBOARD',
  GS = 'GS',
  OPTIONAL = 'OPTIONAL',
  REVISION = 'REVISION',
  ESSAY = 'ESSAY',
  MAINS = 'MAINS',
  PETS = 'PETS',
  HOBBIES = 'HOBBIES',
  FORGE = 'FORGE',
  TRAINING = 'TRAINING', // Boss Fight / Game Master
  GRAND_HALL = 'GRAND_HALL', // Chat with Mentor
  PROFILE = 'PROFILE',
  STORY = 'STORY'
}

export const GS_GROUPS = [
  'Economy', 'Polity', 'Governance', 'IR', 'Geography', 'Ecology', 
  'Science', 'Society', 'Internal Security', 'Disaster Management', 'Ethics'
];

export const OPTIONAL_GROUPS = [
  'Ancient', 'Medieval', 'Modern', 'World', 'Historiography'
];

export const MAX_LEVEL = 500;
export const XP_PER_LEVEL = 1000;

// Boss Battle Config
export const BOSS_START_HOUR = 12; // 12 PM
export const BOSS_END_HOUR = 15; // 3 PM
