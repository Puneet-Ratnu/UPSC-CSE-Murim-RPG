import React from 'react';

interface RadarChartProps {
  stats: {
    gs: number;
    optional: number;
    essay: number;
    mains: number;
    hobbies: number;
  };
}

const RadarChart: React.FC<RadarChartProps> = ({ stats }) => {
  // Normalize stats to 0-100 (assuming roughly 100 tasks/actions is "Mastery" for the chart scope)
  const normalize = (val: number) => Math.min(Math.max(val, 5), 100);
  
  const data = {
    gs: normalize(stats.gs),
    opt: normalize(stats.optional),
    ess: normalize(stats.essay * 5), // Essays are rarer, worth more
    main: normalize(stats.mains * 2),
    hob: normalize(stats.hobbies * 2)
  };

  // Helper to calculate polygon points
  const getPoint = (value: number, angle: number) => {
    const radius = (value / 100) * 80; // 80 is max radius
    const x = 100 + radius * Math.cos(angle);
    const y = 100 + radius * Math.sin(angle);
    return `${x},${y}`;
  };

  // 5 axes: 0, 72, 144, 216, 288 degrees (converted to radians)
  // -90 degrees offset to start at top
  const angles = [-90, -18, 54, 126, 198].map(d => d * (Math.PI / 180));
  
  const points = [
    getPoint(data.gs, angles[0]),    // Top: GS
    getPoint(data.opt, angles[1]),   // Right-Top: Optional
    getPoint(data.ess, angles[2]),   // Right-Bottom: Essay
    getPoint(data.main, angles[3]),  // Left-Bottom: Mains
    getPoint(data.hob, angles[4])    // Left-Top: Hobbies
  ].join(' ');

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-md">
        {/* Background Grid */}
        {gridLevels.map(level => (
          <polygon
            key={level}
            points={angles.map(a => getPoint(level, a)).join(' ')}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
            className="opacity-50"
          />
        ))}
        
        {/* Axes */}
        {angles.map((a, i) => {
          const p = getPoint(100, a);
          return <line key={i} x1="100" y1="100" x2={p.split(',')[0]} y2={p.split(',')[1]} stroke="#cbd5e1" strokeWidth="1" />;
        })}

        {/* Data Area */}
        <polygon
          points={points}
          fill="rgba(192, 132, 252, 0.2)"
          stroke="#a855f7"
          strokeWidth="2"
          className="transition-all duration-1000 ease-out"
        />

        {/* Labels */}
        <text x="100" y="10" textAnchor="middle" className="text-[10px] fill-slate-500 font-bold">GS</text>
        <text x="190" y="70" textAnchor="middle" className="text-[10px] fill-slate-500 font-bold">Optional</text>
        <text x="160" y="190" textAnchor="middle" className="text-[10px] fill-slate-500 font-bold">Essay</text>
        <text x="40" y="190" textAnchor="middle" className="text-[10px] fill-slate-500 font-bold">Mains</text>
        <text x="10" y="70" textAnchor="middle" className="text-[10px] fill-slate-500 font-bold">Hobbies</text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 bg-slate-800 rounded-full opacity-20"></div>
      </div>
    </div>
  );
};

export default RadarChart;
