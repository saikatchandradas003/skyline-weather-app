// src/components/WeatherCard.jsx
import React from 'react';
import { Compass, Droplets, Thermometer, Wind } from 'lucide-react';

export default function WeatherCard({ weather, aqi, icon, formatTemp, isDarkMode }) {
  if (!weather) return null;

  
 const isNight = weather?.weather?.[0]?.icon?.endsWith('n') || false;
 const mainCondition = weather?.weather?.[0]?.main?.toLowerCase() || '';

  const getAqiStatus = (aqiValue) => {
    switch (aqiValue) {
      case 1: return { text: 'AQI: GOOD', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 2: return { text: 'AQI: FAIR', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' };
      case 3: return { text: 'AQI: MODERATE', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
      case 4: return { text: 'AQI: POOR', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 5: return { text: 'AQI: VERY POOR', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      default: return { text: 'AQI: UNKNOWN', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
    }
  };

  const aqiStatus = getAqiStatus(aqi);

  const getWindDirection = (deg) => {
    if (deg >= 337.5 || deg < 22.5) return 'North';
    if (deg >= 22.5 && deg < 67.5) return 'North-East';
    if (deg >= 67.5 && deg < 112.5) return 'East';
    if (deg >= 112.5 && deg < 157.5) return 'South-East';
    if (deg >= 157.5 && deg < 202.5) return 'South';
    if (deg >= 202.5 && deg < 247.5) return 'South-West';
    if (deg >= 247.5 && deg < 292.5) return 'West';
    return 'North-West';
  };

  return (
    <div className={`p-8 flex flex-col h-full justify-between min-h-[460px] relative overflow-hidden group rounded-[2.5rem] transition-colors duration-300 ${
      isDarkMode ? 'text-white' : 'text-slate-800'
    }`}>
      
      {/* Background Animated Gradient Orb */}
      <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-1000 ${
        mainCondition.includes('clear') && !isNight ? 'bg-amber-400 animate-pulse' :
        isNight ? 'bg-indigo-400 animate-[pulse_4s_ease-in-out_infinite]' : 'bg-sky-400'
      }`} />

      <style>{`
        @keyframes cardPopIn {
          0% { transform: scale(0.9) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-card-1 { animation: cardPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-card-2 { animation: cardPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; }
        .animate-card-3 { animation: cardPopIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; }
      `}</style>

      {/* Top Section: Temp, City and Icon */}
      <div className="flex justify-between items-start w-full z-10">
        <div>
          <div className="flex items-baseline select-none">
            <span className={`text-5xl font-black tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-500 hover:scale-105 block cursor-default ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>
              {formatTemp(weather.main.temp)}
            </span>
          </div>
          <h2 className={`text-2xl font-black tracking-tight mt-2 select-text hover:text-orange-500 transition-colors ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {weather.name}, {weather.sys.country}
          </h2>
          <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-black tracking-wider border transition-all duration-500 transform hover:scale-110 cursor-pointer ${aqiStatus.color}`}>
            {aqiStatus.text}
          </span>
        </div>

        <div className={`w-[76px] h-[76px] p-4 rounded-[2rem] border backdrop-blur-sm transition-all duration-300 flex items-center justify-center ${
          isDarkMode 
            ? 'bg-white/5 border-white/10 shadow-[inset_0_4px_12px_rgba(255,255,255,0.05)] hover:bg-white/10' 
            : 'bg-slate-100 border-slate-200/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.03)] hover:bg-slate-200/50'
        }`}>
          {icon}
        </div>
      </div>

      {/* Middle Section: Condition and Wind Direction */}
      <div className="my-8 flex justify-between items-center z-10">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
            isDarkMode ? 'text-white/30' : 'text-slate-400'
          }`}>Current Status</p>
          <p className={`text-2xl font-black tracking-wide capitalize drop-shadow-sm ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>{weather.weather[0].description}</p>
        </div>
        
        <div className={`flex items-center gap-3 border rounded-2xl p-3 backdrop-blur-xl hover:border-orange-500/30 transition-all cursor-default ${
          isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100/80 border-slate-200/60'
        }`}>
          <Compass 
            size={20} 
            className="text-orange-500 transition-transform duration-700 ease-out" 
            style={{ 
              transform: `rotate(${weather.wind.deg}deg)` 
            }} 
          />
          <span className={`text-xs font-bold tracking-wide ${
            isDarkMode ? 'text-white/70' : 'text-slate-600'
          }`}>{getWindDirection(weather.wind.deg)}</span>
        </div>
      </div>

      {/* Bottom Grid Section: Details Metrics */}
      <div className="grid grid-cols-3 gap-4 z-10">
        
        {/* Humidity Card */}
        <div className={`p-4 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md shadow-sm hover:-translate-y-1 transition-all duration-300 cursor-default group/item animate-card-1 border ${
          isDarkMode 
            ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10' 
            : 'bg-slate-100/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300/40'
        }`}>
          <Droplets size={18} className="text-blue-500 mb-2 transition-transform duration-500 group-hover/item:scale-125 group-hover/item:animate-pulse" />
          <p className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Humidity</p>
          <p className={`font-black text-base mt-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{weather.main.humidity}%</p>
        </div>

        {/* Wind Speed Card */}
        <div className={`p-4 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md shadow-sm hover:-translate-y-1 transition-all duration-300 cursor-default group/item animate-card-2 border ${
          isDarkMode 
            ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10' 
            : 'bg-slate-100/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300/40'
        }`}>
          <Wind size={18} className="text-sky-500 mb-2 transition-transform duration-500 group-hover/item:scale-125" />
          <p className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Wind</p>
          <p className={`font-black text-sm mt-1 text-center leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {((weather.wind.speed) * 3.6).toFixed(1)} <span className={`text-[9px] font-medium block ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`}>km/h</span>
          </p>
        </div>

        {/* Feels Like Card */}
        <div className={`p-4 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md shadow-sm hover:-translate-y-1 transition-all duration-300 cursor-default group/item animate-card-3 border ${
          isDarkMode 
            ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10' 
            : 'bg-slate-100/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300/40'
        }`}>
          <Thermometer size={18} className="text-amber-500 mb-2 transition-transform duration-500 group-hover/item:scale-125" />
          <p className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Feels Like</p>
          <p className={`font-black text-base mt-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatTemp(weather.main.feels_like)}</p>
        </div>

      </div>

    </div>
  );
}