import React, { useEffect, useState } from 'react';
import { Scroll, BookOpen, User } from 'lucide-react';
import { StoryChapter, UserStats } from '../types';
import { generateStoryChapter } from '../services/geminiService';

interface StoryViewProps {
  user: UserStats;
  stories: StoryChapter[];
  onAddStory: (chapter: StoryChapter) => void;
}

const StoryView: React.FC<StoryViewProps> = ({ user, stories, onAddStory }) => {
  const [loading, setLoading] = useState(false);

  // Check if we need to generate a story for the current level
  useEffect(() => {
    const hasStoryForLevel = stories.find(s => s.level === user.level);
    
    if (!hasStoryForLevel && user.level > 0) {
      const fetchStory = async () => {
        setLoading(true);
        let role = "Village Novice";
        if (user.level > 50) role = "Outer Disciple";
        if (user.level > 150) role = "Inner Disciple";
        if (user.level > 300) role = "Core Disciple";
        if (user.level > 450) role = "Sect Elder";

        const newStoryData = await generateStoryChapter(user.level, role);
        onAddStory({
          level: user.level,
          title: newStoryData.title,
          content: newStoryData.content,
          unlocked: true
        });
        setLoading(false);
      };
      fetchStory();
    }
  }, [user.level, stories, onAddStory]);

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-20 px-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-pastel-orange mb-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <BookOpen className="text-orange-500" />
          The Chronicles of Puneet
        </h2>
        <p className="text-slate-500">From the Village to the Grand Ministry.</p>
      </div>

      <div className="space-y-6">
        {loading && (
          <div className="bg-pastel-bg p-6 rounded-2xl animate-pulse border border-dashed border-orange-300">
            <div className="h-4 bg-orange-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <p className="mt-4 text-orange-400 font-bold text-center">Consulting the Heavenly Scrolls...</p>
          </div>
        )}

        {[...stories].reverse().map((story) => (
          <div key={story.level} className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-l-orange-400 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Scroll size={100} />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Level {story.level}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{story.title}</h3>
              <p className="text-slate-600 leading-relaxed font-serif italic">"{story.content}"</p>
            </div>
          </div>
        ))}

        {stories.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-400">
            <User size={48} className="mx-auto mb-4 opacity-50" />
            <p>Puneet's journey has just begun. Complete tasks to level up and reveal his destiny!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryView;
