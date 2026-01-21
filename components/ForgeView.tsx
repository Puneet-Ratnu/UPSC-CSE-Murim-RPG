import React, { useState } from 'react';
import { Hammer, Sparkles, Gem, Anvil, ArrowUpCircle } from 'lucide-react';
import { Material, CraftedItem, ItemRarity } from '../types';

interface ForgeViewProps {
  materials: Material[];
  items: CraftedItem[];
  onForge: () => void;
  onAscend: () => void;
}

const ForgeView: React.FC<ForgeViewProps> = ({ materials, items, onForge, onAscend }) => {
  const [tab, setTab] = useState<'FORGE' | 'INVENTORY'>('FORGE');

  // Calculate material counts
  const iron = materials.find(m => m.id === 'iron')?.count || 0;
  const fire = materials.find(m => m.id === 'fire')?.count || 0;
  
  const canForge = iron >= 5 && fire >= 5;

  const humanItems = items.filter(i => i.rarity === 'Human').length;
  const canAscend = humanItems >= 50;

  const getRarityColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'Human': return 'text-slate-500 bg-slate-100 border-slate-200';
      case 'Epic': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Legend': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Divine': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      case 'Transcendental': return 'text-rose-600 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Anvil className="text-slate-600" />
          Spirit Forge
        </h2>
        <p className="text-slate-500">Transform your effort into divine armaments.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setTab('FORGE')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${tab === 'FORGE' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500'}`}
        >
          Forge & Ascend
        </button>
        <button 
          onClick={() => setTab('INVENTORY')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${tab === 'INVENTORY' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500'}`}
        >
          Armory ({items.length})
        </button>
      </div>

      {tab === 'FORGE' && (
        <div className="space-y-6">
          {/* Materials */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
              <span className="text-3xl mb-2">⛓️</span>
              <span className="font-bold text-slate-700">Iron Ingots</span>
              <span className="text-xs text-slate-400 mb-2">From Study Quests</span>
              <span className="text-2xl font-black text-slate-800">{iron}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-orange-50 rounded-2xl">
              <span className="text-3xl mb-2">🔥</span>
              <span className="font-bold text-orange-700">Fire Essence</span>
              <span className="text-xs text-orange-400 mb-2">From Essays/Fitness</span>
              <span className="text-2xl font-black text-orange-800">{fire}</span>
            </div>
          </div>

          {/* Forging Station */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 rounded-3xl shadow-lg text-center relative overflow-hidden">
            <div className="relative z-10">
              <Hammer size={48} className="mx-auto mb-4 text-orange-400" />
              <h3 className="text-2xl font-bold mb-2">Forge Human Armament</h3>
              <p className="text-slate-400 mb-6 text-sm">Requires: 5 Iron Ingots + 5 Fire Essence</p>
              
              <button
                disabled={!canForge}
                onClick={onForge}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                  ${canForge 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/50 shadow-lg' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                `}
              >
                <Sparkles /> Forge Item
              </button>
            </div>
            {/* BG Effect */}
            <div className="absolute top-0 right-0 p-10 opacity-10">
               <Anvil size={200} />
            </div>
          </div>

          {/* Ascension Station */}
          <div className="bg-white p-6 rounded-3xl border-2 border-purple-100 text-center">
            <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
               <ArrowUpCircle size={24} />
               <h3 className="text-xl font-bold">Item Ascension</h3>
            </div>
            <p className="text-slate-500 text-sm mb-4">Merge 50 Human Items for a chance at Epic+</p>
            
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-4">
               <div 
                 className="h-full bg-purple-500 transition-all duration-500" 
                 style={{ width: `${Math.min((humanItems / 50) * 100, 100)}%` }}
               />
            </div>
            <p className="text-xs font-bold text-slate-400 mb-4">{humanItems} / 50 Human Items Owned</p>

            <button
               disabled={!canAscend}
               onClick={onAscend}
               className={`
                  px-6 py-2 rounded-lg font-bold text-sm transition-all
                  ${canAscend ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-100 text-slate-400'}
               `}
            >
               Ascend Items
            </button>
          </div>
        </div>
      )}

      {tab === 'INVENTORY' && (
        <div className="grid grid-cols-2 gap-3">
          {items.slice().reverse().map(item => (
            <div key={item.id} className={`p-4 rounded-2xl border ${getRarityColor(item.rarity)} flex flex-col items-center text-center`}>
               <Gem className="mb-2 opacity-80" />
               <span className="font-bold text-sm">{item.name}</span>
               <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">{item.rarity}</span>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-400 italic">
              Inventory empty. Visit the forge.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ForgeView;
