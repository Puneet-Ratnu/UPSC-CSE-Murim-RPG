import React, { useState } from 'react';
import { Pet, UserStats, Potion } from '../types';
import { ShoppingBag, Heart, Shield, Crown, Zap, Utensils, Coins, FlaskConical } from 'lucide-react';

interface PetSanctuaryProps {
  pets: Pet[];
  activePetId: string | null;
  userStats: UserStats;
  onSetActivePet: (id: string) => void;
  onBuyItem: (cost: number, itemName: string, type: 'food' | 'gear' | 'decor' | 'potion', potionData?: Partial<Potion>) => void;
  activePotion: Potion | null;
}

const PetSanctuary: React.FC<PetSanctuaryProps> = ({ pets, activePetId, userStats, onSetActivePet, onBuyItem, activePotion }) => {
  const [tab, setTab] = useState<'MY_PETS' | 'SHOP'>('MY_PETS');

  const activePet = pets.find(p => p.id === activePetId);

  const renderPetImage = (pet: Pet) => {
      // Mock images based on type
      const seed = pet.id;
      return `https://picsum.photos/seed/${seed}/300/300`;
  };

  const getPetEmoji = (type: string) => {
      switch(type) {
          case 'Phoenix': return '🦅';
          case 'Dragon': return '🐉';
          case 'Turtle': return '🐢';
          case 'Tiger': return '🐅';
          case 'Fox': return '🦊';
          default: return '🐾';
      }
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4">
      {/* Header with Balance */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-700 p-1 rounded-lg"><Crown size={16} /></span>
              <span className="font-bold text-slate-700">{userStats.spendableXp} XP</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-700 p-1 rounded-lg"><Coins size={16} /></span>
              <span className="font-bold text-slate-700">{userStats.gold} Gold</span>
          </div>
        </div>
        
        {activePotion && (
          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-xl text-xs font-bold animate-pulse flex items-center gap-2">
             <FlaskConical size={14} /> {activePotion.name} Active ({activePotion.multiplier}x)
          </div>
        )}

        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
            <button 
                onClick={() => setTab('MY_PETS')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'MY_PETS' ? 'bg-pastel-green text-green-800' : 'text-slate-400'}`}
            >
                My Pets
            </button>
            <button 
                onClick={() => setTab('SHOP')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'SHOP' ? 'bg-pastel-pink text-pink-800' : 'text-slate-400'}`}
            >
                Spirit Shop
            </button>
        </div>
      </div>

      {tab === 'MY_PETS' ? (
        <div className="space-y-6">
            {/* Active Pet Showcase */}
            {activePet ? (
                <div className="bg-white rounded-3xl p-8 shadow-md border-2 border-green-100 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-green-50 to-white z-0"></div>
                    
                    <div className="relative z-10 text-center">
                        <div className="text-6xl mb-4 animate-bounce">{getPetEmoji(activePet.type)}</div>
                        <h2 className="text-2xl font-bold text-slate-800">{activePet.name}</h2>
                        <p className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full inline-block mt-1">
                            Lvl {activePet.level} {activePet.type}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="w-full max-w-sm mt-8 space-y-4 relative z-10">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                <span>Growth (Mains Answers)</span>
                                <span>{activePet.xp} / {activePet.maxXp}</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-400 transition-all duration-500" 
                                    style={{ width: `${(activePet.xp / activePet.maxXp) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Accessories */}
                    {activePet.accessories.length > 0 && (
                        <div className="mt-6 flex gap-2">
                            {activePet.accessories.map((acc, i) => (
                                <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-lg border border-slate-200">
                                    {acc}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p>No active companion. Check your roster!</p>
                </div>
            )}

            {/* Pet Roster */}
            <h3 className="text-lg font-bold text-slate-700 mt-8 mb-4">Companion Roster</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pets.map(pet => (
                    <div 
                        key={pet.id}
                        onClick={() => onSetActivePet(pet.id)}
                        className={`
                            p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center
                            ${pet.id === activePetId ? 'bg-green-50 border-green-400' : 'bg-white border-slate-100 hover:border-green-200'}
                        `}
                    >
                        <div className="text-3xl mb-2">{getPetEmoji(pet.type)}</div>
                        <span className="font-bold text-slate-700 text-sm">{pet.name}</span>
                        <span className="text-xs text-slate-400">Lvl {pet.level}</span>
                    </div>
                ))}
            </div>
        </div>
      ) : (
        /* SHOP TAB */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gold Shop (Potions) */}
              <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-3xl border border-orange-100 mb-2">
                  <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2"><FlaskConical /> Alchemist's Gold Shop</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'Minor XP Potion', cost: 50, multiplier: 2, duration: 10, desc: '2x XP for 10 mins' },
                        { name: 'Major XP Elixir', cost: 150, multiplier: 4, duration: 20, desc: '4x XP for 20 mins' }
                      ].map((item, idx) => (
                         <button 
                            key={idx}
                            disabled={userStats.gold < item.cost}
                            onClick={() => onBuyItem(item.cost, item.name, 'potion', { multiplier: item.multiplier, durationMinutes: item.duration })}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between group hover:border-orange-300 transition-all disabled:opacity-50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                                    <Zap size={20} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                                    <p className="text-xs text-slate-400">{item.desc}</p>
                                </div>
                            </div>
                            <div className="bg-yellow-100 px-3 py-1 rounded-lg text-sm font-bold text-yellow-700 flex items-center gap-1">
                                <Coins size={12} /> {item.cost}
                            </div>
                        </button>
                      ))}
                  </div>
              </div>

              {/* Normal Shop (XP) */}
              {[
                  { name: 'Spirit Berry', type: 'food', cost: 100, icon: <Utensils size={20} />, desc: 'Grants small XP to pet' },
                  { name: 'Heavenly Meat', type: 'food', cost: 300, icon: <Utensils size={20} />, desc: 'Grants large XP to pet' },
                  { name: 'Jade Collar', type: 'gear', cost: 500, icon: <Shield size={20} />, desc: 'Cosmetic Gear' },
                  { name: 'Bamboo Mat', type: 'decor', cost: 200, icon: <Heart size={20} />, desc: 'Cozy decoration' },
                  { name: 'Phoenix Feather', type: 'gear', cost: 1000, icon: <Zap size={20} />, desc: 'Rare Aura' },
              ].map((item, idx) => (
                  <button 
                      key={idx}
                      disabled={userStats.spendableXp < item.cost}
                      onClick={() => onBuyItem(item.cost, item.name, item.type as any)}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-pink-200 transition-all disabled:opacity-50"
                  >
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center">
                              {item.icon}
                          </div>
                          <div className="text-left">
                              <h4 className="font-bold text-slate-800">{item.name}</h4>
                              <p className="text-xs text-slate-400">{item.desc}</p>
                          </div>
                      </div>
                      <div className="bg-slate-50 px-3 py-1 rounded-lg text-sm font-bold text-slate-600 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                          {item.cost} XP
                      </div>
                  </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetSanctuary;
