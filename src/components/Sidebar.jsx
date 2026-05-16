import React from 'react';
import { History } from 'lucide-react';

export default function Sidebar({ history, onSearch }) {
  return (
    <div className="bg-black/20 backdrop-blur-lg p-6 rounded-3xl text-white h-full border border-white/5">
      <div className="flex items-center gap-2 mb-4 opacity-70">
        <History size={18} />
        <h3 className="font-bold uppercase text-xs tracking-widest">Recent Search</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((city, index) => (
          <button 
            key={index} onClick={() => onSearch(city)}
            className="px-4 py-2 bg-white/5 rounded-full hover:bg-white/20 text-xs transition-all border border-white/10"
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}