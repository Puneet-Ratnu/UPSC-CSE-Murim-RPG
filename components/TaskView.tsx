import React, { useState } from 'react';
import { Plus, Check, Trash2, FolderOpen, Sword, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { Task, GS_GROUPS, OPTIONAL_GROUPS, Theme } from '../types';

interface TaskViewProps {
  type: 'GS' | 'Optional';
  tasks: Task[];
  masteredCategories: string[];
  onAddTask: (title: string, subCategory: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleMastery: (category: string) => void;
  theme: Theme;
}

const TaskView: React.FC<TaskViewProps> = ({ type, tasks, masteredCategories, onAddTask, onToggleTask, onDeleteTask, onToggleMastery, theme }) => {
  const categories = type === 'GS' ? GS_GROUPS : OPTIONAL_GROUPS;
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const currentTasks = tasks.filter(t => t.category === type && t.subCategory === selectedCategory);
  const isMastered = masteredCategories.includes(selectedCategory);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isMastered) return;
    onAddTask(newTaskTitle, selectedCategory);
    setNewTaskTitle('');
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-2 animate-fade-in">
      {/* Sidebar / Top bar for Categories */}
      <div className="md:w-1/4 w-full flex md:flex-col overflow-x-auto md:overflow-y-auto gap-2 no-scrollbar pb-2 md:pb-20">
        {categories.map(cat => {
           const isCatMastered = masteredCategories.includes(cat);
           return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                flex-shrink-0 px-4 py-3 rounded-xl text-left font-semibold transition-all duration-300 relative overflow-hidden
                ${selectedCategory === cat 
                  ? `${theme.sidebarActive} shadow-md scale-105` 
                  : `${theme.cardBg} ${theme.textSecondary} hover:bg-slate-100 shadow-sm`}
              `}
            >
              <span className="relative z-10 flex items-center justify-between">
                 {cat}
                 {isCatMastered && <Lock size={12} className="opacity-70" />}
              </span>
              {isCatMastered && <div className="absolute inset-0 bg-slate-900/5 z-0"></div>}
            </button>
           );
        })}
      </div>

      {/* Main Task Area */}
      <div className={`flex-1 ${theme.cardBg} rounded-3xl p-6 shadow-sm border ${theme.cardBorder} flex flex-col h-[calc(100vh-240px)] md:h-auto`}>
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className={`text-2xl font-bold ${theme.textPrimary} flex items-center gap-2`}>
              {type === 'GS' ? <FolderOpen size={24} className={theme.iconColor} /> : <Sword size={24} className={theme.iconColor} />}
              {selectedCategory}
            </h2>
            <p className={`text-sm ${theme.textSecondary}`}>
              {currentTasks.filter(t => t.completed).length} / {currentTasks.length} Quests Completed
            </p>
          </div>

          <button
             onClick={() => onToggleMastery(selectedCategory)}
             className={`
               px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all
               ${isMastered 
                  ? 'bg-slate-800 text-white border-slate-800' 
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}
             `}
          >
             {isMastered ? <Lock size={12} /> : <Unlock size={12} />}
             {isMastered ? 'Realm Conquered' : 'Mark Complete'}
          </button>
        </div>

        {/* Mastered Banner */}
        {isMastered && (
          <div className="mb-6 bg-slate-800 text-white p-4 rounded-xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
             <ShieldAlert className="text-yellow-400" />
             <div>
                <h3 className="font-bold text-sm text-yellow-400">Realm Mastered</h3>
                <p className="text-xs text-slate-300">
                   You have notified the Game Master that this subject is complete. 
                   New tasks are disabled. Focus on Revision in the Revision Hall.
                </p>
             </div>
          </div>
        )}

        {/* Add Task Input */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-6 relative">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={isMastered}
            placeholder={isMastered ? "Subject Mastered - Task Creation Sealed" : "Add new quest..."}
            className={`
               flex-1 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-opacity-50 border transition-all
               ${isMastered 
                  ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed' 
                  : `bg-slate-50/50 border-slate-200 focus:border-transparent`
               }
            `}
            style={!isMastered ? { '--tw-ring-color': theme.iconColor } as any : {}}
          />
          <button 
            type="submit"
            disabled={!newTaskTitle.trim() || isMastered}
            className={`${theme.buttonPrimary} p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95`}
          >
            <Plus size={24} />
          </button>
        </form>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
          {currentTasks.length === 0 ? (
            <div className={`text-center py-10 ${theme.textSecondary} italic opacity-60`}>
              No active quests in this realm. Add one to begin cultivation.
            </div>
          ) : (
            currentTasks.map(task => (
              <div 
                key={task.id} 
                className={`
                  group flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                  ${task.completed 
                    ? 'bg-slate-50 border-transparent opacity-60' 
                    : `bg-white hover:border-slate-300 shadow-sm ${theme.cardBorder}`}
                `}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                      ${task.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-slate-300 hover:border-green-400'}
                    `}
                  >
                    {task.completed && <Check size={14} />}
                  </button>
                  <span className={`font-medium ${task.completed ? 'line-through text-slate-400' : theme.textPrimary}`}>
                    {task.title}
                  </span>
                </div>
                {!isMastered && (
                  <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-opacity p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskView;
