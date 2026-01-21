import React, { useState } from 'react';
import { Palette, BookOpen, Languages, Feather, Plus } from 'lucide-react';
import { HobbyLog, HobbyType } from '../types';

interface HobbiesViewProps {
  logs: HobbyLog[];
  onAddLog: (type: HobbyType, title: string, content?: string) => void;
}

const HobbiesView: React.FC<HobbiesViewProps> = ({ logs, onAddLog }) => {
  const [activeTab, setActiveTab] = useState<HobbyType>('Language');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const filteredLogs = logs.filter(l => l.type === activeTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddLog(activeTab, title, content);
      setTitle('');
      setContent('');
      setShowAdd(false);
    }
  };

  const getIcon = (type: HobbyType) => {
    switch (type) {
      case 'Language': return <Languages />;
      case 'Painting': return <Palette />;
      case 'Poetry': return <Feather />;
      case 'Manhwa': return <BookOpen />;
    }
  };

  const colors = {
    Language: 'bg-red-50 text-red-600 border-red-100',
    Painting: 'bg-blue-50 text-blue-600 border-blue-100',
    Poetry: 'bg-purple-50 text-purple-600 border-purple-100',
    Manhwa: 'bg-green-50 text-green-600 border-green-100'
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Palette className="text-pink-500" />
          The Four Arts
        </h2>
        <p className="text-slate-500">Cultivate your soul through arts and leisure.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {(['Language', 'Painting', 'Poetry', 'Manhwa'] as HobbyType[]).map(type => (
          <button
            key={type}
            onClick={() => { setActiveTab(type); setShowAdd(false); }}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all
              ${activeTab === type ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}
            `}
          >
            {getIcon(type)}
            {type}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAdd ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-slate-700 mb-4">Log {activeTab} Activity</h3>
          <input
            className="w-full p-3 bg-slate-50 rounded-xl mb-3 border-none focus:ring-2 focus:ring-slate-200"
            placeholder={activeTab === 'Language' ? 'Language (e.g., Japanese)' : activeTab === 'Manhwa' ? 'Title (e.g., Solo Leveling)' : 'Title'}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          {(activeTab === 'Poetry' || activeTab === 'Painting') && (
            <textarea
              className="w-full p-3 bg-slate-50 rounded-xl mb-3 border-none focus:ring-2 focus:ring-slate-200 h-32"
              placeholder={activeTab === 'Poetry' ? 'Write your verses here...' : 'Describe your painting...'}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-slate-400 font-bold hover:text-slate-600">Cancel</button>
            <button type="submit" className="flex-1 bg-slate-800 text-white py-2 rounded-xl font-bold hover:bg-slate-700">Save</button>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setShowAdd(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-slate-400 hover:text-slate-600 transition-all mb-6 flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add New Entry
        </button>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLogs.slice().reverse().map(log => (
          <div key={log.id} className={`p-5 rounded-2xl border ${colors[activeTab]} relative group`}>
             <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">{log.title}</h4>
                <span className="text-xs opacity-60">{new Date(log.date).toLocaleDateString()}</span>
             </div>
             {log.content && (
               <p className="text-sm opacity-80 whitespace-pre-wrap font-serif leading-relaxed">
                 {log.content}
               </p>
             )}
          </div>
        ))}
        {filteredLogs.length === 0 && !showAdd && (
          <div className="col-span-full text-center py-10 text-slate-400 italic">
            No masterpieces created yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default HobbiesView;
