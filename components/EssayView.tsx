import React, { useState } from 'react';
import { PenTool, Lock, Star, CheckCircle } from 'lucide-react';

interface EssayViewProps {
  onSubmit: (count: number, topics: { title: string; marks: number }[]) => void;
}

const EssayView: React.FC<EssayViewProps> = ({ onSubmit }) => {
  const [step, setStep] = useState<'intro' | 'count' | 'details' | 'success'>('intro');
  const [essayCount, setEssayCount] = useState<number>(0);
  const [essayDetails, setEssayDetails] = useState<{ title: string; marks: number }[]>([]);

  // Check if it is Wednesday (Day 3)
  const today = new Date();
  const isWednesday = today.getDay() === 3;
  
  // For testing purposes, uncomment the line below to force Wednesday view
  // const isWednesday = true; 

  if (!isWednesday) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <div className="bg-slate-200 p-6 rounded-full mb-6">
          <Lock className="w-12 h-12 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">The Essay Pavilion is Closed</h2>
        <p className="text-slate-500 max-w-md">
          The Grand Masters only accept essays on <span className="font-bold text-pastel-purple">Wednesdays</span>. 
          Focus on your GS and Optional cultivation for now.
        </p>
      </div>
    );
  }

  const handleCountSelect = (count: number) => {
    setEssayCount(count);
    setEssayDetails(Array(count).fill({ title: '', marks: 0 }));
    setStep('details');
  };

  const handleDetailChange = (index: number, field: 'title' | 'marks', value: string | number) => {
    const newDetails = [...essayDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setEssayDetails(newDetails);
  };

  const handleSubmit = () => {
    onSubmit(essayCount, essayDetails);
    setStep('success');
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-pastel-purple mb-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <PenTool className="text-purple-500" />
          Essay Wednesday
        </h2>
        <p className="text-slate-500">Refining your thoughts is key to diplomacy.</p>
      </div>

      {step === 'intro' && (
        <div className="flex flex-col items-center justify-center py-10 bg-white rounded-3xl shadow-sm">
          <h3 className="text-xl font-semibold mb-6">How many essays did you write today?</h3>
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm px-4">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => handleCountSelect(num)}
                className="bg-pastel-purple hover:bg-purple-200 transition-colors text-purple-900 font-bold py-6 rounded-2xl text-2xl shadow-sm"
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-6">
          {essayDetails.map((essay, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  {idx + 1}
                </span>
                Essay Details
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Topic / Title</label>
                  <input
                    type="text"
                    value={essay.title}
                    onChange={(e) => handleDetailChange(idx, 'title', e.target.value)}
                    placeholder="e.g., Impact of AI on Global Relations"
                    className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-purple-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Marks Obtained (out of 250)</label>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400 w-5 h-5" />
                    <input
                      type="number"
                      value={essay.marks || ''}
                      onChange={(e) => handleDetailChange(idx, 'marks', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-24 p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-purple-200 outline-none font-bold text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={handleSubmit}
            className="w-full bg-purple-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-600 transition-all active:scale-95"
          >
            Submit & Claim XP
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
          <CheckCircle className="w-24 h-24 text-green-400 mb-4" />
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Excellent!</h2>
          <p className="text-slate-500 mb-8">Your insights have strengthened your diplomatic core.</p>
          <p className="bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full font-bold">
            XP Awarded!
          </p>
        </div>
      )}
    </div>
  );
};

export default EssayView;
