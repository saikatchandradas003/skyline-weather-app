// src/components/WeatherChart.jsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sun, Cloud } from 'lucide-react';

const getTooltipIcon = (iconCode) => {
  switch (iconCode) {
    case '01d':
    case '01n':
      return <Sun size={28} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />;
    case '02d':
    case '02n':
    case '03d':
      return <Cloud size={28} className="text-sky-200" />;
    default:
      return <Sun size={28} className="text-amber-400" />;
  }
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { temp, description, icon, fullTime } = payload[0].payload;
    return (
      <div className="bg-black/85 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl text-white shadow-2xl flex flex-col items-center min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
        <p className="text-[10px] font-black uppercase tracking-wider text-orange-400 mb-1">
          {fullTime}
        </p>
        <div className="my-1 h-8 flex items-center justify-center">
          {getTooltipIcon(icon)}
        </div>
        <p className="font-black text-xl text-white mt-1">{temp}°C</p>
        <p className="text-[9px] font-medium text-white/50 capitalize mt-0.5 text-center">
          {description}
        </p>
      </div>
    );
  }
  return null;
};

export default function WeatherChart({ data, isDarkMode }) {
  if (!data || data.length === 0) return null;

  const chartData = data.slice(0, 8).map(item => {
    const dateObj = new Date(item.dt * 1000);
    return {
      name: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      fullTime: dateObj.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', hour12: true }),
      temp: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon                 
    };
  });

  const temps = chartData.map(d => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  const startTick = Math.floor(minTemp - 2);
  const endTick = Math.ceil(maxTemp + 2);
  const tickValues = [];
  const adjustedStart = startTick % 2 === 0 ? startTick : startTick - 1;

  for (let i = adjustedStart; i <= endTick + 2; i += 2) {
    tickValues.push(i);
  }

  // থিম ভিত্তিক চার্ট কালার লজিক
  const axisColor = isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(71, 85, 105, 0.6)"; 
  const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  const dotStrokeColor = isDarkMode ? "#1e293b" : "#f97316"; // Darker background dot for dark mode

  return (
    <div className={`p-6 rounded-[2.5rem] border shadow-2xl h-full flex flex-col justify-between min-h-[384px] transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-white/5 border-white/10 text-white' 
        : 'bg-white/60 border-slate-200 text-slate-800'
    }`}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Hourly Analytics</h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
              Temperature fluctuation over the next 24 hours
            </p>
          </div>
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">24H Timeline</span>
          </div>
        </div>
      </div>

      <div className="w-full h-56 mt-4" style={{ minWidth: 0, minHeight: '224px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke={axisColor} 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke={axisColor} 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              ticks={[...new Set(tickValues)]}
              domain={[adjustedStart, 'dataMax + 2']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#f97316" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTemp)" 
              dot={{ r: 4, strokeWidth: 2, fill: isDarkMode ? '#fff' : dotStrokeColor }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Tabs */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <button className={`py-2 rounded-xl text-xs font-bold transition-all ${
          isDarkMode 
            ? 'bg-white/10 hover:bg-white/15 text-white' 
            : 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
        }`}>
          Next 24 Hours
        </button>
        <button className={`py-2 rounded-xl text-xs font-bold transition-all ${
          isDarkMode 
            ? 'bg-white/5 hover:bg-white/10 text-white/60' 
            : 'bg-slate-100 border border-slate-200/60 text-slate-500 hover:bg-slate-200/50'
        }`}>
          Wind Flow
        </button>
        <button className={`py-2 rounded-xl text-xs font-bold transition-all ${
          isDarkMode 
            ? 'bg-white/5 hover:bg-white/10 text-white/60' 
            : 'bg-slate-100 border border-slate-200/60 text-slate-500 hover:bg-slate-200/50'
        }`}>
          Humidity
        </button>
      </div>
    </div>
  );
}