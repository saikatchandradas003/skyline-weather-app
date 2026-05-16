import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Loader2, MapPin, Wind, LayoutDashboard, Settings, History as HistoryIcon, Users, Globe, Coins, Sun, Moon, Cloud, CloudRain, CloudLightning, CloudSnow, CloudDrizzle, Clock, Edit2, Volume2, Sparkles, Bell } from 'lucide-react';
import WeatherCard from './components/WeatherCard';
import Sidebar from './components/Sidebar';
import WeatherChart from './components/WeatherChart';
import SolarTracker from './components/SolarTracker';
import SearchSuggestions from './components/SearchSuggestions';

export default function App() {
  const [city, setCity] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [rawForecastList, setRawForecastList] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); 
  const [aqi, setAqi] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [localTime, setLocalTime] = useState('');
  const [isCelsius, setIsCelsius] = useState(true);
  
  // বাই-ডিফল্ট অ্যাপ সবসময় ডার্ক মোডে শুরু হবে
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('skylineTheme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  
  const [userName, setUserName] = useState(() => {
    const savedName = localStorage.getItem('skylineUserName');
    return savedName ? savedName : 'Saikat Chandra Das';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const timerRef = useRef(null);
  const API_KEY = "50e4e17dfb05e4fca15affda7ae8cb1a";

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('skylineTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    getMyLocation();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSaveName = (newName) => {
    const trimmed = newName.trim();
    if (trimmed) {
      setUserName(trimmed);
      localStorage.setItem('skylineUserName', trimmed);
    } else {
      setUserName('User');
      localStorage.setItem('skylineUserName', 'User');
    }
    setIsEditingName(false);
  };

  const formatTemp = (tempInCelsius) => {
    if (isCelsius) {
      return `${Math.round(tempInCelsius)}°C`;
    }
    const tempInFahrenheit = (tempInCelsius * 9/5) + 32;
    return `${Math.round(tempInFahrenheit)}°F`;
  };

  const startLocalClock = (timezoneOffsetInSeconds) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const updateClock = () => {
      const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
      const targetLocalTime = new Date(utc + 1000 * timezoneOffsetInSeconds);
      
      const timeString = targetLocalTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      
      const dateString = targetLocalTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      setLocalTime(`${dateString} • ${timeString}`);
    };

    updateClock();
    timerRef.current = setInterval(updateClock, 1000);
  };

  const currentDisplayedWeather = useMemo(() => {
    if (!weather) return null;
    if (selectedDayIndex === 0) return weather;
    
    const targetDayData = forecast[selectedDayIndex];
    if (!targetDayData) return weather;

    return {
      name: weather.name,
      sys: weather.sys,
      coord: weather.coord,
      timezone: weather.timezone,
      main: targetDayData.main,
      weather: targetDayData.weather,
      wind: targetDayData.wind,
    };
  }, [weather, forecast, selectedDayIndex]);

  const lifestyleSuggestions = useMemo(() => {
    if (!currentDisplayedWeather) return null;
    
    const temp = currentDisplayedWeather.main.temp;
    const condition = currentDisplayedWeather.weather[0].main.toLowerCase();
    
    let dress = "Wear comfortable casual clothing.";
    let tip = "The weather is quite stable today. Enjoy your day!";
    let alertText = "No active weather alerts for now.";

    if (temp >= 32) {
      dress = "Opt for lightweight, loose-fitting cotton clothing. Full-sleeve shirts are recommended for sun protection.";
      tip = "It's scorching hot outside! Don't forget to carry a water bottle and wear sunglasses.";
      alertText = "Avoid direct sunlight between 12 PM and 3 PM to prevent heat exhaustion.";
    } else if (temp < 32 && temp >= 25) {
      dress = "Perfect for standard t-shirts, polos, or lightweight casual shirts.";
      tip = "Wonderful weather for outdoor activities and productivity. Make the most of it!";
      alertText = "Weather is pleasant, but consider wearing a mask if the streets are dusty.";
    } else if (temp < 25 && temp >= 18) {
      dress = "A long-sleeve shirt or a light jacket/hoodie would be ideal, especially for the evening.";
      tip = "There's a slight chill in the air—perfect time for a warm cup of coffee or tea!";
      alertText = "Light, cool breezes are expected later in the day.";
    } else if (temp < 18) {
      dress = "Wear thick jackets, sweaters, or blazers. Consider layering up to stay warm.";
      tip = "Brace yourself for cold weather! Keep yourself warm and stay hydrated with lukewarm water.";
      alertText = "Stay cautious against catching a cold or triggering sinus sensitivities.";
    }

    if (condition.includes('rain') || condition.includes('drizzle')) {
      dress = "Wear waterproof footwear and synthetic clothing that dries rapidly.";
      tip = "Do not forget to carry an umbrella or a raincoat before stepping out today.";
      alertText = "Expect waterlogging and slippery roads. Commute safely and drive with caution.";
    } else if (condition.includes('thunderstorm')) {
      dress = "It is highly recommended to stay indoors. Wear safe, protective gear if emergency travel is required.";
      tip = "High probability of lightning. Disconnect or handle electronic devices with extra care.";
      alertText = "Avoid standing in open fields or taking shelter under large trees during thunderstorms.";
    }

    return { dress, tip, alertText };
  }, [currentDisplayedWeather]);

  const checkRainAlert = (forecastList, cityName) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const nextForecast = forecastList[0];
    if (!nextForecast) return;

    const condition = nextForecast.weather[0].main.toLowerCase();
    const timeText = new Date(nextForecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
      new Notification(`Skyline Weather Alert: ${cityName}`, {
        body: `Rain or storm is expected within the next 3 hours (${timeText})! Keep an umbrella handy.`,
        icon: '/favicon.ico'
      });
    }
  };

  const speakWeatherReport = () => {
    if (!weather) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const tempText = isCelsius ? `${Math.round(weather.main.temp)} degrees Celsius` : `${Math.round((weather.main.temp * 9/5) + 32)} degrees Fahrenheit`;
    const speechText = `Hi ${userName}. Currently in ${weather.name}, it is ${tempText} with ${weather.weather[0].description}. Wind speed is ${weather.wind.speed} kilometers per hour. Have a great day!`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const filteredChartData = useMemo(() => {
    if (rawForecastList.length === 0) return [];
    
    if (selectedDayIndex === 0) {
      return rawForecastList.slice(0, 8);
    }

    const targetDayData = forecast[selectedDayIndex];
    if (!targetDayData) return rawForecastList.slice(0, 8);

    const targetDateStr = new Date(targetDayData.dt * 1000).toDateString();
    return rawForecastList.filter(item => new Date(item.dt * 1000).toDateString() === targetDateStr);
  }, [rawForecastList, forecast, selectedDayIndex]);

  const chartTimelineLabel = useMemo(() => {
    if (selectedDayIndex === 0) return "Next 24 Hours";
    const targetDayData = forecast[selectedDayIndex];
    if (!targetDayData) return "Hourly Forecast";
    
    const dayName = new Date(targetDayData.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
    return `${dayName} Forecast`;
  }, [selectedDayIndex, forecast]);

  const animationData = useMemo(() => {
    if (!currentDisplayedWeather) return {};

    const rainDrops = [...Array(40)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `-${Math.random() * 20}%`,
      duration: `${0.8 + Math.random() * 1.2}s`,
      delay: `${Math.random() * 2}s`,
    }));

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const clouds = [...Array(4)].map(() => ({
      width: isMobile ? `${180 + Math.random() * 100}px` : `${350 + Math.random() * 150}px`,
      height: isMobile ? `${70 + Math.random() * 40}px` : `${120 + Math.random() * 60}px`,
      top: `${5 + Math.random() * 35}%`,
      duration: isMobile ? `${20 + Math.random() * 10}s` : `${35 + Math.random() * 15}s`, 
      opacity: `${0.6 + Math.random() * 0.2}`, 
    }));

    const stars = [...Array(45)].map(() => ({
      width: `${1.5 + Math.random() * 2.5}px`,
      height: `${1.5 + Math.random() * 2.5}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${1.5 + Math.random() * 2.5}s`,
      delay: `${Math.random() * 4}s`,
    }));

    const shootingStars = [...Array(2)].map(() => ({
      left: `${20 + Math.random() * 60}%`,
      top: `${Math.random() * 30}%`,
      duration: `${2 + Math.random() * 2}s`,
      delay: `${Math.random() * 8}s`,
    }));

    const sunBeams = [...Array(12)].map(() => ({
      width: `${3 + Math.random() * 4}px`,
      height: `${3 + Math.random() * 4}px`,
      left: `${Math.random() * 100}%`,
      top: `${70 + Math.random() * 30}%`,
      duration: `${5 + Math.random() * 5}s`,
      delay: `${Math.random() * 5}s`,
    }));

    return { rainDrops, clouds, stars, shootingStars, sunBeams };
  }, [currentDisplayedWeather]);

  const getDynamicBgColor = () => {
    if (!isDarkMode) {
      return "from-[#F0F4F8] via-[#E2E8F0] to-[#CBD5E1]";
    }
    
    if (!currentDisplayedWeather) return "from-[#0D1117] to-[#161B22]";
    const condition = currentDisplayedWeather.weather[0].main.toLowerCase();
    
    let isNight = currentDisplayedWeather.weather[0].icon.endsWith('n');
    if (selectedDayIndex !== 0) isNight = false; 

    if (condition.includes('rain') || condition.includes('drizzle')) {
      return "from-[#0B0E14] via-[#141A24] to-[#0B0E14]"; 
    }
    if (condition.includes('thunderstorm')) {
      return "from-[#05070B] via-[#120D20] to-[#05070B]"; 
    }
    if (condition.includes('cloud')) {
      return "from-[#0A0E15] via-[#131B26] to-[#0A0E15]"; 
    }
    if (condition.includes('snow')) {
      return "from-[#0E141B] via-[#1A2635] to-[#0E141B]"; 
    }
    if (condition.includes('haze') || condition.includes('mist') || condition.includes('fog')) {
      return "from-[#10141D] via-[#1B2332] to-[#10141D]";
    }
    
    if (isNight) {
      return "from-[#05070A] via-[#0D121A] to-[#05070A]"; 
    }
    return "from-[#0A1424] via-[#12243F] to-[#0A1526]"; 
  };

  const getWeatherIcon = (iconCode, forceDaytime = false) => {
    if (!iconCode) return <Sun size={36} className="text-amber-400" />;
    
    let isNight = iconCode.endsWith('n');
    if (forceDaytime) isNight = false; 

    const genericCode = iconCode.slice(0, 2);

    switch (genericCode) {
      case '01': 
        return isNight ? (
          <Moon size={36} className="text-indigo-200 drop-shadow-[0_0_12px_rgba(199,210,254,0.6)] animate-[pulse_3s_ease-in-out_infinite]" />
        ) : (
          <Sun size={36} className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-[spin_20s_linear_infinite]" />
        );
      case '02': case '03': case '04': 
        return <Cloud size={36} className={isDarkMode ? "text-sky-200 drop-shadow-[0_4px_6px_rgba(255,255,255,0.2)]" : "text-slate-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)]"} />;
      case '09': 
        return <CloudDrizzle size={36} className="text-blue-400" />;
      case '10': 
        return <CloudRain size={36} className="text-blue-500" />;
      case '11': 
        return <CloudLightning size={36} className="text-yellow-400" />;
      case '13': 
        return <CloudSnow size={36} className={isDarkMode ? "text-indigo-100" : "text-sky-600"} />;
      case '50': 
        return <Cloud size={36} className="text-gray-400/80 drop-shadow-[0_2px_8px_rgba(156,163,175,0.4)]" />;
      default: 
        return <Sun size={36} className="text-amber-400" />;
    }
  };

  const renderWeatherAnimation = () => {
    if (!currentDisplayedWeather) return null;
    const condition = currentDisplayedWeather.weather[0].main.toLowerCase();
    
    let isNight = currentDisplayedWeather.weather[0].icon.endsWith('n');
    if (selectedDayIndex !== 0) isNight = false; 

    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
      const isThunder = condition.includes('thunderstorm');
      return (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${isThunder ? 'animate-lightning' : ''}`}>
          {animationData.rainDrops?.map((drop, i) => (
            <div
              key={i}
              className={`absolute w-[1.5px] h-[60px] rounded ${isDarkMode ? 'bg-gradient-to-b from-transparent to-sky-400/60' : 'bg-gradient-to-b from-transparent to-blue-500/80'}`}
              style={{
                left: drop.left,
                top: drop.top,
                animation: `fall ${drop.duration} linear infinite`,
                animationDelay: drop.delay,
              }}
            />
          ))}
        </div>
      );
    }

    if (condition.includes('cloud')) {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bit-cloud-container">
          {animationData.clouds?.map((cloud, i) => (
            <div
              key={i}
              className={`absolute rounded-full cloud-element ${isDarkMode ? 'bg-gradient-to-br from-white/20 via-white/40 to-transparent' : 'bg-gradient-to-br from-slate-400/10 via-slate-500/20 to-transparent'}`}
              style={{
                width: cloud.width,
                height: cloud.height,
                top: cloud.top,
                opacity: cloud.opacity,
                filter: 'blur(20px)', 
                animation: `drift ${cloud.duration} linear infinite`,
                animationDelay: `${i * 4}s`,
              }}
            />
          ))}
        </div>
      );
    }

    if (condition.includes('clear')) {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {isNight && isDarkMode ? (
            <>
              {animationData.stars?.map((star, i) => (
                <div
                  key={i}
                  className="absolute bg-white rounded-full opacity-0"
                  style={{
                    width: star.width,
                    height: star.height,
                    left: star.left,
                    top: star.top,
                    boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
                    animation: `twinkle ${star.duration} ease-in-out infinite`,
                    animationDelay: star.delay,
                  }}
                />
              ))}
              {animationData.shootingStars?.map((sStar, i) => (
                <div
                  key={i}
                  className="absolute bg-gradient-to-r from-white to-transparent h-[1px] w-[60px] rounded-full opacity-0"
                  style={{
                    left: sStar.left,
                    top: sStar.top,
                    transform: 'rotate(-45deg)',
                    animation: `shootStar ${sStar.duration} ease-in-out infinite`,
                    animationDelay: sStar.delay,
                  }}
                />
              ))}
            </>
          ) : !isNight ? (
            <>
              <div className={`absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite] ${isDarkMode ? 'bg-gradient-to-br from-amber-500/10 via-orange-400/5 to-transparent' : 'bg-gradient-to-br from-amber-400/20 via-orange-300/10 to-transparent'}`} />
              {animationData.sunBeams?.map((beam, i) => (
                <div
                  key={i}
                  className={`absolute rounded-full blur-[0.5px] opacity-0 ${isDarkMode ? 'bg-amber-400/30' : 'bg-amber-500/40'}`}
                  style={{
                    width: beam.width,
                    height: beam.height,
                    left: beam.left,
                    top: beam.top,
                    animation: `floatUpParticle ${8 + Math.random() * 6}s ease-in-out infinite`,
                    animationDelay: beam.delay,
                  }}
                />
              ))}
            </>
          ) : null}
        </div>
      );
    }

    if (condition.includes('haze') || condition.includes('mist') || condition.includes('fog')) {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-[160%] h-[280px] ${isDarkMode ? 'bg-gradient-to-r from-gray-600/10 via-gray-400/20 to-gray-600/10' : 'bg-gradient-to-r from-slate-400/10 via-slate-500/20 to-transparent'}`}
              style={{
                left: '-30%',
                top: `${i * 22}%`,
                filter: 'blur(50px)',
                animation: `fogMove ${40 + i * 10}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  const fetchAllData = async (lat, lon, cityName, countryCode) => {
    try {
      const [forecastRes, aqiRes, countryRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
        fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
      ]);

      const forecastData = await forecastRes.json();
      const aqiData = await aqiRes.json();
      const countryInfo = await countryRes.json();

      setAqi(aqiData.list[0].main.aqi);
      setCountryData(countryInfo[0]);
      setRawForecastList(forecastData.list);

      const uniqueDays = [];
      const dailyData = forecastData.list.filter((reading) => {
        const date = new Date(reading.dt * 1000).toDateString();
        if (!uniqueDays.includes(date)) {
          uniqueDays.push(date);
          return true;
        }
        return false;
      });

      setForecast(dailyData.slice(0, 5));
      setSelectedDayIndex(0); 

      if (forecastData.list && forecastData.list.length > 0) {
        checkRainAlert(forecastData.list, cityName);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async (searchParams) => {
    if (!searchParams) return;
    setLoading(true);
    setShowSuggestions(false);
    try {
      let url = "";
      if (searchParams.lat && searchParams.lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${searchParams.lat}&lon=${searchParams.lon}&units=metric&appid=${API_KEY}`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${searchParams}&units=metric&appid=${API_KEY}`;
      }

      const weatherRes = await fetch(url);
      const weatherData = await weatherRes.json();

      if (weatherData.cod === 200) {
        setWeather(weatherData);
        startLocalClock(weatherData.timezone);
        await fetchAllData(weatherData.coord.lat, weatherData.coord.lon, weatherData.name, weatherData.sys.country);
        if (!history.includes(weatherData.name)) {
          setHistory([weatherData.name, ...history].slice(0, 5));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => fetchData({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => fetchData("Comilla")
      );
    } else {
      fetchData("Comilla");
    }
  };

  const handleSelectSuggestion = (cityName) => {
    setCity(cityName);
    fetchData(cityName);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getDynamicBgColor()} ${isDarkMode ? 'text-white' : 'text-slate-800'} flex overflow-hidden font-sans transition-all duration-1000 relative`}>
      
      {renderWeatherAnimation()}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-60px) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(100vh) translateX(30px); opacity: 0; }
        }
        
        .cloud-element {
          left: -250px;
        }
        @media (min-width: 768px) {
          .cloud-element {
            left: -500px;
          }
        }

        @keyframes drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 600px)); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
        @keyframes fogMove {
          0% { transform: translateX(-5%) translateY(0); }
          100% { transform: translateX(5%) translateY(15px); }
        }
        @keyframes lightningFlash {
          0%, 94%, 96%, 100% { background-color: transparent; }
          95% { background-color: rgba(255, 255, 255, 0.08); filter: brightness(1.1); }
        }
        .animate-lightning {
          animation: lightningFlash 7s ease-in-out infinite;
        }
        @keyframes shootStar {
          0% { transform: translate(0, 0) rotate(-45deg); opacity: 0; width: 0px; }
          12% { opacity: 0.8; width: 60px; }
          35% { transform: translate(-250px, 250px) rotate(-45deg); opacity: 0; width: 0px; }
          100% { transform: translate(-250px, 250px) rotate(-45deg); opacity: 0; }
        }
        @keyframes floatUpParticle {
          0% { transform: translateY(0) scale(0.7); opacity: 0; }
          30% { opacity: 0.5; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-120px) scale(1.3); opacity: 0; }
        }
      `}</style>

      <nav className={`w-20 hidden lg:flex flex-col items-center py-10 border-r backdrop-blur-3xl z-10 ${isDarkMode ? 'bg-black/20 border-white/5 text-white' : 'bg-white/40 border-slate-200 text-slate-800'}`}>
        <div className="p-3 bg-orange-500 rounded-2xl mb-10 shadow-lg shadow-orange-500/40">
          <Wind size={24} className="text-white" />
        </div>
        <div className="space-y-10 flex-1">
          <LayoutDashboard size={24} className="text-orange-500 cursor-pointer" />
          <HistoryIcon size={24} className={`cursor-pointer transition-all ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`} />
          <Settings size={24} className={`cursor-pointer transition-all ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`} />
        </div>
      </nav>

      <main className="flex-1 h-screen overflow-y-auto p-4 lg:p-8 z-10">
        
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center justify-between w-full md:w-auto md:gap-8">
            <div>
              <h1 className={`text-4xl font-black tracking-tight text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-white via-white to-white/60' : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-500'}`}>
                Skyline
              </h1>
              
              <div className="mt-1 flex items-center gap-2 group min-h-[20px]">
                {isEditingName ? (
                  <input
                    type="text"
                    defaultValue={userName}
                    autoFocus
                    maxLength={25}
                    onBlur={(e) => handleSaveName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName(e.target.value);
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    className={`border rounded px-2 py-0.5 text-xs font-bold focus:outline-none w-44 ${isDarkMode ? 'bg-white/10 border-orange-500/50 text-white' : 'bg-slate-100 border-orange-500/50 text-slate-800'}`}
                  />
                ) : (
                  <>
                    <p 
                      onClick={() => setIsEditingName(true)}
                      className={`text-sm uppercase tracking-widest font-bold cursor-pointer hover:text-orange-400 transition-colors select-none ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}
                      title="Click to edit name"
                    >
                      {userName}
                    </p>
                    <Edit2 
                      size={12} 
                      onClick={() => setIsEditingName(true)}
                      className={`opacity-0 group-hover:opacity-100 hover:text-orange-400 cursor-pointer transition-all ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`} 
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={speakWeatherReport}
                title="Listen to Weather Report"
                className={`p-2.5 border rounded-xl transition-all backdrop-blur-xl shadow-md transform active:scale-95 ${isSpeaking ? 'bg-orange-500 text-white animate-bounce' : isDarkMode ? 'bg-white/10 border-white/10 text-orange-400 hover:bg-white/20' : 'bg-slate-200/60 border-slate-300 text-orange-500 hover:bg-slate-200'}`}
              >
                <Volume2 size={18} />
              </button>

              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 border rounded-xl transition-all backdrop-blur-xl shadow-md transform active:scale-95 ${isDarkMode ? 'bg-white/10 border-white/10 text-yellow-400 hover:bg-white/20' : 'bg-slate-200/60 border-slate-300 text-indigo-950 hover:bg-slate-200'}`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button 
                onClick={() => setIsCelsius(!isCelsius)}
                className={`px-4 py-2 border rounded-xl text-xs font-black tracking-wider transition-all backdrop-blur-xl shadow-md text-orange-400 select-none transform active:scale-95 ${isDarkMode ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-slate-200/60 border-slate-300 hover:bg-slate-200'}`}
              >
                UNIT: {isCelsius ? '°C' : '°F'}
              </button>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto z-50">
            <div className="relative flex-1 md:w-96">
              <input 
                type="text" 
                placeholder="Search worldwide city..." 
                className={`w-full p-4 pl-14 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-orange-500/50 backdrop-blur-xl transition-all ${isDarkMode ? 'bg-white/10 border-white/10 text-white placeholder-white/40' : 'bg-slate-200/50 border-slate-300 text-slate-800 placeholder-slate-400'}`}
                value={city} 
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => setShowSuggestions(true)}
                onKeyPress={(e) => e.key === 'Enter' && fetchData(city)}
              />
              <Search className={`absolute left-5 top-4 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`} size={20} />
              {showSuggestions && (
                <SearchSuggestions query={city} onSelect={handleSelectSuggestion} />
              )}
            </div>
            <button onClick={getMyLocation}
              className={`p-4 border rounded-2xl text-orange-400 hover:bg-orange-500 hover:text-white transition-all shadow-lg h-full ${isDarkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-slate-200/60 border-slate-300'}`}>
              <MapPin size={22} />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="text-orange-500 animate-spin" size={60} />
            <p className={`font-bold tracking-widest animate-pulse ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>SYNCING GLOBAL DATA...</p>
          </div>
        ) : (
          weather && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="xl:col-span-3 space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* এখানে রিয়েল-টাইম থিম ট্র্যাকিংয়ের জন্য {isDarkMode} ভ্যালু নিখুঁতভাবে পাস করা হয়েছে */}
                  <div className={`relative lg:col-span-1 rounded-[2.5rem] shadow-2xl border backdrop-blur-xl overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100/80 border-slate-200'}`}>
                    <WeatherCard 
                      weather={currentDisplayedWeather} 
                      aqi={aqi} 
                      icon={getWeatherIcon(currentDisplayedWeather.weather[0].icon, selectedDayIndex !== 0)} 
                      formatTemp={formatTemp} 
                      isForecastDay={selectedDayIndex !== 0}
                      isDarkMode={isDarkMode} 
                    />
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {forecast.map((day, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedDayIndex(i)}
                        className={`relative overflow-hidden cursor-pointer p-4 rounded-[2rem] border backdrop-blur-2xl flex flex-col items-center justify-center hover:scale-105 transition-all duration-300 shadow-xl min-h-[140px] ${
                          selectedDayIndex === i 
                            ? 'bg-orange-500/20 border-orange-500/50 shadow-orange-500/10' 
                            : isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-100/80 border-slate-200 hover:bg-slate-200/50'
                        }`}
                      >
                        <div className="absolute -bottom-6 w-12 h-12 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>
                        <p className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                          {i === 0 ? "Today" : new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <div className="my-2 h-10 flex items-center justify-center">
                          {getWeatherIcon(day.weather[0].icon, true)}
                        </div>
                        <p className={`font-black text-lg mt-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatTemp(day.main.temp)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {lifestyleSuggestions && (
                  <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 backdrop-blur-2xl p-6 rounded-[2.5rem] border shadow-xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100/80 border-slate-200 text-slate-800'}`}>
                    <div className="flex gap-4 items-start p-4 rounded-3xl bg-orange-500/5 border border-orange-500/10">
                      <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-500 shrink-0"><Sparkles size={20}/></div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-orange-600 mb-1">Outfit Suggestion</h4>
                        <p className="text-sm font-medium leading-relaxed">{lifestyleSuggestions.dress}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                      <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-500 shrink-0"><LayoutDashboard size={20}/></div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-blue-600 mb-1">Lifestyle Tip</h4>
                        <p className="text-sm font-medium leading-relaxed">{lifestyleSuggestions.tip}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                      <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-600 shrink-0"><Bell size={20}/></div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 mb-1">Health & Travel Alert</h4>
                        <p className="text-sm font-medium leading-relaxed">{lifestyleSuggestions.alertText}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* গ্রাফ ও সানরাইজ বক্সেও {isDarkMode} ভ্যালু নিখুঁতভাবে পাস করা হয়েছে */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className={`backdrop-blur-2xl p-6 rounded-[2.5rem] border shadow-xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100/80 border-slate-200 text-slate-800'}`}>
                    <SolarTracker weather={currentDisplayedWeather} isDarkMode={isDarkMode} />
                  </div>
                  <div className={`lg:col-span-2 backdrop-blur-2xl p-6 rounded-[2.5rem] border shadow-xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100/80 border-slate-200 text-slate-800'}`}>
                    <WeatherChart data={filteredChartData} timelineLabel={chartTimelineLabel} isDarkMode={isDarkMode} />
                  </div>
                </div>

              </div>

              <div className="space-y-8">
                <div className={`backdrop-blur-3xl p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden group ${isDarkMode ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white' : 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-200 text-slate-800'}`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-500"></div>
                  <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
                    <Clock size={14} className="text-orange-500 animate-pulse" /> Local Time
                  </h3>
                  <p className="text-2xl font-black tracking-wide drop-shadow-sm">
                    {localTime || "Loading time..."}
                  </p>
                  <p className={`text-xs font-medium mt-2 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                    Current time in {weather.name}, {weather.sys.country}
                  </p>
                </div>

                {countryData && (
                  <div className={`backdrop-blur-3xl p-8 rounded-[2.5rem] border shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100/80 border-slate-200 text-slate-800'}`}>
                    <h3 className={`text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
                      <Globe size={14} className="text-orange-500" /> Country Profile
                    </h3>
                    <div className="flex items-center gap-5 mb-8">
                      <img src={countryData.flags.svg} alt="flag" className="w-16 h-10 rounded-xl object-cover border border-white/10 shadow-sm" />
                      <div>
                        <h4 className="text-xl font-black">{countryData.name.common}</h4>
                        <p className="text-sm text-orange-400 font-bold">{countryData.capital?.[0]}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className={`flex justify-between items-center p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-200/40 border-slate-300/60'}`}>
                        <span className={`text-xs font-bold uppercase flex items-center gap-2 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}><Users size={16}/> People</span>
                        <span className="font-black text-sm">{(countryData.population / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className={`flex justify-between items-center p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-200/40 border-slate-300/60'}`}>
                        <span className={`text-xs font-bold uppercase flex items-center gap-2 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}><Coins size={16}/> Currency</span>
                        <span className="font-black text-sm">{Object.values(countryData.currencies)[0].symbol}</span>
                      </div>
                    </div>
                  </div>
                )}
                <Sidebar history={history} onSearch={fetchData} />
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}