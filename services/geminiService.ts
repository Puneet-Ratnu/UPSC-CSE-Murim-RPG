import { GoogleGenAI } from "@google/genai";
import { GMPersonality, MCQ, MainsQuestion, MoodType, CultivationPath, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// --- Existing Functions ---

export const generateStoryChapter = async (level: number, currentRole: string): Promise<{ title: string; content: string }> => {
  try {
    const prompt = `
      Write a short, engaging story chapter (approx 100-150 words) for a gamified app.
      
      Protagonist: Puneet, a village boy.
      Setting: A Murim (Martial Arts) fantasy world inspired by Ancient India and Wuxia tropes.
      Goal: Puneet wants to become the "Minister of Foreign Affairs" (a high ranking sect diplomat).
      Current Status: Level ${level} out of 500. He is currently a "${currentRole}".
      
      The story should describe his training (studying books as if they are cultivation manuals), overcoming a mental demon (procrastination), or a small victory in the village/sect.
      
      Return the response in JSON format:
      {
        "title": "A catchy chapter title",
        "content": "The story text..."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating story:", error);
    return {
      title: `The Path of Level ${level}`,
      content: "Puneet meditated on his books, feeling the Qi of knowledge circulate through his meridians. The path to the Ministry is long, but his will is iron."
    };
  }
};

export const getMotivationalQuote = async (streak: number): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Give me a short, cute, and motivational quote for a student who has studied for ${streak} days in a row. Theme: Martial Arts/Murim. Max 20 words.`,
    });
    return response.text || "Keep cultivating your knowledge!";
  } catch (e) {
    return "Your cultivation is deepening!";
  }
};

export const generateWeeklyReport = async (userName: string, stats: { tasks: number, essays: number, questions: number }): Promise<string> => {
  try {
    const prompt = `
      Write a cute, encouraging weekly progress email report for a student named ${userName}.
      Theme: Murim/Fantasy/Cute.
      
      Stats for this week:
      - Quests (Tasks) Completed: ${stats.tasks}
      - Essays Written: ${stats.essays}
      - Mains Questions Attempted: ${stats.questions}
      
      The tone should be like a wise but cute spirit animal reporting to their master. Keep it under 100 words.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || `Master ${userName}, your week was productive! You completed ${stats.tasks} quests and wrote ${stats.essays} essays.`;
  } catch (e) {
    return `Weekly Report for ${userName}: ${stats.tasks} Tasks, ${stats.questions} Questions, ${stats.essays} Essays. Keep fighting!`;
  }
};

// --- NEW GAME MASTER FUNCTIONS ---

const getPersonaInstructions = (persona: GMPersonality) => {
  switch (persona) {
    case GMPersonality.ORTHODOX:
      return "You are the Saintly Hermit, Leader of the Murim Alliance. You speak calmly, using metaphors of nature, balance, and the Dao. You are polite but firm. You refer to the UPSC syllabus as the 'Orthodox Scripture'.";
    case GMPersonality.UNORTHODOX:
      return "You are the Leader of the Unorthodox Faction. You are crass, brazen, loud, and mocking. You call the user 'brat' or 'weakling'. You value raw power and results over methods. You treat exams as bloody brawls.";
    case GMPersonality.HEAVENLY_DEMON:
      return "You are the Great Heavenly Demon. You are arrogant, possessive, and look down on everyone. You use terms like 'This Seat' (to refer to yourself) and 'Ant'. You demand absolute perfection. Failure is an insult to your presence.";
    case GMPersonality.COMMANDER:
      return "You are the Grand Commander of Dragon Chains (Secular Realm). You are military-minded, strict, and motivational. You treat study sessions as 'drills' and 'warfare'. Focus on strategy, discipline, and serving the nation.";
  }
};

const getPathDynamicInstructions = (persona: GMPersonality, userPath?: CultivationPath) => {
  if (!userPath) return "";
  
  // Logic to determine relation
  // Orthodox vs Orthodox = Mentor/Student
  // Orthodox vs Demonic = Disappointed Elder trying to save you
  // Unorthodox vs Demonic = Competitive Rivals
  // etc.
  
  return `
    The User follows the "${userPath}" path. 
    Your Persona is "${persona}".
    
    Instruction:
    - If your persona ALIGNS with the user's path, be supportive, proud, and act like a senior guiding a junior.
    - If your persona CLASHES with the user's path, be skeptical, critical, or mocking of their choice. Tell them why YOUR path is superior, but still give them the advice they need to succeed (you want to convert them).
  `;
};

export const generateBossQuest = async (
  topics: string[], 
  type: 'DAILY' | 'WEEKLY', 
  persona: GMPersonality
): Promise<{ mcqs: MCQ[], mains: MainsQuestion[], introText: string }> => {
  try {
    const personaPrompt = getPersonaInstructions(persona);
    const countMCQ = type === 'DAILY' ? 10 : 25; 
    const countMains = type === 'DAILY' ? 1 : 5;

    const prompt = `
      ${personaPrompt}
      
      You are training a Civil Servant aspirant. 
      Generate a ${type} Boss Fight Exam based on these topics: ${topics.join(', ')}.
      
      Difficulty: UPSC CSE (Very Hard).
      Style: Conceptual and Analytical.
      
      Generate:
      1. ${countMCQ} MCQs.
      2. ${countMains} Mains Question(s).
      3. An intro message in your persona style greeting the user.

      Return ONLY JSON:
      {
        "introText": "string",
        "mcqs": [ { "id": "1", "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0 } ],
        "mains": [ { "id": "m1", "question": "..." } ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    if (!response.text) throw new Error("No text");
    return JSON.parse(response.text);

  } catch (error) {
    console.error("GM Error:", error);
    return {
      introText: "The Heavens are silent... (API Error)",
      mcqs: [],
      mains: []
    };
  }
};

export const evaluateBossFight = async (
  persona: GMPersonality,
  mcqScore: number,
  totalMcqs: number,
  mainsDrafts: { question: string, answer: string }[],
  userPath?: CultivationPath
): Promise<{ feedback: string, xpReward: number, goldReward: number }> => {
  try {
    const personaPrompt = getPersonaInstructions(persona);
    const pathPrompt = getPathDynamicInstructions(persona, userPath);
    
    const prompt = `
      ${personaPrompt}
      ${pathPrompt}
      
      The aspirant has submitted their exam.
      MCQ Score: ${mcqScore}/${totalMcqs}.
      Mains Answers: ${JSON.stringify(mainsDrafts)}.
      
      Task:
      1. STRICTLY evaluate the Mains answers like a ruthless UPSC examiner. Look for keywords, structure, and depth.
      2. Decide on a Gold Reward (0 to 100) and XP Reward (0 to 2000) based on performance.
      3. Give feedback in your persona, acknowledging their path (${userPath}).
      
      Return ONLY JSON:
      {
        "feedback": "string",
        "xpReward": number,
        "goldReward": number
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    if (!response.text) throw new Error("No text");
    return JSON.parse(response.text);

  } catch (error) {
    return { feedback: "The evaluation scroll was lost in transit.", xpReward: 100, goldReward: 10 };
  }
};

export const generateMoodAdvice = async (
  mood: MoodType,
  personality: GMPersonality,
  userPath?: CultivationPath
): Promise<string> => {
  try {
    const personaPrompt = getPersonaInstructions(personality);
    const pathPrompt = getPathDynamicInstructions(personality, userPath);
    
    const prompt = `
      ${personaPrompt}
      ${pathPrompt}
      
      The aspirant has clocked in/out and reported their mood as: "${mood}".
      
      Task:
      1. Ask them why they feel this way (rhetorically or directly).
      2. Give short advice (max 30 words) based on your personality to help them with their UPSC preparation journey.
      
      Keep it short, immersive, and in character. Remember their path is ${userPath}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Cultivate your mind, and emotions will settle.";
  } catch (error) {
    return "The path is long, stay focused.";
  }
};

export const chatWithMentor = async (
  history: ChatMessage[],
  newMessage: string,
  persona: GMPersonality,
  userPath?: CultivationPath
): Promise<string> => {
  try {
    const personaPrompt = getPersonaInstructions(persona);
    const pathPrompt = getPathDynamicInstructions(persona, userPath);
    
    const context = history.map(h => `${h.sender}: ${h.text}`).join('\n');

    const prompt = `
      ${personaPrompt}
      ${pathPrompt}
      
      CONTEXT OF CONVERSATION:
      ${context}

      USER'S NEW MESSAGE:
      "${newMessage}"

      TASK:
      Respond to the user. Focus on UPSC preparation, stress management, executive dysfunction, and discipline.
      Maintain your persona perfectly.
      If the user is struggling, give actionable advice but wrapped in your specific Murim flavor (e.g., calling procrastination a 'Heart Demon' or 'Qi Deviation').
      Keep response concise (under 80 words).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "The wind carries no words today. Meditate and try again.";
  } catch (error) {
    return "My spiritual connection is weak. I cannot answer now.";
  }
};
