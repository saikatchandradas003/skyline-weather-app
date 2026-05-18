import React, { useState } from 'react';
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

const CustomTooltip = ({ active, payload, activeTab }) => {
  if (active && payload && payload.length) {
    const { displayValue, description, icon, fullTime } = payload[0].payload;
    const unit = activeTab === 'temperature' ? '°C' : activeTab === 'wind' ? ' m/s' : '%';
    const labelColor = activeTab === 'temperature' ? 'text-orange-400' : activeTab === 'wind' ? 'text-cyan-400' : 'text-emerald-400';
    
    return (
      <div className="bg-black/85 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl text-white shadow-2xl flex flex-col items-center min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
        <p className={`text-[10px] font-black uppercase tracking-wider ${labelColor} mb-1`}>
          {fullTime}
        </p>
        <div className="my-1 h-8 flex items-center justify-center">
          {getTooltipIcon(icon)}
        </div>
        <p className="font-black text-xl text-white mt-1">{displayValue}{unit}</p>
        <p className="text-[9px] font-medium text-white/50 capitalize mt-0.5 text-center">
          {description}
        </p>
      </div>
    );
  }
  return null;
};

export default function WeatherChart({ data, isDarkMode }) {
  const [activeTab, setActiveTab] = useState('temperature');

  if (!data || data.length === 0) return null;

  const chartData = data.slice(0, 8).map(item => {
    const dateObj = new Date(item.dt * 1000);
    let value = Math.round(item.main.temp);
    if (activeTab === 'wind') value = item.wind.speed;
    if (activeTab === 'humidity') value = item.main.humidity;

    return {
      name: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      fullTime: dateObj.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', hour12: true }),
      displayValue: value,
      description: item.weather[0].description,
      icon: item.weather[0].icon                 
    };
  });

  const values = chartData.map(d => d.displayValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const startTick = Math.floor(minValue - 2);
  const endTick = Math.ceil(maxValue + 2);
  const tickValues = [];
  const adjustedStart = startTick % 2 === 0 ? startTick : startTick - 1;

  for (let i = adjustedStart; i <= endTick + 2; i += 2) {
    tickValues.push(i);
  }

  const axisColor = isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(71, 85, 105, 0.6)"; 
  const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";

  const getThemeConfig = () => {
    if (activeTab === 'wind') {
      return {
        stroke: '#06b6d4',
        gradientId: 'colorWind',
        stopColor: '#06b6d4',
        dotColor: isDarkMode ? '#1e293b' : '#06b6d4',
        accentBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        pulseBg: 'bg-cyan-500'
      };
    }
    if (activeTab === 'humidity') {
      return {
        stroke: '#10b981',
        gradientId: 'colorHumidity',
        stopColor: '#10b981',
        dotColor: isDarkMode ? '#1e293b' : '#10b981',
        accentBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        pulseBg: 'bg-emerald-500'
      };
    }
    return {
      stroke: '#f97316',
      gradientId: 'colorTemp',
      stopColor: '#f97316',
      dotColor: isDarkMode ? '#1e293b' : '#f97316',
      accentBg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      pulseBg: 'bg-orange-500'
    };
  };

  const currentTheme = getThemeConfig();

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
              {activeTab === 'temperature' && 'Temperature fluctuation over the next 24 hours'}
              {activeTab === 'wind' && 'Wind speed forecast over the next 24 hours'}
              {activeTab === 'humidity' && 'Humidity percentage over the next 24 hours'}
            </p>
          </div>
          <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-full ${currentTheme.accentBg}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${currentTheme.pulseBg}`}></span>
            <span className="text-[10px] font-black uppercase tracking-wider">24H Timeline</span>
          </div>
        </div>
      </div>

      <div className="w-full h-56 mt-4" style={{ minWidth: 0, minHeight: '224px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={currentTheme.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentTheme.stopColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={currentTheme.stopColor} stopOpacity={0}/>
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
            <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{ stroke: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey="displayValue" 
              stroke={currentTheme.stroke} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#${currentTheme.gradientId})`} 
              dot={{ r: 4, strokeWidth: 2, fill: isDarkMode ? '#fff' : currentTheme.dotColor }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <button 
          onClick={() => setActiveTab('temperature')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'temperature'
              ? isDarkMode 
                ? 'bg-white/20 text-white border border-white/20' 
                : 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : isDarkMode
                ? 'bg-white/5 hover:bg-white/10 text-white/60'
                : 'bg-slate-100 border border-slate-200/60 text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          Next 24 Hours
        </button>
        
        <button 
          onClick={() => setActiveTab('wind')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'wind'
              ? isDarkMode 
                ? 'bg-white/20 text-white border border-white/20' 
                : 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
              : isDarkMode
                ? 'bg-white/5 hover:bg-white/10 text-white/60'
                : 'bg-slate-100 border border-slate-200/60 text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          Wind Flow
        </button>
        
        <button 
          onClick={() => setActiveTab('humidity')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'humidity'
              ? isDarkMode 
                ? 'bg-white/20 text-white border border-white/20' 
                : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : isDarkMode
                ? 'bg-white/5 hover:bg-white/10 text-white/60'
                : 'bg-slate-100 border border-slate-200/60 text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          Humidity
        </button>
      </div>
    </div>
  );
}