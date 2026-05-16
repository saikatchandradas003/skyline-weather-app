import React from 'react';
import { MapPin } from 'lucide-react';


const POPULAR_CITIES = [
  "Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi", "Barisal", "Rangpur", "Comilla",
  "New York", "London", "Tokyo", "Paris", "Dubai", "Singapore", "Sydney", "Mumbai", 
  "Toronto", "Berlin", "Moscow", "Melbourne", "Bangkok", "Kuala Lumpur"
];

export default function SearchSuggestions({ query, onSelect }) {
  if (!query || query.length < 2) return null;

  
  const filteredCities = POPULAR_CITIES.filter(city =>
    city.toLowerCase().startsWith(query.toLowerCase())
  ).slice(0, 5); 

  if (filteredCities.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E2530]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      {filteredCities.map((city, index) => (
        <div
          key={index}
          onClick={() => onSelect(city)}
          className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 text-white/80 hover:text-white cursor-pointer transition-all border-b border-white/5 last:border-none text-sm font-medium"
        >
          <MapPin size={14} className="text-orange-500" />
          {city}
        </div>
      ))}
    </div>
  );
}