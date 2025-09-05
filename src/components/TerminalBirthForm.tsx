'use client';

import React, { useState } from 'react';
import type { BirthInfo } from '@/types/astrology';

interface TerminalBirthFormProps {
  onSubmit: (birthInfo: BirthInfo) => void;
  loading?: boolean;
}

export default function TerminalBirthForm({ onSubmit, loading = false }: TerminalBirthFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    latitude: 0,
    longitude: 0
  });
  // Removed unused currentTime state

  const handleLocationChange = async (location: string) => {
    setFormData(prev => ({ ...prev, location }));
    
    const cities: Record<string, { lat: number; lng: number }> = {
      'new york': { lat: 40.7128, lng: -74.0060 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'london': { lat: 51.5074, lng: -0.1278 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'tokyo': { lat: 35.6762, lng: 139.6503 },
      'sydney': { lat: -33.8688, lng: 151.2093 },
      'berlin': { lat: 52.5200, lng: 13.4050 },
      'moscow': { lat: 55.7558, lng: 37.6173 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'beijing': { lat: 39.9042, lng: 116.4074 },
      'san francisco': { lat: 37.7749, lng: -122.4194 },
      'dubai': { lat: 25.2048, lng: 55.2708 },
      'singapore': { lat: 1.3521, lng: 103.8198 }
    };
    
    const key = location.toLowerCase();
    if (cities[key]) {
      setFormData(prev => ({
        ...prev,
        latitude: cities[key].lat,
        longitude: cities[key].lng
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.location) {
      alert('ERROR: Missing required fields');
      return;
    }
    
    if (formData.latitude === 0 && formData.longitude === 0) {
      alert('ERROR: Unknown location. Use predefined cities.');
      return;
    }

    const birthInfo: BirthInfo = {
      date: formData.date,
      time: formData.time + ':00',
      location: {
        name: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude
      }
    };

    onSubmit(birthInfo);
  };

  return (
    <div className="min-h-screen bg-[rgb(222,212,198)] text-black font-mono flex items-center justify-center p-6 relative">
      {/* Mobile Overlay */}
      <div className="lg:hidden fixed inset-0 bg-[rgb(222,212,198)] z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-4">AstroChat</div>
          <div className="text-sm text-black/60">
            Optimized for Desktop,<br />
            temporarily
          </div>
        </div>
        {/* Credit */}
        <div className="absolute bottom-4 right-4 text-xs text-black/40">
          built by <a href="https://x.com/singsarg" target="_blank" rel="noopener noreferrer" className="hover:text-black/60 transition-colors">@singsarg</a>
        </div>
      </div>
      
      {/* Credit - Full Screen */}
      <div className="hidden lg:block absolute bottom-4 right-4 text-xs text-black/40 z-10">
        built by <a href="https://x.com/singsarg" target="_blank" rel="noopener noreferrer" className="hover:text-black/60 transition-colors">@singsarg</a>
      </div>
      
      <div className="w-[85%] max-w-3xl border-2 border-dashed border-black/40 p-12 bg-[rgb(222,212,198)]">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-2">AstroChat</h1>
          <p className="text-xs text-black/60">Chat with your planetary placements</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-t border-black/20 pt-6">
            <div className="text-xs text-black/60 mb-4">Enter your birth information:</div>
            
            <div className="space-y-4">
              {/* Date Input */}
              <div className="pl-4">
                <label className="text-xs text-black block mb-2">
                  Birth Date:
                </label>
                <div className="flex items-center">
                  <span className="text-black mr-2">{'>'}</span>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-transparent outline-none text-black text-xs border-b border-black/30 focus:border-black flex-1 [color-scheme:light]"
                    required
                  />
                </div>
              </div>

              {/* Time Input */}
              <div className="pl-4">
                <label className="text-xs text-black block mb-2">
                  Birth Time:
                </label>
                <div className="flex items-center">
                  <span className="text-black mr-2">{'>'}</span>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="bg-transparent outline-none text-black text-xs border-b border-black/30 focus:border-black flex-1 [color-scheme:light]"
                    required
                  />
                </div>
              </div>

              {/* Location Input */}
              <div className="pl-4">
                <label className="text-xs text-black block mb-2">
                  Birth Location:
                </label>
                <div className="flex items-center">
                  <span className="text-black mr-2">{'>'}</span>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder="enter city name..."
                    className="bg-transparent outline-none text-black text-xs border-b border-black/30 focus:border-black flex-1 placeholder-black/30"
                    required
                  />
                </div>
                {formData.latitude !== 0 && (
                  <div className="text-[10px] text-black/50 mt-2 pl-4">
                    Coordinates: [{formData.latitude.toFixed(4)}°, {formData.longitude.toFixed(4)}°]
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Available Cities */}
          <div className="border-t border-black/20 pt-4">
            <div className="text-[10px] text-black/50">
              <div className="mb-2">Available cities:</div>
              <div className="pl-4 grid grid-cols-4 gap-2">
                <div>• new york</div>
                <div>• london</div>
                <div>• tokyo</div>
                <div>• paris</div>
                <div>• los angeles</div>
                <div>• berlin</div>
                <div>• sydney</div>
                <div>• moscow</div>
                <div>• chicago</div>
                <div>• mumbai</div>
                <div>• beijing</div>
                <div>• san francisco</div>
                <div>• singapore</div>
                <div>• dubai</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t border-black/20 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-black/40 text-black text-xs py-3 hover:bg-black hover:text-[rgb(222,212,198)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-pulse">Calculating your chart...</span>
                </span>
              ) : (
                'Chat!'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}