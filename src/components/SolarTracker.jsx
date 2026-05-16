import React, { useEffect, useState } from 'react';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';

export default function SolarTracker({ weather }) {
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
    <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[290px]">
      
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <Sun size={14} className="text-orange-500" /> Day Cycle
        </h3>
        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-wider border flex items-center gap-1.5 uppercase ${
          trackerInfo.isNight 
            ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' 
            : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        }`}>
          {trackerInfo.isNight ? <Moon size={10} /> : <Sun size={10} />}
          {trackerInfo.isNight ? 'Night Mode' : 'Sun Is Up'}
        </span>
      </div>

      
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-6 border border-white/5 relative">
        <div 
          className={`h-full transition-all duration-1000 bg-gradient-to-r ${
            trackerInfo.isNight ? 'from-indigo-600 to-purple-500' : 'from-amber-500 to-orange-500'
          }`}
          style={{ width: `${trackerInfo.progress}%` }}
        />
      </div>

      
      <div className="space-y-3">
        
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <Sunrise size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-wider">Sunrise</p>
            <p className="text-lg font-black text-white mt-0.5">{trackerInfo.sunriseStr}</p>
          </div>
        </div>

       
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Sunset size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-wider">Sunset</p>
            <p className="text-lg font-black text-white mt-0.5">{trackerInfo.sunsetStr}</p>
          </div>
        </div>
      </div>

      
      <p className="text-center text-xs font-bold text-white/40 mt-4 animate-pulse uppercase tracking-wide">
        ⏳ {trackerInfo.countdownText}
      </p>

    </div>
  );
}