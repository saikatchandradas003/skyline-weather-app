// src/components/SolarTracker.jsx
import React, { useEffect, useState } from 'react';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';

export default function SolarTracker({ weather, isDarkMode }) {
  const [trackerInfo, setTrackerInfo] = useState({
    sunriseStr: '--:-- --',
    sunsetStr: '--:-- --',
    progress: 0,
    isNight: false,
    countdownText: ''
  });

  useEffect(() => {
    if (!weather || !weather.sys) return;

    const calculateSolarData = () => {
      const sys = weather.sys;
      const timezoneOffset = weather.timezone; 

      const nowUTC = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
      const currentLocalTime = new Date(nowUTC + timezoneOffset * 1000);

      const convertToLocalTimeStr = (unixTimestamp) => {
        const utcTimestamp = unixTimestamp * 1000;
        const localDate = new Date(utcTimestamp + timezoneOffset * 1000 + new Date().getTimezoneOffset() * 60000);
        return localDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      };

      const sunriseStr = convertToLocalTimeStr(sys.sunrise);
      const sunsetStr = convertToLocalTimeStr(sys.sunset);

      const currentTimeSec = Math.floor(currentLocalTime.getTime() / 1000);
      const sunriseSec = sys.sunrise;
      const sunsetSec = sys.sunset;

      let isNight = false;
      let progress = 0;
      let countdownText = '';

      if (currentTimeSec >= sunriseSec && currentTimeSec < sunsetSec) {
        isNight = false;
        const totalDaylight = sunsetSec - sunriseSec;
        const passedDaylight = currentTimeSec - sunriseSec;
        progress = (passedDaylight / totalDaylight) * 100;

        const remainingSec = sunsetSec - currentTimeSec;
        const hours = Math.floor(remainingSec / 3600);
        const minutes = Math.floor((remainingSec % 3600) / 60);
        countdownText = hours > 0 ? `Sunset in ${hours}h ${minutes}m` : `Sunset in ${minutes}m`;
      } else {
        isNight = true;
        progress = 100; 

        let remainingSec = 0;
        if (currentTimeSec < sunriseSec) {
          remainingSec = sunriseSec - currentTimeSec;
        } else {
          remainingSec = (sunriseSec + 86400) - currentTimeSec;
        }

        const hours = Math.floor(remainingSec / 3600);
        const minutes = Math.floor((remainingSec % 3600) / 60);
        countdownText = hours > 0 ? `Dawn in ${hours}h ${minutes}m` : `Dawn in ${minutes}m`;
      }

      setTrackerInfo({
        sunriseStr,
        sunsetStr,
        progress: Math.min(Math.max(progress, 0), 100), 
        isNight,
        countdownText
      });
    };

    calculateSolarData();
    
    const interval = setInterval(calculateSolarData, 60000);
    return () => clearInterval(interval);

  }, [weather]);

  if (!weather) return null;

  return (
    <div className={`p-6 rounded-[2.5rem] border shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[290px] transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-white/5 border-white/10 text-white' 
        : 'bg-white/60 border-slate-200 text-slate-800'
    }`}>
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
          isDarkMode ? 'text-white/30' : 'text-slate-400'
        }`}>
          <Sun size={14} className="text-orange-500" /> Day Cycle
        </h3>
        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-wider border flex items-center gap-1.5 uppercase ${
          trackerInfo.isNight 
            ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' 
            : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
        }`}>
          {trackerInfo.isNight ? <Moon size={10} /> : <Sun size={10} />}
          {trackerInfo.isNight ? 'Night Mode' : 'Sun Is Up'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-2 rounded-full overflow-hidden mb-6 border relative ${
        isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-200 border-slate-300/30'
      }`}>
        <div 
          className={`h-full transition-all duration-1000 bg-gradient-to-r ${
            trackerInfo.isNight ? 'from-indigo-600 to-purple-500' : 'from-amber-500 to-orange-500'
          }`}
          style={{ width: `${trackerInfo.progress}%` }}
        />
      </div>

      {/* Info Boxes */}
      <div className="space-y-3">
        {/* Sunrise Box */}
        <div className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
          isDarkMode 
            ? 'bg-white/5 border-white/5 hover:bg-white/10' 
            : 'bg-slate-100/60 border-slate-200 hover:bg-slate-100'
        }`}>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
            <Sunrise size={20} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-wider ${
              isDarkMode ? 'text-white/30' : 'text-slate-400'
            }`}>Sunrise</p>
            <p className={`text-lg font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {trackerInfo.sunriseStr}
            </p>
          </div>
        </div>

        {/* Sunset Box */}
        <div className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
          isDarkMode 
            ? 'bg-white/5 border-white/5 hover:bg-white/10' 
            : 'bg-slate-100/60 border-slate-200 hover:bg-slate-100'
        }`}>
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-500">
            <Sunset size={20} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-wider ${
              isDarkMode ? 'text-white/30' : 'text-slate-400'
            }`}>Sunset</p>
            <p className={`text-lg font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {trackerInfo.sunsetStr}
            </p>
          </div>
        </div>
      </div>

      {/* Countdown Text */}
      <p className={`text-center text-xs font-bold mt-4 animate-pulse uppercase tracking-wide ${
        isDarkMode ? 'text-white/40' : 'text-slate-500'
      }`}>
        ⏳ {trackerInfo.countdownText}
      </p>

    </div>
  );
}