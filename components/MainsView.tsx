import React, { useState } from 'react';
import { ScrollText, BarChart3, Mail, CheckCircle, Plus } from 'lucide-react';
import { MainsLog } from '../types';
import { generateWeeklyReport } from '../services/geminiService';

interface MainsViewProps {
  logs: MainsLog[];
  onAddLog: (count: number) => void;
  userName: string;
  weeklyStats: { tasks: number, essays: number, questions: number };
}

const MainsView: React.FC<MainsViewProps> = ({ logs, onAddLog, userName, weeklyStats }) => {
  const [todayCount, setTodayCount] = useState<string>('');
  const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [reportContent, setReportContent] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr);
  const questionsToday = todayLog ? todayLog.count : 0;

  const handleAdd = () => {
    const count = parseInt(todayCount);
    if (count > 0) {
      onAddLog(count);
      setTodayCount('');
    }
  };

  const handleGenerateReport = async () => {
    setReportStatus('loading');
    const report = await generateWeeklyReport(userName, weeklyStats);
    setReportContent(report);
    setReportStatus('done');
  };

  // --- Graph Helpers ---
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const log = logs.find(l => l.date === dateStr);
      days.push({ day: dayName, count: log ? log.count : 0 });
    }
    return days;
  };

  const chartData = getLast7Days();
  const maxCount = Math.max(...chartData.map(d => d.count), 5); // Minimum scale of 5

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <ScrollText className="text-indigo-500" />
          Mains Answer Hall
        </h2>
        <p className="text-slate-500">Track your daily answer writing practice.</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-slate-700">Today's Progress</h3>
          <p className="text-slate-400 text-sm">You have written <span className="font-bold text-indigo-600 text-lg">{questionsToday}</span> answers today.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="number" 
            value={todayCount}
            onChange={(e) => setTodayCount(e.target.value)}
            placeholder="Qty"
            className="w-24 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button 
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={20} /> Add
          </button>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Graph */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-400" /> Weekly Activity
          </h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className="w-full bg-indigo-100 rounded-t-lg hover:bg-indigo-200 transition-all relative group"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: '4px' }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                    {d.count}
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-bold">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Report Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 shadow-sm border border-indigo-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Mail size={20} className="text-purple-500" /> Weekly Scribe
          </h3>
          <p className="text-slate-500 text-sm mb-6">Compile your feats into a scroll for your archives.</p>
          
          <div className="flex-1 flex flex-col items-center justify-center">
             {reportStatus === 'idle' && (
               <button 
                 onClick={handleGenerateReport}
                 className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md border border-indigo-100 transition-all"
               >
                 Generate Report
               </button>
             )}
             {reportStatus === 'loading' && (
               <div className="animate-pulse text-indigo-400 font-bold">Summoning the Scribe Spirit...</div>
             )}
             {reportStatus === 'done' && (
               <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 w-full animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex items-center gap-2 text-green-500 font-bold mb-2">
                   <CheckCircle size={16} /> Report Ready
                 </div>
                 <p className="text-slate-600 text-sm italic leading-relaxed">"{reportContent}"</p>
                 <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
                   Sent to your Apple ID Email (Simulated)
                 </div>
                 <button 
                   onClick={() => setReportStatus('idle')}
                   className="mt-2 w-full text-indigo-500 text-xs font-bold hover:underline"
                 >
                   Create New
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>
      
      {/* Monthly/Yearly placeholders */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <h4 className="text-slate-400 text-xs font-bold uppercase">This Month</h4>
            <p className="text-2xl font-bold text-slate-800">
              {logs.filter(l => l.date.startsWith(todayStr.substring(0, 7))).reduce((acc, curr) => acc + curr.count, 0)}
            </p>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <h4 className="text-slate-400 text-xs font-bold uppercase">This Year</h4>
            <p className="text-2xl font-bold text-slate-800">
              {logs.filter(l => l.date.startsWith(todayStr.substring(0, 4))).reduce((acc, curr) => acc + curr.count, 0)}
            </p>
         </div>
      </div>
    </div>
  );
};

export default MainsView;
